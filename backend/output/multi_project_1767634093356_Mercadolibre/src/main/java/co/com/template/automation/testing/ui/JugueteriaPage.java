package co.com.template.automation.testing.ui;

import net.serenitybdd.screenplay.targets.Target;

public class JugueteriaPage {
    public static final Target BARRA_BUSQUEDA = Target.the("barra de búsqueda")
            .locatedBy("#cb1-edit");
    public static final Target RESULTADOS_BUSQUEDA = Target.the("resultados de búsqueda")
            .locatedBy(".ui-search-result");
    public static final Target MENSAJE_SIN_RESULTADOS = Target.the("mensaje sin resultados")
            .locatedBy(".ui-search-no-results");
    public static final Target PRODUCTO_SELECCIONADO = Target.the("producto seleccionado")
            .locatedBy(".poly-component__link");
}