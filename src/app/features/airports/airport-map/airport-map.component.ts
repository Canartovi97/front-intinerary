import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, input, output } from '@angular/core';
import * as L from 'leaflet';

import { Airport, hasCoordinates } from '../../../core/models/airport.model';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

const COLOMBIA_BOUNDS = L.latLngBounds([-4.3, -79.1], [12.6, -66.8]);
const MARKER_COLOR = '#ff8a3d';
const SELECTED_COLOR = '#2fbf71';

@Component({
  selector: 'app-airport-map',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './airport-map.component.html',
  styleUrl: './airport-map.component.scss'
})
export class AirportMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') private readonly mapContainerRef!: ElementRef<HTMLDivElement>;

  readonly airports = input.required<Airport[]>();
  readonly selectedId = input<string | null>(null);
  readonly selectAirport = output<string>();

  private map: L.Map | null = null;
  private readonly markers = new Map<string, L.CircleMarker>();
  private resizeObserver?: ResizeObserver;

  constructor() {
    effect(() => this.highlight(this.selectedId()));
  }

  ngAfterViewInit(): void {
    const container = this.mapContainerRef.nativeElement;

    this.map = L.map(container, {
      minZoom: 4,
      maxBounds: L.latLngBounds([-8, -88], [18, -60]),
      // Tile fade-in relies on a requestAnimationFrame-driven CSS transition,
      // which some browsers never run for a backgrounded/non-visible tab —
      // leaving tiles stuck at opacity 0 even though they loaded fine.
      fadeAnimation: false
    }).fitBounds(COLOMBIA_BOUNDS);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abc',
      className: 'dark-tiles',
      maxZoom: 19
    }).addTo(this.map);

    for (const airport of this.airports().filter(hasCoordinates)) {
      const marker = L.circleMarker([airport.latitude, airport.longitude], {
        radius: 6,
        weight: 2,
        color: MARKER_COLOR,
        fillColor: MARKER_COLOR,
        fillOpacity: 0.35
      })
        .bindTooltip(`<strong>${airport.name}</strong><br>${airport.city}`, { direction: 'top', offset: [0, -6] })
        .on('click', () => this.selectAirport.emit(airport.id))
        .addTo(this.map);
      this.markers.set(airport.id, marker);
    }

    // The grid cell changes size between desktop and mobile layouts, so
    // Leaflet has to re-measure whenever the container is resized.
    this.resizeObserver = new ResizeObserver(() => this.map?.invalidateSize());
    this.resizeObserver.observe(container);
    this.highlight(this.selectedId());
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.map?.remove();
  }

  private highlight(selectedId: string | null): void {
    if (!this.map) {
      return;
    }

    for (const [id, marker] of this.markers) {
      const selected = id === selectedId;
      marker.setStyle({
        color: selected ? SELECTED_COLOR : MARKER_COLOR,
        fillColor: selected ? SELECTED_COLOR : MARKER_COLOR,
        fillOpacity: selected ? 0.6 : 0.35
      });
      marker.setRadius(selected ? 10 : 6);
      marker.getElement()?.classList.toggle('pulse', selected);
      if (selected) {
        marker.bringToFront();
        this.map.flyTo(marker.getLatLng(), Math.max(this.map.getZoom(), 8), { duration: 0.8 });
      }
    }
  }
}
