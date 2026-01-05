package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import static net.serenitybdd.screenplay.actors.OnStage.theActorInTheSpotlight;
import co.com.template.automation.testing.ui.CamisetasPage;

public class CamisetasQuestion {
    public static Question<Boolean> resultadosDeCamisetas() {
        return actor -> !theActorInTheSpotlight().asksFor(CamisetasPage.RESULTADOS_BUSQUEDA()).isEmpty();
    }

    public static Question<Boolean> mensajeDeError() {
        return actor -> !theActorInTheSpotlight().asksFor(CamisetasPage.MENSAJE_ERROR()).isEmpty();
    }
}