package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import static co.com.template.automation.testing.ui.CelularesPage.*;

public class CelularesQuestion {

    public static Question<Boolean> verificarResultados() {
        return actor -> RESULTADOS_BUSQUEDA.resolveFor(actor).isVisible();
    }

    public static Question<Boolean> verificarResultadosFiltrados() {
        return actor -> RESULTADOS_BUSQUEDA.resolveFor(actor).isVisible();
    }

    public static Question<Boolean> verificarMensajeDeError() {
        return actor -> MENSAJE_ERROR.resolveFor(actor).isVisible();
    }
}