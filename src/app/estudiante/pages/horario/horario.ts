import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth-service';
import { HttpClient } from '@angular/common/http';
import { InscripcionService } from '../../../services/inscripcion-service';
import { RouterModule } from '@angular/router';

interface HorarioModel {
    id: number;
    diasDeClase: string;
    horaInicio: string;
    horaFin: string;
    taller: {
        nombre: string;
    };
    profesor: {
        nombreCompleto: string;
    };
}

@Component({
    selector: 'app-horario',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './horario.html',
    styleUrl: './horario.scss',
})

export class Horario implements OnInit {
    private authService = inject(AuthService);
    private http = inject(HttpClient);
    private inscripcionService = inject(InscripcionService);

    public userName: string = '';
    public horarios: HorarioModel[] = [];
    public isLoading: boolean = true;
    public errorMessage: string | null = null;

    private readonly API_URL = 'http://localhost:8080/api/cliente/horarios';

    ngOnInit(): void {
        console.log('[HORARIO ESTUDIANTE] Inicializando componente');

        const userInfo = this.authService.getUserInfo();
        if (userInfo) {
            this.userName = userInfo.nombreCompleto || userInfo.email;
        }

        this.cargarHorarios();
    }

    private cargarHorarios(): void {
        console.log('[HORARIO ESTUDIANTE] Cargando horarios del estudiante');

        this.http.get<HorarioModel[]>(this.API_URL).subscribe({
            next: (horarios) => {
                console.log('[HORARIO ESTUDIANTE] Horarios cargados:', horarios.length);
                this.horarios = horarios;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('[HORARIO ESTUDIANTE] Error al cargar horarios:', error);
                this.errorMessage = 'No se pudieron cargar los horarios. Por favor, intenta más tarde.';
                this.isLoading = false;
            }
        });
    }

    formatHora(hora: string): string {
        // Formato HH:mm:ss -> HH:mm
        return hora.substring(0, 5);
    }

    solicitarBaja(horario: HorarioModel) {
        const motivo = prompt(`Por favor, indica el motivo de la baja para el taller ${horario.taller.nombre}: `);

        if (motivo === null) {
            return; // Usuario canceló
        }

        if (motivo.trim().length < 5) {
            alert('Por favor, ingresa un motivo válido (mínimo 5 caracteres).');
            return;
        }

        const userInfo = this.authService.getUserInfo();
        if (!userInfo || !userInfo.id) {
            alert('Error: No se pudo identificar al usuario.');
            return;
        }

        const payload = {
            clienteId: userInfo.id,
            horarioId: horario.id,
            motivo: motivo
        };

        console.log('[HORARIO ESTUDIANTE] Solicitando baja:', payload);

        this.http.post('http://localhost:8080/api/inscripcion/solicitar-baja', payload).subscribe({
            next: (response: any) => {
                console.log('✅ [HORARIO ESTUDIANTE] Solicitud enviada:', response);
                alert('Tu solicitud de baja ha sido enviada al administrador. Te contactaremos pronto.');
            },
            error: (err) => {
                console.error('❌ [HORARIO ESTUDIANTE] Error al solicitar baja:', err);
                alert('Hubo un error al procesar tu solicitud. Por favor, intenta nuevamente.');
            }
        });
    }
}