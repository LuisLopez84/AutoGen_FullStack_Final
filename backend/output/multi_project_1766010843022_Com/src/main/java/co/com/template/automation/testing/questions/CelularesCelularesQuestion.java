package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import static co.com.template.automation.testing.ui.CelularesPage.*;

public class CelularesQuestion {
    public static Question<Boolean> resultadosDeBusqueda() {
        return actor -> !RESULTADOS_BUSQUEDA.resolveAllFor(actor).isEmpty();
    }

    public static Question<Boolean> mensajeDeErrorVisible() {
        return actor -> MENSAJE_ERROR.resolveFor(actor).isDisplayed();
    }
}