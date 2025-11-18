import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// src/app/admin/pages/profesores/profesores.ts

import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService, ProfesorDTO } from '../../../services/admin-service';

// Interfaz para definir la estructura de un profesor
export interface Profesor {
  id: number;
  nombreCompleto: string;
  correo: string;
  telefono: string;
  fotoUrl: string;
  informacion: string;
}

@Component({
  selector: 'app-profesores', // Selector para usar en el routing o layout
  templateUrl: './profesores.html',
  styleUrls: ['./profesores.scss'],
  imports: [
    // Si es standalone, necesitará importar FormsModule aquí también:
    FormsModule,
    CommonModule,

  ]
})
export class Profesores implements OnInit { // Renombrado a ProfesoresComponent

  // 1. Modelos de Datos
  nuevoProfesor: Profesor = {
    id: 0,
    nombreCompleto: '',
    correo: '',
    telefono: '',
    fotoUrl: '',
    informacion: ''
  };

  profesorAEditar: Profesor | null = null;

  // Lista real de profesores obtenida desde el backend
  profesores: Profesor[] = [];


  // AdminService será inyectado por Angular
  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    // Intentamos obtener los profesores desde el backend. Si falla, dejamos la lista vacía.
    try {
      if (this.adminService && typeof this.adminService.getProfesores === 'function') {
        this.adminService.getProfesores().subscribe((lista: ProfesorDTO[]) => {
          this.profesores = lista.map(p => ({
            id: p.id,
            nombreCompleto: p.nombreCompleto,
            correo: p.correo || '',
            telefono: p.telefono || '',
            fotoUrl: p.fotoUrl || 'https://i.pravatar.cc/100?img=12',
            informacion: p.informacion || ''
          }));
        }, err => {
          console.error('Error cargando profesores desde backend:', err);
        });
      }
    } catch (e) {
      console.error('No se pudo inicializar AdminService automaticamente:', e);
    }
  }

  // 2. Métodos de Interacción

  /**
   * Simula el registro de un nuevo profesor.
   */
  registrarProfesor(): void {
    // Generación de ID simple (cambiar a un UUID o manejar en el backend)
    const newId = Math.max(0, ...this.profesores.map(p => p.id)) + 1;
    const profesorConId = { ...this.nuevoProfesor, id: newId };

    this.profesores.push(profesorConId);

    // Resetear formulario
    this.nuevoProfesor = {
      id: 0, nombreCompleto: '', correo: '', telefono: '', fotoUrl: '', informacion: ''
    };
    console.log('Profesor registrado:', profesorConId);
  }

  /**
   * Prepara los datos para el modal de edición.
   * @param profesor El profesor a editar.
   */
  cargarEdicion(profesor: Profesor): void {
    // Clona el objeto para permitir la edición sin afectar la lista
    this.profesorAEditar = { ...profesor };
    // NOTA: Para abrir el modal programáticamente en Angular sin jQuery,
    // se recomienda usar un servicio de modal de un framework (como ng-bootstrap o Angular Material)
    // o el objeto Modal nativo de Bootstrap 5 con ViewChild.
  }

  /**
   * Simula la actualización de un profesor y cierra el modal (usando data-bs-dismiss).
   */
  guardarEdicion(): void {
    if (this.profesorAEditar) {
      const index = this.profesores.findIndex(p => p.id === this.profesorAEditar?.id);
      if (index !== -1) {
        // Actualiza el profesor en la lista
        this.profesores[index] = this.profesorAEditar;
        console.log('Profesor actualizado:', this.profesorAEditar);
      }
    }
    this.profesorAEditar = null;
  }

  /**
   * Simula la eliminación de un profesor.
   * @param profesorId El ID del profesor a eliminar.
   */
  eliminarProfesor(profesorId: number): void {
    const profesor = this.profesores.find(p => p.id === profesorId);
    if (profesor && confirm(`¿Estás seguro de que deseas eliminar a ${profesor.nombreCompleto}? Esta acción es irreversible.`)) {
      this.profesores = this.profesores.filter(p => p.id !== profesorId);
      console.log(`Profesor con ID ${profesorId} eliminado.`);
    }
  }

  /**
   * Devuelve la URL correcta para la imagen del profesor.
   * - Si la URL está vacía o es inválida, devuelve un placeholder existente en `public/`.
   * - Si la URL es relativa (no comienza con `/` ni `http`), la normaliza prefijando `/`.
   */
  getFoto(profesor: Profesor): string {
    const placeholder = '/profesorGuitarra.jpg'; // archivo existente en `public/`
    if (!profesor || !profesor.fotoUrl) {
      return placeholder;
    }

    const url = profesor.fotoUrl.trim();

    // Si es absoluta (http/https) úsala tal cual
    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    // Si la BD almacena rutas como '/images/archivo.jpg' pero los archivos están
    // en `public/` (raíz), mapeamos '/images/archivo.jpg' -> '/archivo.jpg'
    if (url.startsWith('/images/')) {
      const parts = url.split('/');
      const basename = parts[parts.length - 1] || '';
      return '/' + basename;
    }

    // Si ya es una ruta absoluta desde la raíz ('/algo'), la devolvemos tal cual
    if (url.startsWith('/')) {
      return url;
    }

    // Si es una ruta relativa (p. ej. "images/profesores/1.jpg" o "uploads/1.jpg"), prefijamos '/'
    return '/' + url;
  }

  /**
   * Handler para el evento de error de imagen: asigna un placeholder válido.
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.onerror = null; // evitar loop
      img.src = '/profesorGuitarra.jpg';
    }
  }
}
