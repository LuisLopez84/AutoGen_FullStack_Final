package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import static co.com.template.automation.testing.ui.TelevisoresPage.*;

public class TelevisoresTask {
    public static Task buscarTelevisores() {
        return Task.where("Buscar televisores",
                Enter.theValue("televisores").into(BARRA_BUSQUEDA),
                Click.on(BOTON_BUSCAR)
        );
    }

    public static Task filtrarPorMarca() {
        return Task.where("Filtrar por marca",
                Click.on(FILTRO_MARCA)
        );
    }

    public static Task buscarTelevisoresInexistentes() {
        return Task.where("Buscar televisores inexistentes",
                Enter.theValue("televisores que no existen").into(BARRA_BUSQUEDA),
                Click.on(BOTON_BUSCAR)
        );
    }
}