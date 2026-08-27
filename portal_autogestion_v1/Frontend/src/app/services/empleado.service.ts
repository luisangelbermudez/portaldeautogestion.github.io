import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Empleado } from "../models/empleado.model";

@Injectable({ providedIn: "root" })
export class EmpleadoService {
  private readonly baseUrl = `${environment.apiUrl}/empleados`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.baseUrl);
  }

  consultarPorId(id: number): Observable<Empleado> {
    return this.http.get<Empleado>(`${this.baseUrl}?id=${id}`);
  }

  crear(empleado: Empleado): Observable<any> {
    return this.http.post(this.baseUrl, empleado);
  }

  actualizar(empleado: Empleado): Observable<any> {
    return this.http.put(this.baseUrl, empleado);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}?id=${id}`);
  }
}
