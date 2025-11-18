import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Si no se usan *ngFor/*ngIf, se podría quitar

@Component({
  selector: 'app-acerca',
  standalone: true,
  // Solo se requieren los módulos de Angular
  imports: [CommonModule], 
  templateUrl: './acerca.html',
  styleUrls: ['./acerca.scss']
})
export class Acerca implements OnInit {

  constructor() { }

  ngOnInit(): void {
    // Es estático, no necesita código de inicialización.
  }
}