import { Component } from '@angular/core';
// ⚠️ CORRECCIÓN: Usamos RouterModule para <router-outlet>
import { RouterModule } from '@angular/router'; 

// Importaciones de tus componentes Standalone compartidos
import { Footer } from "../../../shared/components/footer/footer"; 
import { Header } from "../../../shared/components/header/header";
// Nota: Eliminé la importación de AdminRoutingModule ya que no se usa aquí.

@Component({
  selector: 'app-layout',
  // Asumimos Standalone
  standalone: true, 
  imports: [
    RouterModule, // ✅ Habilita el uso de <router-outlet>
    Header,       // ✅ Habilita el uso de <app-header>
    Footer        // ✅ Habilita el uso de <app-footer>
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  // Aquí no necesitas código adicional por ahora
}