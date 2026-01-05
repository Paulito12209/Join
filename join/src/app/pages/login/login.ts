import { Component, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
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

  private authService = inject(AuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  ngOnInit() {
    setTimeout(() => {
      this.showIntroLogo = false;
    }, 1200);
  }

  login(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    this.authService.signIn(this.email, this.password).subscribe({
      next: () => {
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
        if (err.code === 'auth/configuration-not-found') {
          this.errorMessage = 'Firebase Email/Password login is NOT enabled in Console!';
        } else if (err.code === 'auth/invalid-credential') {
          this.errorMessage = 'Wrong email or password.';
        } else {
          this.errorMessage = 'Login failed: ' + err.message;
        }
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
