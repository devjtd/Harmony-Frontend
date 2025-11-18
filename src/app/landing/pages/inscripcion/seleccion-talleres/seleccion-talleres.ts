import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InscripcionService } from '../../../../services/inscripcion-service';

@Component({
  selector: 'app-seleccion-talleres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seleccion-talleres.html',
  styleUrl: './seleccion-talleres.scss',
})
export class SeleccionTalleres implements OnInit {
  private inscripcionService = inject(InscripcionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public clienteId: number | null = null;
  public isLoading = true;
  public showError = false;
  
  // Accede al estado reactivo del servicio
  public talleres = this.inscripcionService.talleresDisponibles;
  public totalPagar = this.inscripcionService.totalPagar;
  // Usamos la NUEVA señal para la validación:
  public talleresMarcados = this.inscripcionService.talleresMarcados; 
  
  // Computed para la validación: Al menos 1 taller marcado Y todos los marcados con horario elegido
  public isSelectionValid = computed(() => {
    // 1. Usa la señal talleresMarcados (Talleres cuyo checkbox está marcado)
    const marcados = this.talleresMarcados(); 
    
    // 2. Si no hay talleres marcados, es falso.
    if (marcados.length === 0) return false;
    
    // 3. Verifica que TODOS los talleres marcados tengan un ID de horario.
    return marcados.every(t => t.horarioSeleccionadoId !== null);
});


  ngOnInit(): void {
    this.inscripcionService.setPasos(2);
    // 1. Obtener ID de la URL
    this.route.paramMap.subscribe(params => {
        const idParam = params.get('clienteId');
        this.clienteId = idParam ? +idParam : null;
        
        // 2. Si no hay clienteId, redirigir al paso 1
        if (!this.clienteId || !this.inscripcionService.cliente()) {
            this.router.navigate(['/inscripcion/datos']);
            return;
        }

        // 3. Cargar talleres si la lista está vacía (solo al inicio)
        if (this.talleres().length === 0) {
            this.loadTalleres();
        } else {
            this.isLoading = false;
        }
    });
  }
  
  private loadTalleres(): void {
    this.isLoading = true;
    this.inscripcionService.obtenerTalleres().subscribe({
      next: (talleresApi) => {
        // Inicializa el estado en el servicio
        this.inscripcionService.setTalleresIniciales(talleresApi);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar talleres:', err);
        this.showError = true;
        this.isLoading = false;
      }
    });
  }

  // Maneja el cambio de checkbox del taller
  toggleTaller(tallerId: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.inscripcionService.toggleTaller(tallerId, isChecked);
  }

  updateHorario(tallerId: number, horarioId: any): void {
  // El 'horarioId' es el valor de la opción seleccionada.
  // Como [ngValue] es un number, horarioId ya debería ser un number, 
  // pero lo parseamos para seguridad.
  
  // Si el valor es null (Selecciona un horario), lo mantendrá como null.
  // Si es un número (ID de horario), lo parsea.
  const numericHorarioId = horarioId ? parseInt(horarioId, 10) : null;
  
  // Llama al servicio con el ID numérico o null.
  this.inscripcionService.setHorario(tallerId, numericHorarioId);
}
  
  // Botón para avanzar al Paso 3
  // En goToPago, la validación ahora usará la nueva lógica:
  goToPago(): void {
    if (this.isSelectionValid() && this.clienteId !== null) {
      // El servicio actualizará el paso y la ruta
      this.inscripcionService.setPasos(3);
      this.router.navigate(['/inscripcion', 'pago', this.clienteId]);
    } else {
      alert('Por favor, selecciona al menos un taller y su horario correspondiente.');
    }
  }
}