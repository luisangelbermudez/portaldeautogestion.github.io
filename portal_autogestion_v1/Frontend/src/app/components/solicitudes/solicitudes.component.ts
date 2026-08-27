import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Solicitud, NuevaSolicitud } from "../../models/solicitud.model";
import { SolicitudService } from "../../services/solicitud.service";

@Component({
  selector: "app-solicitudes",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./solicitudes.component.html",
  styleUrl: "./solicitudes.component.css",
})
export class SolicitudesComponent implements OnInit {
  solicitudes: Solicitud[] = [];
  nuevaSolicitud: NuevaSolicitud = this.solicitudVacia();
  mensaje = "";
  cargando = false;

  readonly ESTADOS: Record<number, string> = {
    1: "Activo", 2: "Inactivo", 3: "Pendiente", 4: "En revisión", 5: "Aprobado", 6: "Rechazado",
  };

  constructor(private solicitudService: SolicitudService) {}

  ngOnInit(): void { this.cargarSolicitudes(); }

  solicitudVacia(): NuevaSolicitud {
    return { idEmpleado: 0, tipoSolicitud: "", descripcion: "" };
  }

  cargarSolicitudes(): void {
    this.cargando = true;
    this.solicitudService.listar().subscribe({
      next: (data) => { this.solicitudes = data; this.cargando = false; },
      error: (err) => { this.mensaje = "Error al cargar solicitudes: " + err.message; this.cargando = false; },
    });
  }

  crear(): void {
    this.solicitudService.crear(this.nuevaSolicitud).subscribe({
      next: () => { this.mensaje = "Solicitud enviada correctamente"; this.nuevaSolicitud = this.solicitudVacia(); this.cargarSolicitudes(); },
      error: (err) => this.mensaje = "Error al enviar la solicitud: " + (err.error?.mensaje || err.message),
    });
  }

  cambiarEstado(solicitud: Solicitud, nuevoEstado: number): void {
    if (!solicitud.id_solicitud) return;
    this.solicitudService.actualizarEstado(solicitud.id_solicitud, nuevoEstado).subscribe({
      next: () => { this.mensaje = "Estado actualizado correctamente"; this.cargarSolicitudes(); },
      error: (err) => this.mensaje = "Error al actualizar estado: " + err.message,
    });
  }

  eliminar(id?: number): void {
    if (!id) return;
    if (!confirm("¿Seguro que deseas eliminar esta solicitud?")) return;
    this.solicitudService.eliminar(id).subscribe({
      next: () => { this.mensaje = "Solicitud eliminada correctamente"; this.cargarSolicitudes(); },
      error: (err) => this.mensaje = "Error al eliminar: " + err.message,
    });
  }
}
