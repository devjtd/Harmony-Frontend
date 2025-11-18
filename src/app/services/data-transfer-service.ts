import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Define el tipo de datos a transferir
export interface CredencialesTransferencia {
  correo: string;
  contrasenaTemporal: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataTransferService {

  // BehaviorSubject almacena el último valor y lo emite a los suscriptores
  // Inicialmente, no tiene valor (null)
  private credencialesSource = new BehaviorSubject<CredencialesTransferencia | null>(null);
  
  // Observable que las otras clases pueden suscribir (solo lectura)
  credencialesActuales: Observable<CredencialesTransferencia | null> = this.credencialesSource.asObservable();

  constructor() { }

  /**
   * Guarda las credenciales obtenidas del backend.
   * Llamado por inscripción.ts.
   */
  setCredenciales(credenciales: CredencialesTransferencia): void {
    this.credencialesSource.next(credenciales);
    
    // Opcional: Para evitar que el usuario recargue la página y pierda el dato,
    // podrías guardarlo en sessionStorage TEMPORALMENTE aquí.
  }

  /**
   * Obtiene las credenciales y las limpia del servicio inmediatamente.
   * Llamado por confirmacion.ts.
   */
  getCredenciales(): CredencialesTransferencia | null {
    const credenciales = this.credencialesSource.value;
    // IMPORTANTE: Limpiar el valor para que no persista si el usuario navega a otra parte.
    this.credencialesSource.next(null); 
    return credenciales;
  }
}