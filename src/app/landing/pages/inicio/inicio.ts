import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
// Importa la INTERFAZ y la CLASE/SERVICE. Si la clase se llama Taller, 
// usa un alias como TallerApiService para la clase, lo cual ya estás haciendo.
import { TallerSimple as Taller, TallerService as TallerApiService } from '../../../services/taller-service';
@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.scss']
})
export class Inicio implements OnInit {

  public talleres: Taller[] = [];
  public currentYear: number = new Date().getFullYear();

  constructor(private tallerService: TallerApiService) { }

  // 🚀 Función auxiliar para crear la ruta de la imagen, accesible desde el HTML
  getStaticImageUrl(relativePath: string): string { // ⬅️ AÑADIDO
    return this.tallerService.getStaticImageUrl(relativePath);
  }

  ngOnInit(): void {
    this.tallerService.getTalleresActivos().subscribe({
      next: (data) => {
        this.talleres = data;
        console.log("Talleres cargados en Angular:", this.talleres.length);
      },
      error: (err) => {
        console.error("Error al cargar los talleres:", err);
      }
    });
  }
}