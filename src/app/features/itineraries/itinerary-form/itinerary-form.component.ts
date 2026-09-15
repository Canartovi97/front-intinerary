import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ItineraryService } from '../../../core/services/itinerary.service';
import { ItineraryPayload } from '../../../core/models/itinerary.model';
import { notInPastValidator, originNotEqualToDestinationValidator } from './itinerary-form.validators';

@Component({
  selector: 'app-itinerary-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './itinerary-form.component.html',
  styleUrl: './itinerary-form.component.scss'
})
export class ItineraryFormComponent implements OnInit {
  isEditMode = false;
  itineraryId: string | null = null;

  loading = false;
  error = false;
  saving = false;

  private readonly fb = inject(FormBuilder);

  form = this.fb.group(
    {
      originAirportId: ['', Validators.required],
      destinationAirportId: ['', Validators.required],
      departureDate: ['', [Validators.required, notInPastValidator()]],
      durationDays: [1, [Validators.required, Validators.min(1)]]
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

    if (this.isEditMode && this.itineraryId) {
      this.loading = true;
      this.itineraryService.getById(this.itineraryId).subscribe({
        next: (itinerary) => {
          this.form.patchValue({
            originAirportId: itinerary.originAirportId,
            destinationAirportId: itinerary.destinationAirportId,
            departureDate: itinerary.departureDate?.slice(0, 10),
            durationDays: itinerary.durationDays
          });
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

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue() as ItineraryPayload;
    this.saving = true;

    const request$ =
      this.isEditMode && this.itineraryId
        ? this.itineraryService.update(this.itineraryId, payload)
        : this.itineraryService.create(payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/itineraries']);
      },
      error: () => {
        this.saving = false;
        this.error = true;
      }
    });
  }
}
