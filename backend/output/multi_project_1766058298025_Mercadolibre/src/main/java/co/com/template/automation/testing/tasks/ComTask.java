package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import net.serenitybdd.screenplay.actions.Open;
import co.com.template.automation.testing.ui.ComPage;

public class ComTask {

    public static Task VisitarLaPaginaPrincipal() {
        return Task.where("Visitar la página principal de Mercado Libre",
                Open.url("https://www.mercadolibre.com.co/"));
    }

    public static Task BuscarProducto(String producto) {
        return Task.where("Buscar un producto",
                Enter.theValue(producto).into(ComPage.BARRA_DE_BUSQUEDA()),
                Click.on(ComPage.BOTON_BUSCAR()));
    }

    public static Task BuscarProductoSinTexto() {
        return Task.where("Buscar sin texto",
                Click.on(ComPage.BOTON_BUSCAR()));
    }
}