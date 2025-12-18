package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import co.com.template.automation.testing.ui.ComPage;
import static net.serenitybdd.screenplay.actors.OnStage.theActorInTheSpotlight;

public class ComQuestion {

    public static Question<Boolean> ResultadosDeBusqueda() {
        return actor -> ComPage.RESULTADOS_BUSQUEDA.resolveFor(actor).isDisplayed();
    }

    public static Question<Boolean> MensajeDeError() {
        return actor -> ComPage.MENSAJE_ERROR.resolveFor(actor).isDisplayed();
    }
}