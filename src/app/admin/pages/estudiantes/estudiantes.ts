import { CommonModule } from '@angular/common';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, NgForm, RequiredValidator } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService, ClienteDTO, TallerDTO } from '../../../services/admin-service';

// Definición de interfaces para los modelos de datos
interface Horario {
  id: number;
  diasDeClase: string;
  horaInicio: string; // Usaremos string para la hora ('HH:mm')
  horaFin: string; // Usaremos string para la hora ('HH:mm')
  profesor: { nombreCompleto: string };
  vacantesDisponibles: number;
}

interface Taller {
  id: number;
  nombre: string;
  horarios: Horario[];
  seleccionado: boolean; // Campo de control para el checkbox
  horarioSeleccionado?: number; // ID del horario elegido
}

interface Cliente {
  id: number;
  nombreCompleto: string;
  correo: string;
  telefono: string;
  inscripciones: { horario: { taller: { nombre: string }, diasDeClase: string, horaInicio: string, horaFin: string } }[];
  // Propiedades anidadas simplificadas para el ejemplo
  user: { email: string };
}

@Component({
  selector: 'app-estudiantes',
  templateUrl: './estudiantes.html',
  styleUrls: ['./estudiantes.scss'],
  imports: [
    FormsModule,
    CommonModule,


  ]
})
export class Estudiantes implements OnInit {

  // Variables de datos (reemplazan a los modelos de Thymeleaf)
  talleres: Taller[] = [];
  clientes: Cliente[] = [];
  nombreUsuario: string = '';
  nuevoCliente: any = {}; // Modelo para el formulario de registro
  clienteAEditar: Cliente | any = {}; // Modelo para el modal de edición
  originalCorreo: string = '';
  validationAlert: boolean = false;

  // Referencia al formulario de edición para resetear o interactuar
  @ViewChild('editClienteFormRef') editClienteFormRef!: NgForm;

  // Referencia al modal de edición
  @ViewChild('editModal') editModal!: ElementRef;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    // Cargar datos de fallback (mocks) de inmediato para que la UI funcione
    this.loadInitialData();

    // Intentar obtener datos reales desde el backend y sobrescribir los mocks si están disponibles
    this.adminService.getTalleres().subscribe(
      (talleresApi: TallerDTO[]) => {
        if (talleresApi && talleresApi.length > 0) {
          this.talleres = talleresApi.map(t => ({
            id: t.id,
            nombre: t.nombre,
            seleccionado: false,
            horarios: (t as any).horarios || []
          }));
        }
      }, err => {
        console.warn('No se pudo obtener talleres desde backend:', err);
      }
    );

    this.adminService.getClientes().subscribe(
      (clientesApi: ClienteDTO[]) => {
        if (clientesApi && clientesApi.length > 0) {
          this.clientes = clientesApi.map(c => ({
            id: c.id,
            nombreCompleto: c.nombreCompleto,
            correo: c.correo,
            telefono: c.telefono,
            user: { email: c.correo },
            inscripciones: []
          } as Cliente));
        }
      }, err => {
        console.warn('No se pudo obtener clientes desde backend:', err);
      }
    );
  }

  // Función para simular la carga de datos
  loadInitialData() {
    // Talleres
    this.talleres = [
  {
    id: 1,
    nombre: 'Taller de Guitarra',
    seleccionado: false, // <-- ¡AGREGAR ESTO!
    horarios: [
        { id: 101, diasDeClase: 'Lunes y Miércoles', horaInicio: '18:00', horaFin: '19:30', profesor: { nombreCompleto: 'Prof. Ana' }, vacantesDisponibles: 5 },
        { id: 102, diasDeClase: 'Martes y Jueves', horaInicio: '10:00', horaFin: '11:30', profesor: { nombreCompleto: 'Prof. Juan' }, vacantesDisponibles: 2 },
    ]
  },
  {
    id: 2,
    nombre: 'Taller de Canto',
    seleccionado: false, // <-- ¡AGREGAR ESTO!
    horarios: [
        { id: 201, diasDeClase: 'Viernes', horaInicio: '16:00', horaFin: '18:00', profesor: { nombreCompleto: 'Prof. Sofía' }, vacantesDisponibles: 8 },
    ]
  },
  {
    id: 3,
    nombre: 'Taller de Batería',
    seleccionado: false, // <-- ¡AGREGAR ESTO!
    horarios: [] // Taller sin horarios disponibles
  },
];

    this.clientes = [
  {
    id: 1,
    nombreCompleto: 'Pedro González',
    correo: 'pedro@ejemplo.com', // <-- ¡AGREGAR ESTO!
    user: { email: 'pedro@ejemplo.com' },
    telefono: '987654321',
    inscripciones: [
      { horario: { taller: { nombre: 'Taller de Guitarra' }, diasDeClase: 'L/M', horaInicio: '18:00', horaFin: '19:30' } }
    ]
  },
  {
    id: 2,
    nombreCompleto: 'María Lopez',
    correo: 'maria@ejemplo.com', // <-- ¡AGREGAR ESTO!
    user: { email: 'maria@ejemplo.com' },
    telefono: '998877665',
    inscripciones: []
  },
];

    // Inicializar el modelo del formulario
    this.nuevoCliente = { nombreCompleto: '', correo: '', telefono: '' };
  }

  // Lógica del Formulario de Registro (Reemplaza la validación JS)
  registrarCliente(form: NgForm) {
    this.validationAlert = false;
    let validSelection = true;

    this.talleres.forEach(taller => {
      // Si el taller está seleccionado y tiene horarios, debe tener uno elegido
      if (taller.seleccionado && taller.horarios.length > 0 && !taller.horarioSeleccionado) {
        validSelection = false;
      }
    });

    if (!validSelection) {
      this.validationAlert = true;
      console.error('Debes seleccionar un horario para cada taller elegido.');
      return;
    }

    if (form.valid) {
      // Lógica de envío al backend con los datos de this.nuevoCliente y los talleres seleccionados
      console.log('Cliente a registrar:', this.nuevoCliente);
      const inscripciones = this.talleres
          .filter(t => t.seleccionado && t.horarioSeleccionado)
          .map(t => ({ tallerId: t.id, horarioId: t.horarioSeleccionado }));
      console.log('Inscripciones a registrar:', inscripciones);

      // Aquí se llamaría a un servicio: this.clienteService.registrar(data)...

      // Resetear formulario y data
      form.resetForm();
      this.talleres.forEach(t => { t.seleccionado = false; t.horarioSeleccionado = undefined; });
      this.validationAlert = false;
    }
  }

  // Lógica para el Modal de Edición (Reemplaza show.bs.modal)
  openEditModal(cliente: Cliente) {
    // Copia superficial de los datos para evitar modificar el cliente original antes de guardar
    this.clienteAEditar = {
      id: cliente.id,
      nombre: cliente.nombreCompleto,
      correo: cliente.user.email,
      telefono: cliente.telefono
    };
    this.originalCorreo = cliente.user.email;

    // En Angular, se usa el modal programáticamente si usas un framework como Bootstrap/NGX
    // Si usas el JS de Bootstrap, solo necesitas el ID del modal (editModal).
  }

  // Lógica para el envío del formulario de edición
  editarCliente(form: NgForm) {
    if (form.valid) {
      // Lógica de envío al backend (incluye this.clienteAEditar y this.originalCorreo)
      console.log('Cliente a editar:', this.clienteAEditar);
      console.log('Correo original (para validación):', this.originalCorreo);

      // Aquí se llamaría a un servicio: this.clienteService.editar(data)...

      // Cierra el modal (debes usar la API del modal de Bootstrap si lo incluyes en el index.html)
      // Ejemplo: this.editModal.nativeElement.modal('hide');
    }
  }

  // Lógica para la Baja Segura (Reemplaza la función confirmBajaSegura)
  confirmBajaSegura(cliente: Cliente) {
    if (confirm(`¿Estás seguro de que deseas eliminar completamente al cliente ${cliente.nombreCompleto} (ID: ${cliente.id})? Esta acción es irreversible.`)) {
      console.log('Eliminando cliente con ID:', cliente.id);
      // Aquí se llamaría a un servicio: this.clienteService.eliminar(cliente.id)...
    }
  }
}
