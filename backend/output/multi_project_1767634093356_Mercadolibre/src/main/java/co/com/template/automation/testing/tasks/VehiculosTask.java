package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import static co.com.template.automation.testing.ui.VehiculosPage.*;

public class VehiculosTask {

    public static Task navegarALaPaginaPrincipal() {
        return Task.where("navegar a la página principal",
            Click.on(BARRA_BUSQUEDA)
        );
    }

    public static Task buscarVehiculos() {
        return Task.where("buscar vehículos",
            Enter.theValue("Vehiculos").into(BARRA_BUSQUEDA).thenHit(Keys.ENTER)
        );
    }

    public static Task filtrarVehiculosUsados() {
        return Task.where("filtrar vehículos usados",
            Click.on(FILTRO_USADO)
        );
    }

    public static Task buscarTerminoVacio() {
        return Task.where("buscar término vacío",
            Enter.theValue("").into(BARRA_BUSQUEDA).thenHit(Keys.ENTER)
        );
    }
}