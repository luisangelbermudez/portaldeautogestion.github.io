import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { environment } from "../../environments/environment";
import { Usuario } from "../models/usuario.model";

const CLAVE_SESION = "acegrasco_usuario";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/login`;

  constructor(private http: HttpClient) {}

  login(correo: string, contrasena: string): Observable<{ mensaje: string; usuario: Usuario }> {
    return this.http
      .post<{ mensaje: string; usuario: Usuario }>(this.baseUrl, { correo, contrasena })
      .pipe(
        tap((resp) => {
          sessionStorage.setItem(CLAVE_SESION, JSON.stringify(resp.usuario));
        })
      );
  }

  logout(): void {
    sessionStorage.removeItem(CLAVE_SESION);
  }

  obtenerUsuario(): Usuario | null {
    const datos = sessionStorage.getItem(CLAVE_SESION);
    return datos ? JSON.parse(datos) : null;
  }

  estaAutenticado(): boolean {
    return this.obtenerUsuario() !== null;
  }

  esAdministrador(): boolean {
    const usuario = this.obtenerUsuario();
    return usuario?.idRol === 1;
  }

  esEmpleado(): boolean {
    const usuario = this.obtenerUsuario();
    return usuario?.idRol === 2;
  }
}
