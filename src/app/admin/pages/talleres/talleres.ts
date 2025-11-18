import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService, TallerDTO, ProfesorDTO } from '../../../services/admin-service';

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

@Component({
  selector: 'app-talleres',
  imports: [FormsModule, CommonModule],
  templateUrl: './talleres.html',
  styleUrl: './talleres.scss',
})
export class Talleres implements OnInit {
  // Propiedades para gestión de datos
  talleres: Taller[] = [];
  talleresActivos: Taller[] = [];
  profesores: Profesor[] = [];
  nombreUsuario = 'Admin';

  // Form: Registrar nuevo taller
  nuevoTaller = {
    nombre: '',
    descripcion: '',
    duracionSemanas: 0,
    clasesPorSemana: 0,
    precio: 0,
    imagenTaller: '',
    imagenInicio: '',
    temas: '',
  };

  // Form: Registrar nuevo horario
  nuevoHorario = {
    tallerId: '',
    profesorId: '',
    diasDeClase: [] as string[],
    horaInicio: '',
    horaFin: '',
    fechaInicio: '',
    vacantesDisponibles: 0,
  };

  // Form: Editar taller
  tallerAEditar: Taller | null = null;
  tallerParaEditarId = '';
  editFormTallerVisible = false;

  // Form: Editar horario
  tallerParaHorarioEditar = '';
  horarioAEditar: Horario | null = null;
  horarioAEditarId = '';
  horariosDelTaller: Horario[] = [];
  editFormHorarioVisible = false;

  // Alertas
  successMessage = '';
  errorMessage = '';

  // Días de la semana
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  // Fecha de hoy
  today = new Date().toISOString().split('T')[0];

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    // Load mock data immediately so UI works without backend
    this.loadInitialData();

    // Try to fetch real data from backend and overwrite mocks if successful
    this.adminService.getProfesores().subscribe((profesoresApi: ProfesorDTO[]) => {
      if (profesoresApi && profesoresApi.length) {
        this.profesores = profesoresApi.map(p => ({ id: p.id, nombreCompleto: p.nombreCompleto }));
      }
    }, err => {
      console.warn('No se pudo obtener profesores desde backend:', err);
    });

    this.adminService.getTalleres().subscribe((talleresApi: TallerDTO[]) => {
      if (talleresApi && talleresApi.length) {
        this.talleres = talleresApi.map(t => ({
          id: t.id,
          nombre: t.nombre,
          descripcion: (t as any).descripcion || '',
          duracionSemanas: (t as any).duracionSemanas || 0,
          clasesPorSemana: (t as any).clasesPorSemana || 0,
          precio: (t as any).precio || 0,
          imagenTaller: (t as any).imagenTaller || '',
          imagenInicio: (t as any).imagenInicio || '',
          temas: (t as any).temas || '',
          activo: (t as any).activo !== false,
          horarios: (t as any).horarios || []
        } as any));
        this.talleresActivos = this.talleres.filter(t => t.activo);
      }
    }, err => {
      console.warn('No se pudo obtener talleres desde backend:', err);
    });
  }

  loadInitialData() {
    // Mock data - reemplazar con llamadas a servicios
    this.profesores = [
      { id: 1, nombreCompleto: 'Juan García' },
      { id: 2, nombreCompleto: 'María López' },
      { id: 3, nombreCompleto: 'Carlos Martínez' },
    ];

    this.talleres = [
      {
        id: 1,
        nombre: 'Taller de Guitarra',
        descripcion: 'Aprende guitarra clásica desde cero',
        duracionSemanas: 12,
        clasesPorSemana: 2,
        precio: 150,
        imagenTaller: 'https://via.placeholder.com/400x300?text=Guitarra',
        imagenInicio: 'https://via.placeholder.com/800x400?text=Guitarra',
        temas: 'Posición de las manos\nPrimeros acordes\nTécnica básica',
        activo: true,
        horarios: [
          {
            id: 1,
            diasDeClase: 'Lunes, Miércoles',
            horaInicio: '18:00',
            horaFin: '19:30',
            vacantesDisponibles: 5,
            fechaInicio: '2025-11-15',
            profesor: this.profesores[0],
          },
        ],
      },
      {
        id: 2,
        nombre: 'Taller de Canto',
        descripcion: 'Técnica vocal y canto lírico',
        duracionSemanas: 10,
        clasesPorSemana: 2,
        precio: 120,
        imagenTaller: 'https://via.placeholder.com/400x300?text=Canto',
        imagenInicio: 'https://via.placeholder.com/800x400?text=Canto',
        temas: 'Calentamiento vocal\nProyección de voz',
        activo: true,
        horarios: [],
      },
    ];

    this.talleresActivos = this.talleres.filter((t) => t.activo);
  }

  // ===== REGISTRAR NUEVO TALLER =====
  registrarTaller() {
    if (
      !this.nuevoTaller.nombre ||
      !this.nuevoTaller.descripcion ||
      this.nuevoTaller.precio <= 0
    ) {
      this.errorMessage = 'Por favor completa todos los campos requeridos';
      return;
    }

    const taller: Taller = {
      id: Math.max(...this.talleres.map((t) => t.id), 0) + 1,
      ...this.nuevoTaller,
      activo: true,
      horarios: [],
    };

    this.talleres.push(taller);
    this.talleresActivos = this.talleres.filter((t) => t.activo);
    this.successMessage = `Taller "${taller.nombre}" registrado exitosamente`;
    this.resetNuevoTaller();
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
    if (
      !this.nuevoHorario.tallerId ||
      !this.nuevoHorario.profesorId ||
      this.nuevoHorario.diasDeClase.length === 0 ||
      !this.nuevoHorario.horaInicio ||
      !this.nuevoHorario.horaFin
    ) {
      this.errorMessage = 'Por favor completa todos los campos del horario';
      return;
    }

    const taller = this.talleres.find((t) => t.id == Number(this.nuevoHorario.tallerId));
    if (!taller) return;

    const profesor = this.profesores.find((p) => p.id == Number(this.nuevoHorario.profesorId));

    const horario: Horario = {
      id: Math.max(...this.talleres.flatMap((t) => t.horarios.map((h) => h.id)), 0) + 1,
      diasDeClase: this.nuevoHorario.diasDeClase.join(', '),
      horaInicio: this.nuevoHorario.horaInicio,
      horaFin: this.nuevoHorario.horaFin,
      vacantesDisponibles: this.nuevoHorario.vacantesDisponibles,
      fechaInicio: this.nuevoHorario.fechaInicio,
      profesor,
    };

    taller.horarios.push(horario);
    this.successMessage = `Horario añadido al taller "${taller.nombre}"`;
    this.resetNuevoHorario();
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
      this.nuevoHorario.diasDeClase = this.nuevoHorario.diasDeClase.filter((d) => d !== dia);
    } else {
      this.nuevoHorario.diasDeClase.push(dia);
    }
  }

  isDiaSelected(dia: string): boolean {
    return this.nuevoHorario.diasDeClase.includes(dia);
  }

  // ===== EDITAR TALLER =====
  onTallerAEditarChange(tallerId: string) {
    if (!tallerId) {
      this.editFormTallerVisible = false;
      this.tallerAEditar = null;
      return;
    }

    const taller = this.talleresActivos.find((t) => t.id == Number(tallerId));
    if (taller) {
      this.tallerAEditar = { ...taller };
      this.editFormTallerVisible = true;
    }
  }

  guardarCambiosTaller() {
    if (!this.tallerAEditar) return;

    const index = this.talleres.findIndex((t) => t.id === this.tallerAEditar!.id);
    if (index !== -1) {
      this.talleres[index] = { ...this.tallerAEditar };
      this.talleresActivos = this.talleres.filter((t) => t.activo);
      this.successMessage = `Taller "${this.tallerAEditar.nombre}" actualizado`;
      this.tallerAEditar = null;
      this.editFormTallerVisible = false;
    }
  }

  // ===== EDITAR HORARIO =====
  onTallerParaHorarioChange(tallerId: string) {
    if (!tallerId) {
      this.horariosDelTaller = [];
      this.horarioAEditar = null;
      this.editFormHorarioVisible = false;
      return;
    }

    const taller = this.talleres.find((t) => t.id == Number(tallerId));
    this.horariosDelTaller = taller ? taller.horarios : [];
    this.horarioAEditar = null;
    this.editFormHorarioVisible = false;
  }

  onHorarioAEditarChange(horarioId: string) {
    if (!horarioId) {
      this.editFormHorarioVisible = false;
      this.horarioAEditar = null;
      return;
    }

    const horario = this.horariosDelTaller.find((h) => h.id == Number(horarioId));
    if (horario) {
      this.horarioAEditar = { ...horario };
      this.editFormHorarioVisible = true;
    }
  }

  guardarCambiosHorario() {
    if (!this.horarioAEditar) return;

    const taller = this.talleres.find((t) => t.horarios.some((h) => h.id === this.horarioAEditar!.id));
    if (taller) {
      const index = taller.horarios.findIndex((h) => h.id === this.horarioAEditar!.id);
      if (index !== -1) {
        taller.horarios[index] = { ...this.horarioAEditar };
        this.successMessage = 'Horario actualizado';
        this.horarioAEditar = null;
        this.editFormHorarioVisible = false;
      }
    }
  }

  // ===== ELIMINAR HORARIO =====
  eliminarHorario(horarioId: number) {
    if (confirm(`¿Confirmas que deseas ELIMINAR permanentemente el horario con ID ${horarioId}?`)) {
      for (const taller of this.talleres) {
        const index = taller.horarios.findIndex((h) => h.id === horarioId);
        if (index !== -1) {
          taller.horarios.splice(index, 1);
          this.successMessage = 'Horario eliminado exitosamente';
          this.horariosDelTaller = this.horariosDelTaller.filter((h) => h.id !== horarioId);
          break;
        }
      }
    }
  }
}
