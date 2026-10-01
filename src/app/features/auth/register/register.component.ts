import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { passwordsMatchValidator } from './register.validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  submitting = false;
  emailTaken = false;
  genericError = false;

  form = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordsMatchValidator() }
  );

  get f() {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.emailTaken = false;
    this.genericError = false;
    const { email, password } = this.form.getRawValue();

    this.authService
      .register(email, password)
      .pipe(switchMap(() => this.authService.login(email, password)))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigateByUrl('/itineraries');
        },
        error: (err: unknown) => {
          this.submitting = false;
          if (err instanceof HttpErrorResponse && err.status === 409) {
            this.emailTaken = true;
          } else {
            this.genericError = true;
          }
        }
      });
  }
}
