import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth-service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [FormsModule, CommonModule, RouterModule],
    templateUrl: './forgot-password.html',
    styleUrls: ['./forgot-password.scss']
})
export class ForgotPassword {
    private authService = inject(AuthService);
    private router = inject(Router);

    email: string = '';
    token: string = '';
    newPassword: string = '';

    // Steps: 1 = Request Token, 2 = Reset Password
    currentStep: number = 1;

    isLoading = false;
    errorMessage: string | null = null;
    successMessage: string | null = null;

    // Validation
    emailInvalid = false;
    passwordInvalid = false;

    constructor() {
        console.log('[FORGOT PASSWORD] Componente inicializado');
    }

    requestToken() {
        this.errorMessage = null;
        this.successMessage = null;

        if (!this.email) {
            this.errorMessage = 'Por favor, ingresa tu correo electrónico.';
            return;
        }

        this.isLoading = true;
        console.log('[FORGOT PASSWORD] Solicitando token para:', this.email);

        this.authService.forgotPassword(this.email).subscribe({
            next: (response) => {
                console.log('[FORGOT PASSWORD] Solicitud enviada:', response);
                this.isLoading = false;
                this.successMessage = 'Si el correo existe, se ha enviado un código de verificación.';
                this.currentStep = 2;
            },
            error: (error) => {
                console.error('[FORGOT PASSWORD ERROR]', error);
                this.isLoading = false;
                // Even on error, we might want to show a generic message or the specific error if it's not security sensitive
                // For now, keeping the error message from backend if available
                this.errorMessage = error.error?.error || 'Error al solicitar la recuperación.';
            }
        });
    }

    resetPassword() {
        this.errorMessage = null;
        this.successMessage = null;

        if (!this.token || !this.newPassword) {
            this.errorMessage = 'Todos los campos son obligatorios.';
            return;
        }

        if (this.newPassword.length < 6) {
            this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
            return;
        }

        this.isLoading = true;
        console.log('[FORGOT PASSWORD] Restableciendo contraseña...');

        this.authService.resetPassword(this.token, this.newPassword).subscribe({
            next: (response) => {
                console.log('[FORGOT PASSWORD] Contraseña actualizada');
                this.isLoading = false;
                this.successMessage = 'Contraseña actualizada exitosamente. Redirigiendo al login...';
                setTimeout(() => {
                    this.router.navigate(['/auth/login']);
                }, 2000);
            },
            error: (error) => {
                console.error('[FORGOT PASSWORD ERROR]', error);
                this.isLoading = false;
                this.errorMessage = error.error?.error || 'Error al restablecer la contraseña.';
            }
        });
    }
}
