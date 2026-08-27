import { Routes } from "@angular/router";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { UsuariosComponent } from "./components/usuarios/usuarios.component";
import { EmpleadosComponent } from "./components/empleados/empleados.component";
import { SolicitudesComponent } from "./components/solicitudes/solicitudes.component";
import { CertificadosComponent } from "./components/certificados/certificados.component";

export const routes: Routes = [
  { path: "", component: DashboardComponent },
  { path: "usuarios", component: UsuariosComponent },
  { path: "empleados", component: EmpleadosComponent },
  { path: "solicitudes", component: SolicitudesComponent },
  { path: "certificados", component: CertificadosComponent },
  { path: "**", redirectTo: "" },
];
