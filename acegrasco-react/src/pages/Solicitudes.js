/**
 * Solicitudes.js
 * Módulo CRUD de solicitudes en React.
 * Conecta con el ApiSolicitudesServlet del backend Java.
 *
 * Operaciones:
 *  - Listar solicitudes      (GET)
 *  - Crear solicitud          (POST)
 *  - Cambiar estado           (PUT)
 *  - Eliminar solicitud       (DELETE)
 */
import React, { useState, useEffect } from 'react';
import {
  obtenerSolicitudes, crearSolicitud,
  actualizarEstadoSolicitud, eliminarSolicitud
} from '../services/api';

/** Tipos de solicitud disponibles */
const TIPOS = ['Permiso', 'Vacaciones', 'Incapacidad', 'Actualización de datos', 'Modificación datos', 'Otro'];

/** Mapa de estados con label y clase CSS */
const ESTADOS = {
  3: { label: '⏳ Pendiente',   clase: 'badge-pendiente' },
  4: { label: '🔍 En revisión', clase: 'badge-revision'  },
  5: { label: '✅ Aprobado',    clase: 'badge-aprobado'  },
  6: { label: '❌ Rechazado',   clase: 'badge-rechazado' }
};

/** Badge visual del estado de una solicitud */
const BadgeEstado = ({ idEstado }) => {
  const e = ESTADOS[idEstado] || { label: '—', clase: '' };
  return <span className={`badge ${e.clase}`}>{e.label}</span>;
};

/**
 * Componente Solicitudes
 * Página CRUD de solicitudes con tabla, modal de nueva solicitud
 * y botones para cambiar estado (aprobar/rechazar/revisar).
 */
function Solicitudes() {
  // ── Estado principal ──────────────────────────────────────────────────────
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [error, setError]             = useState(null);
  const [mensaje, setMensaje]         = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');

  // ── Estado del modal ──────────────────────────────────────────────────────
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formData, setFormData] = useState({
    idEmpleado: '', tipoSolicitud: 'Permiso', descripcion: ''
  });

  // ── Cargar solicitudes al montar ──────────────────────────────────────────
  useEffect(() => { cargarSolicitudes(); }, []);

  const cargarSolicitudes = async () => {
    setCargando(true);
    try {
      const res = await obtenerSolicitudes();
      setSolicitudes(res.data);
      setError(null);
    } catch {
      setError('No se pudo cargar las solicitudes. Verifica la conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  const mostrarMensaje = (texto, tipo = 'exito') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3500);
  };

  const cerrarModal = () => { setModalAbierto(false); };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ── Crear solicitud ───────────────────────────────────────────────────────
  const guardarSolicitud = async (e) => {
    e.preventDefault();
    try {
      await crearSolicitud({ ...formData, idEmpleado: Number(formData.idEmpleado) });
      mostrarMensaje('✅ Solicitud enviada correctamente. Estado: Pendiente.');
      cerrarModal();
      cargarSolicitudes();
    } catch (err) {
      mostrarMensaje('❌ ' + (err.response?.data?.error || 'Error al enviar la solicitud.'), 'error');
    }
  };

  // ── Cambiar estado ────────────────────────────────────────────────────────
  const cambiarEstado = async (idSolicitud, nuevoEstado, labelEstado) => {
    if (!window.confirm(`¿Cambiar estado a "${labelEstado}"?`)) return;
    try {
      await actualizarEstadoSolicitud(idSolicitud, nuevoEstado);
      mostrarMensaje(`✅ Estado actualizado a "${labelEstado}".`);
      cargarSolicitudes();
    } catch {
      mostrarMensaje('❌ No se pudo actualizar el estado.', 'error');
    }
  };

  // ── Eliminar solicitud ────────────────────────────────────────────────────
  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta solicitud permanentemente?')) return;
    try {
      await eliminarSolicitud(id);
      mostrarMensaje('✅ Solicitud eliminada correctamente.');
      cargarSolicitudes();
    } catch {
      mostrarMensaje('❌ No se pudo eliminar la solicitud.', 'error');
    }
  };

  // ── Filtrar por estado ────────────────────────────────────────────────────
  const solicitudesFiltradas = filtroEstado
    ? solicitudes.filter(s => String(s.idEstado) === filtroEstado)
    : solicitudes;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {mensaje && <div className={`alerta alerta-${mensaje.tipo}`}>{mensaje.texto}</div>}

      <div className="panel">
        <div className="panel-titulo">
          <span>📝 Gestión de Solicitudes</span>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Filtro por estado */}
            <select className="form-control" style={{ width: '160px', padding: '6px 10px' }}
              value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="3">⏳ Pendiente</option>
              <option value="4">🔍 En revisión</option>
              <option value="5">✅ Aprobado</option>
              <option value="6">❌ Rechazado</option>
            </select>
            <button className="btn btn-primario btn-sm" onClick={() => setModalAbierto(true)}>
              ➕ Nueva solicitud
            </button>
          </div>
        </div>

        {cargando ? (
          <div className="cargando"><div className="spinner"></div>Cargando solicitudes...</div>
        ) : error ? (
          <div className="alerta alerta-error">{error}</div>
        ) : (
          <div className="tabla-wrap">
            <table className="tabla">
              <thead>
                <tr>
                  <th>ID</th><th>ID Emp.</th><th>Tipo</th>
                  <th>Descripción</th><th>Estado</th><th>Fecha</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudesFiltradas.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign:'center', color:'#888', padding:'20px' }}>No hay solicitudes.</td></tr>
                ) : (
                  solicitudesFiltradas.map(s => (
                    <tr key={s.idSolicitud}>
                      <td>{s.idSolicitud}</td>
                      <td>{s.idEmpleado}</td>
                      <td><strong>{s.tipoSolicitud}</strong></td>
                      <td style={{ maxWidth: '180px' }}>{s.descripcion}</td>
                      <td><BadgeEstado idEstado={s.idEstado} /></td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '.80rem' }}>
                        {s.fechaCreacion ? s.fechaCreacion.replace('T', ' ').substring(0, 16) : '—'}
                      </td>
                      <td>
                        <div className="btn-acciones">
                          <button className="btn btn-gris btn-sm"
                            onClick={() => cambiarEstado(s.idSolicitud, 4, 'En revisión')}>🔍</button>
                          <button className="btn btn-exito btn-sm"
                            onClick={() => cambiarEstado(s.idSolicitud, 5, 'Aprobado')}>✅</button>
                          <button className="btn btn-peligro btn-sm"
                            onClick={() => cambiarEstado(s.idSolicitud, 6, 'Rechazado')}>❌</button>
                          <button className="btn btn-peligro btn-sm"
                            onClick={() => handleEliminar(s.idSolicitud)}>🗑</button>
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

      {/* ── Modal nueva solicitud ── */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && cerrarModal()}>
          <div className="modal">
            <div className="modal-header">
              <h3>➕ Nueva Solicitud</h3>
              <button className="modal-cerrar" onClick={cerrarModal}>✕</button>
            </div>
            <form onSubmit={guardarSolicitud}>
              <div className="modal-body">
                <div className="form-grupo">
                  <label>ID Empleado *</label>
                  <input type="number" className="form-control" name="idEmpleado"
                    value={formData.idEmpleado} onChange={handleChange}
                    required placeholder="Ej: 1" />
                </div>
                <div className="form-grupo">
                  <label>Tipo de solicitud *</label>
                  <select className="form-control" name="tipoSolicitud"
                    value={formData.tipoSolicitud} onChange={handleChange}>
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-grupo">
                  <label>Descripción *</label>
                  <textarea className="form-control" name="descripcion"
                    value={formData.descripcion} onChange={handleChange}
                    required rows="4"
                    placeholder="Describe tu solicitud con detalle..."
                    style={{ resize: 'vertical' }} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-gris" onClick={cerrarModal}>Cancelar</button>
                <button type="submit" className="btn btn-primario">📤 Enviar solicitud</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Solicitudes;
