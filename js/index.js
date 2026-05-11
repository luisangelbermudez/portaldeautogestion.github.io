 /* ============================================================
   SECCIÓN: LOGIN (index.html)
   ============================================================ */

function login() {
    let rol = document.getElementById("rol").value;
    localStorage.setItem("rolUsuario", rol);

    if (rol === "admin") {
        window.location.href = "admin.html";
    } else {
        window.location.href = "usuario.html";
    }
}

// Mostrar nombre del usuario logueado (si existe en el DOM)
let nombreGuardado = localStorage.getItem("nombreUsuario");
let elNombre = document.getElementById("nombreUsuario");
if (elNombre && nombreGuardado) {
    elNombre.innerText = nombreGuardado;
}
 
 
 const slides = document.getElementById('slides');
  const dotsEl = document.getElementById('dots');
  let current = 0;
  const total = 3;
  const dots = [];

  for (let i = 0; i < total; i++) {
    const d = document.createElement('button');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.onclick = () => goTo(i);
    dotsEl.appendChild(d);
    dots.push(d);
  }

  function goTo(n) {
    current = (n + total) % total;
    slides.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function moveSlide(dir) { goTo(current + dir); }

  setInterval(() => moveSlide(1), 5000);
