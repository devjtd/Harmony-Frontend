import { Component, OnInit, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InscripcionService } from '../../../services/inscripcion-service';
import { AuthService } from '../../../services/auth-service';

@Component({
    selector: 'app-nueva-inscripcion',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './nueva-inscripcion.html',
    styleUrl: './nueva-inscripcion.scss'
})
export class NuevaInscripcionComponent implements OnInit {
    private inscripcionService = inject(InscripcionService);
    private authService = inject(AuthService);
    private router = inject(Router);

    talleres: any[] = [];
    tallerSeleccionadoId: number | null = null;
    horarioSeleccionadoId: number | null = null;
    isLoading = true;
    errorMessage: string | null = null;

    inscripcionesCliente: any[] = [];
    mostrarFormularioPago = false;
    datosPago = {
        numeroTarjeta: '',
        fechaVencimiento: '',
        cvv: ''
    };

    ngOnInit() {
        this.cargarDatosIniciales();
    }

    cargarDatosIniciales() {
        this.isLoading = true;
        const userInfo = this.authService.getUserInfo();

        if (userInfo && userInfo.id) {
            // 1. Cargar inscripciones del cliente
            this.inscripcionService.obtenerInscripcionesPorCliente(userInfo.id).subscribe({
                next: (inscripciones) => {
                    this.inscripcionesCliente = inscripciones;
                    // 2. Cargar talleres disponibles
                    this.cargarTalleres();
                },
                error: (err) => {
                    console.error('Error al cargar inscripciones', err);
                    // Intentar cargar talleres de todos modos
                    this.cargarTalleres();
                }
            });
        } else {
            this.cargarTalleres();
        }
    }

    cargarTalleres() {
        this.inscripcionService.obtenerTalleres().subscribe({
            next: (data) => {
                this.talleres = data;
                this.filtrarHorariosInscritos();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error al cargar talleres', err);
                this.errorMessage = 'No se pudieron cargar los talleres disponibles.';
                this.isLoading = false;
            }
        });
    }

    filtrarHorariosInscritos() {
        if (!this.inscripcionesCliente.length) return;

        const horariosInscritosIds = this.inscripcionesCliente.map(i => i.horario?.id);

        this.talleres.forEach(taller => {
            if (taller.horarios) {
                // Marcar o filtrar horarios ya inscritos
                // Opción A: Filtrarlos (quitarlos de la lista)
                taller.horarios = taller.horarios.filter((h: any) => !horariosInscritosIds.includes(h.id));
            }
        });
    }

    get horariosDisponibles() {
        if (!this.tallerSeleccionadoId) return [];
        const taller = this.talleres.find(t => t.id === this.tallerSeleccionadoId);
        return taller ? taller.horarios : [];
    }

    iniciarProcesoPago() {
        if (!this.tallerSeleccionadoId || !this.horarioSeleccionadoId) return;
        this.mostrarFormularioPago = true;
    }

    cancelarPago() {
        this.mostrarFormularioPago = false;
        this.datosPago = { numeroTarjeta: '', fechaVencimiento: '', cvv: '' };
    }

    validarPago(): boolean {
        const { numeroTarjeta, fechaVencimiento, cvv } = this.datosPago;
        const tarjetaValida = /^\d{15,19}$/.test(numeroTarjeta.replace(/\s/g, ''));
        const fechaValida = /^(0[1-9]|1[0-2])\/\d{2}$/.test(fechaVencimiento);
        const cvvValido = /^\d{3,4}$/.test(cvv);
        return tarjetaValida && fechaValida && cvvValido;
    }

    inscribirse() {
        if (!this.validarPago()) {
            alert('Por favor, ingrese datos de pago válidos.');
            return;
        }

        const userInfo = this.authService.getUserInfo();
        if (!userInfo || !userInfo.id) {
            this.errorMessage = 'No se pudo identificar al usuario.';
            return;
        }

        const payload = {
            clienteId: userInfo.id,
            horarioId: this.horarioSeleccionadoId!
        };

        this.inscripcionService.inscribirEstudiante(payload).subscribe({
            next: () => {
                alert('¡Inscripción realizada con éxito!');
                this.router.navigate(['/estudiante/horario']);
            },
            error: (err) => {
                console.error('Error al inscribir', err);
                this.errorMessage = 'Hubo un error al procesar la inscripción. Inténtalo de nuevo.';
            }
        });
    }
}
