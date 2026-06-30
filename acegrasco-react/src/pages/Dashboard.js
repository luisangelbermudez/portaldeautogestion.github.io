/**
 * Dashboard.js
 * Página principal del portal React de Acegrasco S.A.
 * Muestra estadísticas generales de los 3 módulos.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { obtenerUsuarios, obtenerEmpleados, obtenerSolicitudes } from '../services/api';

/**
 * Componente Dashboard
 * Obtiene conteos de usuarios, empleados y solicitudes del backend
 * y los muestra en tarjetas de estadística.
 */
function Dashboard() {
  // ── Estado ────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState({
    usuarios: 0, empleados: 0,
    solicitudes: 0, pendientes: 0
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState(null);

  // ── Efecto: cargar estadísticas al montar el componente ───────────────────
  useEffect(() => {
    const cargarStats = async () => {
      try {
        // Peticiones paralelas al backend Java
        const [resUsu, resEmp, resSol] = await Promise.all([
          obtenerUsuarios(),
          obtenerEmpleados(),
          obtenerSolicitudes()
        ]);

        const pendientes = resSol.data.filter(s => s.idEstado === 3).length;

        setStats({
          usuarios:    resUsu.data.length,
          empleados:   resEmp.data.length,
          solicitudes: resSol.data.length,
          pendientes
        });
      } catch (err) {
        setError('No se pudo conectar con el servidor. Verifica que Tomcat y XAMPP estén corriendo.');
      } finally {
        setCargando(false);
      }
    };

    cargarStats();
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  if (cargando) return (
    <div className="cargando">
      <div className="spinner"></div>
      Conectando con el servidor...
    </div>
  );

  return (
    <>
      {/* Alerta si no hay conexión con el backend */}
      {error && <div className="alerta alerta-error">⚠️ {error}</div>}

      {/* ── Estadísticas ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icono">👥</div>
          <div>
            <div className="stat-valor">{stats.usuarios}</div>
            <div className="stat-label">Usuarios registrados</div>
          </div>
        </div>
        <div className="stat-card verde">
          <div className="stat-icono">👤</div>
          <div>
            <div className="stat-valor">{stats.empleados}</div>
            <div className="stat-label">Empleados activos</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icono">📝</div>
          <div>
            <div className="stat-valor">{stats.solicitudes}</div>
            <div className="stat-label">Solicitudes totales</div>
          </div>
        </div>
        <div className="stat-card rojo">
          <div className="stat-icono">⏳</div>
          <div>
            <div className="stat-valor">{stats.pendientes}</div>
            <div className="stat-label">Pendientes de atención</div>
          </div>
        </div>
      </div>

      {/* ── Accesos rápidos ── */}
      <div className="panel">
        <div className="panel-titulo">⚡ Módulos del sistema</div>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <Link to="/usuarios"    className="btn btn-primario">👥 Gestión de Usuarios</Link>
          <Link to="/empleados"   className="btn btn-exito">👤 Gestión de Empleados</Link>
          <Link to="/solicitudes" className="btn btn-peligro">📝 Gestión de Solicitudes</Link>
        </div>
      </div>

      {/* ── Info del proyecto ── */}
      <div className="panel">
        <div className="panel-titulo">ℹ️ Sobre este módulo</div>
        <p style={{ color: '#555', fontSize: '.88rem', lineHeight: 1.8 }}>
          Este frontend React consume la <strong>API REST</strong> del backend Java (Servlets + JDBC)
          que corre en <code>localhost:8080/acegrasco</code>.
          Implementa los 3 módulos CRUD usando <strong>React 18</strong>,
          <strong> React Router</strong> y <strong>Axios</strong>.
        </p>
        <p style={{ color: '#888', fontSize: '.80rem', marginTop: '10px' }}>
          Evidencia GA7-220501096-AA3-EV01 | Framework: React |
          Repositorio: github.com/luisangelbermudez/portaldeautogestion.github.io
        </p>
      </div>
    </>
  );
}

export default Dashboard;
