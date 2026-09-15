import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ItineraryService } from '../../../core/services/itinerary.service';
import { Itinerary } from '../../../core/models/itinerary.model';

@Component({
  selector: 'app-itinerary-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, ConfirmDialogComponent],
  templateUrl: './itinerary-list.component.html',
  styleUrl: './itinerary-list.component.scss'
})
export class ItineraryListComponent implements OnInit {
  loading = true;
  error = false;
  itineraries: Itinerary[] = [];

  showDeleteConfirm = false;
  pendingDeleteId: string | null = null;

  constructor(private readonly itineraryService: ItineraryService) {}

  ngOnInit(): void {
    this.fetchItineraries();
  }

  fetchItineraries(): void {
    this.loading = true;
    this.error = false;
    this.itineraryService.getAll().subscribe({
      next: (itineraries) => {
        this.itineraries = itineraries;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  requestDelete(id: string): void {
    this.pendingDeleteId = id;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.pendingDeleteId = null;
    this.showDeleteConfirm = false;
  }

  confirmDelete(): void {
    if (!this.pendingDeleteId) {
      return;
    }
    const id = this.pendingDeleteId;
    this.itineraryService.delete(id).subscribe({
      next: () => {
        this.itineraries = this.itineraries.filter((it) => it.id !== id);
        this.cancelDelete();
      },
      error: () => {
        this.cancelDelete();
      }
    });
  }
}
