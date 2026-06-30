/**
 * api.js
 * Servicio centralizado para todas las peticiones HTTP al backend Java.
 * Usa axios para comunicarse con los Servlets REST en el puerto 8080.
 *
 * URL base: http://localhost:8080/acegrasco/api
 */
import axios from 'axios';

/** URL base del backend Java (Tomcat en puerto 8080) */
const BASE_URL = 'http://localhost:8080/acegrasco/api';

/** Instancia de axios con configuración base */
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000
});

// ─── USUARIOS ────────────────────────────────────────────────────────────────

/** Obtiene la lista completa de usuarios */
export const obtenerUsuarios = () => api.get('/usuarios');

/** Obtiene un usuario por su ID */
export const obtenerUsuarioPorId = (id) => api.get(`/usuarios?id=${id}`);

/** Crea un nuevo usuario */
export const crearUsuario = (datos) => api.post('/usuarios', datos);

/** Actualiza un usuario existente */
export const actualizarUsuario = (datos) => api.put('/usuarios', datos);

/** Elimina un usuario por ID */
export const eliminarUsuario = (id) => api.delete(`/usuarios?id=${id}`);

// ─── EMPLEADOS ───────────────────────────────────────────────────────────────

/** Obtiene la lista completa de empleados */
export const obtenerEmpleados = () => api.get('/empleados');

/** Obtiene un empleado por su ID */
export const obtenerEmpleadoPorId = (id) => api.get(`/empleados?id=${id}`);

/** Crea un nuevo empleado */
export const crearEmpleado = (datos) => api.post('/empleados', datos);

/** Actualiza un empleado existente */
export const actualizarEmpleado = (datos) => api.put('/empleados', datos);

/** Elimina un empleado por ID */
export const eliminarEmpleado = (id) => api.delete(`/empleados?id=${id}`);

// ─── SOLICITUDES ─────────────────────────────────────────────────────────────

/** Obtiene la lista completa de solicitudes */
export const obtenerSolicitudes = () => api.get('/solicitudes');

/** Obtiene solicitudes de un empleado específico */
export const obtenerSolicitudesPorEmpleado = (idEmpleado) =>
  api.get(`/solicitudes?empleado=${idEmpleado}`);

/** Crea una nueva solicitud */
export const crearSolicitud = (datos) => api.post('/solicitudes', datos);

/** Actualiza el estado de una solicitud */
export const actualizarEstadoSolicitud = (idSolicitud, idEstado) =>
  api.put('/solicitudes', { idSolicitud, idEstado });

/** Elimina una solicitud por ID */
export const eliminarSolicitud = (id) => api.delete(`/solicitudes?id=${id}`);

export default api;

// ─── CERTIFICADOS ────────────────────────────────────────────────────────────

/** Obtiene el historial de certificados de un empleado */
export const obtenerCertificadosPorEmpleado = (idEmpleado) =>
  api.get(`/certificados?idEmpleado=${idEmpleado}`);

/** Obtiene todos los certificados emitidos */
export const obtenerCertificados = () => api.get('/certificados');

/**
 * Genera un certificado PDF.
 * responseType 'blob' permite recibir el archivo binario desde Java.
 * Si el canal es 'correo', Java devuelve JSON con confirmación.
 */
export const generarCertificado = (datos) =>
  api.post('/certificados', datos, { responseType: 'blob' });
