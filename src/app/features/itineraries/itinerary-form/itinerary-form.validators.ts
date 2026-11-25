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
 * Fails when the value has content but it's only whitespace (the backend
 * trims names, so "   " would be rejected there anyway).
 */
export function notBlankValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null;
    return value && value.trim().length === 0 ? { blank: true } : null;
  };
}

/** Fails when adults + children exceed the per-itinerary maximum. */
export function maxTravelersValidator(max: number): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const total = Number(group.get('adults')?.value ?? 0) + Number(group.get('children')?.value ?? 0);
    return total > max ? { tooManyTravelers: { max } } : null;
  };
}

/** A guide is only useful with a way to reach them: phone or email. */
export function atLeastOneContactValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const phone = (group.get('phone')?.value as string | null)?.trim();
    const email = (group.get('email')?.value as string | null)?.trim();
    return phone || email ? null : { contactRequired: true };
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
