import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { distinctUntilChanged, of, switchMap, catchError } from 'rxjs';

import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AirportService } from '../../../core/services/airport.service';
import { ItineraryService } from '../../../core/services/itinerary.service';
import { Airport, TouristAttraction } from '../../../core/models/airport.model';
import {
  CabinClass,
  Currency,
  EmergencyContact,
  Itinerary,
  ItineraryPayload,
  ItineraryStatus,
  LodgingType,
  LABELS,
  PlannedAttraction,
  TourGuide,
  TravelDocument,
  TripType,
  optionsOf
} from '../../../core/models/itinerary.model';
import {
  atLeastOneContactValidator,
  maxTravelersValidator,
  notBlankValidator,
  notInPastValidator,
  originNotEqualToDestinationValidator
} from './itinerary-form.validators';

const DAY_MS = 86_400_000;

/** A list row as the form holds it: optional fields are '' instead of null. */
type Row<T> = { [K in keyof T]: null extends T[K] ? Exclude<T[K], null> : T[K] };
export const MAX_TRAVELERS = 9;

@Component({
  selector: 'app-itinerary-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent, DatePipe, DecimalPipe],
  templateUrl: './itinerary-form.component.html',
  styleUrl: './itinerary-form.component.scss'
})
export class ItineraryFormComponent implements OnInit {
  isEditMode = false;
  itineraryId: string | null = null;

  loading = false;
  error = false;
  saving = false;
  saveErrorMessage = '';

  airports: Airport[] = [];
  airportsLoading = true;
  airportsError = false;

  /** Suggestions for the selected destination, from Airport Service. */
  attractions: TouristAttraction[] = [];
  attractionsLoading = false;
  attractionsError = false;
  /** Picked attractions, kept by id so a reloaded suggestion list keeps them selected. */
  selectedAttractions = new Map<number, PlannedAttraction>();
  /** Attraction photos are third-party links; the ones that fail get a placeholder. */
  brokenImages = new Set<number>();

  protected readonly labels = LABELS;
  protected readonly tripTypes = optionsOf(LABELS.tripType);
  protected readonly cabinClasses = optionsOf(LABELS.cabinClass);
  protected readonly lodgingTypes = optionsOf(LABELS.lodgingType);
  protected readonly statuses = optionsOf(LABELS.status);
  protected readonly documentTypes = optionsOf(LABELS.documentType);
  protected readonly currencies = ['COP', 'USD', 'EUR'] as const;

  private readonly fb = inject(FormBuilder);
  private readonly airportService = inject(AirportService);
  private readonly destroyRef = inject(DestroyRef);

  form = this.fb.group(
    {
      name: ['', [Validators.required, Validators.maxLength(100), notBlankValidator()]],
      originAirportId: ['', Validators.required],
      destinationAirportId: ['', Validators.required],
      tripType: this.fb.nonNullable.control<TripType>('ROUND_TRIP'),
      departureDate: ['', [Validators.required, notInPastValidator()]],
      durationDays: [1, [Validators.required, Validators.min(1)]],
      travelers: this.fb.group(
        {
          adults: [1, [Validators.required, Validators.min(1)]],
          children: [0, [Validators.required, Validators.min(0)]],
          cabinClass: this.fb.nonNullable.control<CabinClass>('ECONOMY')
        },
        { validators: maxTravelersValidator(MAX_TRAVELERS) }
      ),
      lodging: this.fb.group({
        type: this.fb.nonNullable.control<LodgingType>('NONE'),
        name: ['', Validators.maxLength(100)],
        address: ['', Validators.maxLength(200)]
      }),
      budget: this.fb.group({
        amount: [null as number | null, Validators.min(0)],
        currency: this.fb.nonNullable.control<Currency>('COP')
      }),
      status: this.fb.nonNullable.control<ItineraryStatus>('PLANNED'),
      notes: ['', Validators.maxLength(2000)],
      guides: this.fb.array<FormGroup>([]),
      emergencyContacts: this.fb.array<FormGroup>([]),
      documents: this.fb.array<FormGroup>([])
    },
    { validators: originNotEqualToDestinationValidator() }
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly itineraryService: ItineraryService
  ) {}

  ngOnInit(): void {
    this.itineraryId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.itineraryId;
    this.loadAirports();
    this.watchDestinationAttractions();

    if (this.isEditMode && this.itineraryId) {
      this.loading = true;
      this.itineraryService.getById(this.itineraryId).subscribe({
        next: (itinerary) => {
          this.fill(itinerary);
          this.loading = false;
        },
        error: () => {
          this.error = true;
          this.loading = false;
        }
      });
    }
  }

  get f() {
    return this.form.controls;
  }

  get guides(): FormArray<FormGroup> {
    return this.form.controls.guides;
  }

  get emergencyContacts(): FormArray<FormGroup> {
    return this.form.controls.emergencyContacts;
  }

  get documents(): FormArray<FormGroup> {
    return this.form.controls.documents;
  }

  /** The airport's id as the select options carry it. */
  airportValue(airport: Airport): string {
    return String(airport.id);
  }

  get destinationAirport(): Airport | undefined {
    return this.airports.find((a) => this.airportValue(a) === this.f.destinationAirportId.value);
  }

  /** Last day of the trip (departure + duration), or null while incomplete. */
  get endDate(): Date | null {
    const departure = this.f.departureDate.value;
    const days = Number(this.f.durationDays.value);
    if (!departure || !(days > 0)) {
      return null;
    }
    return new Date(new Date(departure).getTime() + days * DAY_MS);
  }

  /** True when the document's expiry falls before the trip is over. */
  expiresDuringTrip(index: number): boolean {
    const expiresOn = this.documents.at(index).value.expiresOn as string;
    const end = this.endDate;
    return !!expiresOn && !!end && expiresOn < end.toISOString().slice(0, 10);
  }

  isAttractionSelected(attraction: TouristAttraction): boolean {
    return this.selectedAttractions.has(attraction.id);
  }

  toggleAttraction(attraction: TouristAttraction): void {
    if (this.selectedAttractions.has(attraction.id)) {
      this.selectedAttractions.delete(attraction.id);
    } else {
      this.selectedAttractions.set(attraction.id, {
        attractionId: attraction.id,
        name: attraction.name,
        city: attraction.city
      });
    }
  }

  removeAttraction(attractionId: number): void {
    this.selectedAttractions.delete(attractionId);
  }

  addGuide(guide?: TourGuide): void {
    this.guides.push(
      this.fb.group(
        {
          name: [guide?.name ?? '', [Validators.required, Validators.maxLength(100), notBlankValidator()]],
          phone: [guide?.phone ?? '', Validators.maxLength(30)],
          email: [guide?.email ?? '', Validators.email],
          language: [guide?.language ?? '', Validators.maxLength(50)],
          notes: [guide?.notes ?? '', Validators.maxLength(200)]
        },
        { validators: atLeastOneContactValidator() }
      )
    );
  }

  addEmergencyContact(contact?: EmergencyContact): void {
    this.emergencyContacts.push(
      this.fb.group({
        name: [contact?.name ?? '', [Validators.required, Validators.maxLength(100), notBlankValidator()]],
        relationship: [contact?.relationship ?? '', Validators.maxLength(50)],
        phone: [contact?.phone ?? '', [Validators.required, Validators.maxLength(30), notBlankValidator()]]
      })
    );
  }

  addDocument(document?: TravelDocument): void {
    this.documents.push(
      this.fb.group({
        type: [document?.type ?? 'PASSPORT', Validators.required],
        reference: [document?.reference ?? '', Validators.maxLength(50)],
        expiresOn: [document?.expiresOn ?? ''],
        notes: [document?.notes ?? '', Validators.maxLength(200)]
      })
    );
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.toPayload();
    this.saving = true;
    this.error = false;

    const request$ =
      this.isEditMode && this.itineraryId
        ? this.itineraryService.update(this.itineraryId, payload)
        : this.itineraryService.create(payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/itineraries']);
      },
      error: (err: HttpErrorResponse) => {
        this.saving = false;
        this.error = true;
        this.saveErrorMessage = saveErrorMessage(err);
      }
    });
  }

  private fill(itinerary: Itinerary): void {
    this.form.patchValue({
      name: itinerary.name,
      // Select options carry string ids; the API returns numbers.
      originAirportId: String(itinerary.originAirportId),
      destinationAirportId: String(itinerary.destinationAirportId),
      tripType: itinerary.tripType,
      departureDate: itinerary.departureDate?.slice(0, 10),
      durationDays: itinerary.durationDays,
      travelers: itinerary.travelers,
      lodging: {
        type: itinerary.lodging.type,
        name: itinerary.lodging.name ?? '',
        address: itinerary.lodging.address ?? ''
      },
      budget: itinerary.budget,
      status: itinerary.status,
      notes: itinerary.notes ?? ''
    });
    itinerary.guides.forEach((g) => this.addGuide(g));
    itinerary.emergencyContacts.forEach((c) => this.addEmergencyContact(c));
    itinerary.documents.forEach((d) => this.addDocument(d));
    this.selectedAttractions = new Map(itinerary.attractions.map((a) => [a.attractionId, a]));
  }

  private toPayload(): ItineraryPayload {
    const v = this.form.getRawValue();
    return {
      name: v.name ?? '',
      originAirportId: v.originAirportId ?? '',
      destinationAirportId: v.destinationAirportId ?? '',
      departureDate: v.departureDate ?? '',
      durationDays: Number(v.durationDays),
      tripType: v.tripType,
      travelers: {
        adults: Number(v.travelers.adults),
        children: Number(v.travelers.children),
        cabinClass: v.travelers.cabinClass
      },
      lodging: {
        type: v.lodging.type,
        name: text(v.lodging.name),
        address: text(v.lodging.address)
      },
      budget: {
        amount: v.budget.amount === null || (v.budget.amount as unknown) === '' ? null : Number(v.budget.amount),
        currency: v.budget.currency
      },
      status: v.status,
      notes: text(v.notes),
      guides: (this.guides.getRawValue() as Row<TourGuide>[]).map((g) => ({
        name: g.name.trim(),
        phone: text(g.phone),
        email: text(g.email),
        language: text(g.language),
        notes: text(g.notes)
      })),
      emergencyContacts: (this.emergencyContacts.getRawValue() as Row<EmergencyContact>[]).map((c) => ({
        name: c.name.trim(),
        relationship: text(c.relationship),
        phone: c.phone.trim()
      })),
      documents: (this.documents.getRawValue() as Row<TravelDocument>[]).map((d) => ({
        type: d.type,
        reference: text(d.reference),
        expiresOn: d.expiresOn || null,
        notes: text(d.notes)
      })),
      attractions: [...this.selectedAttractions.values()]
    };
  }

  private loadAirports(): void {
    this.airportService.getAll().subscribe({
      next: (airports) => {
        this.airports = [...airports].sort((a, b) => a.name.localeCompare(b.name));
        this.airportsLoading = false;
      },
      error: () => {
        this.airportsError = true;
        this.airportsLoading = false;
      }
    });
  }

  /** Reloads the attraction suggestions whenever the destination changes. */
  private watchDestinationAttractions(): void {
    this.f.destinationAirportId.valueChanges
      .pipe(
        distinctUntilChanged(),
        switchMap((id) => {
          this.attractions = [];
          this.attractionsError = false;
          if (!id) {
            this.attractionsLoading = false;
            return of(null);
          }
          this.attractionsLoading = true;
          return this.airportService.getAttractions(id).pipe(
            catchError(() => {
              this.attractionsError = true;
              return of([] as TouristAttraction[]);
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((attractions) => {
        this.attractionsLoading = false;
        if (attractions) {
          this.attractions = attractions;
        }
      });
  }
}

function text(value: string | null | undefined): string | null {
  return value?.trim() ? value.trim() : null;
}

/** Maps the itinerary-service's error statuses to a message the user can act on. */
function saveErrorMessage(err: HttpErrorResponse): string {
  switch (err.status) {
    case 404:
      return 'One of the airports does not exist. Pick the origin and destination again.';
    case 503:
      return 'The Airport Service is unavailable, so the airports could not be validated. Nothing was saved — try again later.';
    case 400:
      return [err.error?.message].flat().join(' ') || 'Some fields are invalid.';
    default:
      return 'Could not save the itinerary. Is the itinerary service running?';
  }
}
