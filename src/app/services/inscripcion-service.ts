import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE_URL = 'http://localhost:8080/api/inscripcion';

// --- DEFINICIONES DE TIPOS (INTERFACES) ---
export interface Profesor {
  id: number;
  nombreCompleto: string;
}

export interface Horario {
  id: number;
  diasDeClase: string;
  horaInicio: string;
  horaFin: string;
  vacantesDisponibles: number;
  profesor: Profesor;
}

export interface Taller {
  id: number;
  nombre: string;
  precio: number;
  horarios: Horario[];
  seleccionado: boolean;
  horarioSeleccionadoId: number | null;
}

export interface TallerSeleccionadoConHorario extends Omit<Taller, 'horarios'> {
  horarioSeleccionado: Horario | null;
}

export interface Cliente {
  id: number;
  nombreCompleto: string; 
  correo: string;
  telefono: string;
}

export interface DatosPersonalesForm {
  nombre: string;
  email: string;
  telefono: string;
}

export interface DatosPagoForm {
  numeroTarjeta: string;
  fechaVencimiento: string;
  cvv: string;
}

export interface InscripcionDetalle {
  tallerId: number;
  horarioId: number;
}

export interface InscripcionPayload {
  clienteId: number;
  nombre: string;
  email: string;
  telefono: string;
  numeroTarjeta: string;
  fechaVencimiento: string;
  cvv: string;
  inscripciones: InscripcionDetalle[];
}

export interface InscripcionResponse {
  correo: string;
  contrasenaTemporal: string;
  confirmacionId: string;
}

@Injectable({
  providedIn: 'root'
})
export class InscripcionService {
  private http = inject(HttpClient);
  private router = inject(Router);

  cliente = signal<Cliente | null>(null);

  talleresDisponibles = signal<Taller[]>([]);

  datosPago = signal<DatosPagoForm | null>(null);

  pasoActual = signal<number>(1);


  talleresMarcados = computed<Taller[]>(() => {
    return this.talleresDisponibles().filter(t => t.seleccionado);
  });


  talleresSeleccionadosValidos = computed<TallerSeleccionadoConHorario[]>(() => {
    console.log('[LOG INSCRIPCION-SERVICE] Recalculando talleresSeleccionadosValidos');
    return this.talleresDisponibles()
      .filter(t => t.seleccionado)
      .map(taller => {
        const horario = taller.horarioSeleccionadoId
          ? taller.horarios.find(h => h.id === taller.horarioSeleccionadoId)
          : null;

        return {
          id: taller.id,
          nombre: taller.nombre,
          precio: taller.precio,
          seleccionado: taller.seleccionado,
          horarioSeleccionadoId: taller.horarioSeleccionadoId,
          horarioSeleccionado: horario
        } as TallerSeleccionadoConHorario;
      });
  });

  totalPagar = computed(() => {
    return this.talleresSeleccionadosValidos().reduce((sum, t) =>
      sum + (t.horarioSeleccionado ? t.precio : 0), 0
    );
  });

  guardarDatosPersonales(datos: DatosPersonalesForm): Observable<Cliente> {
    console.log('[LOG INSCRIPCION-SERVICE] POST /cliente con datos: ', datos);
    return this.http.post<Cliente>(`${API_BASE_URL}/cliente`, datos);
  }

  obtenerTalleres(): Observable<Omit<Taller, 'seleccionado' | 'horarioSeleccionadoId'>[]> {
    console.log('[LOG INSCRIPCION-SERVICE] GET /talleresDisponibles');
    return this.http.get<Omit<Taller, 'seleccionado' | 'horarioSeleccionadoId'>[]>(`${API_BASE_URL}/talleresDisponibles`);
  }

  confirmarInscripcion(payload: InscripcionPayload): Observable<InscripcionResponse> {
    console.log('[LOG INSCRIPCION-SERVICE] POST /confirmar con payload: ', payload);
    return this.http.post<InscripcionResponse>(`${API_BASE_URL}/confirmar`, payload);
  }

  setCliente(clienteData: Cliente) {
    console.log('[LOG INSCRIPCION-SERVICE] Cliente guardado en signal: ', clienteData);
    this.cliente.set(clienteData);
    this.pasoActual.set(2);
    this.router.navigate(['/inscripcion', 'talleres', clienteData.id]);
  }

  setTalleresIniciales(talleresApi: Omit<Taller, 'seleccionado' | 'horarioSeleccionadoId'>[]) {
    console.log('[LOG INSCRIPCION-SERVICE] Talleres iniciales configurados');
    const talleresConEstado: Taller[] = talleresApi.map(t => ({
      ...t,
      seleccionado: false,
      horarioSeleccionadoId: null
    }));
    this.talleresDisponibles.set(talleresConEstado);
  }

  toggleTaller(tallerId: number, isChecked: boolean) {
    console.log(`[LOG INSCRIPCION-SERVICE] Toggle Taller ID ${tallerId}, estado: ${isChecked}`);
    this.talleresDisponibles.update(currentTalleres =>
      currentTalleres.map(t => {
        if (t.id === tallerId) {
          return {
            ...t,
            seleccionado: isChecked,
            horarioSeleccionadoId: isChecked ? t.horarioSeleccionadoId : null
          };
        }
        return t;
      })
    );
  }

  setHorario(tallerId: number, horarioId: number | null) {
    console.log(`[LOG INSCRIPCION-SERVICE] Set Horario para Taller ID ${tallerId} a Horario ID: ${horarioId}`);
    this.talleresDisponibles.update(currentTalleres =>
      currentTalleres.map(t =>
        t.id === tallerId ? { ...t, horarioSeleccionadoId: horarioId } : t
      )
    );
  }

  setDatosPago(datos: DatosPagoForm) {
    console.log('[LOG INSCRIPCION-SERVICE] Datos de pago guardados en signal: ', datos);
    this.datosPago.set(datos);
    this.pasoActual.set(3);
  }

  setPasos(paso: number) {
    this.pasoActual.set(paso);
  }

  clearState() {
    console.log('[LOG INSCRIPCION-SERVICE] Limpiando estado global de inscripción.');
    this.cliente.set(null);
    this.talleresDisponibles.set([]);
    this.datosPago.set(null);
    this.pasoActual.set(1);
  }
}