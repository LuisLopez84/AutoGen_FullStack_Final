package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import net.serenitybdd.screenplay.actions.Submit;
import static co.com.template.automation.testing.ui.ComputadoresPage.*;

public class ComputadoresputadoresTask {

    public static Task navegarALaPaginaPrincipal() {
        return Task.where("navegar a la página principal",
                Click.on(BARRA_BUSQUEDA)
        );
    }

    public static Task ingresarProductoEnLaBusqueda(String producto) {
        return Task.where("ingresar producto en la búsqueda",
                Enter.theValue(producto).into(BARRA_BUSQUEDA)
        );
    }

    public static Task enviarFormularioDeBusqueda() {
        return Task.where("enviar formulario de búsqueda",
                Click.on(BOTON_BUSCAR)
        );
    }

    public static Task seleccionarComputador() {
        return Task.where("seleccionar un computador",
                Click.on(TITULO_COMPUTADOR)
        );
    }
}