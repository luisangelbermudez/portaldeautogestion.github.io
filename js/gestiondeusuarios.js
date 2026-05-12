/* ================================================================
   gestiondeusuarios.js — Gestión de Usuarios Acegrasco
   PERSISTENCIA: localStorage (clave "acegrasco_users")
   SESIÓN:       localStorage (clave "sesionUsuario")
   ================================================================ */
 
const LS_KEY   = "acegrasco_users";   // clave de persistencia de usuarios
const LS_SEED  = "acegrasco_seeded";  // flag para saber si ya se cargó el JSON inicial
 
let users  = [];
let nextId = 1;
let sortKey = "id", sortAsc = true;
let deleteTargetId = null;
 
/* ----------------------------------------------------------------
   INICIO: carga usuarios desde localStorage o desde usuarios.json
   ---------------------------------------------------------------- */
async function inicializar() {
  const guardados = localStorage.getItem(LS_KEY);
  const seeded    = localStorage.getItem(LS_SEED);
 
  if (guardados && seeded) {
    // Ya existen datos persistidos → usarlos directamente
    users  = JSON.parse(guardados);
    nextId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
  } else {
    // Primera vez: cargar desde el JSON base
    try {
      const resp = await fetch("data/usuarios.json");
      const base = await resp.json();
      users  = base;
      nextId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
      persistir();
      localStorage.setItem(LS_SEED, "1");
    } catch(e) {
      console.warn("No se pudo cargar usuarios.json, iniciando vacío.", e);
      users  = [];
      nextId = 1;
    }
  }
  renderTable();
}
 
/* Guarda el estado actual de users en localStorage */
function persistir() {
  localStorage.setItem(LS_KEY, JSON.stringify(users));
}
 
/* ----------------------------------------------------------------
   TABLA
   ---------------------------------------------------------------- */
function initials(name) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}
 
function badgeClass(estado) {
  if (estado === "Activo")    return "badge-active";
  if (estado === "Bloqueado") return "badge-blocked";
  return "badge-inactive";
}
 
function renderTable() {
  const q  = (document.getElementById("searchInput").value  || "").toLowerCase();
  const sf = document.getElementById("statusFilter").value  || "";
  const gf = document.getElementById("groupFilter").value   || "";
 
  let filtered = users.filter(u => {
    const txt   = (u.nombre + u.usuario + u.correo + (u.cedula||"") + (u.cargo||"")).toLowerCase();
    const match = !q  || txt.includes(q);
    const stOk  = !sf || u.estado === sf;
    const grOk  = !gf || u.grupo  === gf;
    return match && stOk && grOk;
  });
 
  filtered.sort((a, b) => {
    let va = a[sortKey] ?? "", vb = b[sortKey] ?? "";
    if (typeof va === "string") va = va.toLowerCase();
    if (typeof vb === "string") vb = vb.toLowerCase();
    return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
  });
 
  const tbody = document.getElementById("tableBody");
  const empty = document.getElementById("emptyState");
  document.getElementById("countBadge").textContent =
    `${filtered.length} usuario${filtered.length !== 1 ? "s" : ""}`;
 
  if (!filtered.length) {
    tbody.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";
 
  tbody.innerHTML = filtered.map(u => `
    <tr>
      <td><span style="font-size:.78rem;color:var(--text-muted);">#${String(u.id).padStart(3,"0")}</span></td>
      <td>
        <div class="td-name">
          <div class="avatar">${initials(u.nombre)}</div>
          <div>
            <div style="font-weight:500;font-size:.87rem;">${u.nombre}</div>
            <div style="font-size:.75rem;color:var(--text-muted);">${u.usuario}</div>
          </div>
        </div>
      </td>
      <td style="font-size:.82rem;">${u.cedula  || "—"}</td>
      <td style="font-size:.82rem;">${u.cargo   || "—"}</td>
      <td style="font-size:.82rem;">${u.fechaIngreso || "—"}</td>
      <td><span style="font-size:.82rem;">${u.grupo}</span></td>
      <td style="font-size:.82rem;color:var(--primary);">${u.correo}</td>
      <td><span class="badge ${badgeClass(u.estado)}">${u.estado}</span></td>
      <td>
        <div class="td-actions">
          <button class="btn btn-outline btn-sm" onclick="openModal('edit',${u.id})">✏ Editar</button>
          <button class="btn btn-warn btn-sm"    onclick="toggleStatus(${u.id})">${u.estado === "Bloqueado" ? "🔓 Activar" : "🔒 Bloquear"}</button>
          <button class="btn btn-danger btn-sm"  onclick="askDelete(${u.id})">🗑</button>
        </div>
      </td>
    </tr>
  `).join("");
}
 
function sortBy(key) {
  if (sortKey === key) sortAsc = !sortAsc;
  else { sortKey = key; sortAsc = true; }
  renderTable();
}
 
/* ----------------------------------------------------------------
   MODAL CREAR / EDITAR
   ---------------------------------------------------------------- */
function openModal(mode, id) {
  document.getElementById("modalBg").classList.add("open");
  document.getElementById("editId").value = "";
  ["fNombre","fUsuario","fCorreo","fPassword","fCedula","fCargo","fFechaIngreso"]
    .forEach(f => document.getElementById(f).value = "");
  document.getElementById("fGrupo").value  = "Super Users";
  document.getElementById("fEstado").value = "Activo";
 
  if (mode === "edit" && id) {
    const u = users.find(x => x.id === id);
    if (!u) return;
    document.getElementById("modalTitle").textContent   = "Editar Usuario";
    document.getElementById("editId").value             = u.id;
    document.getElementById("fNombre").value            = u.nombre;
    document.getElementById("fUsuario").value           = u.usuario;
    document.getElementById("fCorreo").value            = u.correo;
    document.getElementById("fCedula").value            = u.cedula       || "";
    document.getElementById("fCargo").value             = u.cargo        || "";
    document.getElementById("fFechaIngreso").value      = u.fechaIngreso || "";
    document.getElementById("fGrupo").value             = u.grupo;
    document.getElementById("fEstado").value            = u.estado;
  } else {
    document.getElementById("modalTitle").textContent = "Nuevo Usuario";
  }
}
 
function closeModal() {
  document.getElementById("modalBg").classList.remove("open");
}
 
function saveUser() {
  const nombre       = document.getElementById("fNombre").value.trim();
  const usuario      = document.getElementById("fUsuario").value.trim();
  const correo       = document.getElementById("fCorreo").value.trim();
  const cedula       = document.getElementById("fCedula").value.trim();
  const cargo        = document.getElementById("fCargo").value.trim();
  const fechaIngreso = document.getElementById("fFechaIngreso").value;
  const grupo        = document.getElementById("fGrupo").value;
  const estado       = document.getElementById("fEstado").value;
  const editId       = document.getElementById("editId").value;
 
  if (!nombre || !usuario || !correo) {
    showToast("⚠ Completa los campos requeridos: Nombre, Usuario y Correo.");
    return;
  }
 
  const password = document.getElementById("fPassword").value;

  if (editId) {
    const u = users.find(x => x.id === +editId);
    if (u) {
      u.nombre = nombre; u.usuario = usuario; u.correo = correo;
      u.cedula = cedula; u.cargo = cargo; u.fechaIngreso = fechaIngreso;
      u.grupo  = grupo;  u.estado = estado;
      // Solo actualizar contraseña si el admin escribió una nueva
      if (password) u.password = password;
    }
    showToast("✓ Usuario actualizado correctamente.");
  } else {
    users.push({ id: nextId++, nombre, usuario, correo, cedula, cargo, fechaIngreso, grupo, estado, password: password || "" });
    showToast("✓ Usuario creado correctamente.");
  }
 
  persistir();   // ← GUARDAR EN LOCALSTORAGE
  closeModal();
  renderTable();
}
 
/* ----------------------------------------------------------------
   BLOQUEAR / ACTIVAR
   ---------------------------------------------------------------- */
function toggleStatus(id) {
  const u = users.find(x => x.id === id);
  if (!u) return;
  u.estado = u.estado === "Bloqueado" ? "Activo" : "Bloqueado";
  persistir();
  renderTable();
  showToast(`Usuario ${u.estado === "Bloqueado" ? "bloqueado" : "activado"}.`);
}
 
/* ----------------------------------------------------------------
   ELIMINAR
   ---------------------------------------------------------------- */
function askDelete(id) {
  const u = users.find(x => x.id === id);
  if (!u) return;
  deleteTargetId = id;
  document.getElementById("deleteUserName").textContent = u.nombre;
  document.getElementById("confirmBg").classList.add("open");
}
 
function confirmDelete() {
  users = users.filter(x => x.id !== deleteTargetId);
  document.getElementById("confirmBg").classList.remove("open");
  persistir();
  renderTable();
  showToast("Usuario eliminado.");
}
 
/* ----------------------------------------------------------------
   IMPORTAR EXCEL
   ---------------------------------------------------------------- */
function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;
 
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const wb   = XLSX.read(ev.target.result, { type: "binary" });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      let added  = 0;
 
      data.forEach(row => {
        const nombre       = row["Nombre"]       || row["nombre"]        || "";
        const usuario      = row["Usuario"]      || row["usuario"]       || "";
        const correo       = row["Correo"]       || row["correo"]        || row["Email"] || "";
        const cedula       = row["Cédula"]       || row["Cedula"]        || row["cédula"] || row["CEDULA"] || row["CC"] || "";
        const cargo        = row["Cargo"]        || row["cargo"]         || "";
        const fechaIngreso = row["Fecha Ingreso"]|| row["FechaIngreso"]  || row["fecha_ingreso"] || "";
        const grupo        = row["Grupo"]        || row["grupo"]         || "Usuarios";
        const estado       = row["Estado"]       || row["estado"]        || "Activo";
 
        if (nombre && usuario) {
          users.push({ id: nextId++, nombre, usuario, correo, cedula, cargo, fechaIngreso, grupo, estado });
          added++;
        }
      });
 
      persistir();   // ← GUARDAR EN LOCALSTORAGE
      renderTable();
      showToast(`✓ ${added} usuario(s) importados desde Excel.`);
    } catch(err) {
      showToast("⚠ Error al leer el archivo. Verifica el formato.");
    }
  };
  reader.readAsBinaryString(file);
  e.target.value = "";
}
 
/* ----------------------------------------------------------------
   EXPORTAR EXCEL
   ---------------------------------------------------------------- */
function exportExcel() {
  const data = users.map(u => ({
    "ID":            u.id,
    "Nombre":        u.nombre,
    "Usuario":       u.usuario,
    "Correo":        u.correo,
    "Cédula":        u.cedula       || "",
    "Cargo":         u.cargo        || "",
    "Fecha Ingreso": u.fechaIngreso || "",
    "Grupo":         u.grupo,
    "Estado":        u.estado
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Usuarios");
  XLSX.writeFile(wb, "usuarios_acegrasco.xlsx");
  showToast("✓ Archivo Excel descargado.");
}
 
/* ----------------------------------------------------------------
   DESCARGAR PLANTILLA
   ---------------------------------------------------------------- */
function downloadTemplate() {
  const data = [{
    "Nombre": "Ejemplo Apellido", "Usuario": "ejemplo.apellido",
    "Correo": "ejemplo@acegrasco.com", "Cédula": "1234567890",
    "Cargo": "Cargo del empleado", "Fecha Ingreso": "2023-01-15",
    "Grupo": "Usuarios", "Estado": "Activo"
  }];
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Usuarios");
  XLSX.writeFile(wb, "plantilla_usuarios.xlsx");
  showToast("✓ Plantilla descargada.");
}
 
/* ----------------------------------------------------------------
   INICIO DE SESIÓN desde usuario.html
   Busca el usuario en localStorage y guarda su info en "sesionUsuario"
   ---------------------------------------------------------------- */
function iniciarSesion(usuarioInput, passwordInput) {
  const users = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  // Buscar por usuario o correo (la contraseña no está implementada aún, 
  // se valida solo que el usuario exista y esté Activo)
  const encontrado = users.find(u =>
    (u.usuario === usuarioInput || u.correo === usuarioInput) &&
    u.estado === "Activo"
  );
  if (encontrado) {
    localStorage.setItem("sesionUsuario", JSON.stringify(encontrado));
    return true;
  }
  return false;
}
 
/* ----------------------------------------------------------------
   TOAST
   ---------------------------------------------------------------- */
function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3200);
}
 
/* ----------------------------------------------------------------
   DRAG & DROP
   ---------------------------------------------------------------- */
const zone = document.getElementById("dropZone");
if (zone) {
  zone.addEventListener("dragover",  e => { e.preventDefault(); zone.classList.add("dragover"); });
  zone.addEventListener("dragleave", ()  => zone.classList.remove("dragover"));
  zone.addEventListener("drop", e => {
    e.preventDefault();
    zone.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file) handleFile({ target: { files: [file], value: "" } });
  });
}
 
/* ----------------------------------------------------------------
   ARRANQUE
   ---------------------------------------------------------------- */
inicializar();
