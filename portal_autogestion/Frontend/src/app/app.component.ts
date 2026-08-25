import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet, RouterLink, Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs";
import { AuthService } from "./services/auth.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  title = "Portal de Autogestión de Empleados - Acegrasco S.A.";
  mostrarNav = false;

  constructor(public authService: AuthService, private router: Router) {
    this.actualizarNav();
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.actualizarNav();
    });
  }

  actualizarNav(): void {
    this.mostrarNav = this.authService.estaAutenticado() && this.router.url !== "/login";
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}
