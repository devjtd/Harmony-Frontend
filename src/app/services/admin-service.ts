import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_ADMIN_BASE = 'http://localhost:8080/api/admin';

export interface ProfesorDTO {
  id: number;
  nombreCompleto: string;
  correo?: string;
  telefono?: string;
  fotoUrl?: string;
  informacion?: string;
}

export interface TallerDTO {
  id: number;
  nombre: string;
  precio?: number;
  descripcion?: string;
  duracionSemanas?: number;
  clasesPorSemana?: number;
  imagenTaller?: string;
  imagenInicio?: string;
  temas?: string;
  activo?: boolean;
  horarios?: any[];
}

export interface ClienteDTO {
  id: number;
  nombreCompleto: string;
  correo: string;
  telefono?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  getProfesores(): Observable<ProfesorDTO[]> {
    return this.http.get<ProfesorDTO[]>(`${API_ADMIN_BASE}/profesores`);
  }

  createProfesor(payload: Partial<ProfesorDTO>): Observable<any> {
    return this.http.post(`${API_ADMIN_BASE}/profesores`, payload);
  }

  updateProfesor(id: number, payload: Partial<ProfesorDTO>): Observable<any> {
    return this.http.put(`${API_ADMIN_BASE}/profesores/${id}`, payload);
  }

  deleteProfesor(id: number): Observable<any> {
    return this.http.delete(`${API_ADMIN_BASE}/profesores/${id}`);
  }

  getTalleres(): Observable<TallerDTO[]> {
    return this.http.get<TallerDTO[]>(`${API_ADMIN_BASE}/talleres`);
  }

  getClientes(): Observable<ClienteDTO[]> {
    return this.http.get<ClienteDTO[]>(`${API_ADMIN_BASE}/clientes`);
  }

  // === Talleres CRUD ===
  createTaller(payload: Partial<TallerDTO>): Observable<any> {
    return this.http.post(`${API_ADMIN_BASE}/talleres`, payload);
  }

  updateTaller(id: number, payload: Partial<TallerDTO>): Observable<any> {
    return this.http.put(`${API_ADMIN_BASE}/talleres/${id}`, payload);
  }

  deleteTaller(id: number): Observable<any> {
    return this.http.delete(`${API_ADMIN_BASE}/talleres/${id}`);
  }

  // === Clientes (Estudiantes) CRUD ===
  createCliente(payload: Partial<ClienteDTO>): Observable<any> {
    return this.http.post(`${API_ADMIN_BASE}/clientes`, payload);
  }

  updateCliente(id: number, payload: Partial<ClienteDTO>): Observable<any> {
    return this.http.put(`${API_ADMIN_BASE}/clientes/${id}`, payload);
  }

  deleteCliente(id: number): Observable<any> {
    return this.http.delete(`${API_ADMIN_BASE}/clientes/${id}`);
  }

  // === Horarios ===
  createHorario(formData: any): Observable<any> {
    // Backend expects request params for horario creation in AdminRestController
    return this.http.post(`${API_ADMIN_BASE}/horarios`, formData);
  }

  updateHorario(id: number, formData: any): Observable<any> {
    return this.http.put(`${API_ADMIN_BASE}/horarios/${id}`, formData);
  }

  deleteHorario(id: number): Observable<any> {
    return this.http.delete(`${API_ADMIN_BASE}/horarios/${id}`);
  }
}
