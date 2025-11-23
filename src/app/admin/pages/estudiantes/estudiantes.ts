import { CommonModule } from '@angular/common';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AdminService } from '../../../services/admin-service';

interface Horario {
  id: number;
  diasDeClase: string;
  horaInicio: string;
  horaFin: string;
  profesor?: { nombreCompleto: string };
  vacantesDisponibles: number;
}

interface Taller {
  id: number;
  nombre: string;
  horarios: Horario[];
  seleccionado: boolean;
  horarioSeleccionado?: number;
}

interface Inscripcion {
  horario?: {
    id?: number;
    taller?: { nombre: string };
    diasDeClase?: string;
    horaInicio?: string;
    horaFin?: string;
  };
}

interface Cliente {
  id: number;
  nombreCompleto: string;
  correo: string;
  telefono: string;
  inscripciones: Inscripcion[];
  user?: { email: string };
}

@Component({
  selector: 'app-estudiantes',
  templateUrl: './estudiantes.html',
  styleUrls: ['./estudiantes.scss'],
  imports: [CommonModule, FormsModule]
})
export class Estudiantes implements OnInit {
  talleres: Taller[] = [];
  clientes: Cliente[] = [];
  nombreUsuario: string = '';
  nuevoCliente: any = {};
  clienteAEditar: Cliente | any = {};
  originalCorreo: string = '';
  validationAlert: boolean = false;

  successMessage: string = '';
  errorMessage: string = '';

  // Gestión de inscripciones (Nuevo)
  nuevaInscripcion: { tallerId?: number, horarioId?: number } = {};

  @ViewChild('editClienteFormRef') editClienteFormRef!: NgForm;
  @ViewChild('editModal') editModal!: ElementRef;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    console.log('🔵 [ESTUDIANTES ANGULAR] Inicializando componente Estudiantes');
    this.cargarTalleresDisponibles();
    this.cargarClientes();
  }

  cargarTalleresDisponibles() {
    console.log('🔵 [ESTUDIANTES ANGULAR] Cargando talleres disponibles...');
    this.adminService.getTalleresDisponibles().subscribe({
      next: (talleresApi: any[]) => {
        console.log('✅ [ESTUDIANTES ANGULAR] Talleres disponibles recibidos:', talleresApi.length);

        this.talleres = talleresApi.map(t => ({
          id: t.id,
          nombre: t.nombre,
          seleccionado: false,
          horarios: (t.horarios || []).map((h: any) => ({
            id: h.id,
            diasDeClase: h.diasDeClase || '',
            horaInicio: h.horaInicio || '',
            horaFin: h.horaFin || '',
            profesor: h.profesor ? { nombreCompleto: h.profesor.nombreCompleto } : undefined,
            vacantesDisponibles: h.vacantesDisponibles || 0
          }))
        }));

        console.log('📊 [ESTUDIANTES ANGULAR] Talleres procesados:', this.talleres);
      },
      error: (err) => {
        console.error('❌ [ESTUDIANTES ANGULAR] Error al cargar talleres:', err);
        this.errorMessage = 'Error al cargar talleres disponibles';
      }
    });
  }

  cargarClientes() {
    console.log('🔵 [ESTUDIANTES ANGULAR] Cargando clientes con inscripciones...');
    this.adminService.getClientesConInscripciones().subscribe({
      next: (clientesApi: any[]) => {
        console.log('✅ [ESTUDIANTES ANGULAR] Clientes recibidos:', clientesApi.length);

        this.clientes = clientesApi.map(c => ({
          id: c.id,
          nombreCompleto: c.nombreCompleto,
          correo: c.correo,
          telefono: c.telefono,
          user: c.user ? { email: c.user.email } : undefined,
          inscripciones: (c.inscripciones || []).map((ins: any) => ({
            horario: ins.horario ? {
              id: ins.horario.id,
              taller: ins.horario.taller ? { nombre: ins.horario.taller.nombre } : undefined,
              diasDeClase: ins.horario.diasDeClase || '',
              horaInicio: ins.horario.horaInicio || '',
              horaFin: ins.horario.horaFin || ''
            } : undefined
          }))
        } as Cliente));

        console.log('📊 [ESTUDIANTES ANGULAR] Clientes procesados:', this.clientes);
      },
      error: (err) => {
        console.error('❌ [ESTUDIANTES ANGULAR] Error al cargar clientes:', err);
        this.errorMessage = 'Error al cargar la lista de clientes';
      }
    });
  }

  registrarCliente(form: NgForm) {
    console.log('🔵 [ESTUDIANTES ANGULAR] Iniciando registro de cliente');
    this.validationAlert = false;
    this.errorMessage = '';
    this.successMessage = '';

    let validSelection = true;
    const talleresSeleccionados: { [key: number]: number } = {};

    this.talleres.forEach(taller => {
      if (taller.seleccionado && taller.horarios.length > 0 && !taller.horarioSeleccionado) {
        validSelection = false;
        console.warn('⚠️ [ESTUDIANTES ANGULAR] Taller sin horario:', taller.nombre);
      }

      if (taller.seleccionado && taller.horarioSeleccionado) {
        talleresSeleccionados[taller.id] = taller.horarioSeleccionado;
      }
    });

    if (!validSelection) {
      this.validationAlert = true;
      console.error('❌ [ESTUDIANTES ANGULAR] Validación fallida: falta seleccionar horarios');
      return;
    }

    if (form.valid) {
      const payload = {
        nombreCompleto: this.nuevoCliente.nombreCompleto,
        correo: this.nuevoCliente.correo,
        telefono: this.nuevoCliente.telefono,
        talleresSeleccionados: talleresSeleccionados
      };

      this.adminService.createCliente(payload).subscribe({
        next: (response: any) => {
          console.log('✅ [ESTUDIANTES ANGULAR SUCCESS] Cliente registrado:', response);
          this.successMessage = 'Cliente registrado exitosamente. Correo: ' + response.email + ', Contraseña temporal: ' + response.temporalPassword;

          form.resetForm();
          this.talleres.forEach(t => {
            t.seleccionado = false;
            t.horarioSeleccionado = undefined;
          });
          this.cargarClientes();
          this.cargarTalleresDisponibles(); // Actualizar vacantes

          setTimeout(() => {
            this.successMessage = '';
          }, 8000);
        },
        error: (err) => {
          console.error('❌ [ESTUDIANTES ANGULAR ERROR] Error al registrar cliente:', err);
          this.errorMessage = err.error?.message || 'Error al registrar el cliente';
        }
      });
    } else {
      console.warn('⚠️ [ESTUDIANTES ANGULAR] Formulario inválido');
    }
  }

  // Propiedad para filtrar talleres disponibles para el cliente seleccionado
  talleresDisponiblesParaCliente: Taller[] = [];

  openEditModal(cliente: Cliente) {
    console.log('🔵 [ESTUDIANTES ANGULAR] Abriendo modal de edición para cliente:', cliente.id);
    this.clienteAEditar = {
      id: cliente.id,
      nombre: cliente.nombreCompleto,
      correo: cliente.user?.email || cliente.correo,
      telefono: cliente.telefono,
      inscripciones: cliente.inscripciones // Guardamos inscripciones para filtrar
    };
    this.originalCorreo = cliente.user?.email || cliente.correo;
    this.nuevaInscripcion = {}; // Resetear nueva inscripción

    // Filtrar talleres: Excluir aquellos en los que el cliente ya tiene inscripción
    const inscripcionesIds = new Set(cliente.inscripciones.map(i => i.horario?.id));

    // Filtrar talleres que tienen horarios donde el cliente NO está inscrito
    this.talleresDisponiblesParaCliente = this.talleres.map(taller => {
      // Clonar el taller para no modificar el original
      const tallerClonado = { ...taller };
      // Filtrar horarios donde el cliente NO está inscrito
      tallerClonado.horarios = taller.horarios.filter(h => !inscripcionesIds.has(h.id));
      return tallerClonado;
    }).filter(t => t.horarios.length > 0); // Solo mostrar talleres con horarios disponibles

    console.log('📊 [ESTUDIANTES ANGULAR] Talleres filtrados para cliente:', this.talleresDisponiblesParaCliente.length);
  }

  editarCliente(form: NgForm) {
    console.log('🔵 [ESTUDIANTES ANGULAR] Iniciando edición de cliente ID:', this.clienteAEditar.id);

    if (form.valid) {
      const payload = {
        nombreCompleto: this.clienteAEditar.nombre,
        correo: this.clienteAEditar.correo,
        telefono: this.clienteAEditar.telefono
      };

      this.adminService.updateCliente(this.clienteAEditar.id, payload).subscribe({
        next: (response: any) => {
          console.log('✅ [ESTUDIANTES ANGULAR SUCCESS] Cliente actualizado:', response);
          this.successMessage = 'Cliente actualizado exitosamente';
          this.cargarClientes();

          const modalElement = document.getElementById('estudiantes-editModal');
          if (modalElement) {
            const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
          }

          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        },
        error: (err) => {
          console.error('❌ [ESTUDIANTES ANGULAR ERROR] Error al editar cliente:', err);
          this.errorMessage = err.error?.message || 'Error al actualizar el cliente';
        }
      });
    }
  }

  confirmBajaSegura(cliente: Cliente) {
    console.log('🔵 [ESTUDIANTES ANGULAR] Confirmando baja de cliente:', cliente.id);

    if (confirm('¿Estás seguro de que deseas eliminar completamente al cliente ' + cliente.nombreCompleto + ' (ID: ' + cliente.id + ')? Esta acción es irreversible.')) {
      this.adminService.deleteCliente(cliente.id).subscribe({
        next: (response: any) => {
          console.log('✅ [ESTUDIANTES ANGULAR SUCCESS] Cliente eliminado:', response);
          this.successMessage = 'Cliente eliminado exitosamente';
          this.cargarClientes();
          this.cargarTalleresDisponibles(); // Actualizar vacantes

          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        },
        error: (err) => {
          console.error('❌ [ESTUDIANTES ANGULAR ERROR] Error al eliminar cliente:', err);
          this.errorMessage = err.error?.message || 'Error al eliminar el cliente';
        }
      });
    }
  }

  agregarInscripcion() {
    if (!this.clienteAEditar.id || !this.nuevaInscripcion.horarioId) {
      return;
    }

    console.log('🔵 [ESTUDIANTES ANGULAR] Agregando inscripción:', this.nuevaInscripcion);

    this.adminService.addInscripcion(this.clienteAEditar.id, this.nuevaInscripcion.horarioId).subscribe({
      next: (response: any) => {
        console.log('✅ [ESTUDIANTES ANGULAR SUCCESS] Inscripción agregada:', response);
        this.successMessage = 'Inscripción agregada exitosamente';
        this.cargarClientes();
        this.cargarTalleresDisponibles(); // Actualizar vacantes
        this.nuevaInscripcion = {};

        // Cerrar modal si se desea, o dejarlo abierto para ver el cambio
        const modalElement = document.getElementById('estudiantes-editModal');
        if (modalElement) {
          const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
          if (modal) modal.hide();
        }

        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (err) => {
        console.error('❌ [ESTUDIANTES ANGULAR ERROR] Error al agregar inscripción:', err);
        this.errorMessage = err.error?.message || 'Error al agregar inscripción';
      }
    });
  }

  eliminarInscripcion(cliente: Cliente, inscripcion: any) {
    if (!inscripcion.horario || !inscripcion.horario.id) {
      console.error('❌ [ESTUDIANTES ANGULAR] Error: ID de horario no encontrado en la inscripción');
      return;
    }

    const horarioId = inscripcion.horario.id;
    const nombreTaller = inscripcion.horario.taller?.nombre || 'Taller';

    if (confirm('¿Estás seguro de que deseas dar de baja a ' + cliente.nombreCompleto + ' del taller ' + nombreTaller + '?')) {
      console.log('🔵 [ESTUDIANTES ANGULAR] Eliminando inscripción. Cliente:', cliente.id, 'Horario:', horarioId);

      this.adminService.removeInscripcion(cliente.id, horarioId).subscribe({
        next: (response: any) => {
          console.log('✅ [ESTUDIANTES ANGULAR SUCCESS] Inscripción eliminada:', response);
          this.successMessage = 'Inscripción eliminada exitosamente';
          this.cargarClientes();
          this.cargarTalleresDisponibles(); // Actualizar vacantes

          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        },
        error: (err: any) => {
          console.error('❌ [ESTUDIANTES ANGULAR ERROR] Error al eliminar inscripción:', err);
          this.errorMessage = err.error?.message || 'Error al eliminar inscripción';
        }
      });
    }
  }
}