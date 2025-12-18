package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import net.serenitybdd.screenplay.actions.Open;
import co.com.template.automation.testing.ui.CelularesPage;

public class CelularesTask {

    public static Task navegarALaPaginaPrincipal() {
        return Task.where("navegar a la página principal",
                Open.browserOn().the(CelularesPage.class)
        );
    }

    public static Task buscarProducto(String producto) {
        return Task.where("buscar un producto",
                Enter.theValue(producto).into(CelularesPage.BARRA_BUSQUEDA),
                Click.on(CelularesPage.BOTON_BUSCAR)
        );
    }

    public static Task navegarAPaginaResultados() {
        return Task.where("navegar a la página de resultados",
                Open.browserOn().the(CelularesPage.class)
        );
    }

    public static Task seleccionarMarca(String marca) {
        return Task.where("seleccionar una marca",
                Click.on(CelularesPage.FILTRO_MARCA)
        );
    }
}