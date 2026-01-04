import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './login.html',
    styleUrl: './login.scss'
})
export class Login {
    email = '';
    password = '';
    errorMessage = '';

    private authService = inject(AuthService);
    private router = inject(Router);

    login() {
        this.authService.signIn(this.email, this.password).subscribe({
            next: () => {
                this.router.navigate(['/summary']);
            },
            error: (err) => {
                console.error('Login failed', err);
                this.errorMessage = 'Email or password is incorrect';
            }
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
            }
        });
    }
}
