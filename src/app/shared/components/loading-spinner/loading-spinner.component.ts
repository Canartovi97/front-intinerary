import { Component, Input } from '@angular/core';

/**
 * Small reusable loading / error / empty state indicator.
 *
 * Usage:
 *   <app-loading-spinner *ngIf="loading()" />
 *   <app-loading-spinner *ngIf="error()" [error]="true" [message]="errorMessage()" />
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss'
})
export class LoadingSpinnerComponent {
  @Input() error = false;
  @Input() message = '';
}
