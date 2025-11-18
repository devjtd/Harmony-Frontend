import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz para el modelo Noticia
export interface Noticia {
  id: number;
  titulo: string;
  contenido: string;
  imagenUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  private apiUrl = 'http://localhost:8080/api/blog'; // Endpoint del backend

  constructor(private http: HttpClient) { }

  // Obtener todas las noticias
  getNoticias(): Observable<Noticia[]> {
    return this.http.get<Noticia[]>(this.apiUrl);
  }

  // Obtener noticia por ID
  getNoticiaById(id: number): Observable<Noticia> {
    return this.http.get<Noticia>(`${this.apiUrl}/${id}`);
  }
}