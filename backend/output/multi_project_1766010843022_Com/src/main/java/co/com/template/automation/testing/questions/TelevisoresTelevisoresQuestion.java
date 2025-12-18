package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import co.com.template.automation.testing.ui.TelevisoresPage;

public class TelevisoresQuestion {
    public static Question<Boolean> verificarResultados() {
        return actor -> !TelevisoresPage.RESULTADOS_BUSQUEDA().resolveFor(actor).isEmpty();
    }

    public static Question<Boolean> verificarPaginaDetalles() {
        return actor -> // Implementación para verificar la página de detalles
    }

    public static Question<Boolean> verificarMensajeError() {
        return actor -> TelevisoresPage.MENSAJE_ERROR().resolveFor(actor).isDisplayed();
    }
}