import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService, LoginRequest } from '../../../services/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginData: LoginRequest = {
    email: '',
    password: ''
  };

  isLoading = false;
  errorMessage: string | null = null;

  // Validación de campos
  emailInvalid = false;
  passwordInvalid = false;
  emailErrorMsg = '';
  passwordErrorMsg = '';

  // Control de visibilidad de contraseña
  showPassword = false;

  returnUrl: string = '/';

  constructor() {
    // Obtener la URL de retorno si existe
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    console.log('[LOGIN COMPONENT] Componente inicializado');
    console.log('[LOGIN COMPONENT] URL de retorno:', this.returnUrl);
  }

  /**
   * Valida el formato del email
   */
  validateEmail(): boolean {
    const email = this.loginData.email.trim();

    if (!email) {
      this.emailInvalid = true;
      this.emailErrorMsg = 'El correo electrónico es obligatorio';
      return false;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      this.emailInvalid = true;
      this.emailErrorMsg = 'El formato del correo no es válido';
      return false;
    }

    this.emailInvalid = false;
    this.emailErrorMsg = '';
    return true;
  }

  /**
   * Valida la contraseña
   */
  validatePassword(): boolean {
    const password = this.loginData.password;

    if (!password) {
      this.passwordInvalid = true;
      this.passwordErrorMsg = 'La contraseña es obligatoria';
      return false;
    }

    if (password.length < 6) {
      this.passwordInvalid = true;
      this.passwordErrorMsg = 'La contraseña debe tener al menos 6 caracteres';
      return false;
    }

    this.passwordInvalid = false;
    this.passwordErrorMsg = '';
    return true;
  }

  /**
   * Valida todos los campos
   */
  validateAll(): boolean {
    const emailValid = this.validateEmail();
    const passwordValid = this.validatePassword();
    return emailValid && passwordValid;
  }

  /**
   * Maneja el envío del formulario de login
   */
  iniciarSesion(form: NgForm): void {
    this.errorMessage = null;

    console.log('[LOGIN] Iniciando proceso de login');
    console.log('[LOGIN] Email:', this.loginData.email);

    // Validar formulario
    if (!this.validateAll()) {
      console.log('[LOGIN] Validación falló');
      return;
    }

    if (form.valid) {
      this.isLoading = true;
      console.log('[LOGIN] Enviando credenciales al servidor');

      this.authService.login(this.loginData).subscribe({
        next: (response) => {
          console.log('[LOGIN SUCCESS] Autenticación exitosa');
          console.log('[LOGIN] Rol del usuario:', response.role);
          console.log('[LOGIN] Nombre:', response.nombreCompleto);

          this.isLoading = false;

          // Redirigir según el rol
          this.authService.redirectByRole();
        },
        error: (error) => {
          console.error('[LOGIN ERROR] Error en autenticación:', error);
          console.error('[LOGIN ERROR] Status:', error.status);

          this.isLoading = false;

          if (error.status === 401) {
            this.errorMessage = 'Email o contraseña incorrectos. Por favor, verifica tus credenciales.';
          } else if (error.status === 0) {
            this.errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
          } else {
            this.errorMessage = 'Ocurrió un error inesperado. Por favor, intenta nuevamente.';
          }
        }
      });
    } else {
      console.warn('[LOGIN] Formulario inválido');
    }
  }

  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Limpia los mensajes de error
   */
  clearError(): void {
    this.errorMessage = null;
  }
}