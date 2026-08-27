export interface Solicitud {
  id_solicitud?: number;
  id_empleado?: number;
  id_estado?: number;
  tipo_solicitud?: string;
  descripcion?: string;
  fecha_creacion?: string;
}

export interface NuevaSolicitud {
  idEmpleado: number;
  tipoSolicitud: string;
  descripcion: string;
}
