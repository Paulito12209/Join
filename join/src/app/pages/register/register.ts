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
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  showTaskAddedToast = false;
  hideToast = false;
  private toastHideTimer?: ReturnType<typeof setTimeout>;
  private toastRemoveTimer?: ReturnType<typeof setTimeout>;

  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  get isFormValid(): boolean {
    return (
      this.name.trim() !== '' &&
      this.email.trim() !== '' &&
      this.password.length >= 6 &&
      this.password === this.confirmPassword &&
      this.privacyPolicyAccepted
    );
  }

  register() {
    if (!this.isFormValid) return;

    this.errorMessage = '';

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

        this.errorMessage =
          err.code === 'auth/email-already-in-use'
            ? 'Email is already in use'
            : 'Registration failed. Please try again.';

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
