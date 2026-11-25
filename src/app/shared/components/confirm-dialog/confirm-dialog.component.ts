import { Component, EventEmitter, Input, Output } from '@angular/core';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';

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
  imports: [TranslatePipe],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  /** Empty values fall back to the translated defaults. */
  @Input() title = '';
  @Input() message = '';
  @Input() confirmLabel = '';
  @Input() cancelLabel = '';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
