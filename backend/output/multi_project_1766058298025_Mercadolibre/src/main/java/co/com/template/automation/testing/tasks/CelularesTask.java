package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import static co.com.template.automation.testing.ui.CelularesPage.*;

public class CelularesTask {

    public static Task navegarALaPaginaPrincipal() {
        return Task.where("navegar a la página principal",
                Click.on(BARRA_BUSQUEDA)
        );
    }

    public static Task buscarCelulares() {
        return Task.where("buscar celulares",
                Enter.theValue("celulares").into(BARRA_BUSQUEDA),
                Click.on(BOTON_BUSCAR)
        );
    }

    public static Task navegarAPaginaResultados() {
        return Task.where("navegar a la página de resultados",
                Click.on(RESULTADOS_BUSQUEDA)
        );
    }

    public static Task seleccionarMarcaHonor() {
        return Task.where("seleccionar marca Honor",
                Click.on(FILTRO_MARCA)
        );
    }

    public static Task buscarProductoInexistente() {
        return Task.where("buscar un producto inexistente",
                Enter.theValue("producto_inexistente").into(BARRA_BUSQUEDA),
                Click.on(BOTON_BUSCAR)
        );
    }
}