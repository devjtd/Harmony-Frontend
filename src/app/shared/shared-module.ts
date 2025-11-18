import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// 1. Importar las clases de componentes Standalone
import { Header } from './components/header/header'; 
import { Footer } from './components/footer/footer';
import { HeaderLogin } from './components/header-login/header-login';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    RouterModule,
    Header, 
    Footer,
    HeaderLogin
  ],
  exports: [
    RouterModule,
    CommonModule,
    Header, 
    Footer,
    HeaderLogin
  ]
})
export class SharedModule { }