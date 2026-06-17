package com.acegrasco.vista;

import com.acegrasco.dao.SolicitudDao;
import com.acegrasco.dao.UsuarioDao;
import com.acegrasco.modelo.Solicitud;
import com.acegrasco.modelo.Usuario;
import com.acegrasco.util.Utilidades;

import java.util.List;
import java.util.Scanner;

/**
 * Vista de consola del Portal de Autogestión - Acegrasco S.A.
 * Gestiona el flujo de login, menú de usuario y menú de administrador.
 *
 * @author [Tu nombre]
 * @version 1.0
 */
public class MenuPrincipal {

    private final UsuarioDao   usuarioDao;
    private final SolicitudDao solicitudDao;
    private final Scanner      lector;
    private Usuario            usuarioSesion;  // usuario autenticado actualmente

    public MenuPrincipal() {
        this.usuarioDao   = new UsuarioDao();
        this.solicitudDao = new SolicitudDao();
        this.lector       = new Scanner(System.in);
    }

    // ── Punto de entrada ─────────────────────────────────────────────────────

    public void iniciar() {
        int opcion;
        do {
            mostrarMenuInicio();
            opcion = leerEntero("Seleccione una opción: ");
            switch (opcion) {
                case 1 -> iniciarSesion();
                case 2 -> registrarNuevoUsuario();
                case 0 -> System.out.println("\nCerrando el sistema. ¡Hasta pronto!");
                default -> System.out.println("⚠ Opción no válida.");
            }
        } while (opcion != 0);
    }

    // ── Menú de inicio ───────────────────────────────────────────────────────

    private void mostrarMenuInicio() {
        System.out.println("\n╔══════════════════════════════════════════╗");
        System.out.println("║   PORTAL DE AUTOGESTIÓN – ACEGRASCO S.A. ║");
        System.out.println("╠══════════════════════════════════════════╣");
        System.out.println("║  1. Iniciar sesión                        ║");
        System.out.println("║  2. Registrarse                           ║");
        System.out.println("║  0. Salir                                 ║");
        System.out.println("╚══════════════════════════════════════════╝");
    }

    // ── Login ────────────────────────────────────────────────────────────────

    private void iniciarSesion() {
        System.out.println("\n── INICIAR SESIÓN ──");
        String correo     = leerTextoObligatorio("Correo: ");
        String contrasena = leerTextoObligatorio("Contraseña: ");

        usuarioSesion = usuarioDao.autenticar(correo, contrasena);

        if (usuarioSesion == null) {
            System.out.println("✘ Correo o contraseña incorrectos.");
            return;
        }

        System.out.println("✔ Bienvenido/a, " + usuarioSesion.getNombreCompleto() + "!");

        if (usuarioSesion.getRol() == Usuario.Rol.ADMIN) {
            menuAdministrador();
        } else {
            menuUsuario();
        }
    }

    // ── Registro ─────────────────────────────────────────────────────────────

    private void registrarNuevoUsuario() {
        System.out.println("\n── REGISTRO DE NUEVO USUARIO ──");
        String nombre     = leerTextoObligatorio("Nombre completo: ");
        String correo     = leerCorreo();
        String contrasena = leerContrasena();

        Usuario nuevoUsuario = new Usuario(nombre, correo, contrasena);
        if (usuarioDao.insertar(nuevoUsuario)) {
            System.out.println("✔ Usuario registrado correctamente. Ya puede iniciar sesión.");
        } else {
            System.out.println("✘ No se pudo registrar. El correo puede estar en uso.");
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    //  MENÚ USUARIO
    // ════════════════════════════════════════════════════════════════════════

    private void menuUsuario() {
        int opcion;
        do {
            System.out.println("\n╔══════════════════════════════════════╗");
            System.out.println("║        MI PORTAL – " + String.format("%-18s", usuarioSesion.getNombreCompleto()) + "║");
            System.out.println("╠══════════════════════════════════════╣");
            System.out.println("║  1. Nueva solicitud                   ║");
            System.out.println("║  2. Mis solicitudes                   ║");
            System.out.println("║  3. Actualizar mi solicitud           ║");
            System.out.println("║  4. Eliminar mi solicitud             ║");
            System.out.println("║  5. Actualizar mis datos              ║");
            System.out.println("║  6. Cambiar contraseña                ║");
            System.out.println("║  0. Cerrar sesión                     ║");
            System.out.println("╚══════════════════════════════════════╝");

            opcion = leerEntero("Seleccione una opción: ");
            switch (opcion) {
                case 1 -> crearSolicitud();
                case 2 -> listarMisSolicitudes();
                case 3 -> actualizarMiSolicitud();
                case 4 -> eliminarMiSolicitud();
                case 5 -> actualizarMisDatos();
                case 6 -> cambiarMiContrasena();
                case 0 -> System.out.println("Sesión cerrada.");
                default -> System.out.println("⚠ Opción no válida.");
            }
        } while (opcion != 0);
    }

    private void crearSolicitud() {
        System.out.println("\n── NUEVA SOLICITUD ──");
        System.out.println("Tipos: Certificado laboral | Permiso de salida | Vacaciones | Otro");
        String tipo        = leerTextoObligatorio("Tipo de solicitud: ");
        String descripcion = leerTextoObligatorio("Descripción detallada: ");

        Solicitud nuevaSolicitud = new Solicitud(usuarioSesion.getIdUsuario(), tipo, descripcion);
        if (solicitudDao.insertar(nuevaSolicitud)) {
            System.out.println("✔ Solicitud enviada correctamente. ID: " + nuevaSolicitud.getIdSolicitud());
        } else {
            System.out.println("✘ No se pudo crear la solicitud.");
        }
    }

    private void listarMisSolicitudes() {
        System.out.println("\n── MIS SOLICITUDES ──");
        List<Solicitud> lista = solicitudDao.consultarPorUsuario(usuarioSesion.getIdUsuario());

        if (lista.isEmpty()) {
            System.out.println("⚠ No tienes solicitudes registradas.");
            return;
        }

        System.out.printf("%-5s %-25s %-12s %-20s%n", "ID", "Tipo", "Estado", "Fecha");
        System.out.println("─".repeat(65));
        for (Solicitud s : lista) {
            System.out.printf("%-5d %-25s %-12s %-20s%n",
                    s.getIdSolicitud(), s.getTipoSolicitud(),
                    s.getEstado(), s.getFechaCreacion());
        }
    }

    private void actualizarMiSolicitud() {
        System.out.println("\n── ACTUALIZAR SOLICITUD ──");
        listarMisSolicitudes();
        int id = leerEntero("ID de la solicitud a actualizar: ");

        Solicitud solicitud = solicitudDao.consultarPorId(id);
        if (solicitud == null || solicitud.getIdUsuario() != usuarioSesion.getIdUsuario()) {
            System.out.println("⚠ Solicitud no encontrada o no te pertenece.");
            return;
        }

        if (solicitud.getEstado() != Solicitud.Estado.PENDIENTE) {
            System.out.println("⚠ Solo puedes editar solicitudes en estado PENDIENTE.");
            return;
        }

        String tipo = leerTextoConDefault("Tipo [" + solicitud.getTipoSolicitud() + "]: ",
                solicitud.getTipoSolicitud());
        String desc = leerTextoConDefault("Descripción [" + solicitud.getDescripcion() + "]: ",
                solicitud.getDescripcion());

        solicitud.setTipoSolicitud(tipo);
        solicitud.setDescripcion(desc);

        if (solicitudDao.actualizar(solicitud)) {
            System.out.println("✔ Solicitud actualizada correctamente.");
        } else {
            System.out.println("✘ No se pudo actualizar.");
        }
    }

    private void eliminarMiSolicitud() {
        System.out.println("\n── ELIMINAR SOLICITUD ──");
        listarMisSolicitudes();
        int id = leerEntero("ID de la solicitud a eliminar: ");

        Solicitud solicitud = solicitudDao.consultarPorId(id);
        if (solicitud == null || solicitud.getIdUsuario() != usuarioSesion.getIdUsuario()) {
            System.out.println("⚠ Solicitud no encontrada o no te pertenece.");
            return;
        }

        String confirmacion = leerTextoObligatorio("¿Confirmar eliminación? (S/N): ");
        if (confirmacion.equalsIgnoreCase("S")) {
            if (solicitudDao.eliminar(id)) {
                System.out.println("✔ Solicitud eliminada.");
            } else {
                System.out.println("✘ No se pudo eliminar.");
            }
        } else {
            System.out.println("Operación cancelada.");
        }
    }

    private void actualizarMisDatos() {
        System.out.println("\n── ACTUALIZAR MIS DATOS ──");
        String nombre = leerTextoConDefault("Nombre completo [" + usuarioSesion.getNombreCompleto() + "]: ",
                usuarioSesion.getNombreCompleto());
        String correo = leerTextoConDefault("Correo [" + usuarioSesion.getCorreo() + "]: ",
                usuarioSesion.getCorreo());

        usuarioSesion.setNombreCompleto(nombre);
        usuarioSesion.setCorreo(correo);

        if (usuarioDao.actualizar(usuarioSesion)) {
            System.out.println("✔ Datos actualizados correctamente.");
        } else {
            System.out.println("✘ No se pudo actualizar.");
        }
    }

    private void cambiarMiContrasena() {
        System.out.println("\n── CAMBIAR CONTRASEÑA ──");
        String nueva      = leerContrasena();
        String confirmada = leerTextoObligatorio("Confirmar nueva contraseña: ");

        if (!nueva.equals(confirmada)) {
            System.out.println("⚠ Las contraseñas no coinciden.");
            return;
        }

        if (usuarioDao.cambiarContrasena(usuarioSesion.getIdUsuario(), nueva)) {
            System.out.println("✔ Contraseña cambiada exitosamente.");
        } else {
            System.out.println("✘ No se pudo cambiar la contraseña.");
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    //  MENÚ ADMINISTRADOR
    // ════════════════════════════════════════════════════════════════════════

    private void menuAdministrador() {
        int opcion;
        do {
            System.out.println("\n╔══════════════════════════════════════╗");
            System.out.println("║        PANEL ADMINISTRADOR            ║");
            System.out.println("╠══════════════════════════════════════╣");
            System.out.println("║  1. Ver todas las solicitudes         ║");
            System.out.println("║  2. Cambiar estado de solicitud       ║");
            System.out.println("║  3. Eliminar solicitud                ║");
            System.out.println("║  4. Ver todos los usuarios            ║");
            System.out.println("║  5. Desactivar usuario                ║");
            System.out.println("║  0. Cerrar sesión                     ║");
            System.out.println("╚══════════════════════════════════════╝");

            opcion = leerEntero("Seleccione una opción: ");
            switch (opcion) {
                case 1 -> listarTodasLasSolicitudes();
                case 2 -> cambiarEstadoSolicitud();
                case 3 -> eliminarSolicitudAdmin();
                case 4 -> listarTodosLosUsuarios();
                case 5 -> desactivarUsuario();
                case 0 -> System.out.println("Sesión cerrada.");
                default -> System.out.println("⚠ Opción no válida.");
            }
        } while (opcion != 0);
    }

    private void listarTodasLasSolicitudes() {
        System.out.println("\n── TODAS LAS SOLICITUDES ──");
        List<Solicitud> lista = solicitudDao.consultarTodas();
        if (lista.isEmpty()) {
            System.out.println("⚠ No hay solicitudes registradas.");
            return;
        }
        System.out.printf("%-5s %-20s %-25s %-12s%n", "ID", "Usuario", "Tipo", "Estado");
        System.out.println("─".repeat(65));
        for (Solicitud s : lista) {
            System.out.printf("%-5d %-20s %-25s %-12s%n",
                    s.getIdSolicitud(), s.getNombreUsuario(),
                    s.getTipoSolicitud(), s.getEstado());
        }
    }

    private void cambiarEstadoSolicitud() {
        System.out.println("\n── CAMBIAR ESTADO DE SOLICITUD ──");
        int id = leerEntero("ID de la solicitud: ");

        Solicitud solicitud = solicitudDao.consultarPorId(id);
        if (solicitud == null) {
            System.out.println("⚠ Solicitud no encontrada.");
            return;
        }

        System.out.println("Estado actual: " + solicitud.getEstado());
        System.out.println("Estados disponibles:");
        System.out.println("  1. PENDIENTE   2. EN_PROCESO   3. RESUELTA   4. CANCELADA");
        int estadoOpcion = leerEntero("Nuevo estado (1-4): ");

        Solicitud.Estado nuevoEstado = switch (estadoOpcion) {
            case 1 -> Solicitud.Estado.PENDIENTE;
            case 2 -> Solicitud.Estado.EN_PROCESO;
            case 3 -> Solicitud.Estado.RESUELTA;
            case 4 -> Solicitud.Estado.CANCELADA;
            default -> null;
        };

        if (nuevoEstado == null) {
            System.out.println("⚠ Opción no válida.");
            return;
        }

        if (solicitudDao.cambiarEstado(id, nuevoEstado)) {
            System.out.println("✔ Estado actualizado a: " + nuevoEstado);
        } else {
            System.out.println("✘ No se pudo actualizar el estado.");
        }
    }

    private void eliminarSolicitudAdmin() {
        System.out.println("\n── ELIMINAR SOLICITUD (ADMIN) ──");
        int id = leerEntero("ID de la solicitud a eliminar: ");
        String confirmacion = leerTextoObligatorio("¿Confirmar? (S/N): ");
        if (confirmacion.equalsIgnoreCase("S")) {
            if (solicitudDao.eliminar(id)) {
                System.out.println("✔ Solicitud eliminada.");
            } else {
                System.out.println("✘ No se encontró la solicitud.");
            }
        }
    }

    private void listarTodosLosUsuarios() {
        System.out.println("\n── USUARIOS REGISTRADOS ──");
        List<Usuario> lista = usuarioDao.consultarTodos();
        if (lista.isEmpty()) {
            System.out.println("⚠ No hay usuarios.");
            return;
        }
        System.out.printf("%-5s %-30s %-30s %-8s%n", "ID", "Nombre", "Correo", "Rol");
        System.out.println("─".repeat(75));
        for (Usuario u : lista) {
            System.out.printf("%-5d %-30s %-30s %-8s%n",
                    u.getIdUsuario(), u.getNombreCompleto(), u.getCorreo(), u.getRol());
        }
    }

    private void desactivarUsuario() {
        System.out.println("\n── DESACTIVAR USUARIO ──");
        int id = leerEntero("ID del usuario a desactivar: ");
        String confirmacion = leerTextoObligatorio("¿Confirmar? (S/N): ");
        if (confirmacion.equalsIgnoreCase("S")) {
            if (usuarioDao.eliminar(id)) {
                System.out.println("✔ Usuario desactivado.");
            } else {
                System.out.println("✘ No se encontró el usuario.");
            }
        }
    }

    // ── Métodos auxiliares de entrada ────────────────────────────────────────

    private int leerEntero(String mensaje) {
        System.out.print(mensaje);
        while (!lector.hasNextInt()) {
            System.out.print("⚠ Ingrese un número: ");
            lector.next();
        }
        int valor = lector.nextInt();
        lector.nextLine();
        return valor;
    }

    private String leerTexto(String mensaje) {
        System.out.print(mensaje);
        return lector.nextLine().trim();
    }

    private String leerTextoObligatorio(String mensaje) {
        String valor;
        do {
            System.out.print(mensaje);
            valor = lector.nextLine().trim();
            if (valor.isEmpty()) System.out.println("⚠ Campo obligatorio.");
        } while (valor.isEmpty());
        return valor;
    }

    private String leerTextoConDefault(String mensaje, String valorPorDefecto) {
        System.out.print(mensaje);
        String entrada = lector.nextLine().trim();
        return entrada.isEmpty() ? valorPorDefecto : entrada;
    }

    private String leerCorreo() {
        String correo;
        do {
            System.out.print("Correo electrónico: ");
            correo = lector.nextLine().trim();
            if (!Utilidades.esCorreoValido(correo))
                System.out.println("⚠ Formato inválido. Ejemplo: nombre@dominio.com");
        } while (!Utilidades.esCorreoValido(correo));
        return correo;
    }

    private String leerContrasena() {
        String contrasena;
        do {
            System.out.print("Contraseña (mínimo 6 caracteres): ");
            contrasena = lector.nextLine().trim();
            if (!Utilidades.esContrasenaValida(contrasena))
                System.out.println("⚠ La contraseña debe tener al menos 6 caracteres.");
        } while (!Utilidades.esContrasenaValida(contrasena));
        return contrasena;
    }
}
