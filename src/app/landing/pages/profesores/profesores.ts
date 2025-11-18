// profesores.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Profesor, ProfesorService } from '../../../services/profesor-service';
// ⬅️ Importar la interfaz y el servicio del paso anterior

// Las interfaces originales se pueden simplificar o borrar si se usa la importación del servicio

@Component({
  selector: 'app-profesores',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './profesores.html',
  styleUrls: ['./profesores.scss']
})

export class Profesores implements OnInit {

  public profesores: Profesor[] = [];

  // 🚨 CAMBIO: Inyectar el ProfesorService
  constructor(private profesorService: ProfesorService) { } 

  ngOnInit(): void {
    this.cargarProfesores();
  }
  
  cargarProfesores(): void {
    this.profesorService.getProfesores().subscribe({
        next: (data) => {
            // 🚨 MAPEO CLAVE: Construir la URL Absoluta
            this.profesores = data.map(profesor => ({
                ...profesor,
                // Reemplaza la URL relativa de la DB por la URL absoluta para el navegador
                fotoUrl: this.profesorService.getStaticImageUrl(profesor.fotoUrl) 
            }));
            console.log(`Profesores cargados con URLs absolutas: ${this.profesores.length}`);
        },
        error: (error) => {
            console.error('Error al cargar la lista de profesores:', error);
            // Manejo de error para que la vista muestre "Aún no hay profesores registrados"
            this.profesores = []; 
        }
    });
  }
}
