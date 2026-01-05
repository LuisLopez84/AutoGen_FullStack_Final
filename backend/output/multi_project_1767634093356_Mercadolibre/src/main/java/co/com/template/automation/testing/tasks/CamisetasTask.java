package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import co.com.template.automation.testing.ui.CamisetasPage;

public class CamisetasTask {
    public static Task buscarCamisetas() {
        return Task.where("Buscar camisetas",
                Enter.theValue("camisetas").into(CamisetasPage.BARRA_BUSQUEDA()),
                Click.on(CamisetasPage.RESULTADOS_BUSQUEDA())
        );
    }

    public static Task seleccionarCamiseta() {
        return Task.where("Seleccionar camiseta",
                Click.on(CamisetasPage.CAMISETA_SELECCIONADA())
        );
    }

    public static Task buscarCamisetasSinConexion() {
        return Task.where("Buscar camisetas sin conexión",
                // Implementación para simular la falta de conexión
        );
    }
}