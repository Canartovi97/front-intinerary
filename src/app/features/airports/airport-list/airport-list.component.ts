import { Component, computed, input, output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Airport, hasCoordinates } from '../../../core/models/airport.model';

type CoordinateFilter = 'all' | 'located' | 'missing';

@Component({
  selector: 'app-airport-list',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './airport-list.component.html',
  styleUrl: './airport-list.component.scss'
})
export class AirportListComponent {
  readonly airports = input.required<Airport[]>();
  readonly selectedId = input<string | null>(null);
  readonly selectAirport = output<string>();

  readonly search = signal('');
  readonly filter = signal<CoordinateFilter>('all');

  protected readonly hasCoordinates = hasCoordinates;

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const filter = this.filter();
    return this.airports()
      .filter((a) => !term || a.name.toLowerCase().includes(term) || a.city.toLowerCase().includes(term))
      .filter((a) => filter === 'all' || (filter === 'located') === hasCoordinates(a))
      .sort((a, b) => a.name.localeCompare(b.name));
  });
}
