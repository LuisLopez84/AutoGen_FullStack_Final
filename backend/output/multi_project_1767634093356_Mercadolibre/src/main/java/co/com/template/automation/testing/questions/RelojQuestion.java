package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.questions.Text;
import co.com.template.automation.testing.ui.RelojPage;

public class RelojQuestion {

    public static Question<Boolean> verificarResultados(String busqueda) {
        return actor -> Text.of(RelojPage.RESULTADOS_BUSQUEDA).contains(busqueda);
    }

    public static Question<Boolean> verificarPaginaDetalles() {
        return actor -> Text.of(RelojPage.ENLACE_RELOJ).isDisplayed();
    }

    public static Question<Boolean> verificarMensajeSinResultados() {
        return actor -> Text.of(RelojPage.MENSAJE_SIN_RESULTADOS).isDisplayed();
    }
}