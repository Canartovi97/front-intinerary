import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AirportService } from '../../../core/services/airport.service';
import { Airport } from '../../../core/models/airport.model';

@Component({
  selector: 'app-airport-detail',
  standalone: true,
  imports: [RouterLink, LoadingSpinnerComponent],
  templateUrl: './airport-detail.component.html',
  styleUrl: './airport-detail.component.scss'
})
export class AirportDetailComponent implements OnInit {
  loading = true;
  error = false;
  airport?: Airport;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly airportService: AirportService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = true;
      this.loading = false;
      return;
    }

    this.airportService.getById(id).subscribe({
      next: (airport) => {
        this.airport = airport;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }
}
