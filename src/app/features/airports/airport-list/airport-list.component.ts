import { Component, computed, inject, input, output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Airport, hasCoordinates } from '../../../core/models/airport.model';
import { I18nService } from '../../../core/i18n/i18n.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

type CoordinateFilter = 'all' | 'located' | 'missing';

@Component({
  selector: 'app-airport-list',
  standalone: true,
  imports: [RouterLink, DecimalPipe, TranslatePipe],
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
  protected readonly i18n = inject(I18nService);

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const filter = this.filter();
    return this.airports()
      .filter((a) => !term || a.name.toLowerCase().includes(term) || a.city.toLowerCase().includes(term))
      .filter((a) => filter === 'all' || (filter === 'located') === hasCoordinates(a))
      .sort((a, b) => a.name.localeCompare(b.name));
  });
}
