package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import static co.com.template.automation.testing.ui.TelevisoresPage.*;

public class TelevisoresQuestion {

    public static Question<Boolean> resultadosDeBusqueda() {
        return actor -> !RESULTADOS_BUSQUEDA.resolveFor(actor).isEmpty();
    }

    public static Question<Boolean> mensajeDeErrorVisible() {
        return actor -> MENSAJE_ERROR.resolveFor(actor).isDisplayed();
    }
}