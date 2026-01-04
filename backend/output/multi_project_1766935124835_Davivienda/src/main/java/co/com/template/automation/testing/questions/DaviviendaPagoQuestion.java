package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import co.com.template.automation.testing.ui.DaviviendaPagoPage;

public class DaviviendaPagoQuestion {
    public static Question<String> mensajeConfirmacion() {
        return actor -> DaviviendaPagoPage.MENSAJE_CONFIRMACION.resolveFor(actor).getText();
    }

    public static Question<String> mensajeError() {
        return actor -> DaviviendaPagoPage.MENSAJE_ERROR.resolveFor(actor).getText();
    }
}