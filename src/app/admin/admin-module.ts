// src/app/admin/admin-module.ts

import { NgModule } from '@angular/core';
// Importa CommonModule (ya está) y agrega FormsModule
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- 1. Importar FormsModule
import { AdminRoutingModule } from './admin-routing-module';
import { Profesores } from './pages/profesores/profesores';
import { Estudiantes } from './pages/estudiantes/estudiantes';

@NgModule({
  declarations: [

    // Asegúrate de que el componente Profesores esté en las declaraciones
    // Si no está aquí, debe estar en un módulo de routing (lazy-loaded module) que importa este módulo,
    // pero para este ejemplo, asumiremos que se declara aquí o está en un módulo hijo cargado.

  ],
  imports: [
    CommonModule,
    Profesores,
    Estudiantes,
    // 2. Añadir FormsModule al array de imports
    FormsModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
