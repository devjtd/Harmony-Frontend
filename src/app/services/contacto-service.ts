import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

interface ContactoForm {
  nombre: string;
  correo: string;
  asunto: string;
  mensaje: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactoService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/contacto/enviar';

  enviar(contactoData: ContactoForm): Observable<any> {
    console.log('[CONTACTO SERVICE] Enviando petición POST a:', this.API_URL);
    console.log('[CONTACTO SERVICE] Payload:', contactoData);

    return this.http.post(this.API_URL, contactoData).pipe(
      tap(response => {
        console.log('[CONTACTO SERVICE SUCCESS] Respuesta del servidor:', response);
      }),
      catchError(error => {
        console.error('[CONTACTO SERVICE ERROR] Error en la petición:', error);
        return throwError(() => error);
      })
    );
  }
}