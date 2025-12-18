package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import net.serenitybdd.screenplay.actions.Submit;
import static co.com.template.automation.testing.ui.CelularesPage.*;

public class CelularesTask {
    public static Task buscarCelulares() {
        return Task.where("Buscar celulares",
                Enter.theValue("celulares").into(BARRA_BUSQUEDA),
                Click.on(BOTON_BUSCAR)
        );
    }

    public static Task seleccionarMarcaHonor() {
        return Task.where("Seleccionar marca Honor",
                Click.on(FILTRO_MARCA)
        );
    }

    public static Task buscarProductoInexistente() {
        return Task.where("Buscar un producto inexistente",
                Enter.theValue("producto_inexistente").into(BARRA_BUSQUEDA),
                Click.on(BOTON_BUSCAR)
        );
    }
}