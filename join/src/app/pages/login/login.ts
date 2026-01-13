/**
 * Login Component
 *
 * Responsibilities:
 * - Handle user login (email/password)
 * - Handle guest login
 * - Control intro logo animation (shown once per session)
 * - Display validation and authentication errors
 * - Navigate to summary page after successful login
 *
 * This component is standalone and fully self-contained.
 */

import { Component, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { IntroAnimationService } from '../../core/services/intro-animation.service';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  /** Form state */
  email = '';
  password = '';
  errorMessage = '';

  /** Animation state */
  showIntroLogo = true;
  showWhiteLogo = true;
  showHeaderLogo = false;

  /** Injected services */
  private authService = inject(AuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private introAnimationService = inject(IntroAnimationService);

  /**
   * Component initialization
   *
   * Controls the intro animation lifecycle.
   * The animation is shown only once per browser session.
   */
  ngOnInit() {
    // Skip animation if already shown in this session
    if (this.introAnimationService.hasAnimationBeenShown()) {
      this.showIntroLogo = false;
      this.showWhiteLogo = false;
      this.showHeaderLogo = true;
      return;
    }

    // Initial animation state
    this.showIntroLogo = true;
    this.showWhiteLogo = true;
    this.showHeaderLogo = false;

    // Switch from white logo to dark logo
    setTimeout(() => {
      this.showWhiteLogo = false;
      this.cdr.detectChanges();
    }, 600);

    // Fade in header logo before intro disappears
    setTimeout(() => {
      this.showHeaderLogo = true;
      this.cdr.detectChanges();
    }, 1100);

    // Remove intro overlay and mark animation as shown
    setTimeout(() => {
      this.showIntroLogo = false;
      this.introAnimationService.markAnimationAsShown();
      this.cdr.detectChanges();
    }, 1700);
  }

  /**
   * Standard user login
   *
   * - Validates input fields
   * - Calls AuthService
   * - Waits for authenticated user state
   * - Redirects to summary page
   */
  login(event?: Event) {
    if (event) {
      event.preventDefault();
    }

    if (!this.email || !this.password) {
      this.errorMessage = 'Check your email and password. Please try again.';
      this.cdr.detectChanges();
      return;
    }

    this.errorMessage = '';

    this.authService.signIn(this.email, this.password).subscribe({
      next: () => {
        this.authService.user$
          .pipe(
            filter((u) => !!u),
            take(1)
          )
          .subscribe(() => {
            sessionStorage.setItem('just_logged_in', 'true');
            this.ngZone.run(() => {
              this.router.navigate(['/summary']);
            });
          });
      },
      error: () => {
        this.errorMessage = 'Check your email and password. Please try again.';
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Guest login
   *
   * Allows access without credentials.
   * Typically used for demo or testing purposes.
   */
  guestLogin() {
    this.authService.loginAsGuest().subscribe({
      next: () => {
        sessionStorage.setItem('just_logged_in', 'true');
        this.router.navigate(['/summary']);
      },
      error: () => {
        this.errorMessage = 'Guest login failed';
      },
    });
  }
}
