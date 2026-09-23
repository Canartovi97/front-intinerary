import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as L from 'leaflet';

import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AirportService } from '../../../core/services/airport.service';
import { Airport } from '../../../core/models/airport.model';

const COLOMBIA_CENTER: L.LatLngTuple = [4.6, -74.1];
const DEFAULT_ZOOM = 5;

@Component({
  selector: 'app-airport-map',
  standalone: true,
  imports: [LoadingSpinnerComponent],
  templateUrl: './airport-map.component.html',
  styleUrl: './airport-map.component.scss'
})
export class AirportMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') private readonly mapContainerRef!: ElementRef<HTMLDivElement>;

  loading = true;
  error = false;
  airports: Airport[] = [];

  private map: L.Map | null = null;

  constructor(private readonly airportService: AirportService) {}

  ngAfterViewInit(): void {
    this.airportService.getAll().subscribe({
      next: (airports) => {
        this.airports = airports;
        this.loading = false;
        // Wait for layout to settle so the now-visible container has a real
        // size before Leaflet measures it (a plain setTimeout(0) can still
        // race the browser's layout pass).
        requestAnimationFrame(() => requestAnimationFrame(() => this.initMap(airports)));
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private initMap(airports: Airport[]): void {
    // A handful of airports come back from api-colombia with no coordinates
    // at all; our adapter defaults those to (0, 0), which sits in the Gulf
    // of Guinea. Including them would force the whole map to zoom out to a
    // near-world view just to fit one bogus point off the coast of Africa.
    const located = airports.filter((a) => a.latitude !== 0 || a.longitude !== 0);

    if (!this.mapContainerRef || located.length === 0) {
      return;
    }

    this.map = L.map(this.mapContainerRef.nativeElement, {
      center: COLOMBIA_CENTER,
      zoom: DEFAULT_ZOOM,
      scrollWheelZoom: false,
      // Tile fade-in relies on a requestAnimationFrame-driven CSS transition,
      // which some browsers never run for a backgrounded/non-visible tab —
      // leaving tiles stuck at opacity 0 even though they loaded fine.
      // Disabling it renders tiles immediately instead.
      fadeAnimation: false
    });
    // The container was hidden (via [hidden]) until just before this call,
    // so Leaflet may have measured it before layout settled — force a
    // fresh size read before computing bounds/zoom.
    this.map.invalidateSize();

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abc',
      maxZoom: 19
    }).addTo(this.map);

    const markers: L.CircleMarker[] = located.map((airport) =>
      L.circleMarker([airport.latitude, airport.longitude], {
        radius: 7,
        weight: 2,
        color: '#ffffff',
        fillColor: '#0b5ed7',
        fillOpacity: 0.9
      }).bindTooltip(`<strong>${airport.name}</strong><br>${airport.city}`)
    );

    const markerGroup = L.featureGroup(markers).addTo(this.map);
    this.map.fitBounds(markerGroup.getBounds().pad(0.15));
  }
}
