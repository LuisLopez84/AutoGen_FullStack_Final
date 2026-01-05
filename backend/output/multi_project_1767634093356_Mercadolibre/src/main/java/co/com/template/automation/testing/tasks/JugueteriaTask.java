package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import static net.serenitybdd.screenplay.Tasks.instrumented;
import co.com.template.automation.testing.ui.JugueteriaPage;

public class JugueteriaTask {

    public static Task navegarAPaginaPrincipal() {
        return instrumented(NavegarAPaginaPrincipal.class);
    }

    public static Task buscarProducto(String producto) {
        return instrumented(BuscarProducto.class, producto);
    }

    public static Task seleccionarProducto() {
        return instrumented(SeleccionarProducto.class);
    }

    public static class NavegarAPaginaPrincipal implements Task {
        @Override
        public <T extends Actor> void performAs(T actor) {
            actor.attemptsTo(
                Open.url("https://www.mercadolibre.com.co/")
            );
        }
    }

    public static class BuscarProducto implements Task {
        private final String producto;

        public BuscarProducto(String producto) {
            this.producto = producto;
        }

        @Override
        public <T extends Actor> void performAs(T actor) {
            actor.attemptsTo(
                Enter.theValue(producto).into(JugueteriaPage.BARRA_BUSQUEDA),
                Click.on(JugueteriaPage.BARRA_BUSQUEDA)
            );
        }
    }

    public static class SeleccionarProducto implements Task {
        @Override
        public <T extends Actor> void performAs(T actor) {
            actor.attemptsTo(
                Click.on(JugueteriaPage.PRODUCTO_SELECCIONADO)
            );
        }
    }
}