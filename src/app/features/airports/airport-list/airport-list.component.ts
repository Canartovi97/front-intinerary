import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AirportService } from '../../../core/services/airport.service';
import { Airport } from '../../../core/models/airport.model';

@Component({
  selector: 'app-airport-list',
  standalone: true,
  imports: [RouterLink, LoadingSpinnerComponent],
  templateUrl: './airport-list.component.html',
  styleUrl: './airport-list.component.scss'
})
export class AirportListComponent implements OnInit {
  loading = true;
  error = false;
  airports: Airport[] = [];

  constructor(private readonly airportService: AirportService) {}

  ngOnInit(): void {
    this.airportService.getAll().subscribe({
      next: (airports) => {
        this.airports = airports;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }
}
