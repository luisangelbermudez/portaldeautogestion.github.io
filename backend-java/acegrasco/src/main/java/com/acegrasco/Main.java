package com.acegrasco;

import com.acegrasco.conexion.ConexionBaseDatos;
import com.acegrasco.vista.MenuPrincipal;

/**
 * Clase principal del Portal de Autogestión - Acegrasco S.A.
 *
 * Evidencia : GA7-220501096-AA2-EV01
 * Programa  : Análisis y Desarrollo de Software – SENA
 * Tecnologías: Java 17 · JDBC · MySQL 8 · IntelliJ IDEA
 *
 * @author Grupo 9
 * @version 1.0
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("================================================");
        System.out.println("  PORTAL DE AUTOGESTIÓN – ACEGRASCO S.A.        ");
        System.out.println("================================================");

        MenuPrincipal menu = new MenuPrincipal();
        menu.iniciar();

        ConexionBaseDatos.obtenerInstancia().cerrarConexion();
    }
}
