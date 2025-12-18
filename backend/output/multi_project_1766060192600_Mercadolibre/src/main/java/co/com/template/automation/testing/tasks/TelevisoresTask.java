package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Click;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Open;
import co.com.template.automation.testing.ui.TelevisoresPage;

public class TelevisoresTask {
    public static Task navegarAPaginaPrincipal() {
        return Task.where("Navegar a la página principal",
            Open.url("https://www.mercadolibre.com.co/")
        );
    }

    public static Task buscarProducto(String producto) {
        return Task.where("Buscar un producto",
            Enter.theValue(producto).into(TelevisoresPage.BARRA_BUSQUEDA),
            Click.on(TelevisoresPage.BOTON_BUSCAR)
        );
    }

    public static Task navegarAPaginaResultados() {
        return Task.where("Navegar a la página de resultados",
            Open.url("https://listado.mercadolibre.com.co/televisores")
        );
    }

    public static Task seleccionarMarca(String marca) {
        return Task.where("Seleccionar una marca",
            Click.on(TelevisoresPage.FILTRO_MARCA)
        );
    }
}