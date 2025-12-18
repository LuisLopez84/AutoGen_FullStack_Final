package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import static co.com.template.automation.testing.ui.TelevisoresPage.RESULTADOS_BUSQUEDA;

public class TelevisoresQuestion {
    public static Question<Boolean> hayResultados() {
        return actor -> RESULTADOS_BUSQUEDA.resolveFor(actor).isVisible();
    }

    public static Question<String> mensajeDeError() {
        return actor -> {
            // Implementación para obtener el mensaje de error
            return "No se encontraron resultados";
        };
    }
}