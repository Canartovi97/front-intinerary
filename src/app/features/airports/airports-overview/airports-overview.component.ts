import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { AirportMapComponent } from '../airport-map/airport-map.component';
import { AirportListComponent } from '../airport-list/airport-list.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AirportService } from '../../../core/services/airport.service';
import { Airport, hasCoordinates } from '../../../core/models/airport.model';

/**
 * Landing page for the /airports route: KPI row, map on the left and a
 * searchable side panel on the right. Loads the airports once and shares
 * them (plus the current selection) with both children.
 */
@Component({
  selector: 'app-airports-overview',
  standalone: true,
  imports: [AirportMapComponent, AirportListComponent, LoadingSpinnerComponent],
  templateUrl: './airports-overview.component.html',
  styleUrl: './airports-overview.component.scss'
})
export class AirportsOverviewComponent implements OnInit {
  private readonly airportService = inject(AirportService);

  readonly airports = signal<Airport[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly selectedId = signal<string | null>(null);

  readonly located = computed(() => this.airports().filter(hasCoordinates).length);
  readonly cities = computed(() => new Set(this.airports().map((a) => a.city)).size);

  ngOnInit(): void {
    this.airportService.getAll().subscribe({
      next: (airports) => {
        this.airports.set(airports);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  select(id: string): void {
    this.selectedId.set(this.selectedId() === id ? null : id);
  }
}
