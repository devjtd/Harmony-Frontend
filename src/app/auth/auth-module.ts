import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Login } from './pages/login/login';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    FormsModule,
    Login
  ],
  exports: [
  ]
})
export class AuthModule { }