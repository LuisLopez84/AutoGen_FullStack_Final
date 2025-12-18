package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import net.serenitybdd.screenplay.actions.Open;
import co.com.template.automation.testing.ui.TelevisoresPage;
import net.serenitybdd.screenplay.Actor;

public class TelevisoresTask {
    public static Task navegarAPaginaPrincipal() {
        return Task.where("navegar a la página principal",
            Open.url("https://www.mercadolibre.com.co/")
        );
    }

    public static Task buscarProducto(String producto) {
        return Task.where("buscar un producto",
            Enter.theValue(producto).into(TelevisoresPage.BARRA_BUSQUEDA()),
            Click.on(TelevisoresPage.BOTON_BUSCAR())
        );
    }

    public static Task navegarAPaginaResultados() {
        return Task.where("navegar a la página de resultados",
            // Implementación para navegar a la página de resultados
        );
    }

    public static Task seleccionarTelevisor() {
        return Task.where("seleccionar un televisor",
            Click.on(TelevisoresPage.TELEVISOR_TITULO())
        );
    }
}