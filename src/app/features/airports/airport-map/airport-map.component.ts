import { Component, OnInit } from '@angular/core';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';

import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AirportService } from '../../../core/services/airport.service';
import { Airport } from '../../../core/models/airport.model';

// Loaded here (rather than in main.ts) so the fairly heavy plotly.js bundle
// only ends up in this feature's lazy chunk instead of the initial bundle.
PlotlyModule.plotlyjs = PlotlyJS;

@Component({
  selector: 'app-airport-map',
  standalone: true,
  imports: [PlotlyModule, LoadingSpinnerComponent],
  templateUrl: './airport-map.component.html',
  styleUrl: './airport-map.component.scss'
})
export class AirportMapComponent implements OnInit {
  loading = true;
  error = false;
  airports: Airport[] = [];

  graphData: any[] = [];
  graphLayout: any = {
    autosize: true,
    geo: {
      showland: true,
      landcolor: '#e2e8f0',
      showcountries: true,
      countrycolor: '#cbd5e1'
    },
    margin: { t: 10, b: 10, l: 10, r: 10 }
  };
  graphConfig: any = { responsive: true, displaylogo: false };

  constructor(private readonly airportService: AirportService) {}

  ngOnInit(): void {
    this.airportService.getAll().subscribe({
      next: (airports) => {
        this.airports = airports;
        this.buildGraphData(airports);
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  private buildGraphData(airports: Airport[]): void {
    this.graphData = [
      {
        type: 'scattergeo',
        mode: 'markers',
        lat: airports.map((a) => a.latitude),
        lon: airports.map((a) => a.longitude),
        text: airports.map((a) => `${a.name} (${a.city})`),
        marker: { size: 9, color: '#2563eb' }
      }
    ];
  }
}
