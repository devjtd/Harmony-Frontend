import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Layout } from './pages/layout/layout';
import { Login } from './pages/login/login';
import { ForgotPassword } from './pages/forgot-password/forgot-password';

const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'login',
        component: Login,
        title: 'Harmony - Login'
      },
      {
        path: 'forgot-password',
        component: ForgotPassword,
        title: 'Harmony - Recuperar Contraseña'
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
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