import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { InscripcionService } from '../../../services/inscripcion-service';
import { ProgressBar } from './progress-bar';


@Component({
  selector: 'app-inscripcion',
  standalone: true,
  // Se añade ProgressBar a los imports
  imports: [CommonModule, RouterOutlet, ProgressBar],
  templateUrl: './inscripcion.html',
  styleUrls: ['./inscripcion.scss']
})
export class Inscripcion implements OnInit {
  private inscripcionService = inject(InscripcionService);

  ngOnInit(): void {
    // Al cargar el componente padre, reiniciaremos el flujo o verificamos el paso si es necesario
    // Para simplificar, asumimos que al entrar, volvemos al paso 1 o donde indique el router-outlet
    // Los componentes hijos se encargarán de actualizar el pasoActual del servicio al cargarse.
  }
}