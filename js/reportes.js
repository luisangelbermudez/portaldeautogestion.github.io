const GREEN  = '#1D9E75';
const AMBER  = '#EF9F27';
const BLUE   = '#378ADD';
const RED    = '#E24B4A';
const GRAY   = '#888780';
const LGRAY  = '#C4E9DB';

const deptData = {
  all:        [42, 58, 31, 25, 17],
  RRHH:       [42,  0,  0,  0,  0],
  TI:         [0,  58,  0,  0,  0],
  Finanzas:   [0,   0, 31,  0,  0],
  Operaciones:[0,   0,  0, 25,  0],
  Legal:      [0,   0,  0,  0, 17],
};
const trendData = {
  all: [72, 88, 95, 110, 120],
  RRHH: [18, 20, 22, 28, 30],
  TI:   [22, 28, 30, 35, 40],
  Finanzas: [12, 15, 18, 20, 22],
  Operaciones: [14, 18, 18, 20, 22],
  Legal: [6, 7, 7, 7, 6],
};

let charts = {};

function mkChart(id, type, data, options={}) {
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart(document.getElementById(id).getContext('2d'), { type, data, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { font: { family:'DM Sans', size:11 }, color:'#5a7a6a' } } }, ...options } });
}

function updateCharts() {
  const dept = document.getElementById('deptFilter').value;
  const dd = deptData[dept] || deptData.all;
  const td = trendData[dept] || trendData.all;

  mkChart('chartDept', 'doughnut', {
    labels: ['RRHH', 'TI', 'Finanzas', 'Operaciones', 'Legal'],
    datasets: [{ data: dd, backgroundColor: [GREEN, BLUE, AMBER, '#9FE1CB', GRAY], borderWidth: 2, borderColor: '#fff' }]
  }, { plugins: { legend: { position: 'right', labels: { font: { size:11 }, color:'#5a7a6a' } } } });

  mkChart('chartStatus', 'pie', {
    labels: ['Aprobadas', 'Pendientes', 'Rechazadas', 'En proceso'],
    datasets: [{ data: [148, 35, 12, 28], backgroundColor: [GREEN, AMBER, RED, BLUE], borderWidth: 2, borderColor: '#fff' }]
  }, { plugins: { legend: { position: 'right', labels: { font: { size:11 }, color:'#5a7a6a' } } } });

  mkChart('chartTrend', 'line', {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
    datasets: [
      { label: 'Total solicitudes', data: td, borderColor: GREEN, backgroundColor: 'rgba(29,158,117,0.08)', tension: 0.4, fill: true, pointBackgroundColor: GREEN, pointRadius: 4 },
      { label: 'Aprobadas', data: td.map(v => Math.round(v * 0.67)), borderColor: BLUE, backgroundColor: 'transparent', tension: 0.4, pointBackgroundColor: BLUE, pointRadius: 3 },
    ]
  }, { plugins: { legend: { position: 'top', labels: { font: { size:11 }, color:'#5a7a6a' } } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(15,110,86,0.07)' }, ticks: { color:'#5a7a6a', font: { size:11 } } }, x: { grid: { display: false }, ticks: { color:'#5a7a6a', font: { size:11 } } } } });

  mkChart('chartTime', 'bar', {
    labels: ['RRHH', 'TI', 'Finanzas', 'Oper.', 'Legal'],
    datasets: [{ label: 'Días promedio', data: [7.2, 12.4, 9.8, 5.6, 15.1], backgroundColor: [GREEN, BLUE, AMBER, LGRAY, RED], borderRadius: 5, borderSkipped: false }]
  }, { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(15,110,86,0.07)' }, ticks: { color:'#5a7a6a', font: { size:11 } } }, x: { grid: { display: false }, ticks: { color:'#5a7a6a', font: { size:11 } } } } });

  mkChart('chartSat', 'line', {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
    datasets: [{ label: '% Satisfacción', data: [82, 85, 83, 88, 87.9], borderColor: AMBER, backgroundColor: 'rgba(239,159,39,0.08)', tension: 0.4, fill: true, pointBackgroundColor: AMBER, pointRadius: 4 }]
  }, { plugins: { legend: { display: false } }, scales: { y: { min: 70, max: 100, grid: { color: 'rgba(15,110,86,0.07)' }, ticks: { color:'#5a7a6a', font: { size:11 }, callback: v => v + '%' } }, x: { grid: { display: false }, ticks: { color:'#5a7a6a', font: { size:11 } } } } });
}

const reports = [
  { id: 1, tipo: 'Reporte de usuarios',      dept: 'General',    fecha: '01/03/2026', por: 'jose.trivino', estado: 'Completado' },
  { id: 2, tipo: 'Solicitudes por dpto.',    dept: 'RRHH',       fecha: '15/03/2026', por: 'gennifer.silvana', estado: 'Completado' },
  { id: 3, tipo: 'Tendencia mensual',        dept: 'General',    fecha: '01/04/2026', por: 'richard.acevedo', estado: 'Completado' },
  { id: 4, tipo: 'Análisis de satisfacción', dept: 'General',    fecha: '10/04/2026', por: 'nicolas.luna', estado: 'Pendiente' },
  { id: 5, tipo: 'Costos operativos',        dept: 'Finanzas',   fecha: '01/05/2026', por: 'jose.trivino', estado: 'En proceso' },
];
let repId = 6;

function renderReports() {
  const tbody = document.getElementById('reportTable');
  tbody.innerHTML = reports.map(r => `
    <tr>
      <td style="color:var(--text-muted);font-size:0.78rem;">#${r.id}</td>
      <td style="font-weight:500;">${r.tipo}</td>
      <td>${r.dept}</td>
      <td style="color:var(--text-muted);">${r.fecha}</td>
      <td style="font-size:0.82rem;">${r.por}</td>
      <td><span class="badge ${r.estado==='Completado'?'b-completado':r.estado==='Pendiente'?'b-pendiente':'b-proceso'}">${r.estado}</span></td>
      <td><button class="btn btn-outline" style="padding:0.25rem 0.65rem;font-size:0.78rem;" onclick="viewReport(${r.id})">&#128065; Ver</button></td>
    </tr>
  `).join('');
}

function addReport() {
  const tipos = ['Reporte de usuarios','Solicitudes por dpto.','Tendencia mensual','Análisis de satisfacción'];
  const tipo = tipos[Math.floor(Math.random()*tipos.length)];
  const now = new Date();
  const fecha = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;
  reports.unshift({ id: repId++, tipo, dept: 'General', fecha, por: 'jose.trivino', estado: 'En proceso' });
  renderReports();
  setTimeout(() => { reports[0].estado = 'Completado'; renderReports(); }, 2500);
}

function viewReport(id) {
  const r = reports.find(x => x.id === id);
  if (r) alert(`Reporte #${r.id}: ${r.tipo}\nDepartamento: ${r.dept}\nFecha: ${r.fecha}\nGenerado por: ${r.por}\nEstado: ${r.estado}`);
}

function generateReport() {
  alert('Reporte PDF generado. En producción, esto usaría una librería como jsPDF o una API de generación.');
}

function exportExcel() {
  const data = reports.map(r => ({
    'ID': r.id, 'Tipo': r.tipo, 'Departamento': r.dept,
    'Fecha': r.fecha, 'Generado por': r.por, 'Estado': r.estado
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reportes');
  XLSX.writeFile(wb, 'reportes_acegrasco.xlsx');
}

document.addEventListener('DOMContentLoaded', () => {
  updateCharts();
  renderReports();
});
