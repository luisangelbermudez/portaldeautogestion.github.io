import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CertificadoService } from "../../services/certificado.service";
import { GenerarCertificadoRequest } from "../../models/certificado.model";

@Component({
  selector: "app-certificados",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./certificados.component.html",
  styleUrl: "./certificados.component.css",
})
export class CertificadosComponent {
  solicitud: GenerarCertificadoRequest = { idUsuario: 0, tipoCarta: "todos", canal: "pdf" };
  mensaje = "";
  generando = false;

  constructor(private certificadoService: CertificadoService) {}

  generar(): void {
    this.generando = true;
    this.mensaje = "";

    if (this.solicitud.canal === "pdf") {
      this.certificadoService.generarPdf(this.solicitud).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const enlace = document.createElement("a");
          enlace.href = url;
          enlace.download = `certificado-${this.solicitud.tipoCarta}.pdf`;
          enlace.click();
          window.URL.revokeObjectURL(url);
          this.mensaje = "Certificado generado y descargado correctamente";
          this.generando = false;
        },
        error: (err) => {
          this.mensaje = "Error al generar el certificado: " + (err.error?.mensaje || err.message);
          this.generando = false;
        },
      });
    } else {
      this.certificadoService.generarYEnviarPorCorreo(this.solicitud).subscribe({
        next: (resp) => { this.mensaje = resp.mensaje; this.generando = false; },
        error: (err) => {
          this.mensaje = "Error al enviar el certificado: " + (err.error?.mensaje || err.message);
          this.generando = false;
        },
      });
    }
  }
}
