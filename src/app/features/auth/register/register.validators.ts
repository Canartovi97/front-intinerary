import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Fails when password and confirmPassword don't match. Applied at the
 * FormGroup level since it compares two sibling controls.
 */
export function passwordsMatchValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  };
}
