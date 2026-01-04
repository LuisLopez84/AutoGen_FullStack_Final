package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import co.com.template.automation.testing.ui.DaviviendaPagoPage;

public class DaviviendaPagoTask {
    public static Task ingresarDatosPago(String numeroPapel, String total) {
        return Task.where("Ingresar datos de pago",
            Click.on(DaviviendaPagoPage.SERVICIO_ACUEDUCTO),
            Enter.theValue(numeroPapel).into(DaviviendaPagoPage.NUMERO_PAPEL),
            Enter.theValue(total).into(DaviviendaPagoPage.TOTAL_PAGAR)
        );
    }
}