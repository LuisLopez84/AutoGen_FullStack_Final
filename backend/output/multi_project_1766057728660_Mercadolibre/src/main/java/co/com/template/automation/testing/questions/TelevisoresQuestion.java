package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.targets.Target;
import static net.serenitybdd.screenplay.actors.OnStage.theActorInTheSpotlight;

public class TelevisoresQuestion {

    public static Question<String> resultadosDeBusqueda() {
        return actor -> theActorInTheSpotlight().asksFor(Target.the("resultados de búsqueda").resolveAll().size());
    }

    public static Question<String> mensajeDeError() {
        return actor -> Target.the("mensaje de error").resolveFor(actor).getText();
    }

    public static Question<String> urlDelProducto() {
        return actor -> theActorInTheSpotlight().asksFor(Target.the("url del producto").resolveFor(actor).getAttribute("href"));
    }
}