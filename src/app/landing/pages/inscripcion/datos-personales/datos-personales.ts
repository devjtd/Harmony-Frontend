import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DatosPersonalesForm, InscripcionService } from '../../../../services/inscripcion-service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-datos-personales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './datos-personales.html',
  styleUrl: './datos-personales.scss',
})
export class DatosPersonales implements OnInit {
  private inscripcionService = inject(InscripcionService);

  datos: DatosPersonalesForm = {
    nombre: '',
    email: '',
    telefono: ''
  };

  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Propiedades para validación visual
  nombreInvalid = false;
  emailInvalid = false;
  telefonoInvalid = false;
  
  nombreErrorMsg = '';
  emailErrorMsg = '';
  telefonoErrorMsg = '';

  ngOnInit(): void {
    console.log('[LOG DATOS-PERSONALES] Inicializando componente DatosPersonales (Paso 1)');
    this.inscripcionService.setPasos(1);
    const cliente = this.inscripcionService.cliente();
    if (cliente) {
      console.log('[LOG DATOS-PERSONALES] Precargando datos: ' + cliente.correo);
      this.datos = { nombre: cliente.nombreCompleto, email: cliente.correo, telefono: cliente.telefono };
    }
  }

  clearError() {
    this.errorMessage = null;
    this.successMessage = null;
  }

  // Validación del nombre
  validateNombre(): boolean {
    const nombre = this.datos.nombre.trim();
    
    if (!nombre) {
      this.nombreInvalid = true;
      this.nombreErrorMsg = 'El nombre es obligatorio';
      return false;
    }
    
    if (nombre.length < 3) {
      this.nombreInvalid = true;
      this.nombreErrorMsg = 'El nombre debe tener al menos 3 caracteres';
      return false;
    }
    
    if (nombre.length > 100) {
      this.nombreInvalid = true;
      this.nombreErrorMsg = 'El nombre no puede exceder 100 caracteres';
      return false;
    }
    
    // Validar que contenga solo letras, espacios y caracteres latinos
    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nombreRegex.test(nombre)) {
      this.nombreInvalid = true;
      this.nombreErrorMsg = 'El nombre solo puede contener letras y espacios';
      return false;
    }
    
    this.nombreInvalid = false;
    this.nombreErrorMsg = '';
    return true;
  }

  // Validación del email
  validateEmail(): boolean {
    const email = this.datos.email.trim();
    
    if (!email) {
      this.emailInvalid = true;
      this.emailErrorMsg = 'El correo electrónico es obligatorio';
      return false;
    }
    
    // Regex para validar formato de email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      this.emailInvalid = true;
      this.emailErrorMsg = 'El formato del correo electrónico no es válido';
      return false;
    }
    
    if (email.length > 100) {
      this.emailInvalid = true;
      this.emailErrorMsg = 'El correo no puede exceder 100 caracteres';
      return false;
    }
    
    this.emailInvalid = false;
    this.emailErrorMsg = '';
    return true;
  }

  // Validación del teléfono
  validateTelefono(): boolean {
    const telefono = this.datos.telefono.trim();
    
    if (!telefono) {
      this.telefonoInvalid = true;
      this.telefonoErrorMsg = 'El teléfono es obligatorio';
      return false;
    }
    
    // Remover espacios, guiones y paréntesis para validar solo números
    const telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');
    
    // Validar que contenga solo números y posiblemente un + al inicio
    const telefonoRegex = /^\+?\d+$/;
    if (!telefonoRegex.test(telefonoLimpio)) {
      this.telefonoInvalid = true;
      this.telefonoErrorMsg = 'El teléfono solo puede contener números, espacios, guiones y paréntesis';
      return false;
    }
    
    // Validar longitud (entre 7 y 15 dígitos)
    const numDigitos = telefonoLimpio.replace(/\+/g, '').length;
    if (numDigitos < 7) {
      this.telefonoInvalid = true;
      this.telefonoErrorMsg = 'El teléfono debe tener al menos 7 dígitos';
      return false;
    }
    
    if (numDigitos > 15) {
      this.telefonoInvalid = true;
      this.telefonoErrorMsg = 'El teléfono no puede tener más de 15 dígitos';
      return false;
    }
    
    this.telefonoInvalid = false;
    this.telefonoErrorMsg = '';
    return true;
  }

  // Validar todos los campos
  validateAll(): boolean {
    const nombreValido = this.validateNombre();
    const emailValido = this.validateEmail();
    const telefonoValido = this.validateTelefono();
    
    return nombreValido && emailValido && telefonoValido;
  }

  submitDatos(form: NgForm) {
    // Limpiar mensajes previos
    this.successMessage = null;
    this.errorMessage = null;

    console.log('[LOG DATOS-PERSONALES] Iniciando validación del formulario');
    
    // Validar todos los campos
    if (!this.validateAll()) {
      console.log('[LOG DATOS-PERSONALES] Validación falló');
      this.errorMessage = 'Por favor, corrige los errores en el formulario';
      return;
    }

    if (form.valid) {
      this.isLoading = true;

      const datosCliente: DatosPersonalesForm = form.value;
      console.log('[LOG DATOS-PERSONALES] Enviando datos personales. Email: ' + datosCliente.email);
      console.log('[LOG DATOS-PERSONALES] Validación exitosa - Todos los campos correctos');

      this.inscripcionService.guardarDatosPersonales(datosCliente).subscribe({
        next: (clienteGuardado) => {
          console.log('[LOG DATOS-PERSONALES] Cliente guardado con éxito. ID: ' + clienteGuardado.id + ', Email: ' + clienteGuardado.correo);
          this.inscripcionService.setCliente(clienteGuardado);
          this.successMessage = "¡Datos guardados! Pulsa 'Continuar' para seleccionar tu taller.";
          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('[LOG DATOS-PERSONALES] Error al registrar datos personales:', err);

          if (err.status === 409 || err.status === 400) {
            this.errorMessage = "Ya tienes una cuenta activa con este correo. Por favor, inicia sesión para continuar.";
          }
          else if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = "Error desconocido al guardar los datos. Revisa el estado de la conexión.";
          }
          this.isLoading = false;
        }
      });
    }
  }
}