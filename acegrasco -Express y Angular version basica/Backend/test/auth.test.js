const { test, describe, beforeEach, afterEach, mock } = require("node:test");
const assert = require("node:assert/strict");

const { pool } = require("../src/config/db");
const { login } = require("../src/controllers/authController");

// Construye un objeto "res" falso (mock) que imita res.status(...).json(...)
// y guarda lo que el controlador le envía, para poder verificarlo con assert.
function crearResFalso() {
  const res = {
    codigoEstado: null,
    cuerpoJson: null,
    status(codigo) {
      this.codigoEstado = codigo;
      return this;
    },
    json(cuerpo) {
      this.cuerpoJson = cuerpo;
      return this;
    },
  };
  return res;
}

const usuarioDeEjemplo = {
  id_usuario: 1,
  nombre: "Leonardo Trivino",
  correo: "leonardo@acegrasco.com",
  contrasena: "clave123",
  id_rol: 2,
  nombre_rol: "Empleado",
  id_estado: 1,
};

describe("authController.login (POST /api/login)", () => {
  let mockQuery;

  beforeEach(() => {
    // Antes de cada prueba, reemplazamos pool.query por una función simulada
    // para no depender de una conexión real a MySQL.
    mockQuery = mock.method(pool, "query");
  });

  afterEach(() => {
    mock.restoreAll();
  });

  test("Deberia rechazar la peticion si falta correo o contrasena (400)", async () => {
    const req = { body: { correo: "leonardo@acegrasco.com" } }; // sin contrasena
    const res = crearResFalso();

    await login(req, res);

    assert.equal(res.codigoEstado, 400);
    assert.equal(res.cuerpoJson.mensaje, "Correo y contrasena son obligatorios");
  });

  test("Deberia rechazar credenciales invalidas si el correo no existe (401)", async () => {
    mockQuery.mock.mockImplementation(async () => [[]]); // consulta no devuelve filas

    const req = { body: { correo: "noexiste@acegrasco.com", contrasena: "clave123" } };
    const res = crearResFalso();

    await login(req, res);

    assert.equal(res.codigoEstado, 401);
    assert.equal(res.cuerpoJson.mensaje, "Credenciales invalidas");
  });

  test("Deberia rechazar credenciales invalidas si la contrasena no coincide (401)", async () => {
    mockQuery.mock.mockImplementation(async () => [[usuarioDeEjemplo]]);

    const req = { body: { correo: "leonardo@acegrasco.com", contrasena: "claveIncorrecta" } };
    const res = crearResFalso();

    await login(req, res);

    assert.equal(res.codigoEstado, 401);
    assert.equal(res.cuerpoJson.mensaje, "Credenciales invalidas");
  });

  test("Deberia rechazar el acceso si el usuario esta inactivo (403)", async () => {
    const usuarioInactivo = { ...usuarioDeEjemplo, id_estado: 0 };
    mockQuery.mock.mockImplementation(async () => [[usuarioInactivo]]);

    const req = { body: { correo: "leonardo@acegrasco.com", contrasena: "clave123" } };
    const res = crearResFalso();

    await login(req, res);

    assert.equal(res.codigoEstado, 403);
    assert.equal(res.cuerpoJson.mensaje, "El usuario se encuentra inactivo");
  });

  test("Deberia iniciar sesion exitosamente con credenciales correctas (200)", async () => {
    mockQuery.mock.mockImplementation(async () => [[usuarioDeEjemplo]]);

    const req = { body: { correo: "leonardo@acegrasco.com", contrasena: "clave123" } };
    const res = crearResFalso();

    await login(req, res);

    assert.equal(res.codigoEstado, 200);
    assert.equal(res.cuerpoJson.mensaje, "Inicio de sesion exitoso");
    assert.equal(res.cuerpoJson.usuario.correo, "leonardo@acegrasco.com");
    assert.equal(res.cuerpoJson.usuario.rolNombre, "Empleado");
  });
});
