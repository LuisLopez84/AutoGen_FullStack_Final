package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import co.com.template.automation.testing.ui.DaviviendaPagoPage;

public class DaviviendaPagoTask {

    public static Task navegarAPaginaPrincipal() {
        return Task.where("Navegar a la página principal",
                Click.on(DaviviendaPagoPage.SERVICIO_ACUEDUCTO)
        );
    }

    public static Task seleccionarServicio() {
        return Task.where("Seleccionar servicio",
                Click.on(DaviviendaPagoPage.SERVICIO_ACUEDUCTO)
        );
    }

    public static Task ingresarNumeroDePapel(String numeroPapel) {
        return Task.where("Ingresar número de papel",
                Enter.theValue(numeroPapel).into(DaviviendaPagoPage.NUMERO_PAPEL)
        );
    }

    public static Task ingresarTotalAPagar(String total) {
        return Task.where("Ingresar total a pagar",
                Enter.theValue(total).into(DaviviendaPagoPage.TOTAL_PAGAR)
        );
    }
}