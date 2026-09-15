import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Lightweight confirmation modal. The parent owns the visibility flag and
 * reacts to the `confirmed`/`cancelled` outputs, e.g.:
 *
 *   <app-confirm-dialog
 *     [visible]="showDeleteConfirm"
 *     title="Delete itinerary"
 *     message="This action cannot be undone."
 *     (confirmed)="onDeleteConfirmed()"
 *     (cancelled)="showDeleteConfirm = false" />
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() title = 'Please confirm';
  @Input() message = 'Are you sure you want to continue?';
  @Input() confirmLabel = 'Confirm';
  @Input() cancelLabel = 'Cancel';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
