/**
 * App.js
 * Componente raíz de la aplicación React.
 * Define el enrutamiento principal entre los 4 módulos.
 *
 * Rutas:
 *   /              → Dashboard principal
 *   /usuarios      → Módulo CRUD Usuarios
 *   /empleados     → Módulo CRUD Empleados
 *   /solicitudes   → Módulo CRUD Solicitudes
 *   /certificados  → Módulo generación de certificados PDF
 */
import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard    from './pages/Dashboard';
import Usuarios     from './pages/Usuarios';
import Empleados    from './pages/Empleados';
import Solicitudes  from './pages/Solicitudes';
import Certificados from './pages/Certificados';

/**
 * Componente App
 * Renderiza la barra de navegación y las rutas de la aplicación.
 */
function App() {
  return (
    <>
      {/* ── Barra de navegación superior ── */}
      <nav className="navbar">
        <NavLink to="/" className="navbar-brand">
          🏢 Portal Acegrasco <span style={{ color: 'rgba(255,255,255,.5)', fontWeight: 400 }}>| React</span>
        </NavLink>
        <div className="navbar-links">
          <NavLink to="/"             className={({ isActive }) => isActive ? 'activo' : ''} end>📊 Inicio</NavLink>
          <NavLink to="/usuarios"     className={({ isActive }) => isActive ? 'activo' : ''}>👥 Usuarios</NavLink>
          <NavLink to="/empleados"    className={({ isActive }) => isActive ? 'activo' : ''}>👤 Empleados</NavLink>
          <NavLink to="/solicitudes"  className={({ isActive }) => isActive ? 'activo' : ''}>📝 Solicitudes</NavLink>
          <NavLink to="/certificados" className={({ isActive }) => isActive ? 'activo' : ''}>📄 Certificados</NavLink>
        </div>
      </nav>

      {/* ── Contenido según la ruta ── */}
      <div className="contenido">
        <Routes>
          <Route path="/"             element={<Dashboard />} />
          <Route path="/usuarios"     element={<Usuarios />} />
          <Route path="/empleados"    element={<Empleados />} />
          <Route path="/solicitudes"  element={<Solicitudes />} />
          <Route path="/certificados" element={<Certificados />} />
        </Routes>
      </div>

      {/* ── Pie de página ── */}
      <footer className="footer">
        Portal de Autogestión Acegrasco S.A. © 2026
        <span>📱 (+57) 301 2952356</span>
        <span>✉ info@acegrasco.com.co</span>
        <span>📍 Calle 15 #5-23, Bogotá</span>
      </footer>
    </>
  );
}

export default App;
