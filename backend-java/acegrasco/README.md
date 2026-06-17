# Portal de Autogestión – Acegrasco S.A.
## Evidencia GA7-220501096-AA2-EV01 – Codificación de módulos del software

---

## Tecnologías
| Herramienta | Versión |
|---|---|
| Java | 17 |
| MySQL | 8.x |
| MySQL Connector/J (JDBC) | 8.3.0 |
| Maven | 3.9+ |
| IntelliJ IDEA | 2024+ |

---

## Estructura del proyecto
```
portal-autogestion/
├── pom.xml
├── .gitignore
├── sql/
│   └── 01_acegrasco_db.sql         ← Script de base de datos
└── src/main/java/com/acegrasco/
    ├── Main.java                   ← Punto de entrada
    ├── conexion/
    │   └── ConexionBaseDatos.java  ← Singleton JDBC
    ├── modelo/
    │   ├── Usuario.java            ← Entidad Usuario
    │   └── Solicitud.java          ← Entidad Solicitud
    ├── dao/
    │   ├── UsuarioDao.java         ← CRUD + Login usuarios
    │   └── SolicitudDao.java       ← CRUD solicitudes
    ├── vista/
    │   └── MenuPrincipal.java      ← Menú de consola
    └── util/
        └── Utilidades.java         ← Hash SHA-256 + validaciones
```

---

## Pasos para ejecutar

### 1. Crear la base de datos
```bash
mysql -u root -p < sql/01_acegrasco_db.sql
```

### 2. Ajustar credenciales
Editar `ConexionBaseDatos.java`:
```java
private static final String CLAVE = "TU_CONTRASEÑA";
```

### 3. Abrir en IntelliJ IDEA
- `File → Open` → seleccionar carpeta del proyecto
- IntelliJ detecta el `pom.xml` y descarga el driver automáticamente
- Ejecutar `Main.java`

### 4. Versionamiento con Git
```bash
git init
git add .
git commit -m "feat: codificación módulo portal autogestión GA7-AA2-EV01"
git remote add origin https://github.com/tu-usuario/portal-autogestion.git
git push -u origin main
```

---

## Credenciales de prueba (datos iniciales del SQL)
| Rol | Correo | Contraseña |
|---|---|---|
| Admin | info@acegrasco.com.co | admin123 |
| Usuario | luis@acegrasco.com.co | admin123 |

---

## Funcionalidades CRUD implementadas

### Módulo Usuarios
| Operación | Método | SQL |
|---|---|---|
| Registrar | `insertar()` | INSERT |
| Consultar por ID | `consultarPorId()` | SELECT WHERE id |
| Listar todos | `consultarTodos()` | SELECT ORDER BY nombre |
| Actualizar datos | `actualizar()` | UPDATE |
| Cambiar contraseña | `cambiarContrasena()` | UPDATE contrasena |
| Desactivar | `eliminar()` | UPDATE activo=FALSE |
| Autenticar | `autenticar()` | SELECT WHERE correo + hash |

### Módulo Solicitudes
| Operación | Método | SQL |
|---|---|---|
| Crear | `insertar()` | INSERT |
| Consultar por ID | `consultarPorId()` | SELECT JOIN usuarios |
| Listar todas | `consultarTodas()` | SELECT (admin) |
| Mis solicitudes | `consultarPorUsuario()` | SELECT WHERE id_usuario |
| Actualizar | `actualizar()` | UPDATE tipo + descripcion |
| Cambiar estado | `cambiarEstado()` | UPDATE estado |
| Eliminar | `eliminar()` | DELETE |

---

## Estándares de codificación aplicados
- **Paquetes:** minúsculas → `com.acegrasco.dao`
- **Clases:** PascalCase → `UsuarioDao`, `MenuPrincipal`
- **Métodos:** camelCase → `autenticar()`, `cambiarEstado()`
- **Constantes:** SCREAMING_SNAKE_CASE → `SQL_INSERTAR`, `URL`
- **Javadoc** en todas las clases y métodos públicos
- **PreparedStatement** en todas las consultas (previene SQL Injection)
- **Patrón DAO** para separar acceso a datos de lógica de negocio
- **Patrón Singleton** para la conexión JDBC

---

## Autor
**Nombre:** [Tu nombre completo]
**Ficha:** [Número de ficha]
**Programa:** Análisis y Desarrollo de Software – SENA
**Año:** 2026
