/**
 * Usuarios.js
 * Módulo CRUD de usuarios en React.
 * Conecta con el ApiUsuariosServlet del backend Java.
 *
 * Operaciones:
 *  - Listar usuarios (GET)
 *  - Crear usuario   (POST)
 *  - Editar usuario  (PUT)
 *  - Eliminar usuario (DELETE)
 */
import React, { useState, useEffect } from 'react';
import {
  obtenerUsuarios, crearUsuario,
  actualizarUsuario, eliminarUsuario
} from '../services/api';

/** Badges visuales según el rol del usuario */
const BadgeRol = ({ idRol }) => (
  <span className={`badge ${idRol === 1 ? 'badge-admin' : 'badge-activo'}`}>
    {idRol === 1 ? '🛡 Administrador' : '👤 Empleado'}
  </span>
);

/** Badges visuales según el estado del usuario */
const BadgeEstado = ({ idEstado }) => (
  <span className={`badge ${idEstado === 1 ? 'badge-activo' : 'badge-inactivo'}`}>
    {idEstado === 1 ? '✅ Activo' : '🔴 Inactivo'}
  </span>
);

/**
 * Componente Usuarios
 * Página principal del módulo de usuarios con tabla y modal de formulario.
 */
function Usuarios() {
  // ── Estado principal ───────────────────────────────────────────────────────
  const [usuarios, setUsuarios]     = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [error, setError]           = useState(null);
  const [mensaje, setMensaje]       = useState(null);

  // ── Estado del modal y formulario ─────────────────────────────────────────
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion,  setModoEdicion]  = useState(false);
  const [formData, setFormData] = useState({
    idUsuario: '', nombre: '', correo: '',
    contrasena: '', idRol: 2, idEstado: 1
  });

  // ── Cargar usuarios al montar el componente ────────────────────────────────
  useEffect(() => { cargarUsuarios(); }, []);

  /**
   * Carga la lista de usuarios desde el backend Java.
   */
  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const res = await obtenerUsuarios();
      setUsuarios(res.data);
      setError(null);
    } catch {
      setError('No se pudo cargar la lista de usuarios. Verifica la conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  /** Muestra una alerta de éxito o error temporal */
  const mostrarMensaje = (texto, tipo = 'exito') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3500);
  };

  // ── Abrir modal para nuevo usuario ────────────────────────────────────────
  const abrirModalNuevo = () => {
    setFormData({ idUsuario: '', nombre: '', correo: '', contrasena: '', idRol: 2, idEstado: 1 });
    setModoEdicion(false);
    setModalAbierto(true);
  };

  // ── Abrir modal para editar usuario ───────────────────────────────────────
  const abrirModalEditar = (usuario) => {
    setFormData({ ...usuario, contrasena: '' });
    setModoEdicion(true);
    setModalAbierto(true);
  };

  // ── Cerrar modal ──────────────────────────────────────────────────────────
  const cerrarModal = () => { setModalAbierto(false); setError(null); };

  // ── Manejar cambios en el formulario ──────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ── Guardar: crear o actualizar ───────────────────────────────────────────
  const guardarUsuario = async (e) => {
    e.preventDefault();
    try {
      if (modoEdicion) {
        await actualizarUsuario({ ...formData, idRol: Number(formData.idRol), idEstado: Number(formData.idEstado) });
        mostrarMensaje('✅ Usuario actualizado correctamente.');
      } else {
        await crearUsuario({ ...formData, idRol: Number(formData.idRol), idEstado: Number(formData.idEstado) });
        mostrarMensaje('✅ Usuario creado correctamente.');
      }
      cerrarModal();
      cargarUsuarios();
    } catch (err) {
      mostrarMensaje('❌ ' + (err.response?.data?.error || 'Error al guardar el usuario.'), 'error');
    }
  };

  // ── Eliminar usuario ──────────────────────────────────────────────────────
  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Deseas eliminar al usuario "${nombre}"?`)) return;
    try {
      await eliminarUsuario(id);
      mostrarMensaje('✅ Usuario eliminado correctamente.');
      cargarUsuarios();
    } catch {
      mostrarMensaje('❌ No se pudo eliminar el usuario.', 'error');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Alertas ── */}
      {mensaje && (
        <div className={`alerta alerta-${mensaje.tipo}`}>{mensaje.texto}</div>
      )}

      <div className="panel">
        {/* ── Encabezado ── */}
        <div className="panel-titulo">
          <span>👥 Gestión de Usuarios</span>
          <button className="btn btn-primario btn-sm" onClick={abrirModalNuevo}>
            ➕ Nuevo usuario
          </button>
        </div>

        {/* ── Tabla ── */}
        {cargando ? (
          <div className="cargando"><div className="spinner"></div>Cargando usuarios...</div>
        ) : error ? (
          <div className="alerta alerta-error">{error}</div>
        ) : (
          <div className="tabla-wrap">
            <table className="tabla">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre completo</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign:'center', color:'#888', padding:'20px' }}>No hay usuarios registrados.</td></tr>
                ) : (
                  usuarios.map(u => (
                    <tr key={u.idUsuario}>
                      <td>{u.idUsuario}</td>
                      <td><strong>{u.nombre}</strong></td>
                      <td>{u.correo}</td>
                      <td><BadgeRol idRol={u.idRol} /></td>
                      <td><BadgeEstado idEstado={u.idEstado} /></td>
                      <td>
                        <div className="btn-acciones">
                          <button className="btn btn-dorado btn-sm" onClick={() => abrirModalEditar(u)}>✏️ Editar</button>
                          <button className="btn btn-peligro btn-sm" onClick={() => handleEliminar(u.idUsuario, u.nombre)}>🗑 Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal formulario ── */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && cerrarModal()}>
          <div className="modal">
            <div className="modal-header">
              <h3>{modoEdicion ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}</h3>
              <button className="modal-cerrar" onClick={cerrarModal}>✕</button>
            </div>
            <form onSubmit={guardarUsuario}>
              <div className="modal-body">
                <div className="form-fila">
                  <div className="form-grupo">
                    <label>Nombre completo *</label>
                    <input className="form-control" name="nombre" value={formData.nombre}
                      onChange={handleChange} required placeholder="Ej: Carlos Rodríguez" />
                  </div>
                  <div className="form-grupo">
                    <label>Correo electrónico *</label>
                    <input type="email" className="form-control" name="correo" value={formData.correo}
                      onChange={handleChange} required placeholder="usuario@acegrasco.com" />
                  </div>
                </div>
                <div className="form-grupo">
                  <label>Contraseña {modoEdicion ? '(dejar vacío para no cambiar)' : '*'}</label>
                  <input type="password" className="form-control" name="contrasena" value={formData.contrasena}
                    onChange={handleChange} placeholder="••••••••"
                    required={!modoEdicion} />
                </div>
                <div className="form-fila">
                  <div className="form-grupo">
                    <label>Rol *</label>
                    <select className="form-control" name="idRol" value={formData.idRol} onChange={handleChange}>
                      <option value={2}>Empleado</option>
                      <option value={1}>Administrador</option>
                    </select>
                  </div>
                  <div className="form-grupo">
                    <label>Estado *</label>
                    <select className="form-control" name="idEstado" value={formData.idEstado} onChange={handleChange}>
                      <option value={1}>Activo</option>
                      <option value={2}>Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-gris" onClick={cerrarModal}>Cancelar</button>
                <button type="submit" className="btn btn-primario">💾 Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Usuarios;
