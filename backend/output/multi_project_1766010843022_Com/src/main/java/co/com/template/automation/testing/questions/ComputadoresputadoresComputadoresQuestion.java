package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import static co.com.template.automation.testing.ui.ComputadoresPage.*;

public class ComputadoresputadoresQuestion {

    public static Question<Boolean> resultadosDeBusqueda() {
        return Question.about("resultados de búsqueda").answeredBy(actor -> !RESULTADOS_BUSQUEDA.resolveAllFor(actor).isEmpty());
    }

    public static Question<Boolean> paginaDeDetalles() {
        return Question.about("página de detalles").answeredBy(actor -> TITULO_COMPUTADOR.resolveFor(actor).isDisplayed());
    }

    public static Question<Boolean> mensajeDeError() {
        return Question.about("mensaje de error").answeredBy(actor -> MENSAJE_ERROR.resolveFor(actor).isDisplayed());
    }
}