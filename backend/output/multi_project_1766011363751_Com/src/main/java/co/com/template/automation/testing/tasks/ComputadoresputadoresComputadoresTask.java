package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import net.serenitybdd.screenplay.actions.Open;
import co.com.template.automation.testing.ui.ComputadoresPage;

public class ComputadoresputadoresTask {

    public static Task navegarALaPaginaPrincipal() {
        return Task.where("navegar a la página principal",
            Open.url("https://www.mercadolibre.com.co/")
        );
    }

    public static Task buscarProducto(String producto) {
        return Task.where("buscar un producto",
            Enter.theValue(producto).into(ComputadoresPage.BARRA_BUSQUEDA()),
            Click.on(ComputadoresPage.BOTON_BUSCAR())
        );
    }

    public static Task seleccionarComputador() {
        return Task.where("seleccionar un computador",
            Click.on(ComputadoresPage.PRODUCTO_SELECCIONADO())
        );
    }
}