/**
 * Certificados.js
 * Módulo de certificados laborales en React.
 * Conecta con ApiCertificadosServlet del backend Java.
 *
 * El PDF es generado por Java con iText y se descarga directamente
 * en el navegador a través de React.
 *
 * Operaciones:
 *  - Seleccionar tipo de certificado
 *  - Seleccionar canal (PDF descarga / correo)
 *  - Generar y descargar PDF real desde Java
 *  - Ver historial de certificados generados
 */
import React, { useState, useEffect } from 'react';
import { generarCertificado, obtenerCertificadosPorEmpleado } from '../services/api';

/** Tipos de certificado disponibles */
const TIPOS_CERTIFICADO = [
  {
    id: 'todos',
    icono: '📋',
    titulo: 'Certificación Laboral Completa',
    descripcion: 'Incluye nombre, cédula, cargo, área, fecha de ingreso y salario básico mensual.',
    idTipo: 1
  },
  {
    id: 'sin_basico',
    icono: '📑',
    titulo: 'Sin Salario Básico',
    descripcion: 'Igual que la anterior pero sin mencionar el salario. Ideal para trámites generales.',
    idTipo: 2
  },
  {
    id: 'con_extras',
    icono: '⏱️',
    titulo: 'Con Horas Extras',
    descripcion: 'Incluye todos los datos más el promedio de horas extras de los últimos 3 meses.',
    idTipo: 3
  }
];

/** Nombres de los tipos para el historial */
const NOMBRE_TIPO = { 1: 'Completa', 2: 'Sin Salario', 3: 'Con Horas Extras' };

/**
 * Componente Certificados
 * Permite al empleado generar certificados laborales reales en PDF.
 */
function Certificados() {
  // ── Estado ────────────────────────────────────────────────────────────────
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [canal,            setCanal]            = useState('pdf');
  const [idUsuario,        setIdUsuario]        = useState('');
  const [idEmpleado,       setIdEmpleado]       = useState('');
  const [generando,        setGenerando]        = useState(false);
  const [mensaje,          setMensaje]          = useState(null);
  const [historial,        setHistorial]        = useState([]);
  const [cargandoHist,     setCargandoHist]     = useState(false);

  // ── Cargar historial cuando cambia el idEmpleado ──────────────────────────
  useEffect(() => {
    if (idEmpleado && !isNaN(idEmpleado)) {
      cargarHistorial(idEmpleado);
    }
  }, [idEmpleado]);

  const cargarHistorial = async (id) => {
    setCargandoHist(true);
    try {
      const res = await obtenerCertificadosPorEmpleado(id);
      setHistorial(res.data);
    } catch {
      setHistorial([]);
    } finally {
      setCargandoHist(false);
    }
  };

  const mostrarMensaje = (texto, tipo = 'exito') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 5000);
  };

  // ── Generar certificado ───────────────────────────────────────────────────
  const handleGenerar = async () => {
    if (!tipoSeleccionado) {
      mostrarMensaje('⚠️ Selecciona un tipo de certificado.', 'error');
      return;
    }
    if (!idUsuario || isNaN(idUsuario)) {
      mostrarMensaje('⚠️ Ingresa un ID de usuario válido.', 'error');
      return;
    }

    setGenerando(true);
    try {
      const datos = {
        idUsuario: Number(idUsuario),
        tipoCarta: tipoSeleccionado,
        canal
      };

      const response = await generarCertificado(datos);

      if (canal === 'correo') {
        // Java devuelve JSON con mensaje de confirmación
        const texto = await response.data.text();
        const json  = JSON.parse(texto);
        mostrarMensaje(`📧 ${json.mensaje}`);
      } else {
        // Java devuelve bytes del PDF → crear descarga en el navegador
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');

        // Obtener nombre del archivo desde el header Content-Disposition
        const disposition = response.headers['content-disposition'] || '';
        const nombreMatch = disposition.match(/filename="(.+)"/);
        link.download = nombreMatch ? nombreMatch[1] : `certificado-${Date.now()}.pdf`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        mostrarMensaje('✅ Certificado generado y descargado correctamente.');
      }

      // Recargar historial
      if (idEmpleado) cargarHistorial(idEmpleado);

    } catch (err) {
      mostrarMensaje('❌ Error al generar el certificado. Verifica que Tomcat esté corriendo.', 'error');
    } finally {
      setGenerando(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {mensaje && (
        <div className={`alerta alerta-${mensaje.tipo}`}>{mensaje.texto}</div>
      )}

      {/* ── Panel generación ── */}
      <div className="panel">
        <div className="panel-titulo">📄 Generar Certificado Laboral</div>

        {/* ID de usuario */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div className="form-grupo" style={{ flex: '1', minWidth: '180px' }}>
            <label>ID de usuario *</label>
            <input type="number" className="form-control" placeholder="Ej: 2"
              value={idUsuario} onChange={e => setIdUsuario(e.target.value)} />
          </div>
          <div className="form-grupo" style={{ flex: '1', minWidth: '180px' }}>
            <label>ID de empleado (para historial)</label>
            <input type="number" className="form-control" placeholder="Ej: 1"
              value={idEmpleado} onChange={e => setIdEmpleado(e.target.value)} />
          </div>
        </div>

        {/* Tipos de certificado */}
        <p style={{ fontSize: '.85rem', color: '#666', marginBottom: '14px' }}>
          Selecciona el tipo de certificado:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '14px', marginBottom: '20px' }}>
          {TIPOS_CERTIFICADO.map(t => (
            <div key={t.id}
              onClick={() => setTipoSeleccionado(t.id)}
              style={{
                border: `2px solid ${tipoSeleccionado === t.id ? 'var(--azul-oscuro)' : 'var(--borde)'}`,
                borderRadius: '10px', padding: '16px', cursor: 'pointer',
                background: tipoSeleccionado === t.id ? 'rgba(15,52,96,.06)' : '#fff',
                transition: 'all .2s', textAlign: 'center'
              }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{t.icono}</div>
              <h4 style={{ fontSize: '.9rem', color: 'var(--azul-oscuro)', marginBottom: '6px' }}>{t.titulo}</h4>
              <p style={{ fontSize: '.78rem', color: '#666', margin: 0 }}>{t.descripcion}</p>
              {tipoSeleccionado === t.id && (
                <span style={{ display: 'inline-block', marginTop: '8px',
                  background: 'var(--azul-oscuro)', color: '#fff',
                  borderRadius: '20px', padding: '2px 12px', fontSize: '.74rem' }}>
                  ✓ Seleccionado
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Canal de entrega */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600,
            color: 'var(--azul-oscuro)', marginBottom: '8px' }}>
            Canal de entrega
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {['pdf', 'correo'].map(c => (
              <div key={c} onClick={() => setCanal(c)}
                style={{
                  flex: 1, padding: '12px', border: `2px solid ${canal === c ? 'var(--azul-oscuro)' : 'var(--borde)'}`,
                  borderRadius: '8px', cursor: 'pointer', textAlign: 'center',
                  background: canal === c ? 'rgba(15,52,96,.06)' : '#fff',
                  fontWeight: 600, fontSize: '.88rem', transition: 'all .2s',
                  color: canal === c ? 'var(--azul-oscuro)' : '#555'
                }}>
                {c === 'pdf' ? '⬇️ Descargar PDF' : '📧 Enviar por correo'}
              </div>
            ))}
          </div>
        </div>

        {/* Botón generar */}
        <button className="btn btn-primario"
          onClick={handleGenerar}
          disabled={generando}
          style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '.95rem' }}>
          {generando ? '⏳ Generando certificado...' : '📄 Generar certificado'}
        </button>
      </div>

      {/* ── Historial ── */}
      <div className="panel">
        <div className="panel-titulo">📋 Historial de certificados</div>

        {!idEmpleado ? (
          <p style={{ color: '#888', fontSize: '.87rem' }}>
            Ingresa un ID de empleado arriba para ver el historial.
          </p>
        ) : cargandoHist ? (
          <div className="cargando"><div className="spinner"></div>Cargando historial...</div>
        ) : historial.length === 0 ? (
          <p style={{ color: '#888', fontSize: '.87rem' }}>
            Este empleado no tiene certificados generados aún.
          </p>
        ) : (
          <div className="tabla-wrap">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Consecutivo</th>
                  <th>Tipo</th>
                  <th>Canal</th>
                  <th>Fecha</th>
                  <th>Archivo</th>
                </tr>
              </thead>
              <tbody>
                {historial.map(c => (
                  <tr key={c.idCertificado}>
                    <td>
                      <span style={{ background: 'var(--azul-oscuro)', color: 'var(--dorado)',
                        borderRadius: '20px', padding: '3px 12px', fontSize: '.78rem', fontWeight: 700 }}>
                        #{String(c.consecutivo).padStart(4, '0')}
                      </span>
                    </td>
                    <td>{NOMBRE_TIPO[c.idTipo] || '—'}</td>
                    <td>{c.canalEntrega === 'pdf' ? '⬇️ PDF' : '📧 Correo'}</td>
                    <td style={{ fontSize: '.80rem' }}>
                      {c.fechaGeneracion ? c.fechaGeneracion.replace('T', ' ').substring(0, 16) : '—'}
                    </td>
                    <td style={{ fontSize: '.80rem', color: '#666' }}>{c.archivoPdf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default Certificados;
