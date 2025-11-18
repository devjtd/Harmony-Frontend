/*
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Mínimo requerido

@Component({
  selector: 'app-blog',
  standalone: true,
  // Solo se requieren los módulos de Angular básicos
  imports: [CommonModule], 
  templateUrl: './blog.html',
  styleUrls: ['./blog.css']
})
export class Blog implements OnInit {

  constructor() { }

  ngOnInit(): void {
    // Es estático, no requiere lógica de inicialización ni carga de datos.
  }
}
  */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogService, Noticia } from '../../../services/blog-service';


@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blog.html',
  styleUrls: ['./blog.css']
})
export class Blog implements OnInit {

  noticias: Noticia[] = []; // Aquí guardaremos las noticias del backend

  constructor(private blogService: BlogService) { }

  ngOnInit(): void {
    // Traemos las noticias desde el servicio al iniciar el componente
    this.blogService.getNoticias().subscribe({
      next: (data) => this.noticias = data,
      error: (err) => console.error('Error al cargar noticias:', err)
    });
  }
}