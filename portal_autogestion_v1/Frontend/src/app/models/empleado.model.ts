export interface Empleado {
  id_empleado?: number;
  idUsuario: number;
  cedula: string;
  cargo: string;
  area: string;
  fechaIngreso: string;
  fecha_ingreso?: string;
  salario: number;
  promedioHorasExtras: number;
}
