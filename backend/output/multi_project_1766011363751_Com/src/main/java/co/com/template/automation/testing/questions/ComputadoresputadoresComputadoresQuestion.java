package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.questions.Text;
import co.com.template.automation.testing.ui.ComputadoresPage;

public class ComputadoresputadoresQuestion {
    public static Question<String> mensajeError() {
        return Question.about("mensaje de error").answeredBy(actor -> Text.of(ComputadoresPage.MENSAJE_ERROR()).viewedBy(actor).asString());
    }

    public static Question<Boolean> hayResultados() {
        return Question.about("hay resultados").answeredBy(actor -> !Text.of(ComputadoresPage.RESULTADOS_BUSQUEDA()).viewedBy(actor).asString().isEmpty());
    }
}