package com.acegrasco.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.regex.Pattern;

/**
 * Clase utilitaria con métodos de validación y seguridad.
 *
 * @author [Tu nombre]
 * @version 1.0
 */
public class Utilidades {

    private static final Pattern PATRON_CORREO =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private Utilidades() {}

    /**
     * Genera el hash SHA-256 de una contraseña en texto plano.
     *
     * @param contrasena texto plano
     * @return hash hexadecimal de 64 caracteres
     */
    public static String hashContrasena(String contrasena) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(contrasena.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error al generar hash SHA-256", e);
        }
    }

    /** Verifica que un texto no sea nulo ni vacío. */
    public static boolean esTextoValido(String texto) {
        return texto != null && !texto.trim().isEmpty();
    }

    /** Valida formato de correo electrónico. */
    public static boolean esCorreoValido(String correo) {
        return correo != null && PATRON_CORREO.matcher(correo).matches();
    }

    /** Valida que la contraseña tenga mínimo 6 caracteres. */
    public static boolean esContrasenaValida(String contrasena) {
        return contrasena != null && contrasena.length() >= 6;
    }

    /** Valida que un ID sea positivo. */
    public static boolean esIdValido(int id) {
        return id > 0;
    }
}
