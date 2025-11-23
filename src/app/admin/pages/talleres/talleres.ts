import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService, TallerDTO, ProfesorDTO } from '../../../services/admin-service';
import { HttpParams } from '@angular/common/http';

interface Profesor {
  id: number;
  nombreCompleto: string;
}

interface Horario {
  id: number;
  diasDeClase: string;
  horaInicio: string;
  horaFin: string;
  vacantesDisponibles: number;
  fechaInicio: string;
  profesor?: Profesor;
}

interface Taller {
  id: number;
  nombre: string;
  descripcion: string;
  duracionSemanas: number;
  clasesPorSemana: number;
  precio: number;
  imagenTaller: string;
  imagenInicio: string;
  temas: string;
  activo: boolean;
  horarios: Horario[];
}

interface ImageInfo {
  filename: string;
  url: string;
}

@Component({
  selector: 'app-talleres',
  imports: [FormsModule, CommonModule],
  templateUrl: './talleres.html',
  styleUrl: './talleres.scss',
})
export class Talleres implements OnInit {
  talleres: Taller[] = [];
  talleresActivos: Taller[] = [];
  profesores: Profesor[] = [];

  diasSemana: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  today: string = new Date().toISOString().split('T')[0];

  // ✅ Lista de imágenes disponibles en el servidor
  imagenesDisponibles: ImageInfo[] = [];

  nuevoTaller = {
    nombre: '',
    descripcion: '',
    duracionSemanas: 0,
    clasesPorSemana: 0,
    precio: 0,
    imagenTaller: '',  // ✅ Solo ruta string
    imagenInicio: '',  // ✅ Solo ruta string
    temas: '',
  };

  nuevoHorario = {
    tallerId: '',
    profesorId: '',
    diasDeClase: [] as string[],
    horaInicio: '',
    horaFin: '',
    fechaInicio: '',
    vacantesDisponibles: 0,
  };

  tallerAEditar: Taller | null = null;
  tallerParaEditarId = '';
  editFormTallerVisible = false;

  tallerParaHorarioEditar = '';
  horarioAEditar: Horario | null = null;
  horarioAEditarId = '';
  horariosDelTaller: Horario[] = [];
  editFormHorarioVisible = false;

  successMessage = '';
  errorMessage = '';

  // ✅ Control de carga de nueva imagen
  uploadingNewImage = false;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.cargarImagenesDisponibles();
    this.cargarProfesores();
  }

  cargarProfesores() {
    console.log('🔵 [TALLERES ANGULAR] Cargando profesores...');
    this.adminService.getProfesores().subscribe({
      next: (data: any[]) => {
        this.profesores = data;
        console.log('✅ [TALLERES ANGULAR] Profesores cargados:', this.profesores.length);
        // Aseguramos que los talleres se carguen DESPUÉS de los profesores para mapear correctamente si es necesario
        this.cargarTalleres();
      },
      error: (err) => {
        console.error('❌ [TALLERES ANGULAR] Error al cargar profesores:', err);
        // Intentamos cargar talleres de todos modos
        this.cargarTalleres();
      }
    });
  }

  cargarTalleres() {
    console.log('🔵 [TALLERES ANGULAR] Cargando talleres...');
    this.adminService.getTalleres().subscribe({
      next: (data: any[]) => {
        this.talleres = data;
        this.talleresActivos = this.talleres.filter(t => t.activo);
        console.log('✅ [TALLERES ANGULAR] Talleres cargados:', this.talleres.length);
      },
      error: (err) => {
        console.error('❌ [TALLERES ANGULAR] Error al cargar talleres:', err);
      }
    });
  }

  cargarImagenesDisponibles() {
    console.log('🔵 [TALLERES ANGULAR] Cargando lista de imágenes disponibles...');
    this.adminService.getImagesList().subscribe({
      next: (response: any) => {
        if (response.success && response.images) {
          this.imagenesDisponibles = response.images;
          console.log('✅ [TALLERES ANGULAR] Imágenes disponibles:', this.imagenesDisponibles.length);
        }
      },
      error: (err) => {
        console.error('❌ [TALLERES ANGULAR] Error al cargar lista de imágenes:', err);
      }
    });
  }

  /**
   * ✅ NUEVO: Dispara el selector de archivo para subir una nueva imagen
   */
  triggerFileUpload() {
    const fileInput = document.getElementById('uploadImageFile') as HTMLInputElement;
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

    console.log('🔵 [TALLERES ANGULAR] Subiendo nueva imagen:', file.name);

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
        console.log('✅ [TALLERES ANGULAR] Imagen subida exitosamente:', response);
        this.successMessage = `Imagen "${response.filename}" subida exitosamente`;

        // ✅ Recargar lista de imágenes
        this.cargarImagenesDisponibles();

        this.uploadingNewImage = false;

        // Limpiar el input
        const fileInput = document.getElementById('uploadImageFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        setTimeout(() => { this.successMessage = ''; }, 3000);
      },
      error: (err) => {
        console.error('❌ [TALLERES ANGULAR] Error al subir imagen:', err);
        this.errorMessage = err.error?.message || 'Error al subir la imagen';
        this.uploadingNewImage = false;
      }
    });
  }

  // ===== REGISTRAR NUEVO TALLER =====
  registrarTaller() {
    console.log('🔵 [TALLERES ANGULAR] Registrando nuevo taller:', this.nuevoTaller.nombre);

    // ✅ VALIDACIONES ESTRICTAS
    if (!this.nuevoTaller.nombre || this.nuevoTaller.nombre.trim() === '') {
      this.errorMessage = 'El nombre del taller es obligatorio';
      console.warn('⚠️ [TALLERES ANGULAR] Nombre vacío');
      return;
    }

    if (!this.nuevoTaller.descripcion || this.nuevoTaller.descripcion.trim() === '') {
      this.errorMessage = 'La descripción del taller es obligatoria';
      console.warn('⚠️ [TALLERES ANGULAR] Descripción vacía');
      return;
    }

    if (!this.nuevoTaller.imagenTaller || !this.nuevoTaller.imagenInicio) {
      this.errorMessage = 'Debes seleccionar ambas imágenes';
      console.warn('⚠️ [TALLERES ANGULAR] Imágenes no seleccionadas');
      return;
    }

    // ✅ VALIDAR NÚMEROS - Aquí estaba el problema
    const duracionSemanas = Number(this.nuevoTaller.duracionSemanas);
    const clasesPorSemana = Number(this.nuevoTaller.clasesPorSemana);
    const precio = Number(this.nuevoTaller.precio);

    // Verificar que no sean NaN
    if (isNaN(duracionSemanas) || duracionSemanas <= 0) {
      this.errorMessage = 'La duración debe ser un número mayor a 0';
      console.warn('⚠️ [TALLERES ANGULAR] Duración inválida:', duracionSemanas);
      return;
    }

    if (isNaN(clasesPorSemana) || clasesPorSemana <= 0) {
      this.errorMessage = 'Las clases por semana deben ser un número mayor a 0';
      console.warn('⚠️ [TALLERES ANGULAR] Clases por semana inválida:', clasesPorSemana);
      return;
    }

    if (isNaN(precio) || precio < 0) {
      this.errorMessage = 'El precio debe ser un número válido mayor o igual a 0';
      console.warn('⚠️ [TALLERES ANGULAR] Precio inválido:', precio);
      return;
    }

    // ✅ Construir payload con tipos correctos
    const payload = {
      nombre: this.nuevoTaller.nombre.trim(),
      descripcion: this.nuevoTaller.descripcion.trim(),
      duracionSemanas: duracionSemanas,
      clasesPorSemana: clasesPorSemana,
      precio: precio,
      imagenTaller: this.nuevoTaller.imagenTaller,
      imagenInicio: this.nuevoTaller.imagenInicio,
      temas: this.nuevoTaller.temas || '',
      activo: true
    };

    console.log('📤 [TALLERES ANGULAR] Enviando payload:', payload);
    console.log('🔍 [TALLERES ANGULAR] Tipos de datos:');
    console.log('   - nombre:', typeof payload.nombre, '|', payload.nombre);
    console.log('   - duracionSemanas:', typeof payload.duracionSemanas, '|', payload.duracionSemanas);
    console.log('   - clasesPorSemana:', typeof payload.clasesPorSemana, '|', payload.clasesPorSemana);
    console.log('   - precio:', typeof payload.precio, '|', payload.precio);
    console.log('   - activo:', typeof payload.activo, '|', payload.activo);

    this.adminService.createTaller(payload).subscribe({
      next: (response: any) => {
        console.log('✅ [TALLERES ANGULAR SUCCESS] Taller registrado:', response);
        this.successMessage = `Taller "${this.nuevoTaller.nombre}" registrado exitosamente`;
        this.resetNuevoTaller();
        this.cargarTalleres();

        setTimeout(() => { this.successMessage = ''; }, 5000);
      },
      error: (err) => {
        console.error('❌ [TALLERES ANGULAR ERROR] Error al registrar taller:', err);
        console.error('❌ [TALLERES ANGULAR ERROR] Status:', err.status);
        console.error('❌ [TALLERES ANGULAR ERROR] Detalles:', err.error);
        this.errorMessage = err.error?.message || 'Error al registrar el taller';
      }
    });
  }

  resetNuevoTaller() {
    this.nuevoTaller = {
      nombre: '',
      descripcion: '',
      duracionSemanas: 0,
      clasesPorSemana: 0,
      precio: 0,
      imagenTaller: '',
      imagenInicio: '',
      temas: '',
    };
  }

  // ===== REGISTRAR NUEVO HORARIO =====
  registrarHorario() {
    console.log('🔵 [TALLERES ANGULAR] Registrando nuevo horario para taller:', this.nuevoHorario.tallerId);

    if (!this.nuevoHorario.tallerId || !this.nuevoHorario.profesorId ||
      this.nuevoHorario.diasDeClase.length === 0 || !this.nuevoHorario.horaInicio ||
      !this.nuevoHorario.horaFin) {
      this.errorMessage = 'Por favor completa todos los campos del horario';
      console.warn('⚠️ [TALLERES ANGULAR] Datos de horario incompletos');
      return;
    }

    const params = new HttpParams()
      .set('tallerId', this.nuevoHorario.tallerId)
      .set('profesorId', this.nuevoHorario.profesorId)
      .set('diasDeClase', this.nuevoHorario.diasDeClase.join(', '))
      .set('horaInicio', this.nuevoHorario.horaInicio)
      .set('horaFin', this.nuevoHorario.horaFin)
      .set('fechaInicio', this.nuevoHorario.fechaInicio)
      .set('vacantesDisponibles', this.nuevoHorario.vacantesDisponibles.toString());

    console.log('📤 [TALLERES ANGULAR] Enviando params:', params.toString());

    this.adminService.createHorario(params).subscribe({
      next: (response: any) => {
        console.log('✅ [TALLERES ANGULAR SUCCESS] Horario registrado:', response);
        this.successMessage = 'Horario añadido exitosamente';
        this.resetNuevoHorario();
        this.cargarTalleres();

        setTimeout(() => { this.successMessage = ''; }, 5000);
      },
      error: (err: any) => {
        console.error('❌ [TALLERES ANGULAR ERROR] Error al registrar horario:', err);
        console.error('❌ [TALLERES ANGULAR ERROR] Detalles:', err.error);
        this.errorMessage = err.error?.message || 'Error al registrar el horario';
      }
    });
  }

  resetNuevoHorario() {
    this.nuevoHorario = {
      tallerId: '',
      profesorId: '',
      diasDeClase: [],
      horaInicio: '',
      horaFin: '',
      fechaInicio: '',
      vacantesDisponibles: 0,
    };
  }

  toggleDia(dia: string) {
    if (this.nuevoHorario.diasDeClase.includes(dia)) {
      this.nuevoHorario.diasDeClase = this.nuevoHorario.diasDeClase.filter(d => d !== dia);
    } else {
      this.nuevoHorario.diasDeClase.push(dia);
    }
    console.log('🔄 [TALLERES ANGULAR] Días seleccionados:', this.nuevoHorario.diasDeClase);
  }

  isDiaSelected(dia: string): boolean {
    return this.nuevoHorario.diasDeClase.includes(dia);
  }

  // ===== EDITAR TALLER =====
  onTallerAEditarChange(tallerId: string) {
    console.log('🔵 [TALLERES ANGULAR] Seleccionando taller para editar:', tallerId);

    if (!tallerId) {
      this.editFormTallerVisible = false;
      this.tallerAEditar = null;
      return;
    }

    const taller = this.talleresActivos.find(t => t.id == Number(tallerId));
    if (taller) {
      this.tallerAEditar = { ...taller };
      this.editFormTallerVisible = true;
      console.log('📝 [TALLERES ANGULAR] Taller cargado para edición:', this.tallerAEditar.nombre);
    }
  }

  guardarCambiosTaller() {
    console.log('🔵 [TALLERES ANGULAR] Guardando cambios del taller:', this.tallerAEditar?.id);

    if (!this.tallerAEditar) return;

    // ✅ VALIDACIONES
    if (!this.tallerAEditar.nombre || this.tallerAEditar.nombre.trim() === '') {
      this.errorMessage = 'El nombre del taller es obligatorio';
      return;
    }

    if (!this.tallerAEditar.descripcion || this.tallerAEditar.descripcion.trim() === '') {
      this.errorMessage = 'La descripción es obligatoria';
      return;
    }

    // ✅ Construir payload con todos los campos
    const payload = {
      id: this.tallerAEditar.id,
      nombre: this.tallerAEditar.nombre.trim(),
      descripcion: this.tallerAEditar.descripcion.trim(),
      duracionSemanas: Number(this.tallerAEditar.duracionSemanas),
      clasesPorSemana: Number(this.tallerAEditar.clasesPorSemana),
      precio: Number(this.tallerAEditar.precio),
      imagenTaller: this.tallerAEditar.imagenTaller,
      imagenInicio: this.tallerAEditar.imagenInicio,
      temas: this.tallerAEditar.temas || '',
      activo: this.tallerAEditar.activo  // ✅ Mantener el estado actual
    };

    console.log('📤 [TALLERES ANGULAR] Enviando payload de actualización:', payload);

    this.adminService.updateTaller(this.tallerAEditar.id, payload).subscribe({
      next: (response: any) => {
        console.log('✅ [TALLERES ANGULAR SUCCESS] Taller actualizado:', response);
        this.successMessage = `Taller "${this.tallerAEditar!.nombre}" actualizado`;
        this.tallerAEditar = null;
        this.editFormTallerVisible = false;
        this.cargarTalleres();

        setTimeout(() => { this.successMessage = ''; }, 5000);
      },
      error: (err: any) => {
        console.error('❌ [TALLERES ANGULAR ERROR] Error al actualizar taller:', err);
        console.error('❌ [TALLERES ANGULAR ERROR] Status:', err.status);
        console.error('❌ [TALLERES ANGULAR ERROR] Detalles:', err.error);
        this.errorMessage = err.error?.message || 'Error al actualizar el taller';
      }
    });
  }

  // ===== EDITAR HORARIO =====
  onTallerParaHorarioChange(tallerId: string) {
    console.log('🔵 [TALLERES ANGULAR] Cargando horarios del taller:', tallerId);

    if (!tallerId) {
      this.horariosDelTaller = [];
      this.horarioAEditar = null;
      this.editFormHorarioVisible = false;
      return;
    }

    const taller = this.talleres.find(t => t.id == Number(tallerId));
    this.horariosDelTaller = taller ? taller.horarios : [];
    this.horarioAEditar = null;
    this.editFormHorarioVisible = false;

    console.log('📊 [TALLERES ANGULAR] Horarios cargados:', this.horariosDelTaller.length);
  }

  onHorarioAEditarChange(horarioId: string) {
    console.log('🔵 [TALLERES ANGULAR] Seleccionando horario para editar:', horarioId);

    if (!horarioId) {
      this.editFormHorarioVisible = false;
      this.horarioAEditar = null;
      return;
    }

    const horario = this.horariosDelTaller.find(h => h.id == Number(horarioId));
    if (horario) {
      this.horarioAEditar = { ...horario };
      this.editFormHorarioVisible = true;
      console.log('📝 [TALLERES ANGULAR] Horario cargado para edición:', this.horarioAEditar.id);
    }
  }

  guardarCambiosHorario() {
    console.log('🔵 [TALLERES ANGULAR] Guardando cambios del horario:', this.horarioAEditar?.id);

    if (!this.horarioAEditar || !this.horarioAEditar.profesor) {
      this.errorMessage = 'Debe seleccionar un profesor';
      return;
    }

    const params = new HttpParams()
      .set('profesorId', this.horarioAEditar.profesor.id.toString())
      .set('diasDeClase', this.horarioAEditar.diasDeClase)
      .set('horaInicio', this.horarioAEditar.horaInicio)
      .set('horaFin', this.horarioAEditar.horaFin)
      .set('fechaInicio', this.horarioAEditar.fechaInicio)
      .set('vacantesDisponibles', this.horarioAEditar.vacantesDisponibles.toString());

    console.log('📤 [TALLERES ANGULAR] Enviando actualización de horario:', params.toString());

    this.adminService.updateHorario(this.horarioAEditar.id, params).subscribe({
      next: (response: any) => {
        console.log('✅ [TALLERES ANGULAR SUCCESS] Horario actualizado:', response);
        this.successMessage = 'Horario actualizado exitosamente';
        this.horarioAEditar = null;
        this.editFormHorarioVisible = false;
        this.cargarTalleres();

        setTimeout(() => { this.successMessage = ''; }, 5000);
      },
      error: (err: any) => {
        console.error('❌ [TALLERES ANGULAR ERROR] Error al actualizar horario:', err);
        console.error('❌ [TALLERES ANGULAR ERROR] Detalles:', err.error);
        this.errorMessage = err.error?.message || 'Error al actualizar el horario';
      }
    });
  }

  // ===== ELIMINAR HORARIO =====
  eliminarHorario(horarioId: number) {
    console.log('🔵 [TALLERES ANGULAR] Confirmando eliminación de horario:', horarioId);

    if (confirm(`¿Confirmas que deseas ELIMINAR permanentemente el horario con ID ${horarioId}?`)) {
      console.log('📤 [TALLERES ANGULAR] Eliminando horario:', horarioId);

      this.adminService.deleteHorario(horarioId).subscribe({
        next: (response: any) => {
          console.log('✅ [TALLERES ANGULAR SUCCESS] Horario eliminado:', response);
          this.successMessage = 'Horario eliminado exitosamente';
          this.horariosDelTaller = this.horariosDelTaller.filter(h => h.id !== horarioId);
          this.cargarTalleres();

          setTimeout(() => { this.successMessage = ''; }, 5000);
        },
        error: (err: any) => {
          console.error('❌ [TALLERES ANGULAR ERROR] Error al eliminar horario:', err);
          this.errorMessage = err.error?.message || 'Error al eliminar el horario';
        }
      });
    } else {
      console.log('⚠️ [TALLERES ANGULAR] Eliminación cancelada');
    }
  }

  /**
   * ✅ Genera preview de imagen desde ruta string
   */
  getImagePreview(url: string): string {
    if (!url) return '';

    // Si ya es URL completa, devolverla tal cual
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Si es ruta local, construir URL completa
    return `http://localhost:8080${url}`;
  }
}