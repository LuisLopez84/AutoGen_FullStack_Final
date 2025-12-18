package co.com.template.automation.testing.ui;

import net.serenitybdd.screenplay.targets.Target;

public class ComputadoresputadoresPage {
    public static final Target BARRA_BUSQUEDA = Target.the("barra de búsqueda")
            .locatedBy("#cb1-edit");
    public static final Target BOTON_BUSCAR = Target.the("botón de búsqueda")
            .locatedBy("button.nav-search-btn");
    public static final Target RESULTADOS_BUSQUEDA = Target.the("resultados de búsqueda")
            .locatedBy(".ui-search-result");
    public static final Target MENSAJE_ERROR = Target.the("mensaje de error")
            .locatedBy(".ui-search-error");
    public static final Target TITULO_COMPUTADOR = Target.the("título del computador")
            .locatedBy("a.poly-component__title");
}