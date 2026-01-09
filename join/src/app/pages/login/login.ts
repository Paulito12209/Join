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
  email = '';
  password = '';
  errorMessage = '';
  showIntroLogo = true;
  showWhiteLogo = true;
  showHeaderLogo = false;

  private authService = inject(AuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private introAnimationService = inject(IntroAnimationService);

  ngOnInit() {
    // Prüfe, ob die Animation bereits gezeigt wurde (in dieser Session)
    if (this.introAnimationService.hasAnimationBeenShown()) {
      // Animation überspringen - direkt finalen Zustand setzen
      this.showIntroLogo = false;
      this.showWhiteLogo = false;
      this.showHeaderLogo = true;
      return;
    }

    // Animation wurde noch nicht gezeigt - starte sie
    this.showIntroLogo = true;
    this.showWhiteLogo = true;
    this.showHeaderLogo = false;

    // Wechsle zu dunklem Logo während der Animation
    setTimeout(() => {
      this.showWhiteLogo = false;
      this.cdr.detectChanges();
    }, 600);

    // Header-Logo einblenden (kurz bevor das Intro-Logo ausfadet)
    setTimeout(() => {
      this.showHeaderLogo = true;
      this.cdr.detectChanges();
    }, 1100);

    // Intro-Logo später ausblenden (nachdem Header-Logo sichtbar ist)
    setTimeout(() => {
      this.showIntroLogo = false;
      // Markiere Animation als gezeigt für diese Session
      this.introAnimationService.markAnimationAsShown();
      this.cdr.detectChanges();
    }, 1700);
  }

  login(event?: Event) {
    if (event) {
      event.preventDefault();
    }

    console.log('Login attempt:', { email: this.email, password: this.password ? '***' : '' });

    if (!this.email || !this.password) {
      console.log('Validation failed: empty fields');
      this.errorMessage = 'Check your email and password. Please try again.';
      this.cdr.detectChanges(); // Force change detection
      return;
    }

    // Clear error message only if validation passes
    this.errorMessage = '';

    this.authService.signIn(this.email, this.password).subscribe({
      next: () => {
        console.log('Login successful');
        // Wait for the auth state to update in the global observable before navigating
        this.authService.user$
          .pipe(
            filter((u) => !!u),
            take(1)
          )
          .subscribe(() => {
            this.ngZone.run(() => {
              this.router.navigate(['/summary']);
            });
          });
      },
      error: (err) => {
        console.log('Login error:', err);
        this.errorMessage = 'Check your email and password. Please try again.';
        this.cdr.detectChanges(); // Force change detection
      },
    });
  }

  guestLogin() {
    this.authService.loginAsGuest().subscribe({
      next: () => {
        this.router.navigate(['/summary']);
      },
      error: (err) => {
        console.error('Guest login failed', err);
        this.errorMessage = 'Guest login failed';
      },
    });
  }
}
