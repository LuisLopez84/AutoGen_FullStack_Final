package co.com.template.automation.testing.ui;

import net.serenitybdd.screenplay.targets.Target;

public class RelojPage {
    public static final Target BARRA_BUSQUEDA = Target.the("barra de búsqueda")
            .locatedBy("#cb1-edit");
    public static final Target RESULTADOS_BUSQUEDA = Target.the("resultados de búsqueda")
            .locatedBy(".ui-search-result");
    public static final Target ENLACE_RELOJ = Target.the("enlace del reloj seleccionado")
            .locatedBy("a.ui-search-link");
    public static final Target MENSAJE_SIN_RESULTADOS = Target.the("mensaje sin resultados")
            .locatedBy(".ui-search-no-results");
}