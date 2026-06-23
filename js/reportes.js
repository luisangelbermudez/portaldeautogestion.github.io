/* ==========================================================
   CAPA DE DATOS CENTRALIZADA — AppData
   Reemplaza estos valores con llamadas reales a tu API/backend.
   Todos los KPIs, gráficas y tabla se alimentan desde aquí.
   ========================================================== */
const AppData = {

  /* ── SOLICITUDES ────────────────────────────────────────── */
  solicitudesHoy: 24,
  aprobadas: 148,
  pendientes: 35,
  rechazadas: 12,
  enProceso: 28,

  /* ── TIEMPO PROMEDIO (días) ─────────────────────────────── */
  tiempoPromedio: 9.7,                      // general
  tiempoPorDept: {                          // por departamento
    RRHH: 7.2,
    TI: 12.4,
    Finanzas: 9.8,
    Operaciones: 5.6,
    Legal: 15.1,
  },

  /* ── USUARIOS ───────────────────────────────────────────── */
  usuariosActivos: 4,
  superUsers: 4,
  bloqueados: 0,
  sinActividad30d: 1,

  /* ── SOLICITUDES POR DEPARTAMENTO ───────────────────────── */
  solicitudesPorDept: {
    all:         { RRHH: 42, TI: 58, Finanzas: 31, Operaciones: 25, Legal: 17 },
    RRHH:        { RRHH: 42, TI: 0,  Finanzas: 0,  Operaciones: 0,  Legal: 0  },
    TI:          { RRHH: 0,  TI: 58, Finanzas: 0,  Operaciones: 0,  Legal: 0  },
    Finanzas:    { RRHH: 0,  TI: 0,  Finanzas: 31, Operaciones: 0,  Legal: 0  },
    Operaciones: { RRHH: 0,  TI: 0,  Finanzas: 0,  Operaciones: 25, Legal: 0  },
    Legal:       { RRHH: 0,  TI: 0,  Finanzas: 0,  Operaciones: 0,  Legal: 17 },
  },

  /* ── TENDENCIA MENSUAL ──────────────────────────────────── */
  tendenciaMeses: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
  tendenciaTotales: {
    all:         [72, 88, 95, 110, 120],
    RRHH:        [18, 20, 22, 28,  30 ],
    TI:          [22, 28, 30, 35,  40 ],
    Finanzas:    [12, 15, 18, 20,  22 ],
    Operaciones: [14, 18, 18, 20,  22 ],
    Legal:       [ 6,  7,  7,  7,   6 ],
  },

  /* ── HISTORIAL DE REPORTES ──────────────────────────────── */
  reportes: [
    { id: 1, tipo: 'Reporte de usuarios',      dept: 'General',  fecha: '01/03/2026', por: 'jose.trivino',      estado: 'Completado' },
    { id: 2, tipo: 'Solicitudes por dpto.',    dept: 'RRHH',     fecha: '15/03/2026', por: 'gennifer.silvana',  estado: 'Completado' },
    { id: 3, tipo: 'Tendencia mensual',        dept: 'General',  fecha: '01/04/2026', por: 'richard.acevedo',   estado: 'Completado' },
    { id: 4, tipo: 'Análisis de satisfacción', dept: 'General',  fecha: '10/04/2026', por: 'nicolas.luna',      estado: 'Pendiente'  },
    { id: 5, tipo: 'Costos operativos',        dept: 'Finanzas', fecha: '01/05/2026', por: 'jose.trivino',      estado: 'En proceso' },
  ],
};

/* ==========================================================
   COLORES CORPORATIVOS AZULES
   ========================================================== */
const BLUE   = '#1A56DB';
const LBLUE  = '#3B82F6';
const CYAN   = '#0EA5E9';
const INDIGO = '#6366F1';
const AMBER  = '#F59E0B';
const RED    = '#EF4444';
const LGRAY  = '#93C5FD';

/* ==========================================================
   MOTOR DE GRÁFICAS
   ========================================================== */
let charts = {};

function mkChart(id, type, data, options = {}) {
  if (charts[id]) charts[id].destroy();
  const ctx = document.getElementById(id);
  if (!ctx) return;
  charts[id] = new Chart(ctx.getContext('2d'), {
    type,
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { font: { family: 'DM Sans', size: 11 }, color: '#475569' } }
      },
      ...options
    }
  });
}

/* ==========================================================
   ACTUALIZAR KPIs DESDE AppData
   ========================================================== */
function updateKPIs() {
  const d = AppData;
  setEl('kpiHoy',        d.solicitudesHoy);
  setEl('kpiAprobadas',  d.aprobadas);
  setEl('kpiPendientes', d.pendientes);
  setEl('kpiTiempo',     d.tiempoPromedio);

  setEl('kpiUsuariosActivos', d.usuariosActivos);
  setEl('kpiSuperUsers',      d.superUsers);
  setEl('kpiBloqueados',      d.bloqueados);
  setEl('kpiSinActividad',    d.sinActividad30d);
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ==========================================================
   ACTUALIZAR GRÁFICAS DESDE AppData
   ========================================================== */
function updateCharts() {
  const dept = document.getElementById('deptFilter')?.value || 'all';
  const mes  = document.getElementById('mesFilter')?.value  || 'all';

  const deptObj = AppData.solicitudesPorDept[dept] || AppData.solicitudesPorDept.all;
  const deptVals = [deptObj.RRHH, deptObj.TI, deptObj.Finanzas, deptObj.Operaciones, deptObj.Legal];

  /* Gráfica 1 — Solicitudes por departamento (Doughnut) */
  mkChart('chartDept', 'doughnut', {
    labels: ['RRHH', 'TI', 'Finanzas', 'Operaciones', 'Legal'],
    datasets: [{
      data: deptVals,
      backgroundColor: [BLUE, CYAN, AMBER, LGRAY, INDIGO],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  }, {
    plugins: {
      legend: { position: 'right', labels: { font: { size: 11 }, color: '#475569' } }
    }
  });

  /* Gráfica 2 — Estado de solicitudes (Pie) */
  mkChart('chartStatus', 'pie', {
    labels: ['Aprobadas', 'Pendientes', 'Rechazadas', 'En proceso'],
    datasets: [{
      data: [AppData.aprobadas, AppData.pendientes, AppData.rechazadas, AppData.enProceso],
      backgroundColor: [BLUE, AMBER, RED, CYAN],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  }, {
    plugins: {
      legend: { position: 'right', labels: { font: { size: 11 }, color: '#475569' } }
    }
  });

  /* Gráfica 3 — Tendencia mensual (Line) */
  let tendLabels = AppData.tendenciaMeses;
  let tendTotal  = AppData.tendenciaTotales[dept] || AppData.tendenciaTotales.all;

  if (mes !== 'all') {
    const idx = { Ene: 0, Feb: 1, Mar: 2, Abr: 3, May: 4 }[mes];
    if (idx !== undefined) {
      tendLabels = [tendLabels[idx]];
      tendTotal  = [tendTotal[idx]];
    }
  }

  mkChart('chartTrend', 'line', {
    labels: tendLabels,
    datasets: [
      {
        label: 'Total solicitudes',
        data: tendTotal,
        borderColor: BLUE,
        backgroundColor: 'rgba(26,86,219,0.08)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: BLUE,
        pointRadius: 4
      },
      {
        label: 'Aprobadas',
        data: tendTotal.map(v => Math.round(v * (AppData.aprobadas / (AppData.aprobadas + AppData.pendientes + AppData.rechazadas + AppData.enProceso)))),
        borderColor: CYAN,
        backgroundColor: 'transparent',
        tension: 0.4,
        pointBackgroundColor: CYAN,
        pointRadius: 3
      }
    ]
  }, {
    plugins: { legend: { position: 'top', labels: { font: { size: 11 }, color: '#475569' } } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(26,86,219,0.07)' }, ticks: { color: '#475569', font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { color: '#475569', font: { size: 11 } } }
    }
  });

  /* Gráfica 4 — Tiempo promedio por dpto. (Bar) */
  const tiempoVals = Object.values(AppData.tiempoPorDept);
  mkChart('chartTime', 'bar', {
    labels: Object.keys(AppData.tiempoPorDept),
    datasets: [{
      label: 'Días promedio',
      data: tiempoVals,
      backgroundColor: [BLUE, CYAN, AMBER, LGRAY, RED],
      borderRadius: 5,
      borderSkipped: false
    }]
  }, {
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(26,86,219,0.07)' }, ticks: { color: '#475569', font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { color: '#475569', font: { size: 11 } } }
    }
  });
}

/* ==========================================================
   TABLA DE REPORTES
   ========================================================== */
let repId = AppData.reportes.length + 1;

function renderReports() {
  const tbody = document.getElementById('reportTable');
  if (!tbody) return;
  tbody.innerHTML = AppData.reportes.map(r => `
    <tr>
      <td style="color:var(--text-muted);font-size:0.78rem;">#${r.id}</td>
      <td style="font-weight:500;">${r.tipo}</td>
      <td>${r.dept}</td>
      <td style="color:var(--text-muted);">${r.fecha}</td>
      <td style="font-size:0.82rem;">${r.por}</td>
      <td>
        <span class="badge ${r.estado === 'Completado' ? 'b-completado' : r.estado === 'Pendiente' ? 'b-pendiente' : 'b-proceso'}">
          ${r.estado}
        </span>
      </td>
      <td>
        <button class="btn btn-outline" style="padding:0.25rem 0.65rem;font-size:0.78rem;" onclick="viewReport(${r.id})">
          &#128065; Ver
        </button>
      </td>
    </tr>
  `).join('');
}

function addReport() {
  const tipos = ['Reporte de usuarios', 'Solicitudes por dpto.', 'Tendencia mensual', 'Análisis de satisfacción'];
  const tipo = tipos[Math.floor(Math.random() * tipos.length)];
  const now = new Date();
  const fecha = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  AppData.reportes.unshift({ id: repId++, tipo, dept: 'General', fecha, por: 'jose.trivino', estado: 'En proceso' });
  renderReports();
  setTimeout(() => { AppData.reportes[0].estado = 'Completado'; renderReports(); }, 2500);
}

function viewReport(id) {
  const r = AppData.reportes.find(x => x.id === id);
  if (r) alert(`Reporte #${r.id}: ${r.tipo}\nDepartamento: ${r.dept}\nFecha: ${r.fecha}\nGenerado por: ${r.por}\nEstado: ${r.estado}`);
}

function generateReport() {
  alert('Reporte PDF generado. En producción, esto usaría una librería como jsPDF o una API de generación.');
}

function exportExcel() {
  const data = AppData.reportes.map(r => ({
    'ID': r.id,
    'Tipo': r.tipo,
    'Departamento': r.dept,
    'Fecha': r.fecha,
    'Generado por': r.por,
    'Estado': r.estado
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reportes');
  XLSX.writeFile(wb, 'reportes_acegrasco.xlsx');
}

/* ==========================================================
   INIT
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  updateKPIs();
  updateCharts();
  renderReports();
});

/* ==========================================================
   GENERACIÓN DE REPORTE PERSONALIZADO
   Funciones nuevas para la sección de reporte por tipo/fecha
   ========================================================== */

// Datos de muestra para los reportes generados
const DatosReportes = {

  solicitudes: [
    { id: 1,  empleado: 'Carlos Rodríguez',  tipo: 'Permiso',             estado: 'Aprobado',    fecha: '2026-01-10', dept: 'RRHH'       },
    { id: 2,  empleado: 'María López',        tipo: 'Vacaciones',          estado: 'Aprobado',    fecha: '2026-01-15', dept: 'TI'         },
    { id: 3,  empleado: 'Andrés Gómez',       tipo: 'Incapacidad',         estado: 'Pendiente',   fecha: '2026-02-03', dept: 'Finanzas'   },
    { id: 4,  empleado: 'Laura Martínez',     tipo: 'Actualiz. datos',     estado: 'Rechazado',   fecha: '2026-02-18', dept: 'Legal'      },
    { id: 5,  empleado: 'Santiago Torres',    tipo: 'Permiso',             estado: 'Aprobado',    fecha: '2026-03-05', dept: 'Operaciones'},
    { id: 6,  empleado: 'Valentina Ruiz',     tipo: 'Vacaciones',          estado: 'En revisión', fecha: '2026-03-20', dept: 'RRHH'       },
    { id: 7,  empleado: 'Diego Herrera',      tipo: 'Permiso',             estado: 'Aprobado',    fecha: '2026-04-02', dept: 'TI'         },
    { id: 8,  empleado: 'Camila Moreno',      tipo: 'Otro',                estado: 'Pendiente',   fecha: '2026-04-14', dept: 'Finanzas'   },
    { id: 9,  empleado: 'Nicolás Luna',       tipo: 'Incapacidad',         estado: 'Aprobado',    fecha: '2026-05-01', dept: 'Legal'      },
    { id: 10, empleado: 'Gennifer Silvana',   tipo: 'Vacaciones',          estado: 'Aprobado',    fecha: '2026-05-10', dept: 'Operaciones'},
  ],

  certificados: [
    { consecutivo: 1,  empleado: 'Carlos Rodríguez',  tipo: 'Laboral Básico',      canal: 'PDF',    fecha: '2026-01-08', dept: 'RRHH'       },
    { consecutivo: 2,  empleado: 'María López',        tipo: 'Con Salario',         canal: 'PDF',    fecha: '2026-01-22', dept: 'TI'         },
    { consecutivo: 3,  empleado: 'Andrés Gómez',       tipo: 'Con Horas Extras',    canal: 'Correo', fecha: '2026-02-10', dept: 'Finanzas'   },
    { consecutivo: 4,  empleado: 'Laura Martínez',     tipo: 'Laboral Básico',      canal: 'PDF',    fecha: '2026-03-01', dept: 'Legal'      },
    { consecutivo: 5,  empleado: 'Santiago Torres',    tipo: 'Con Salario',         canal: 'PDF',    fecha: '2026-03-15', dept: 'Operaciones'},
    { consecutivo: 6,  empleado: 'Valentina Ruiz',     tipo: 'Laboral Básico',      canal: 'Correo', fecha: '2026-04-05', dept: 'RRHH'       },
    { consecutivo: 7,  empleado: 'Diego Herrera',      tipo: 'Con Horas Extras',    canal: 'PDF',    fecha: '2026-04-20', dept: 'TI'         },
    { consecutivo: 8,  empleado: 'Camila Moreno',      tipo: 'Con Salario',         canal: 'PDF',    fecha: '2026-05-08', dept: 'Finanzas'   },
  ],

  usuarios: [
    { id: 1, nombre: 'jose.trivino',     rol: 'Administrador', estado: 'Activo',   dept: 'General'    },
    { id: 2, nombre: 'carlos.rodriguez', rol: 'Empleado',      estado: 'Activo',   dept: 'RRHH'       },
    { id: 3, nombre: 'maria.lopez',      rol: 'Empleado',      estado: 'Activo',   dept: 'TI'         },
    { id: 4, nombre: 'andres.gomez',     rol: 'Empleado',      estado: 'Inactivo', dept: 'Finanzas'   },
    { id: 5, nombre: 'richard.acevedo',  rol: 'Administrador', estado: 'Activo',   dept: 'General'    },
    { id: 6, nombre: 'nicolas.luna',     rol: 'Empleado',      estado: 'Activo',   dept: 'Legal'      },
  ]
};

// Variable que guarda el último resultado para exportar
let _ultimoResultado = [];
let _ultimoTipo = '';

/**
 * Ejecuta el reporte según tipo, departamento y fechas seleccionadas.
 * Muestra el resultado como tabla dentro de #resultado-reporte.
 */
function ejecutarReporte() {
  const tipo   = document.getElementById('genTipo').value;
  const dept   = document.getElementById('genDept').value;
  const inicio = document.getElementById('genInicio').value;
  const fin    = document.getElementById('genFin').value;
  const div    = document.getElementById('resultado-reporte');

  _ultimoTipo = tipo;
  let filas = '';
  let cabecera = '';
  let datos = [];

  if (tipo === 'solicitudes') {
    datos = DatosReportes.solicitudes.filter(s => {
      const enDept  = dept === 'all' || s.dept === dept;
      const despues = !inicio || s.fecha >= inicio;
      const antes   = !fin    || s.fecha <= fin;
      return enDept && despues && antes;
    });
    _ultimoResultado = datos;
    cabecera = `<tr><th>#</th><th>Empleado</th><th>Tipo</th><th>Departamento</th><th>Estado</th><th>Fecha</th></tr>`;
    filas = datos.map(s => {
      const badgeCls = s.estado === 'Aprobado' ? 'b-completado' : s.estado === 'Pendiente' ? 'b-pendiente' : 'b-proceso';
      return `<tr>
        <td style="color:var(--text-muted);font-size:0.78rem;">#${s.id}</td>
        <td style="font-weight:500;">${s.empleado}</td>
        <td>${s.tipo}</td>
        <td>${s.dept}</td>
        <td><span class="badge ${badgeCls}">${s.estado}</span></td>
        <td style="color:var(--text-muted);">${s.fecha}</td>
      </tr>`;
    }).join('');

  } else if (tipo === 'certificados') {
    datos = DatosReportes.certificados.filter(c => {
      const enDept  = dept === 'all' || c.dept === dept;
      const despues = !inicio || c.fecha >= inicio;
      const antes   = !fin    || c.fecha <= fin;
      return enDept && despues && antes;
    });
    _ultimoResultado = datos;
    cabecera = `<tr><th>Consec.</th><th>Empleado</th><th>Tipo</th><th>Departamento</th><th>Canal</th><th>Fecha</th></tr>`;
    filas = datos.map(c => `<tr>
      <td style="font-weight:700;color:var(--primary);">#${c.consecutivo}</td>
      <td style="font-weight:500;">${c.empleado}</td>
      <td>${c.tipo}</td>
      <td>${c.dept}</td>
      <td><span class="badge b-completado">${c.canal}</span></td>
      <td style="color:var(--text-muted);">${c.fecha}</td>
    </tr>`).join('');

  } else if (tipo === 'usuarios') {
    datos = DatosReportes.usuarios.filter(u => {
      return dept === 'all' || u.dept === dept || u.dept === 'General';
    });
    _ultimoResultado = datos;
    cabecera = `<tr><th>#</th><th>Usuario</th><th>Rol</th><th>Departamento</th><th>Estado</th></tr>`;
    filas = datos.map(u => {
      const badgeCls = u.estado === 'Activo' ? 'b-completado' : 'b-pendiente';
      return `<tr>
        <td style="color:var(--text-muted);font-size:0.78rem;">#${u.id}</td>
        <td style="font-weight:500;">${u.nombre}</td>
        <td>${u.rol}</td>
        <td>${u.dept}</td>
        <td><span class="badge ${badgeCls}">${u.estado}</span></td>
      </tr>`;
    }).join('');
  }

  const titulos = { solicitudes: 'Solicitudes', certificados: 'Certificados Emitidos', usuarios: 'Usuarios Activos' };
  const periodoStr = inicio && fin ? ` &nbsp;|&nbsp; ${inicio} al ${fin}` : '';

  if (!datos.length) {
    div.innerHTML = `<div class="resultado-vacio">&#128202; Sin resultados para los filtros seleccionados.</div>`;
    return;
  }

  div.innerHTML = `
    <div class="resultado-titulo">
      &#128202; ${titulos[tipo]} &mdash; ${datos.length} registro(s)${periodoStr}
    </div>
    <div class="resultado-tabla-wrap">
      <table>
        <thead>${cabecera}</thead>
        <tbody>${filas}</tbody>
      </table>
    </div>`;
}

/**
 * Exporta el último resultado generado a Excel.
 */
function exportarResultado() {
  if (!_ultimoResultado.length) {
    alert('Primero genera un reporte para poder exportarlo.');
    return;
  }
  const ws = XLSX.utils.json_to_sheet(_ultimoResultado);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
  XLSX.writeFile(wb, `reporte_${_ultimoTipo}_acegrasco.xlsx`);
}
