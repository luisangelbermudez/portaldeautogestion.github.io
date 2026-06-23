<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="co.acegrasco.modelo.Usuario" %>
<%
    // Si ya hay sesión, redirigir al dashboard
    jakarta.servlet.http.HttpSession _ses = request.getSession(false);
    if (_ses != null && _ses.getAttribute("usuario") != null) {
        Usuario _u = (Usuario) _ses.getAttribute("usuario");
        response.sendRedirect(request.getContextPath() + (_u.getIdRol() == 1 ? "/admin/dashboard" : "/empleado/dashboard"));
        return;
    }
%>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Portal de Autogestión - Acegrasco</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/index.css"/>
</head>
<body>

<nav>
  <a class="nav-brand" href="${pageContext.request.contextPath}/login">Portal <span>Acegrasco</span></a>
</nav>

<main class="hero">
  <!-- CAROUSEL -->
  <div class="carousel-wrap">
    <div class="carousel-slides" id="slides">
      <div class="slide">
        <img src="${pageContext.request.contextPath}/imagenes/portal1.JPG" alt="Portal Acegrasco"
             onerror="this.style.background='#0F6E56';this.style.minHeight='300px'"/>
        <div class="slide-overlay">
          <div class="slide-tag">Bienvenido</div>
          <div class="slide-title">Portal de Autogestión Acegrasco</div>
          <div class="slide-desc">Gestiona tus solicitudes de forma rápida, segura y desde cualquier dispositivo.</div>
        </div>
      </div>
      <div class="slide">
        <img src="${pageContext.request.contextPath}/imagenes/portal2.jpg" alt="Portal Acegrasco"
             onerror="this.style.background='#085041';this.style.minHeight='300px'"/>
        <div class="slide-overlay">
          <div class="slide-tag">Eficiencia</div>
          <div class="slide-title">Solicitudes en minutos, no en días</div>
          <div class="slide-desc">Nuestro sistema centraliza todas tus gestiones con trazabilidad en tiempo real.</div>
        </div>
      </div>
      <div class="slide">
        <img src="${pageContext.request.contextPath}/imagenes/portal3.JPG" alt="Portal Acegrasco"
             onerror="this.style.background='#04342C';this.style.minHeight='300px'"/>
        <div class="slide-overlay">
          <div class="slide-tag">Control total</div>
          <div class="slide-title">Administración centralizada</div>
          <div class="slide-desc">Panel administrativo con reportes, usuarios y seguimiento en un solo lugar.</div>
        </div>
      </div>
    </div>
    <button class="carousel-btn prev" onclick="moveSlide(-1)">&#8592;</button>
    <button class="carousel-btn next" onclick="moveSlide(1)">&#8594;</button>
    <div class="carousel-nav" id="dots"></div>
  </div>

  <!-- SIDEBAR LOGIN -->
  <aside class="sidebar">
    <div class="sidebar-header">
      <img class="logo-img" src="${pageContext.request.contextPath}/imagenes/acegrasco.JPG" alt="Acegrasco"
           onerror="this.style.display='none'"/>
      <h2>Acegrasco S.A.</h2>
      <p>Sistema de gestión de solicitudes</p>
    </div>

    <div class="sidebar-body">
      <div class="panel">
        <div class="panel-title">Iniciar Sesión</div>
        <div class="panel-body">

          <%-- Mensaje de error desde el Servlet --%>
          <% if (request.getAttribute("error") != null) { %>
            <div style="background:#FCEBEB;color:#A32D2D;border:1px solid #f7c1c1;border-radius:7px;padding:.5rem .75rem;font-size:.82rem;margin-bottom:.6rem;">
              ${error}
            </div>
          <% } %>

          <%-- Formulario POST al LoginServlet --%>
          <form action="${pageContext.request.contextPath}/login" method="post">
            <div class="form-group">
              <label for="correo">Correo electrónico</label>
              <input type="email" id="correo" name="correo" placeholder="usuario@acegrasco.com"
                     value="${not empty param.correo ? param.correo : ''}" required/>
            </div>
            <div class="form-group">
              <label for="contrasena">Contraseña</label>
              <input type="password" id="contrasena" name="contrasena" placeholder="••••••••" required/>
            </div>
            <button type="submit" class="btn-primary">Ingresar</button>
          </form>

        </div>
      </div>
    </div>
  </aside>
</main>

<footer>
  <div class="contact">
    <span>&#128241; (+57) 301 2952356</span>
    <span>&#9993; info@acegrasco.com.co</span>
    <span>&#128205; Calle 15 #5-23, Bogotá</span>
  </div>
  <div class="copy">Portal de Autogestión &copy; 2026</div>
</footer>

<script>
  // Carousel del index (igual que la maqueta)
  var current = 0;
  var slides  = document.getElementById('slides');
  var total   = document.querySelectorAll('.slide').length;
  var dotsEl  = document.getElementById('dots');

  function buildDots() {
    for (var i = 0; i < total; i++) {
      var d = document.createElement('span');
      d.className = 'dot' + (i === 0 ? ' active' : '');
      (function(idx){ d.onclick = function(){ goTo(idx); }; })(i);
      dotsEl.appendChild(d);
    }
  }

  function goTo(n) {
    current = (n + total) % total;
    slides.style.transform = 'translateX(-' + (current * 100) + '%)';
    document.querySelectorAll('.dot').forEach(function(d, i){ d.className = 'dot' + (i === current ? ' active' : ''); });
  }

  function moveSlide(dir) { goTo(current + dir); }

  buildDots();
  setInterval(function(){ moveSlide(1); }, 4500);
</script>

</body>
</html>
