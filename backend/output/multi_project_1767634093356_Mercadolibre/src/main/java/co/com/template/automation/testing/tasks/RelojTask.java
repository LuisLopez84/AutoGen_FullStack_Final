package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import net.serenitybdd.screenplay.actions.Open;
import co.com.template.automation.testing.ui.RelojPage;
import net.serenitybdd.screenplay.actors.Actor;

public class RelojTask {

    public static Task navegarAPaginaPrincipal() {
        return Task.where("Navegar a la página principal",
                Open.url("https://www.mercadolibre.com.co/"));
    }

    public static Task buscarProducto(String busqueda) {
        return Task.where("Buscar producto",
                Enter.theValue(busqueda).into(RelojPage.BARRA_BUSQUEDA),
                Click.on(RelojPage.BARRA_BUSQUEDA));
    }

    public static Task seleccionarReloj() {
        return Task.where("Seleccionar un reloj",
                Click.on(RelojPage.ENLACE_RELOJ));
    }
}