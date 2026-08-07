package co.acegrasco.conexion;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Clase Conexion
 * Gestiona la conexión JDBC a MySQL mediante patrón Singleton.
 * Paquete: co.acegrasco.conexion
 */
public class Conexion {

    private static final String URL     = "jdbc:mysql://127.0.0.1:3306/portal_acegrasco"
                                        + "?useSSL=false&serverTimezone=America/Bogota&allowPublicKeyRetrieval=true";
    private static final String USUARIO = "root";
    private static final String CLAVE   = "";   // XAMPP por defecto sin contraseña

    private static Conexion instancia;
    private Connection conexionActiva;

    private Conexion() {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            this.conexionActiva = DriverManager.getConnection(URL, USUARIO, CLAVE);
        } catch (ClassNotFoundException | SQLException e) {
            System.err.println("❌ Error de conexión JDBC: " + e.getMessage());
            this.conexionActiva = null;
        }
    }

    public static synchronized Conexion obtenerInstancia() {
        if (instancia == null || !instancia.estaActiva()) {
            instancia = new Conexion();
        }
        return instancia;
    }

    public Connection obtenerConexion() {
        if (conexionActiva == null) {
            throw new RuntimeException("No hay conexión activa con la base de datos. Verifique que XAMPP esté corriendo.");
        }
        return conexionActiva;
    }

    public boolean estaActiva() {
        try {
            return conexionActiva != null && !conexionActiva.isClosed();
        } catch (SQLException e) {
            return false;
        }
    }

    public void cerrar() {
        try {
            if (conexionActiva != null && !conexionActiva.isClosed()) {
                conexionActiva.close();
                instancia = null;
            }
        } catch (SQLException e) {
            System.err.println("Error al cerrar conexión: " + e.getMessage());
        }
    }
}
