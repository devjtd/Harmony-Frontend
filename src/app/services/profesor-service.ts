import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// La interfaz sigue siendo la misma
export interface Profesor {
    id: number;
    nombreCompleto: string;
    telefono: string; 
    fotoUrl: string; // Contiene la ruta o el nombre del archivo
    informacion: string; 
}

@Injectable({
    providedIn: 'root'
})
export class ProfesorService { 

    // URL del endpoint REST de Spring Boot
    private readonly API_URL = 'http://localhost:8080/api/profesores'; 
    // URL BASE del servidor
    private readonly STATIC_URL = 'http://localhost:8080';

    constructor(private http: HttpClient) { }

    getProfesores(): Observable<Profesor[]> {
        return this.http.get<Profesor[]>(this.API_URL);
    }
    
    /**
     * Convierte la ruta de la DB a una URL absoluta que el navegador pueda resolver.
     */
    getStaticImageUrl(pathOrFileName: string): string {
        if (!pathOrFileName) {
            return ''; // Retorna vacío si no hay ruta
        }
        
        // 1. Limpia cualquier barra inicial
        let cleanPath = pathOrFileName.startsWith('/') ? pathOrFileName.substring(1) : pathOrFileName;

        // 2. Si la ruta de la DB ya contiene 'images/', úsala directamente.
        if (cleanPath.startsWith('images/')) {
            return `${this.STATIC_URL}/${cleanPath}`;
        }
        
        // 3. Si es solo el nombre del archivo, construimos la URL completa.
        // RESULTADO ESPERADO: http://localhost:8080/images/profesor1.jpg
        return `${this.STATIC_URL}/images/${cleanPath}`;
    }
}