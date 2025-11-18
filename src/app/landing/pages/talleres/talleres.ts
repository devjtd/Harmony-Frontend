// talleres.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TallerService, TallerDetallado, Horario, Profesor } from '../../../services/taller-service'; // ⬅️ Importar TODO desde el servicio

// No redefinimos las interfaces aquí ya que las importamos del servicio (taller.service.ts)
// Si el servicio no existiera, las interfaces tendrían que estar aquí, como las tenías originalmente.

@Component({
  selector: 'app-talleres',
  standalone: true,
  // Se necesita HttpClientModule para que el servicio funcione.
  // Si usas standalone, asegúrate de que provideHttpClient() esté en tu app.config.ts
  imports: [CommonModule, RouterLink], 
  templateUrl: './talleres.html',
  styleUrls: ['./talleres.css'],
  providers: [CurrencyPipe, DatePipe, TallerService] // Proveer los pipes y el servicio
})
export class Talleres implements OnInit {

  // Usamos la interfaz TallerDetallado que coincide con el DTO de Spring Boot
  public talleres: TallerDetallado[] = []; 

  constructor(
      private currencyPipe: CurrencyPipe, 
      private datePipe: DatePipe,
      private tallerService: TallerService // ⬅️ Inyectar el TallerService
  ) { }

  ngOnInit(): void {
        this.cargarTalleres(); 
  }

    /**
     * Carga los talleres activos con sus detalles y horarios desde el REST Controller.
     */
    cargarTalleres(): void {
        this.tallerService.getTalleresDetalladosActivos().subscribe({
            next: (data) => {
                // Mapear y construir las URLs absolutas de la imagen
                this.talleres = data.map(taller => ({
                    ...taller,
                    imagenTaller: this.tallerService.getStaticImageUrl(taller.imagenTaller) 
                }));
                console.log('Talleres cargados exitosamente:', this.talleres.length);
            },
            error: (error) => {
                console.error('Error al cargar los talleres detallados:', error);
                // Aquí puedes manejar el error, por ejemplo, mostrando un mensaje al usuario
            }
        });
    }


  // --- Funciones de Utilidad (Formatos) ---

  /**
   * Formatea el precio a S/ X.XX (usando el Pipe de Angular para moneda)
   * @param precio El monto a formatear.
   * @returns Cadena con el formato de moneda.
   */
  formatPrecio(precio: number): string | null {
      // Usa 'symbol' y 'es-PE' para obtener S/ xx.00.
      return this.currencyPipe.transform(precio, 'PEN', 'symbol', '1.2-2', 'es-PE');
  }

  /**
   * Formatea un string de hora (HH:mm:ss) a HH:mm
   */
  formatHora(hora: string): string | null {
      const [h, m, s] = hora.split(':');
      const date = new Date(1, 1, 1, parseInt(h), parseInt(m), parseInt(s)); 
      return this.datePipe.transform(date, 'HH:mm');
  }

  /**
   * Formatea una fecha (yyyy-MM-dd) a dd-MM-yyyy.
   */
  formatFecha(fecha: string): string | null {
      return this.datePipe.transform(fecha, 'dd-MM-yyyy');
  }

  /**
   * Calcula los días restantes entre hoy y la fecha de inicio del horario.
   */
  getDiasRestantes(fechaInicio: string): number {
    const inicio = new Date(fechaInicio);
    const hoy = new Date();
    // Resetear horas para cálculo preciso de días
    inicio.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);

    const diffTime = inicio.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    return Math.max(0, diffDays); 
  }

}