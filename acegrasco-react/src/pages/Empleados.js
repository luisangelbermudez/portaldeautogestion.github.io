/**
 * Empleados.js
 * Módulo CRUD de empleados en React.
 * Conecta con el ApiEmpleadosServlet del backend Java.
 *
 * Operaciones:
 *  - Listar empleados (GET)
 *  - Crear empleado   (POST)
 *  - Editar empleado  (PUT)
 *  - Eliminar empleado (DELETE)
 */
import React, { useState, useEffect } from 'react';
import {
  obtenerEmpleados, crearEmpleado,
  actualizarEmpleado, eliminarEmpleado
} from '../services/api';

/** Lista de áreas disponibles en Acegrasco S.A. */
const AREAS = ['Gerencia', 'Gestion Humana', 'Tecnologia', 'Financiera', 'Calidad', 'Operaciones', 'Legal'];

/**
 * Componente Empleados
 * Página CRUD de empleados con tabla y modal de formulario.
 */
function Empleados() {
  // ── Estado principal ──────────────────────────────────────────────────────
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [error, setError]         = useState(null);
  const [mensaje, setMensaje]     = useState(null);

  // ── Estado del modal ──────────────────────────────────────────────────────
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion,  setModoEdicion]  = useState(false);
  const [formData, setFormData] = useState({
    idEmpleado: '', idUsuario: '', cedula: '', cargo: '',
    area: 'Tecnologia', fechaIngreso: '', salario: '', promedioHorasExtras: '0'
  });

  // ── Cargar empleados al montar ─────────────────────────────────────────────
  useEffect(() => { cargarEmpleados(); }, []);

  const cargarEmpleados = async () => {
    setCargando(true);
    try {
      const res = await obtenerEmpleados();
      setEmpleados(res.data);
      setError(null);
    } catch {
      setError('No se pudo cargar la lista de empleados. Verifica la conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  const mostrarMensaje = (texto, tipo = 'exito') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3500);
  };

  // ── Abrir modal nuevo ─────────────────────────────────────────────────────
  const abrirModalNuevo = () => {
    setFormData({ idEmpleado: '', idUsuario: '', cedula: '', cargo: '',
      area: 'Tecnologia', fechaIngreso: '', salario: '', promedioHorasExtras: '0' });
    setModoEdicion(false);
    setModalAbierto(true);
  };

  // ── Abrir modal editar ────────────────────────────────────────────────────
  const abrirModalEditar = (emp) => {
    setFormData({
      ...emp,
      fechaIngreso: emp.fechaIngreso ? emp.fechaIngreso.substring(0, 10) : '',
      salario: String(emp.salario),
      promedioHorasExtras: String(emp.promedioHorasExtras)
    });
    setModoEdicion(true);
    setModalAbierto(true);
  };

  const cerrarModal = () => { setModalAbierto(false); };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ── Guardar empleado ──────────────────────────────────────────────────────
  const guardarEmpleado = async (e) => {
    e.preventDefault();
    const datos = {
      ...formData,
      idUsuario: Number(formData.idUsuario),
      salario: Number(formData.salario),
      promedioHorasExtras: Number(formData.promedioHorasExtras)
    };
    try {
      if (modoEdicion) {
        await actualizarEmpleado({ ...datos, idEmpleado: Number(formData.idEmpleado) });
        mostrarMensaje('✅ Empleado actualizado correctamente.');
      } else {
        await crearEmpleado(datos);
        mostrarMensaje('✅ Empleado registrado correctamente.');
      }
      cerrarModal();
      cargarEmpleados();
    } catch (err) {
      mostrarMensaje('❌ ' + (err.response?.data?.error || 'Error al guardar.'), 'error');
    }
  };

  // ── Eliminar empleado ─────────────────────────────────────────────────────
  const handleEliminar = async (id, cedula) => {
    if (!window.confirm(`¿Eliminar el empleado con cédula ${cedula}?`)) return;
    try {
      await eliminarEmpleado(id);
      mostrarMensaje('✅ Empleado eliminado correctamente.');
      cargarEmpleados();
    } catch {
      mostrarMensaje('❌ No se pudo eliminar el empleado.', 'error');
    }
  };

  // ── Formatear salario en pesos ────────────────────────────────────────────
  const formatearSalario = (valor) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {mensaje && <div className={`alerta alerta-${mensaje.tipo}`}>{mensaje.texto}</div>}

      <div className="panel">
        <div className="panel-titulo">
          <span>👤 Gestión de Empleados</span>
          <button className="btn btn-primario btn-sm" onClick={abrirModalNuevo}>➕ Nuevo empleado</button>
        </div>

        {cargando ? (
          <div className="cargando"><div className="spinner"></div>Cargando empleados...</div>
        ) : error ? (
          <div className="alerta alerta-error">{error}</div>
        ) : (
          <div className="tabla-wrap">
            <table className="tabla">
              <thead>
                <tr>
                  <th>ID</th><th>Cédula</th><th>Nombre</th><th>Cargo</th>
                  <th>Área</th><th>Ingreso</th><th>Salario</th><th>H. Extras</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empleados.length === 0 ? (
                  <tr><td colSpan="9" style={{ textAlign:'center', color:'#888', padding:'20px' }}>No hay empleados registrados.</td></tr>
                ) : (
                  empleados.map(e => (
                    <tr key={e.idEmpleado}>
                      <td>{e.idEmpleado}</td>
                      <td>{e.cedula}</td>
                      <td><strong>{e.nombre}</strong></td>
                      <td>{e.cargo}</td>
                      <td><span className="badge badge-area">{e.area}</span></td>
                      <td>{e.fechaIngreso}</td>
                      <td>{formatearSalario(e.salario)}</td>
                      <td>{e.promedioHorasExtras} h</td>
                      <td>
                        <div className="btn-acciones">
                          <button className="btn btn-dorado btn-sm" onClick={() => abrirModalEditar(e)}>✏️ Editar</button>
                          <button className="btn btn-peligro btn-sm" onClick={() => handleEliminar(e.idEmpleado, e.cedula)}>🗑 Eliminar</button>
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
              <h3>{modoEdicion ? '✏️ Editar Empleado' : '➕ Nuevo Empleado'}</h3>
              <button className="modal-cerrar" onClick={cerrarModal}>✕</button>
            </div>
            <form onSubmit={guardarEmpleado}>
              <div className="modal-body">
                <div className="form-fila">
                  <div className="form-grupo">
                    <label>ID Usuario vinculado *</label>
                    <input type="number" className="form-control" name="idUsuario"
                      value={formData.idUsuario} onChange={handleChange}
                      required disabled={modoEdicion} placeholder="Ej: 2" />
                  </div>
                  <div className="form-grupo">
                    <label>Cédula *</label>
                    <input className="form-control" name="cedula" value={formData.cedula}
                      onChange={handleChange} required placeholder="Ej: 12345678" />
                  </div>
                </div>
                <div className="form-fila">
                  <div className="form-grupo">
                    <label>Cargo *</label>
                    <input className="form-control" name="cargo" value={formData.cargo}
                      onChange={handleChange} required placeholder="Ej: Analista de Sistemas" />
                  </div>
                  <div className="form-grupo">
                    <label>Área *</label>
                    <select className="form-control" name="area" value={formData.area} onChange={handleChange}>
                      {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-fila">
                  <div className="form-grupo">
                    <label>Fecha de ingreso *</label>
                    <input type="date" className="form-control" name="fechaIngreso"
                      value={formData.fechaIngreso} onChange={handleChange} required />
                  </div>
                  <div className="form-grupo">
                    <label>Salario mensual *</label>
                    <input type="number" className="form-control" name="salario"
                      value={formData.salario} onChange={handleChange}
                      required min="0" step="1" placeholder="Ej: 3000000" />
                  </div>
                </div>
                <div className="form-grupo">
                  <label>Promedio horas extras</label>
                  <input type="number" className="form-control" name="promedioHorasExtras"
                    value={formData.promedioHorasExtras} onChange={handleChange}
                    min="0" step="0.01" />
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

export default Empleados;
