import { Component } from '@angular/core';

import { AirportMapComponent } from '../airport-map/airport-map.component';
import { AirportListComponent } from '../airport-list/airport-list.component';

/**
 * Landing page for the /airports route: map on top, list below.
 */
@Component({
  selector: 'app-airports-overview',
  standalone: true,
  imports: [AirportMapComponent, AirportListComponent],
  templateUrl: './airports-overview.component.html',
  styleUrl: './airports-overview.component.scss'
})
export class AirportsOverviewComponent {}
