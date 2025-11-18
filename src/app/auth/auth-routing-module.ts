import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// 🚨 Asegúrate de que las rutas de importación sean correctas:
import { Layout } from './pages/layout/layout';
import { Login } from './pages/login/login'; // ⬅️ ¡Añadida la importación de Login!

const routes: Routes = [
  {
    // Define la ruta base para el módulo Auth (ej: 'auth/')
    path: '', 
    component: Layout, // El Layout actúa como contenedor principal
    children: [
      {
        // Ruta para el Login (ej: 'auth/login')
        path: 'login',
        component: Login
      },
      {
        // Redirección por defecto si la URL del módulo es solo 'auth/'
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        // Manejo de cualquier otra ruta dentro del módulo Auth
        path: '**',
        redirectTo: 'login'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }