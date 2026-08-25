# Portal de Autogestión de Empleados - Acegrasco S.A.

Proyecto formativo SENA — Tecnología en Análisis y Desarrollo de Software (Ficha 3186635)
Evidencias GA8-220501096-AA1-EV01 y AA1-EV02

## Arquitectura

```
portal_autogestion/
├── Backend/     -> API REST en Node.js + Express
├── Frontend/    -> Aplicación web en Angular
└── Database/    -> Script SQL de la base de datos (MySQL)
```

- **Backend:** Node.js, Express, mysql2, PDFKit (generación de certificados en PDF)
- **Frontend:** Angular (standalone components), Angular Router, HttpClient
- **Base de datos:** MySQL (portal_acegrasco), gestionada con XAMPP/phpMyAdmin
- **Testing de API:** Postman

## Requisitos previos

- Node.js 18+ y npm instalados
- XAMPP con MySQL corriendo
- Angular CLI (`npm install -g @angular/cli`) — opcional si usas `npx ng`

## 1. Base de datos

1. Abre phpMyAdmin (`http://127.0.0.1/phpmyadmin`).
2. Ve a la pestaña "Importar" y selecciona el archivo `Database/portal_acegrasco.sql`.
3. Esto crea la base de datos `portal_acegrasco` con todas sus tablas y datos de ejemplo.

## 2. Backend (Express)

```bash
cd Backend
npm install
copy .env.example .env      (en Windows; o "cp .env.example .env" en Mac/Linux)
```

Edita el archivo `.env` con tus credenciales reales de MySQL (usuario, contraseña).

```bash
npm run dev
```

El servidor queda disponible en: **http://localhost:3000**

## 3. Frontend (Angular)

```bash
cd Frontend
npm install
npx ng serve
```

La aplicación queda disponible en: **http://localhost:4200**

## Endpoints principales de la API

| Recurso | Base URL |
|---|---|
| Usuarios | http://localhost:3000/api/usuarios |
| Empleados | http://localhost:3000/api/empleados |
| Solicitudes | http://localhost:3000/api/solicitudes |
| Certificados | http://localhost:3000/api/certificados |

## Notas

- JavaScript/Node.js es un lenguaje interpretado: no genera archivos "compilados" como en Java. El código fuente se ejecuta directamente con el comando `node` (o `nodemon` en modo desarrollo).
- Los certificados en PDF generados se guardan temporalmente en `Backend/certificados/` (carpeta excluida del control de versiones).
