package co.acegrasco.util;

import co.acegrasco.modelo.Empleado;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.Locale;

/**
 * Clase GeneradorPdf
 * Genera certificados laborales en PDF con diseño corporativo Acegrasco S.A.
 * Usa la librería iText 7.
 *
 * NOTA: recibe el nombre del empleado como parámetro separado porque
 *       ese dato viene de la tabla 'usuarios', no de 'empleados'.
 *
 * Paquete: co.acegrasco.util
 */
public class GeneradorPdf {

    // Colores corporativos Acegrasco
    private static final DeviceRgb AZUL_OSCURO = new DeviceRgb(15,  52,  96);
    private static final DeviceRgb DORADO      = new DeviceRgb(241, 196, 15);
    private static final DeviceRgb BLANCO      = new DeviceRgb(255, 255, 255);
    private static final DeviceRgb GRIS_TEXTO  = new DeviceRgb(40,  40,  40);
    private static final DeviceRgb GRIS_LINEA  = new DeviceRgb(210, 210, 210);

    /**
     * Genera el PDF del certificado laboral.
     *
     * @param tipo          "todos" | "sin_basico" | "con_extras"
     * @param empleado      objeto Empleado con datos laborales
     * @param nombreEmpleado nombre completo (viene de la tabla usuarios)
     * @param consecutivo   número de consecutivo del certificado
     * @return bytes del PDF generado
     */
    public static byte[] generar(String tipo, Empleado empleado,
                                  String nombreEmpleado, int consecutivo) throws Exception {

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter   writer = new PdfWriter(baos);
        PdfDocument pdf    = new PdfDocument(writer);
        Document    doc    = new Document(pdf, PageSize.A4);
        doc.setMargins(0, 40, 30, 40);

        PdfFont bold    = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
        PdfFont regular = PdfFontFactory.createFont(StandardFonts.HELVETICA);

        String hoy = LocalDate.now().getDayOfMonth() + " de " +
                     LocalDate.now().getMonth().getDisplayName(TextStyle.FULL, new Locale("es","CO")) +
                     " de " + LocalDate.now().getYear();

        String tituloDoc = switch (tipo) {
            case "sin_basico" -> "CERTIFICACIÓN LABORAL (SIN SALARIO BÁSICO)";
            case "con_extras" -> "CARTA LABORAL CON PROMEDIO DE HORAS EXTRAS";
            default           -> "CERTIFICACIÓN LABORAL";
        };

        // ─── ENCABEZADO AZUL ─────────────────────────────────────────
        Table header = new Table(UnitValue.createPercentArray(new float[]{1}))
                .setWidth(UnitValue.createPercentValue(100));
        Cell headerCell = new Cell()
                .setBackgroundColor(AZUL_OSCURO)
                .setPadding(18).setBorder(Border.NO_BORDER);
        headerCell.add(new Paragraph("ACEGRASCO S.A.")
                .setFont(bold).setFontSize(18).setFontColor(DORADO)
                .setTextAlignment(TextAlignment.CENTER).setMarginBottom(4));
        headerCell.add(new Paragraph("Portal de Autogestión — Recursos Humanos")
                .setFont(regular).setFontSize(10).setFontColor(BLANCO)
                .setTextAlignment(TextAlignment.CENTER).setMarginBottom(3));
        headerCell.add(new Paragraph("Calle 15 #5-23, Bogotá  |  (+57) 301 2952356  |  info@acegrasco.com.co")
                .setFont(regular).setFontSize(8).setFontColor(BLANCO)
                .setTextAlignment(TextAlignment.CENTER));
        header.addCell(headerCell);
        doc.add(header);

        // ─── TÍTULO ────────────────────────────────────────────────
        doc.add(new Paragraph(tituloDoc)
                .setFont(bold).setFontSize(13).setFontColor(AZUL_OSCURO)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(20).setMarginBottom(4));
        doc.add(new LineSeparator(new com.itextpdf.kernel.pdf.canvas.draw.SolidLine(0.8f))
                .setStrokeColor(DORADO).setMarginBottom(14));

        // ─── CONSECUTIVO ───────────────────────────────────────────
        doc.add(new Paragraph("Consecutivo N.° " + String.format("%04d", consecutivo))
                .setFont(regular).setFontSize(9)
                .setFontColor(new DeviceRgb(100,100,100))
                .setTextAlignment(TextAlignment.RIGHT).setMarginBottom(10));

        // ─── ENCABEZADO CARTA ──────────────────────────────────────
        doc.add(new Paragraph("Bogotá D.C., " + hoy)
                .setFont(regular).setFontSize(10).setFontColor(GRIS_TEXTO).setMarginBottom(8));
        doc.add(new Paragraph("A quien pueda interesar:")
                .setFont(regular).setFontSize(10).setFontColor(GRIS_TEXTO).setMarginBottom(8));
        doc.add(new Paragraph("La empresa ACEGRASCO S.A. certifica que el/la señor(a):")
                .setFont(regular).setFontSize(10).setFontColor(GRIS_TEXTO).setMarginBottom(10));

        // ─── TABLA DATOS EMPLEADO ──────────────────────────────────
        Table datos = new Table(UnitValue.createPercentArray(new float[]{40, 60}))
                .setWidth(UnitValue.createPercentValue(100)).setMarginBottom(14);

        // Nombre viene de la tabla usuarios (parámetro separado)
        agregarFila(datos, "Nombre completo",
                nombreEmpleado != null && !nombreEmpleado.isBlank() ? nombreEmpleado : "—",
                bold, regular);
        agregarFila(datos, "Cédula de ciudadanía",
                empleado.getCedula() != null ? empleado.getCedula() : "—", bold, regular);
        agregarFila(datos, "Cargo",
                empleado.getCargo() != null ? empleado.getCargo() : "—", bold, regular);
        agregarFila(datos, "Área / Departamento",
                empleado.getArea() != null ? empleado.getArea() : "—", bold, regular);
        agregarFila(datos, "Fecha de ingreso",
                empleado.getFechaIngreso() != null
                        ? empleado.getFechaIngreso().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                        : "—", bold, regular);

        if ("todos".equals(tipo) && empleado.getSalario() != null) {
            String salarioFmt = "$ " + String.format("%,.0f", empleado.getSalario())
                    .replace(",", ".");
            agregarFila(datos, "Salario básico mensual", salarioFmt, bold, regular);
        }
        if ("con_extras".equals(tipo) && empleado.getPromedioHorasExtras() != null) {
            agregarFila(datos, "Prom. horas extras (últ. 3 meses)",
                    empleado.getPromedioHorasExtras() + " horas", bold, regular);
        }

        doc.add(datos);

        // ─── PÁRRAFO LEGAL ─────────────────────────────────────────
        doc.add(new LineSeparator(new com.itextpdf.kernel.pdf.canvas.draw.SolidLine(0.3f))
                .setStrokeColor(GRIS_LINEA).setMarginBottom(10));

        String parrafo = switch (tipo) {
            case "sin_basico" ->
                "Se certifica que el/la empleado(a) se encuentra activo(a) en nuestra empresa, " +
                "desempeñando las funciones de su cargo con contrato a término indefinido. " +
                "Esta certificación se expide sin mencionar el salario.";
            case "con_extras" ->
                "Se certifica que el/la empleado(a) se encuentra activo(a), devengando el salario " +
                "indicado más un promedio de horas extras de los últimos tres (3) meses, conforme " +
                "al Código Sustantivo del Trabajo.";
            default ->
                "Se certifica que el/la empleado(a) se encuentra activo(a) en nuestra empresa, " +
                "devengando el salario básico mensual indicado con todos los beneficios de ley " +
                "del Código Sustantivo del Trabajo de Colombia.";
        };

        doc.add(new Paragraph(parrafo)
                .setFont(regular).setFontSize(9.5f).setFontColor(GRIS_TEXTO)
                .setTextAlignment(TextAlignment.JUSTIFIED).setMarginBottom(8));
        doc.add(new Paragraph(
                "La presente certificación se expide con veracidad y es válida a la fecha indicada.")
                .setFont(regular).setFontSize(9.5f).setFontColor(GRIS_TEXTO).setMarginBottom(24));

        // ─── FIRMA ─────────────────────────────────────────────────
        doc.add(new Paragraph("______________________________")
                .setFont(bold).setFontSize(10).setFontColor(AZUL_OSCURO).setMarginBottom(4));
        doc.add(new Paragraph("Recursos Humanos — Acegrasco S.A.")
                .setFont(bold).setFontSize(10).setFontColor(AZUL_OSCURO).setMarginBottom(4));
        doc.add(new Paragraph("Firma autorizada / Sello empresa")
                .setFont(regular).setFontSize(9).setFontColor(new DeviceRgb(100,100,100)));

        // ─── PIE AZUL ──────────────────────────────────────────────
        doc.add(new Paragraph("\n\n"));
        Table pie = new Table(UnitValue.createPercentArray(new float[]{1}))
                .setWidth(UnitValue.createPercentValue(100));
        Cell pieCell = new Cell()
                .setBackgroundColor(AZUL_OSCURO).setPadding(10).setBorder(Border.NO_BORDER);
        pieCell.add(new Paragraph(
                "Portal de Autogestión Acegrasco © 2026  |  Documento generado electrónicamente  |  " +
                "Consecutivo N.° " + String.format("%04d", consecutivo))
                .setFont(regular).setFontSize(8).setFontColor(DORADO)
                .setTextAlignment(TextAlignment.CENTER));
        pie.addCell(pieCell);
        doc.add(pie);

        doc.close();
        return baos.toByteArray();
    }

    private static void agregarFila(Table tabla, String label, String valor,
                                     PdfFont bold, PdfFont regular) {
        tabla.addCell(new Cell()
                .add(new Paragraph(label + ":").setFont(bold).setFontSize(9.5f).setFontColor(AZUL_OSCURO))
                .setBorder(Border.NO_BORDER).setPaddingLeft(4).setPaddingBottom(5));
        tabla.addCell(new Cell()
                .add(new Paragraph(valor).setFont(regular).setFontSize(9.5f).setFontColor(GRIS_TEXTO))
                .setBorder(Border.NO_BORDER).setPaddingBottom(5));
    }
}
