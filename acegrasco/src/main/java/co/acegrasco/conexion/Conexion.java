package co.acegrasco.conexion;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Clase Conexion
 * Gestiona la conexión JDBC a la base de datos MySQL de Acegrasco S.A.
 * Implementa el patrón Singleton para reutilizar la conexión.
 *
 * Base de datos: portal_acegrasco (XAMPP MySQL)
 */
public class Conexion {

    // ─── Parámetros de conexión ───────────────────────────────────────────────
    private static final String URL     = "jdbc:mysql://127.0.0.1:3306/portal_acegrasco"
                                        + "?useSSL=false&serverTimezone=America/Bogota&allowPublicKeyRetrieval=true";
    private static final String USUARIO = "root";
    private static final String CLAVE   = "123456";   // XAMPP por defecto no tiene contraseña

    // ─── Instancia única (Singleton) ─────────────────────────────────────────
    private static Conexion instancia;
    private Connection conexionActiva;

    /** Constructor privado: impide instanciación externa. */
    private Conexion() {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            this.conexionActiva = DriverManager.getConnection(URL, USUARIO, CLAVE);
            System.out.println("✅ Conexión establecida con portal_acegrasco.");
        } catch (ClassNotFoundException e) {
            System.err.println("❌ Driver MySQL no encontrado: " + e.getMessage());
            this.conexionActiva = null;
        } catch (SQLException e) {
            System.err.println("❌ Error al conectar: " + e.getMessage());
            System.err.println("   ► Verifica que XAMPP esté corriendo (Apache + MySQL).");
            System.err.println("   ► Verifica que la BD 'portal_acegrasco' exista en phpMyAdmin.");
            System.err.println("   ► URL usada: " + URL);
            this.conexionActiva = null;
        }
    }

    /** Obtiene la instancia única de Conexion (Singleton). */
    public static Conexion obtenerInstancia() {
        if (instancia == null) {
            instancia = new Conexion();
        }
        return instancia;
    }

    /**
     * Retorna el objeto Connection activo.
     * Lanza RuntimeException si la conexión no pudo establecerse,
     * para evitar NullPointerException silencioso en los DAO.
     */
    public Connection obtenerConexion() {
        if (conexionActiva == null) {
            throw new RuntimeException(
                "❌ No hay conexión activa con la base de datos.\n" +
                "   Asegúrate de que XAMPP esté corriendo y la BD 'portal_acegrasco' exista."
            );
        }
        return conexionActiva;
    }

    /** Indica si la conexión está activa y disponible. */
    public boolean estaConectado() {
        try {
            return conexionActiva != null && !conexionActiva.isClosed();
        } catch (SQLException e) {
            return false;
        }
    }

    /** Cierra la conexión activa y limpia la instancia. */
    public void cerrar() {
        try {
            if (conexionActiva != null && !conexionActiva.isClosed()) {
                conexionActiva.close();
                instancia = null;
                System.out.println("🔒 Conexión cerrada correctamente.");
            }
        } catch (SQLException e) {
            System.err.println("Error al cerrar la conexión: " + e.getMessage());
        }
    }
}
