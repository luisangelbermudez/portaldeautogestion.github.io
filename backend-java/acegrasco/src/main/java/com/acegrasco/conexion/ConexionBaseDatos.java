package com.acegrasco.conexion;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Gestiona la conexión JDBC a la base de datos de Acegrasco.
 * Implementa el patrón Singleton para garantizar una única conexión activa.
 *
 * @author [Tu nombre]
 * @version 1.0
 */
public class ConexionBaseDatos {

    private static final String URL       = "jdbc:mysql://localhost:3306/acegrasco_db?useSSL=false&serverTimezone=America/Bogota";
    private static final String USUARIO   = "root";
    private static final String CLAVE     = "123456";           // ← cambia aquí
    private static final String DRIVER    = "com.mysql.cj.jdbc.Driver";

    private static ConexionBaseDatos instancia;
    private Connection conexion;

    private ConexionBaseDatos() {
        try {
            Class.forName(DRIVER);
            this.conexion = DriverManager.getConnection(URL, USUARIO, CLAVE);
            System.out.println("✔ Conexión establecida con acegrasco_db.");
        } catch (ClassNotFoundException e) {
            System.err.println("✘ Driver no encontrado: " + e.getMessage());
        } catch (SQLException e) {
            System.err.println("✘ Error al conectar: " + e.getMessage());
        }
    }

    public static ConexionBaseDatos obtenerInstancia() {
        if (instancia == null) {
            instancia = new ConexionBaseDatos();
        }
        return instancia;
    }

    public Connection obtenerConexion() { return conexion; }

    public void cerrarConexion() {
        try {
            if (conexion != null && !conexion.isClosed()) {
                conexion.close();
                instancia = null;
                System.out.println("✔ Conexión cerrada.");
            }
        } catch (SQLException e) {
            System.err.println("✘ Error al cerrar conexión: " + e.getMessage());
        }
    }
}
