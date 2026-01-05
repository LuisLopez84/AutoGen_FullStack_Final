package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import co.com.template.automation.testing.ui.JugueteriaPage;

public class JugueteriaQuestion {

    public static Question<Boolean> resultadosDeBusqueda(String producto) {
        return actor -> !JugueteriaPage.RESULTADOS_BUSQUEDA.resolveFor(actor).isEmpty();
    }

    public static Question<Boolean> paginaDelProducto() {
        return actor -> JugueteriaPage.PRODUCTO_SELECCIONADO.resolveFor(actor).isDisplayed();
    }

    public static Question<Boolean> mensajeSinResultados() {
        return actor -> JugueteriaPage.MENSAJE_SIN_RESULTADOS.resolveFor(actor).isDisplayed();
    }
}