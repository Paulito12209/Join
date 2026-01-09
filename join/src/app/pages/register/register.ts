import { Component, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements OnDestroy {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  privacyPolicyAccepted = false;
  showPassword = false;
  showConfirmPassword = false;

  // Field-specific error messages
  nameErrorMessage = '';
  emailErrorMessage = '';
  passwordErrorMessage = '';
  confirmPasswordErrorMessage = '';

  showTaskAddedToast = false;
  hideToast = false;
  private toastHideTimer?: ReturnType<typeof setTimeout>;
  private toastRemoveTimer?: ReturnType<typeof setTimeout>;

  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  get isFormValid(): boolean {
    return this.privacyPolicyAccepted;
  }

  register() {
    // Clear previous error states
    this.nameErrorMessage = '';
    this.emailErrorMessage = '';
    this.passwordErrorMessage = '';
    this.confirmPasswordErrorMessage = '';

    let hasError = false;

    // Validate name (minimum 3 characters)
    if (!this.name.trim() || this.name.trim().length < 3) {
      this.nameErrorMessage = 'Name must be at least 3 characters long.';
      hasError = true;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email.trim() || !emailRegex.test(this.email)) {
      this.emailErrorMessage = 'Please enter a valid email address.';
      hasError = true;
    }

    // Validate password is filled and length
    if (!this.password) {
      this.passwordErrorMessage = 'Please enter a password.';
      hasError = true;
    } else if (this.password.length < 6) {
      this.passwordErrorMessage = 'Password must be at least 6 characters long.';
      hasError = true;
    }

    // Validate confirm password
    if (!this.confirmPassword) {
      this.confirmPasswordErrorMessage = 'Please confirm your password.';
      hasError = true;
    } else if (this.password !== this.confirmPassword) {
      this.confirmPasswordErrorMessage = "Your passwords don't match. Please try again.";
      hasError = true;
    }

    // If any validation failed, stop here
    if (hasError) {
      this.cdr.detectChanges();
      return;
    }

    this.authService.signUp(this.email, this.password, this.name).subscribe({
      next: () => {
        this.showTaskAddedToast = true;
        this.hideToast = false;
        this.cdr.detectChanges();

        this.startToastAutoClose();

        setTimeout(() => {
          this.router.navigate(['/summary']);
        }, 3500);
      },
      error: (err) => {
        console.error('Registration failed', err);

        if (err.code === 'auth/email-already-in-use') {
          this.emailErrorMessage = 'Email is already in use';
        } else {
          this.emailErrorMessage = 'Registration failed. Please try again.';
        }

        this.closeToastImmediately();
        this.cdr.detectChanges();
      },
    });
  }

  private startToastAutoClose() {
    clearTimeout(this.toastHideTimer);
    clearTimeout(this.toastRemoveTimer);

    this.toastHideTimer = setTimeout(() => {
      this.hideToast = true;
      this.cdr.detectChanges();
    }, 3000);

    this.toastRemoveTimer = setTimeout(() => {
      this.showTaskAddedToast = false;
      this.cdr.detectChanges();
    }, 3500);
  }

  private closeToastImmediately() {
    clearTimeout(this.toastHideTimer);
    clearTimeout(this.toastRemoveTimer);

    this.hideToast = false;
    this.showTaskAddedToast = false;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    clearTimeout(this.toastHideTimer);
    clearTimeout(this.toastRemoveTimer);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
