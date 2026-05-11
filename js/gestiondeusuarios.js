    let users = [];
    async function cargarUsuarios(){
    const response = await fetch("data/usuarios.json");
    users = await response.json();
    renderTable();
}

cargarUsuarios();
    let nextId = 5;
    let sortKey = 'id', sortAsc = true;
    let deleteTargetId = null;

    function initials(name) {
      return name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
    }

    function badgeClass(estado) {
      if (estado === 'Activo') return 'badge-active';
      if (estado === 'Bloqueado') return 'badge-blocked';
      return 'badge-inactive';
    }

    function renderTable() {
      const q = document.getElementById('searchInput').value.toLowerCase();
      const sf = document.getElementById('statusFilter').value;
      const gf = document.getElementById('groupFilter').value;

      let filtered = users.filter(u => {
        const match = !q || u.nombre.toLowerCase().includes(q) || u.usuario.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q);
        const stateOk = !sf || u.estado === sf;
        const groupOk = !gf || u.grupo === gf;
        return match && stateOk && groupOk;
      });

      filtered.sort((a, b) => {
        let va = a[sortKey], vb = b[sortKey];
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
      });

      const tbody = document.getElementById('tableBody');
      const empty = document.getElementById('emptyState');
      document.getElementById('countBadge').textContent = `${filtered.length} usuario${filtered.length !== 1 ? 's' : ''}`;

      if (!filtered.length) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
      }
      empty.style.display = 'none';
      tbody.innerHTML = filtered.map(u => `
        <tr>
          <td><span style="font-size:0.78rem;color:var(--text-muted);">#${String(u.id).padStart(3,'0')}</span></td>
          <td>
            <div class="td-name">
              <div class="avatar">${initials(u.nombre)}</div>
              <div>
                <div style="font-weight:500;font-size:0.87rem;">${u.nombre}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);">${u.usuario}</div>
              </div>
            </div>
          </td>
          <td><code style="font-size:0.8rem;background:#f0f8f4;padding:2px 6px;border-radius:4px;">${u.usuario}</code></td>
          <td><span style="font-size:0.82rem;">${u.grupo}</span></td>
          <td style="font-size:0.82rem;color:var(--primary);">${u.correo}</td>
          <td><span class="badge ${badgeClass(u.estado)}">${u.estado}</span></td>
          <td>
            <div class="td-actions">
              <button class="btn btn-outline btn-sm" onclick="openModal('edit',${u.id})">&#9998; Editar</button>
              <button class="btn btn-warn btn-sm" onclick="toggleStatus(${u.id})">${u.estado==='Bloqueado'?'&#128275; Activar':'&#128274; Bloquear'}</button>
              <button class="btn btn-danger btn-sm" onclick="askDelete(${u.id})">&#128465;</button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    function sortBy(key) {
      if (sortKey === key) sortAsc = !sortAsc;
      else { sortKey = key; sortAsc = true; }
      renderTable();
    }

    function openModal(mode, id) {
      document.getElementById('modalBg').classList.add('open');
      document.getElementById('editId').value = '';
      ['fNombre','fUsuario','fCorreo','fPassword'].forEach(f => document.getElementById(f).value = '');
      document.getElementById('fGrupo').value = 'Super Users';
      document.getElementById('fEstado').value = 'Activo';

      if (mode === 'edit' && id) {
        const u = users.find(x => x.id === id);
        if (!u) return;
        document.getElementById('modalTitle').textContent = 'Editar Usuario';
        document.getElementById('editId').value = u.id;
        document.getElementById('fNombre').value = u.nombre;
        document.getElementById('fUsuario').value = u.usuario;
        document.getElementById('fCorreo').value = u.correo;
        document.getElementById('fGrupo').value = u.grupo;
        document.getElementById('fEstado').value = u.estado;
      } else {
        document.getElementById('modalTitle').textContent = 'Nuevo Usuario';
      }
    }

    function closeModal() { document.getElementById('modalBg').classList.remove('open'); }

    function saveUser() {
      const nombre = document.getElementById('fNombre').value.trim();
      const usuario = document.getElementById('fUsuario').value.trim();
      const correo = document.getElementById('fCorreo').value.trim();
      const grupo = document.getElementById('fGrupo').value;
      const estado = document.getElementById('fEstado').value;
      const editId = document.getElementById('editId').value;

      if (!nombre || !usuario || !correo) { showToast('⚠ Por favor completa los campos requeridos.'); return; }

      if (editId) {
        const u = users.find(x => x.id === +editId);
        if (u) { u.nombre = nombre; u.usuario = usuario; u.correo = correo; u.grupo = grupo; u.estado = estado; }
        showToast('✓ Usuario actualizado correctamente.');
      } else {
        users.push({ id: nextId++, nombre, usuario, correo, grupo, estado });
        showToast('✓ Usuario creado correctamente.');
      }
      closeModal();
      renderTable();
    }

    function toggleStatus(id) {
      const u = users.find(x => x.id === id);
      if (!u) return;
      u.estado = u.estado === 'Bloqueado' ? 'Activo' : 'Bloqueado';
      renderTable();
      showToast(`Usuario ${u.estado === 'Bloqueado' ? 'bloqueado' : 'activado'}.`);
    }

    function askDelete(id) {
      const u = users.find(x => x.id === id);
      if (!u) return;
      deleteTargetId = id;
      document.getElementById('deleteUserName').textContent = u.nombre;
      document.getElementById('confirmBg').classList.add('open');
    }

    function confirmDelete() {
      users = users.filter(x => x.id !== deleteTargetId);
      document.getElementById('confirmBg').classList.remove('open');
      renderTable();
      showToast('Usuario eliminado.');
    }

    function handleFile(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const wb = XLSX.read(ev.target.result, { type: 'binary' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json(ws);
          let added = 0;
          data.forEach(row => {
            const nombre = row['Nombre'] || row['nombre'] || '';
            const usuario = row['Usuario'] || row['usuario'] || '';
            const correo = row['Correo'] || row['correo'] || row['Email'] || '';
            const grupo = row['Grupo'] || row['grupo'] || 'Usuarios';
            const estado = row['Estado'] || row['estado'] || 'Activo';
            if (nombre && usuario) {
              users.push({ id: nextId++, nombre, usuario, correo, grupo, estado });
              added++;
            }
          });
          renderTable();
          showToast(`✓ ${added} usuario(s) importados desde Excel.`);
        } catch(err) {
          showToast('⚠ Error al leer el archivo. Verifica el formato.');
        }
      };
      reader.readAsBinaryString(file);
      e.target.value = '';
    }

    function exportExcel() {
      const data = users.map(u => ({
        'ID': u.id, 'Nombre': u.nombre, 'Usuario': u.usuario,
        'Correo': u.correo, 'Grupo': u.grupo, 'Estado': u.estado
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
      XLSX.writeFile(wb, 'usuarios_acegrasco.xlsx');
      showToast('✓ Archivo Excel descargado.');
    }

    function downloadTemplate() {
      const data = [{ 'Nombre': 'Ejemplo Apellido', 'Usuario': 'ejemplo.apellido', 'Correo': 'ejemplo@acegrasco.com', 'Grupo': 'Usuarios', 'Estado': 'Activo' }];
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
      XLSX.writeFile(wb, 'plantilla_usuarios.xlsx');
      showToast('✓ Plantilla descargada.');
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 3200);
    }

    // Drag & drop
    const zone = document.getElementById('dropZone');
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) {
        const fakeEvt = { target: { files: [file], value: '' } };
        handleFile(fakeEvt);
      }
    });

    renderTable();
