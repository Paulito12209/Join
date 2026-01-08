import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './register.html',
    styleUrl: './register.scss'
})
export class Register {
    name = '';
    email = '';
    password = '';
    confirmPassword = '';
    privacyPolicyAccepted = false;
    errorMessage = '';
    showPassword = false;
    showConfirmPassword = false;

    private authService = inject(AuthService);
    private router = inject(Router);

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

        this.authService.signUp(this.email, this.password, this.name).subscribe({
            next: () => {
                this.router.navigate(['/summary']);
            },
            error: (err) => {
                console.error('Registration failed', err);
                if (err.code === 'auth/email-already-in-use') {
                    this.errorMessage = 'Email is already in use';
                } else {
                    this.errorMessage = 'Registration failed. Please try again.';
                }
            }
        });
    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPasswordVisibility() {
        this.showConfirmPassword = !this.showConfirmPassword;
    }
}
