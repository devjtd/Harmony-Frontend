import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactoService } from '../../../services/contacto-service';

interface ContactoForm {
  nombre: string;
  correo: string;
  asunto: string;
  mensaje: string;
}

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './contacto.html',
  styleUrls: ['./contacto.scss']
})
export class Contacto implements OnInit {

  public contactoData: ContactoForm = {
    nombre: '',
    correo: '',
    asunto: '',
    mensaje: ''
  };

  public successMessage: string | null = null;
  public errorMessage: string | null = null;
  public isLoading: boolean = false;

  constructor(
    private contactoService: ContactoService
  ) { }

  ngOnInit(): void {
    console.log('[CONTACTO COMPONENT] Componente inicializado');
  }

  enviarMensaje(formValue: ContactoForm): void {
    this.successMessage = null;
    this.errorMessage = null;
    this.isLoading = true;

    console.log('[CONTACTO] Iniciando envío de mensaje de contacto');
    console.log('[CONTACTO] Datos del formulario:', {
      nombre: formValue.nombre,
      correo: formValue.correo,
      asunto: formValue.asunto,
      mensajeLength: formValue.mensaje.length
    });
    
    this.contactoService.enviar(formValue).subscribe({
      next: (response) => {
        console.log('[CONTACTO SUCCESS] Mensaje enviado correctamente', response);
        this.successMessage = '¡Gracias! Tu mensaje ha sido enviado exitosamente.';
        this.contactoData = { nombre: '', correo: '', asunto: '', mensaje: '' };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('[CONTACTO ERROR] Error al enviar mensaje:', err);
        console.error('[CONTACTO ERROR] Detalles del error:', {
          status: err.status,
          message: err.message,
          error: err.error
        });
        this.errorMessage = 'Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo.';
        this.isLoading = false;
      }
    });
  }
}