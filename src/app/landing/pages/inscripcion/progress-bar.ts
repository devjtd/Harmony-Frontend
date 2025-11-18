import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InscripcionService } from '../../../services/inscripcion-service';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-start mb-5 mt-3 position-relative">
      <div class="position-absolute w-100 top-0 start-0 progress-base" style="height: 5px; background-color: #ced4da; margin-top: 20px;"></div>
      
      <div class="position-absolute top-0 start-0 progress-fill" 
           [style.width]="progressWidth()" 
           style="height: 5px; background-color: var(--form-primary); margin-top: 20px; transition: width 0.3s ease-in-out;">
      </div>

      @for (paso of pasos; track paso.numero) {
        <div class="text-center flex-grow-1 position-relative">
          <div 
            class="rounded-circle d-inline-flex align-items-center justify-content-center text-white fw-bold shadow-sm progress-circle"
            [ngClass]="{
                'bg-success': paso.numero <= inscripcionService.pasoActual(),
                'bg-secondary': paso.numero > inscripcionService.pasoActual()
            }"
          >
            {{ paso.numero }}
          </div>
          <p class="mt-2 mb-0 small fw-medium text-nowrap"
            [ngClass]="{
                'text-primary': paso.numero <= inscripcionService.pasoActual(),
                'text-muted': paso.numero > inscripcionService.pasoActual()
            }">
            {{ paso.nombre }}
          </p>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
        display: block;
    }
    .progress-circle {
        width: 40px; 
        height: 40px; 
        z-index: 10; 
        position: relative; 
        border: 3px solid white; /* Borde blanco para separar del color de la línea */
        transition: all 0.3s;
    }
    .progress-base, .progress-fill {
        /* Para alinear al centro del circulo de 40px */
        top: 17px; 
    }
  `]
})
export class ProgressBar {
  public inscripcionService = inject(InscripcionService);

  pasos = [
    { numero: 1, nombre: 'Datos Personales' },
    { numero: 2, nombre: 'Selección de Talleres' },
    { numero: 3, nombre: 'Pago Final' }
  ];

  // NUEVA FUNCIÓN: Calcula el ancho de la barra de progreso
  progressWidth(): string {
    const totalPasos = this.pasos.length;
    const pasoActual = this.inscripcionService.pasoActual();
    
    // Si estamos en el paso 1, el progreso es 0%.
    if (pasoActual <= 1) return '0%'; 

    // Calcula el porcentaje basado en los pasos completados
    // (pasoActual - 1) son los "segmentos" ya completados
    // (totalPasos - 1) son los segmentos totales entre círculos
    const percentage = ((pasoActual - 1) / (totalPasos - 1)) * 100;
    
    // Devolvemos el porcentaje, ajustado para no abarcar toda la pantalla
    // La línea rellena va de la posición del paso 1 a la posición del paso actual.
    // Restamos 20px del inicio y 20px del final para centrarla
    return `calc(${percentage}% - 40px)`; 
  }
}