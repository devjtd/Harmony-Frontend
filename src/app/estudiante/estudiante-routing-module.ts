import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Layout } from './pages/layout/layout';
import { Horario } from './pages/horario/horario';
import { Contrasena } from './pages/contrasena/contrasena';

const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: '',
        redirectTo: 'horario',
        pathMatch: 'full'
      },
      {
        path: 'horario',
        component: Horario
      },
      {
        path: 'contrasena',
        component: Contrasena
      },
      {
        path: '**',
        redirectTo: 'horario'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EstudianteRoutingModule { }
