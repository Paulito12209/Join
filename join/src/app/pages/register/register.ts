/**
 * Register Component
 *
 * Responsibilities:
 * - Handle user registration (name, email, password)
 * - Perform client-side form validation with field-specific error messages
 * - Enforce privacy policy acceptance
 * - Display success feedback via a temporary toast message
 * - Redirect user after successful registration
 *
 * This component is implemented as a standalone Angular component.
 */

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
  /** Form fields */
  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  /** UI state */
  privacyPolicyAccepted = false;
  showPassword = false;
  showConfirmPassword = false;

  /** Field-specific validation messages */
  nameErrorMessage = '';
  emailErrorMessage = '';
  passwordErrorMessage = '';
  confirmPasswordErrorMessage = '';

  /** Toast (success feedback) state */
  showTaskAddedToast = false;
  hideToast = false;

  /** Timers for toast animation lifecycle */
  private toastHideTimer?: ReturnType<typeof setTimeout>;
  private toastRemoveTimer?: ReturnType<typeof setTimeout>;

  /** Injected services */
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  /**
   * Indicates whether the form can be submitted.
   * Currently depends only on privacy policy acceptance.
   * Additional checks are handled inside the register() method.
   */
  get isFormValid(): boolean {
    return this.privacyPolicyAccepted;
  }

  /**
   * Main registration handler
   *
   * Flow:
   * 1. Clear previous validation errors
   * 2. Validate all input fields
   * 3. Abort if validation fails
   * 4. Call AuthService to create the user
   * 5. Show success toast and redirect
   */
  register() {
    // Reset previous error messages
    this.nameErrorMessage = '';
    this.emailErrorMessage = '';
    this.passwordErrorMessage = '';
    this.confirmPasswordErrorMessage = '';

    let hasError = false;

    // Validate name (minimum length)
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

    // Validate password
    if (!this.password) {
      this.passwordErrorMessage = 'Please enter a password.';
      hasError = true;
    } else if (this.password.length < 6) {
      this.passwordErrorMessage = 'Password must be at least 6 characters long.';
      hasError = true;
    }

    // Validate password confirmation
    if (!this.confirmPassword) {
      this.confirmPasswordErrorMessage = 'Please confirm your password.';
      hasError = true;
    } else if (this.password !== this.confirmPassword) {
      this.confirmPasswordErrorMessage =
        "Your passwords don't match. Please try again.";
      hasError = true;
    }

    // Stop execution if any validation failed
    if (hasError) {
      this.cdr.detectChanges();
      return;
    }

    // Call authentication service to create user
    this.authService.signUp(this.email, this.password, this.name).subscribe({
      next: () => {
        // Show success feedback
        this.showTaskAddedToast = true;
        this.hideToast = false;
        this.cdr.detectChanges();

        // Start automatic toast removal
        this.startToastAutoClose();

        // Redirect after toast animation finishes
        setTimeout(() => {
          this.router.navigate(['/summary']);
        }, 3500);
      },
      error: (err) => {
        console.error('Registration failed', err);

        // Handle common authentication errors
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

  /**
   * Starts the automatic hide and removal animation for the toast.
   * Ensures timers are cleared before restarting.
   */
  private startToastAutoClose() {
    clearTimeout(this.toastHideTimer);
    clearTimeout(this.toastRemoveTimer);

    // Trigger hide animation
    this.toastHideTimer = setTimeout(() => {
      this.hideToast = true;
      this.cdr.detectChanges();
    }, 3000);

    // Fully remove toast from DOM
    this.toastRemoveTimer = setTimeout(() => {
      this.showTaskAddedToast = false;
      this.cdr.detectChanges();
    }, 3500);
  }

  /**
   * Immediately closes and removes the toast.
   * Used when an error occurs.
   */
  private closeToastImmediately() {
    clearTimeout(this.toastHideTimer);
    clearTimeout(this.toastRemoveTimer);

    this.hideToast = false;
    this.showTaskAddedToast = false;
    this.cdr.detectChanges();
  }

  /**
   * Cleanup lifecycle hook
   *
   * Ensures no timers are left running when the component is destroyed.
   */
  ngOnDestroy(): void {
    clearTimeout(this.toastHideTimer);
    clearTimeout(this.toastRemoveTimer);
  }

  /** Toggles password input visibility */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /** Toggles confirm password input visibility */
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
