import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatosPagoForm, InscripcionPayload, InscripcionService } from '../../../../services/inscripcion-service';
import { DataTransferService } from '../../../../services/data-transfer-service';

@Component({
  selector: 'app-metodo-pago',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './metodo-pago.html',
  styleUrl: './metodo-pago.scss',
})
export class MetodoPago implements OnInit {
  private inscripcionService = inject(InscripcionService);
  private dataTransferService = inject(DataTransferService); // ✅ INYECTADO
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public datos: DatosPagoForm = {
    numeroTarjeta: '',
    fechaVencimiento: '',
    cvv: ''
  };

  public isLoading = false;
  public totalPagar = this.inscripcionService.totalPagar;
  public talleresSeleccionados = this.inscripcionService.talleresSeleccionadosValidos;

  public isSelectionValid = computed(() => {
    const seleccionados = this.talleresSeleccionados();
    return seleccionados.length > 0 && seleccionados.every(t => t.horarioSeleccionadoId !== null);
  });

  ngOnInit(): void {
    this.inscripcionService.setPasos(3);

    console.log('[LOG METODO-PAGO] Inicializando componente MetodoPago (Paso 3)');

    const cliente = this.inscripcionService.cliente();
    if (!cliente || !this.isSelectionValid()) {
      alert('Debes completar los pasos anteriores.');
      this.router.navigate(['/inscripcion/datos']);
      return;
    }

    console.log('[LOG METODO-PAGO] Cliente cargado del servicio: ', cliente);
    console.log('[LOG METODO-PAGO] Email del cliente cargado: ' + cliente.correo);

    const pago = this.inscripcionService.datosPago();
    if (pago) {
      this.datos = pago;
    }
  }

  submitPago(form: NgForm) {
    if (form.invalid || !this.isSelectionValid() || this.totalPagar() <= 0) {
      return;
    }

    this.isLoading = true;
    console.log('[LOG METODO-PAGO] Datos de pago a guardar: ', form.value);
    this.inscripcionService.setDatosPago(form.value);

    const cliente = this.inscripcionService.cliente()!;
    const talleresSeleccionados = this.talleresSeleccionados().map(t => ({
      tallerId: t.id,
      horarioId: t.horarioSeleccionadoId!
    }));

    const payload: InscripcionPayload = {
      clienteId: cliente.id,
      nombre: cliente.nombreCompleto,
      email: cliente.correo,
      telefono: cliente.telefono,
      numeroTarjeta: form.value.numeroTarjeta,
      fechaVencimiento: form.value.fechaVencimiento,
      cvv: form.value.cvv,
      inscripciones: talleresSeleccionados,
    };

    console.log('[LOG METODO-PAGO] Payload Final a enviar: ', payload);
    console.log('[LOG METODO-PAGO] Email en Payload Final: ' + payload.email);

    this.inscripcionService.confirmarInscripcion(payload).subscribe({
      next: (response) => {
        console.log('[LOG METODO-PAGO] Inscripción exitosa. Response:', response);

        // ✅ GUARDAR CREDENCIALES EN EL SERVICIO DE TRANSFERENCIA
        this.dataTransferService.setCredenciales({
          correo: response.correo,
          contrasenaTemporal: response.contrasenaTemporal
        });

        console.log('[LOG METODO-PAGO] Credenciales guardadas en DataTransferService');

        // Limpiar estado de inscripción
        this.inscripcionService.clearState();

        // Navegar a confirmación
        this.router.navigate(['/confirmacion']);
      },
      error: (err) => {
        console.error('[LOG METODO-PAGO] Error al procesar el pago:', err);
        alert('Error en el pago. Por favor, verifica tus datos de tarjeta e inténtalo de nuevo.');
        this.isLoading = false;
      }
    });
  }

  eliminarTaller(tallerId: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este taller de tu inscripción?')) {
      this.inscripcionService.toggleTaller(tallerId, false);
      // Si después de eliminar no queda nada, redirigir o mostrar mensaje
      if (this.talleresSeleccionados().length === 0) {
        alert('Has eliminado todos los talleres. Serás redirigido a la selección.');
        this.router.navigate(['/inscripcion/talleres', this.inscripcionService.cliente()?.id]);
      }
    }
  }
}