package co.com.template.automation.testing.ui;

import net.serenitybdd.screenplay.targets.Target;

public class VehiculosPage {
    public static final Target BARRA_BUSQUEDA = Target.the("barra de búsqueda").locatedBy("#cb1-edit");
    public static final Target FILTRO_USADO = Target.the("filtro usado").locatedBy("#item_condition_highlighted");
    public static final Target RESULTADOS_BUSQUEDA = Target.the("resultados de búsqueda").locatedBy(".results-container");
    public static final Target MENSAJE_ERROR = Target.the("mensaje de error").locatedBy(".error-message");
}