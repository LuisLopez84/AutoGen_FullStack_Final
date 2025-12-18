package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.targets.Target;
import net.serenitybdd.screenplay.actors.OnStage;
import static net.serenitybdd.screenplay.actors.OnStage.theActorInTheSpotlight;

public class CelularesQuestion {

    public static Question<Boolean> verificarResultados() {
        return actor -> !theActorInTheSpotlight().asksFor(Target.the("resultados de búsqueda").resolveAll()).isEmpty();
    }

    public static Question<Boolean> verificarMarca(String marca) {
        return actor -> theActorInTheSpotlight().asksFor(Target.the("resultados de búsqueda").resolveAll()).stream()
                .anyMatch(producto -> producto.getText().contains(marca));
    }

    public static Question<Boolean> verificarMensajeError() {
        return actor -> !theActorInTheSpotlight().asksFor(Target.the("mensaje de error").resolveAll()).isEmpty();
    }
}