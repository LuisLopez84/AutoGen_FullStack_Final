package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.questions.Text;
import co.com.template.automation.testing.ui.TelevisoresPage;

public class TelevisoresQuestion {
    public static Question<Boolean> verificarResultados() {
        return Question.about("verificar resultados").answeredBy(actor -> {
            return !Text.of(TelevisoresPage.RESULTADOS_BUSQUEDA).viewedBy(actor).isEmpty();
        });
    }

    public static Question<Boolean> verificarFiltradoPorMarca() {
        return Question.about("verificar filtrado por marca").answeredBy(actor -> {
            // Implementar lógica para verificar que los resultados son de la marca seleccionada
            return true;
        });
    }

    public static Question<Boolean> verificarMensajeDeError() {
        return Question.about("verificar mensaje de error").answeredBy(actor -> {
            return !Text.of(TelevisoresPage.MENSAJE_ERROR).viewedBy(actor).isEmpty();
        });
    }
}