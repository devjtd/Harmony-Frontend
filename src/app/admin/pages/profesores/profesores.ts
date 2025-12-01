import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { AdminService, ProfesorDTO } from '../../../services/admin-service';

export interface Profesor {
  id: number;
  nombreCompleto: string;
  correo: string;
  telefono: string;
  fotoUrl: string;
  informacion: string;
}

interface ImageInfo {
  filename: string;
  url: string;
}

@Component({
  selector: 'app-profesores',
  templateUrl: './profesores.html',
  styleUrls: ['./profesores.scss'],
  imports: [FormsModule, CommonModule]
})
export class Profesores implements OnInit {
  nuevoProfesor: Profesor = {
    id: 0,
    nombreCompleto: '',
    correo: '',
    telefono: '',
    fotoUrl: '',  // ✅ Solo ruta string
    informacion: ''
  };

  profesorAEditar: Profesor | null = null;
  profesores: Profesor[] = [];

  // ✅ Lista de imágenes disponibles
  imagenesDisponibles: ImageInfo[] = [];

  successMessage: string = '';
  errorMessage: string = '';

  uploadingNewImage = false;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    console.log('🔵 [PROFESORES ANGULAR] Inicializando componente Profesores');
    this.cargarProfesores();
    this.cargarImagenesDisponibles();
  }

  cargarProfesores() {
    console.log('🔵 [PROFESORES ANGULAR] Cargando profesores desde backend...');
    this.adminService.getProfesores().subscribe({
      next: (lista: any[]) => {
        console.log('✅ [PROFESORES ANGULAR] Profesores recibidos:', lista);
        this.profesores = lista.map(p => ({
          id: p.id,
          nombreCompleto: p.nombreCompleto,
          correo: p.correo || '',
          telefono: p.telefono || '',
          fotoUrl: p.fotoUrl || '',
          informacion: p.informacion || ''
        }));
        console.log('📊 [PROFESORES ANGULAR] Profesores procesados:', this.profesores.length);
      },
      error: (err) => {
        console.error('❌ [PROFESORES ANGULAR] Error cargando profesores:', err);
        this.errorMessage = 'Error al cargar la lista de profesores';
      }
    });
  }

  /**
   * ✅ NUEVO: Carga la lista de imágenes disponibles desde el backend
   */
  cargarImagenesDisponibles() {
    console.log('🔵 [PROFESORES ANGULAR] Cargando lista de imágenes disponibles...');
    this.adminService.getImagesList().subscribe({
      next: (response: any) => {
        if (response.success && response.images) {
          this.imagenesDisponibles = response.images;
          console.log('✅ [PROFESORES ANGULAR] Imágenes disponibles:', this.imagenesDisponibles.length);
        }
      },
      error: (err) => {
        console.error('❌ [PROFESORES ANGULAR] Error al cargar lista de imágenes:', err);
      }
    });
  }

  /**
   * ✅ NUEVO: Dispara el selector de archivo
   */
  triggerFileUpload() {
    const fileInput = document.getElementById('uploadProfesorImageFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  /**
   * ✅ NUEVO: Maneja la subida de una nueva imagen
   */
  onUploadNewImage(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    console.log('🔵 [PROFESORES ANGULAR] Subiendo nueva imagen:', file.name);

    // Validar tamaño
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'La imagen no debe superar los 5MB';
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Solo se permiten archivos de imagen';
      return;
    }

    this.uploadingNewImage = true;

    const formData = new FormData();
    formData.append('file', file);

    this.adminService.uploadImage(formData).subscribe({
      next: (response: any) => {
        console.log('✅ [PROFESORES ANGULAR] Imagen subida exitosamente:', response);
        this.successMessage = `Foto "${response.filename}" subida exitosamente`;

        // ✅ Recargar lista de imágenes
        this.cargarImagenesDisponibles();

        this.uploadingNewImage = false;

        // Limpiar el input
        const fileInput = document.getElementById('uploadProfesorImageFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        setTimeout(() => { this.successMessage = ''; }, 3000);
      },
      error: (err) => {
        console.error('❌ [PROFESORES ANGULAR] Error al subir imagen:', err);
        this.errorMessage = err.error?.message || 'Error al subir la imagen';
        this.uploadingNewImage = false;
      }
    });
  }

  registrarProfesor(): void {
    console.log('🔵 [PROFESORES ANGULAR] Iniciando registro de profesor');
    console.log('📝 [PROFESORES ANGULAR] Datos del nuevo profesor:', this.nuevoProfesor);

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.nuevoProfesor.nombreCompleto || !this.nuevoProfesor.correo || !this.nuevoProfesor.telefono) {
      console.warn('⚠️ [PROFESORES ANGULAR] Datos incompletos');
      this.errorMessage = 'Por favor completa todos los campos obligatorios';
      return;
    }

    // ✅ Enviar solo datos string
    const payload = {
      nombreCompleto: this.nuevoProfesor.nombreCompleto,
      correo: this.nuevoProfesor.correo,
      telefono: this.nuevoProfesor.telefono,
      fotoUrl: this.nuevoProfesor.fotoUrl,  // ✅ Ruta string
      informacion: this.nuevoProfesor.informacion
    };

    console.log('📤 [PROFESORES ANGULAR] Enviando payload:', payload);

    this.adminService.createProfesor(payload).subscribe({
      next: (response) => {
        console.log('✅ [PROFESORES ANGULAR SUCCESS] Profesor registrado:', response);
        this.successMessage = 'Profesor registrado exitosamente';

        // Resetear formulario
        this.nuevoProfesor = {
          id: 0,
          nombreCompleto: '',
          correo: '',
          telefono: '',
          fotoUrl: '',
          informacion: ''
        };

        // Recargar lista
        this.cargarProfesores();

        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (err) => {
        console.error('❌ [PROFESORES ANGULAR ERROR] Error al registrar profesor:', err);
        this.errorMessage = err.error?.message || 'Error al registrar el profesor';
      }
    });
  }

  cargarEdicion(profesor: Profesor): void {
    console.log('🔵 [PROFESORES ANGULAR] Cargando datos para edición:', profesor.id);
    this.profesorAEditar = { ...profesor };
    console.log('📝 [PROFESORES ANGULAR] Datos a editar:', this.profesorAEditar);
  }

  guardarEdicion(): void {
    console.log('🔵 [PROFESORES ANGULAR] Guardando edición de profesor');

    if (this.profesorAEditar) {
      console.log('📤 [PROFESORES ANGULAR] Enviando actualización:', this.profesorAEditar);

      // ✅ Enviar solo datos string
      const payload = {
        nombreCompleto: this.profesorAEditar.nombreCompleto,
        correo: this.profesorAEditar.correo,
        telefono: this.profesorAEditar.telefono,
        fotoUrl: this.profesorAEditar.fotoUrl,  // ✅ Ruta string
        informacion: this.profesorAEditar.informacion
      };

      this.adminService.updateProfesor(this.profesorAEditar.id, payload).subscribe({
        next: (response) => {
          console.log('✅ [PROFESORES ANGULAR SUCCESS] Profesor actualizado:', response);
          this.successMessage = 'Profesor actualizado exitosamente';
          this.cargarProfesores();
          this.profesorAEditar = null;

          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        },
        error: (err) => {
          console.error('❌ [PROFESORES ANGULAR ERROR] Error al actualizar profesor:', err);
          this.errorMessage = err.error?.message || 'Error al actualizar el profesor';
        }
      });
    }
  }

  eliminarProfesor(profesorId: number): void {
    const profesor = this.profesores.find(p => p.id === profesorId);
    console.log('🔵 [PROFESORES ANGULAR] Confirmando eliminación de profesor:', profesorId);

    if (profesor && confirm(`¿Estás seguro de que deseas eliminar a ${profesor.nombreCompleto}? Esta acción es irreversible.`)) {
      console.log('📤 [PROFESORES ANGULAR] Eliminando profesor ID:', profesorId);

      this.adminService.deleteProfesor(profesorId).subscribe({
        next: (response) => {
          console.log('✅ [PROFESORES ANGULAR SUCCESS] Profesor eliminado:', response);
          this.successMessage = 'Profesor eliminado exitosamente';
          this.cargarProfesores();

          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        },
        error: (err) => {
          console.error('❌ [PROFESORES ANGULAR ERROR] Error al eliminar profesor:', err);
          this.errorMessage = err.error?.message || 'Error al eliminar el profesor';
        }
      });
    } else {
      console.log('⚠️ [PROFESORES ANGULAR] Eliminación cancelada');
    }
  }

  /**
   * ✅ Obtiene la foto del profesor (carga desde backend)
   */
  getFoto(profesor: Profesor): string {
    const placeholder = '/profesorGuitarra.jpg';
    if (!profesor || !profesor.fotoUrl) {
      return placeholder;
    }

    const url = profesor.fotoUrl.trim();

    // Si ya es URL externa
    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    // Si es ruta local con /images/
    if (url.startsWith('/images/')) {
      return `http://localhost:8080${url}`;
    }

    // Si es solo el nombre del archivo
    if (url.startsWith('/')) {
      return `http://localhost:8080${url}`;
    }

    return `http://localhost:8080/images/${url}`;
  }

  /**
   * ✅ Genera preview de imagen desde ruta string
   */
  getImagePreview(url: string): string {
    if (!url) return '';

    // Si ya es URL completa
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Si es ruta local
    return `http://localhost:8080${url}`;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.onerror = null;
      img.src = '/profesorGuitarra.jpg';
    }
  }
}