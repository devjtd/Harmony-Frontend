import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_ADMIN_BASE = 'http://localhost:8080/api/admin';
const API_UPLOAD_BASE = 'http://localhost:8080/api/upload';

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

export interface ImageInfo {
  filename: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  // === PROFESORES ===
  getProfesores(): Observable<ProfesorDTO[]> {
    console.log('🔵 [ADMIN SERVICE] GET /api/admin/profesores');
    return this.http.get<ProfesorDTO[]>(`${API_ADMIN_BASE}/profesores`);
  }

  createProfesor(payload: Partial<ProfesorDTO>): Observable<any> {
    console.log('🔵 [ADMIN SERVICE] POST /api/admin/profesores', payload);
    return this.http.post(`${API_ADMIN_BASE}/profesores`, payload);
  }

  updateProfesor(id: number, payload: Partial<ProfesorDTO>): Observable<any> {
    console.log('🔵 [ADMIN SERVICE] PUT /api/admin/profesores/' + id, payload);
    return this.http.put(`${API_ADMIN_BASE}/profesores/${id}`, payload);
  }

  deleteProfesor(id: number): Observable<any> {
    console.log('🔵 [ADMIN SERVICE] DELETE /api/admin/profesores/' + id);
    return this.http.delete(`${API_ADMIN_BASE}/profesores/${id}`);
  }

  // === TALLERES ===
  getTalleres(): Observable<TallerDTO[]> {
    console.log('🔵 [ADMIN SERVICE] GET /api/admin/talleres');
    return this.http.get<TallerDTO[]>(`${API_ADMIN_BASE}/talleres`);
  }

  getTalleresActivos(): Observable<TallerDTO[]> {
    console.log('🔵 [ADMIN SERVICE] GET /api/admin/talleres/activos');
    return this.http.get<TallerDTO[]>(`${API_ADMIN_BASE}/talleres/activos`);
  }

  getTalleresDisponibles(): Observable<TallerDTO[]> {
    console.log('🔵 [ADMIN SERVICE] GET /api/admin/clientes/talleres-disponibles');
    return this.http.get<TallerDTO[]>(`${API_ADMIN_BASE}/clientes/talleres-disponibles`);
  }

  createTaller(payload: Partial<TallerDTO>): Observable<any> {
    console.log('🔵 [ADMIN SERVICE] POST /api/admin/talleres', payload);
    // ✅ NO especificar Content-Type, dejar que Angular lo maneje automáticamente
    return this.http.post(`${API_ADMIN_BASE}/talleres`, payload);
  }

  updateTaller(id: number, payload: Partial<TallerDTO>): Observable<any> {
    console.log('🔵 [ADMIN SERVICE] PUT /api/admin/talleres/' + id, payload);
    // ✅ NO especificar Content-Type, dejar que Angular lo maneje automáticamente
    return this.http.put(`${API_ADMIN_BASE}/talleres/${id}`, payload);
  }
  deleteTaller(id: number): Observable<any> {
    console.log('🔵 [ADMIN SERVICE] DELETE /api/admin/talleres/' + id);
    return this.http.delete(`${API_ADMIN_BASE}/talleres/${id}`);
  }

  // === CLIENTES ===
  getClientes(): Observable<ClienteDTO[]> {
    console.log('🔵 [ADMIN SERVICE] GET /api/admin/clientes');
    return this.http.get<ClienteDTO[]>(`${API_ADMIN_BASE}/clientes`);
  }

  getClientesConInscripciones(): Observable<any[]> {
    console.log('🔵 [ADMIN SERVICE] GET /api/admin/clientes (con inscripciones)');
    return this.http.get<any[]>(`${API_ADMIN_BASE}/clientes`);
  }

  createCliente(payload: Partial<ClienteDTO>): Observable<any> {
    console.log('🔵 [ADMIN SERVICE] POST /api/admin/clientes', payload);
    return this.http.post(`${API_ADMIN_BASE}/clientes`, payload);
  }

  updateCliente(id: number, payload: Partial<ClienteDTO>): Observable<any> {
    console.log('🔵 [ADMIN SERVICE] PUT /api/admin/clientes/' + id, payload);
    return this.http.put(`${API_ADMIN_BASE}/clientes/${id}`, payload);
  }

  deleteCliente(id: number): Observable<any> {
    console.log('🔵 [ADMIN SERVICE] DELETE /api/admin/clientes/' + id);
    return this.http.delete(`${API_ADMIN_BASE}/clientes/${id}`);
  }

  addInscripcion(clienteId: number, horarioId: number): Observable<any> {
    console.log(`🔵 [ADMIN SERVICE] POST /api/admin/clientes/${clienteId}/inscripciones`, { horarioId });
    return this.http.post(`${API_ADMIN_BASE}/clientes/${clienteId}/inscripciones`, { horarioId });
  }

  removeInscripcion(clienteId: number, horarioId: number): Observable<any> {
    console.log(`🔵 [ADMIN SERVICE] DELETE /api/admin/clientes/${clienteId}/inscripciones/${horarioId}`);
    return this.http.delete(`${API_ADMIN_BASE}/clientes/${clienteId}/inscripciones/${horarioId}`);
  }

  // === UPLOAD ===
  uploadImage(formData: FormData): Observable<any> {
    console.log('🔵 [ADMIN SERVICE] POST /api/upload/image');
    return this.http.post(`${API_UPLOAD_BASE}/image`, formData);
  }

  /**
   * ✅ NUEVO: Obtiene la lista de imágenes disponibles
   */
  getImagesList(): Observable<any> {
    console.log('🔵 [ADMIN SERVICE] GET /api/upload/images-list');
    return this.http.get(`${API_UPLOAD_BASE}/images-list`);
  }

  // === HORARIOS ===
  createHorario(payload: HttpParams): Observable<any> {
    console.log('🔵 [ADMIN SERVICE] POST /api/admin/horarios', payload.toString());
    return this.http.post(`${API_ADMIN_BASE}/horarios`, null, { params: payload });
  }

  updateHorario(id: number, payload: HttpParams): Observable<any> {
    console.log('🔵 [ADMIN SERVICE] PUT /api/admin/horarios/' + id, payload.toString());
    return this.http.put(`${API_ADMIN_BASE}/horarios/${id}`, null, { params: payload });
  }

  deleteHorario(id: number): Observable<any> {
    console.log('🔵 [ADMIN SERVICE] DELETE /api/admin/horarios/' + id);
    return this.http.delete(`${API_ADMIN_BASE}/horarios/${id}`);
  }
}