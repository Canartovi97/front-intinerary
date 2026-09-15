import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Fails when the departure date is strictly before today (local time, date-only).
 */
export function notInPastValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const value = new Date(control.value);
    value.setHours(0, 0, 0, 0);
    return value.getTime() < today.getTime() ? { pastDate: true } : null;
  };
}

/**
 * Fails when originAirportId and destinationAirportId are equal.
 * Applied at the FormGroup level since it compares two sibling controls.
 */
export function originNotEqualToDestinationValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const origin = group.get('originAirportId')?.value;
    const destination = group.get('destinationAirportId')?.value;
    if (origin && destination && origin === destination) {
      return { sameOriginDestination: true };
    }
    return null;
  };
}
