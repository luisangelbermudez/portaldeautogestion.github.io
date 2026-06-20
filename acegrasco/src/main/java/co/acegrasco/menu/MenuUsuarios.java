package co.acegrasco.menu;

import co.acegrasco.dao.UsuarioDao;
import co.acegrasco.modelo.Usuario;
import co.acegrasco.util.Consola;

import java.util.List;
import java.util.Scanner;

/**
 * Clase MenuUsuarios
 * Gestiona el menú de consola para las operaciones CRUD de usuarios.
 *
 * Paquete: co.acegrasco.menu
 */
public class MenuUsuarios {

    private final UsuarioDao usuarioDao;
    private final Scanner    scanner;

    public MenuUsuarios(Scanner scanner) {
        this.usuarioDao = new UsuarioDao();
        this.scanner    = scanner;
    }

    /** Muestra el menú principal de usuarios y procesa la opción elegida. */
    public void mostrar() {
        int opcion;
        do {
            Consola.titulo("Gestión de Usuarios");
            System.out.println("  1. Listar todos los usuarios");
            System.out.println("  2. Consultar usuario por ID");
            System.out.println("  3. Insertar nuevo usuario");
            System.out.println("  4. Actualizar usuario");
            System.out.println("  5. Eliminar usuario");
            System.out.println("  0. Volver al menú principal");
            Consola.separador();
            System.out.print("  Seleccione una opción: ");
            opcion = leerEntero();

            switch (opcion) {
                case 1 -> listarUsuarios();
                case 2 -> consultarPorId();
                case 3 -> insertarUsuario();
                case 4 -> actualizarUsuario();
                case 5 -> eliminarUsuario();
                case 0 -> System.out.println("  Volviendo al menú principal...");
                default -> Consola.error("Opción inválida.");
            }
        } while (opcion != 0);
    }

    // ─── Listar ──────────────────────────────────────────────────────────────

    private void listarUsuarios() {
        Consola.titulo("Listado de Usuarios");
        List<Usuario> usuarios = usuarioDao.consultarTodos();
        Consola.imprimirUsuarios(usuarios);
    }

    // ─── Consultar por ID ─────────────────────────────────────────────────────

    private void consultarPorId() {
        Consola.titulo("Consultar Usuario por ID");
        System.out.print("  Ingrese el ID del usuario: ");
        int id = leerEntero();
        Usuario u = usuarioDao.consultarPorId(id);
        if (u != null) {
            System.out.println("\n  " + u);
        } else {
            Consola.error("Usuario no encontrado.");
        }
    }

    // ─── Insertar ─────────────────────────────────────────────────────────────

    private void insertarUsuario() {
        Consola.titulo("Insertar Nuevo Usuario");
        Usuario nuevo = new Usuario();

        System.out.print("  Nombre completo : ");
        nuevo.setNombre(scanner.nextLine().trim());

        System.out.print("  Correo          : ");
        nuevo.setCorreo(scanner.nextLine().trim());

        System.out.print("  Contraseña      : ");
        nuevo.setContrasena(scanner.nextLine().trim());

        System.out.print("  Rol (1=Admin, 2=Empleado): ");
        nuevo.setIdRol(leerEntero());

        nuevo.setIdEstado(1); // Activo por defecto

        boolean resultado = usuarioDao.insertar(nuevo);
        if (resultado) Consola.exito("Usuario insertado correctamente.");
        else           Consola.error("No se pudo insertar el usuario.");
    }

    // ─── Actualizar ───────────────────────────────────────────────────────────

    private void actualizarUsuario() {
        Consola.titulo("Actualizar Usuario");
        System.out.print("  ID del usuario a actualizar: ");
        int id = leerEntero();

        Usuario existente = usuarioDao.consultarPorId(id);
        if (existente == null) { Consola.error("Usuario no encontrado."); return; }

        System.out.printf("  Nombre actual [%s] → nuevo nombre (Enter para mantener): ", existente.getNombre());
        String nombre = scanner.nextLine().trim();
        if (!nombre.isEmpty()) existente.setNombre(nombre);

        System.out.printf("  Correo actual [%s] → nuevo correo (Enter para mantener): ", existente.getCorreo());
        String correo = scanner.nextLine().trim();
        if (!correo.isEmpty()) existente.setCorreo(correo);

        System.out.print("  Nueva contraseña (Enter para mantener): ");
        String clave = scanner.nextLine().trim();
        if (!clave.isEmpty()) existente.setContrasena(clave);

        System.out.printf("  Estado actual [%d] → nuevo estado (1=Activo, 2=Inactivo, Enter para mantener): ", existente.getIdEstado());
        String estadoStr = scanner.nextLine().trim();
        if (!estadoStr.isEmpty()) existente.setIdEstado(Integer.parseInt(estadoStr));

        boolean resultado = usuarioDao.actualizar(existente);
        if (resultado) Consola.exito("Usuario actualizado correctamente.");
        else           Consola.error("No se pudo actualizar el usuario.");
    }

    // ─── Eliminar ─────────────────────────────────────────────────────────────

    private void eliminarUsuario() {
        Consola.titulo("Eliminar Usuario");
        System.out.print("  ID del usuario a eliminar: ");
        int id = leerEntero();

        System.out.print("  ¿Confirma la eliminación? (s/n): ");
        String confirmacion = scanner.nextLine().trim();
        if (!confirmacion.equalsIgnoreCase("s")) { Consola.info("Operación cancelada."); return; }

        boolean resultado = usuarioDao.eliminar(id);
        if (resultado) Consola.exito("Usuario eliminado correctamente.");
        else           Consola.error("No se pudo eliminar el usuario.");
    }

    // ─── Util ─────────────────────────────────────────────────────────────────

    private int leerEntero() {
        try {
            int valor = Integer.parseInt(scanner.nextLine().trim());
            return valor;
        } catch (NumberFormatException e) {
            return -1;
        }
    }
}
