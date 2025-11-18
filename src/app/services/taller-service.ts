// taller.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// --- Interfaces Necesarias para el Taller Detallado (DTO de Spring Boot) ---
// Estas interfaces están en el servicio para ser compartidas por otros componentes si es necesario.

export interface Profesor {
    nombreCompleto: string;
    // Agrega aquí otros campos si los necesitas (ej: email, foto)
}

export interface Horario {
    id: number;
    diasDeClase: string; // Ej: Lunes y Miércoles
    horaInicio: string;  // Formato: HH:mm:ss (e.g., "18:00:00")
    horaFin: string;     // Formato: HH:mm:ss (e.g., "19:30:00")
    fechaInicio: string; // Formato: yyyy-MM-dd (e.g., "2025-12-01")
    vacantesDisponibles: number;
    profesor: Profesor;
}

// Interfaz para el Taller Detallado (DTO) que consume talleres.ts
export interface TallerDetallado { 
    id: number;
    nombre: string;
    descripcion: string;
    imagenTaller: string; // La URL relativa de la imagen
    duracionSemanas: number;
    clasesPorSemana: number;
    precio: number; // Tipo 'number' para el BigDecimal/Double
    temas: string;
    
    // Campos que vienen del nuevo REST Controller
    horariosAbiertos: Horario[]; 
    tieneHorariosDefinidos: boolean;
}

// Interfaz para la página de inicio (solo lo esencial, si aún la usas)
export interface TallerSimple { 
    id: number;
    nombre: string;
    duracionSemanas: number;
    clasesPorSemana: number;
    precio: number;
    imagenInicio: string; 
}
// -------------------------------------------------------------------------


@Injectable({
  providedIn: 'root'
})
export class TallerService { 

  // 🚨 URL del endpoint REST de Spring Boot
  private readonly API_URL = 'http://localhost:8080/api/talleres'; 
  // 🚨 URL BASE para RECURSOS ESTÁTICOS de Spring Boot
  private readonly STATIC_URL = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista de talleres activos (solo campos básicos) desde Spring Boot.
   */
  getTalleresActivos(): Observable<TallerSimple[]> {
    return this.http.get<TallerSimple[]>(`${this.API_URL}/activos`);
  }
  
  /**
   * Obtiene la lista de talleres activos con información detallada y horarios para talleres.html.
   */
  getTalleresDetalladosActivos(): Observable<TallerDetallado[]> {
    return this.http.get<TallerDetallado[]>(`${this.API_URL}/detallados/activos`);
  }
  
  /**
   * Construye la URL COMPLETA para un recurso estático (imagen).
   */
  getStaticImageUrl(relativePath: string): string {
    return `${this.STATIC_URL}${relativePath}`;
  }
}