import { Routes } from '@angular/router';
import { Error404 } from './shared/pages/error404/error404';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth-routing-module').then(m => m.AuthRoutingModule)
    },
    {
        path: '',
        loadChildren: () => import('./landing/landing-module').then(m => m.LandingModule),
    },
    {
        path: 'admin',
        loadChildren: () => import('./admin/admin-module').then(m => m.AdminModule)
    },
    {
        path: 'estudiante',
        loadChildren: () => import('./estudiante/estudiante-module').then(m => m.EstudianteModule)
    },
    {
        path: 'profesor',
        loadChildren: () => import('./profesor/profesor-module').then(m => m.ProfesorModule)
    },
    {
        path: '**',
        component: Error404
    },
];
