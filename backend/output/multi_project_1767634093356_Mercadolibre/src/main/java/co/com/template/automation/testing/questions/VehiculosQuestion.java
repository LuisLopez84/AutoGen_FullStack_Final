package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import static co.com.template.automation.testing.ui.VehiculosPage.*;

public class VehiculosQuestion {

    public static Question<Boolean> verificarResultados() {
        return actor -> RESULTADOS_BUSQUEDA.resolveFor(actor).isVisible();
    }

    public static Question<Boolean> verificarVehiculosUsados() {
        return actor -> // lógica para verificar que solo se muestran vehículos usados;
    }

    public static Question<Boolean> verificarMensajeDeError() {
        return actor -> MENSAJE_ERROR.resolveFor(actor).isVisible();
    }
}