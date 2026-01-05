package co.com.template.automation.testing.ui;

import net.serenitybdd.screenplay.targets.Target;

public class CamisetasPage {
    public static final Target BARRA_BUSQUEDA = Target.the("barra de búsqueda")
            .locatedBy("#cb1-edit");
    public static final Target RESULTADOS_BUSQUEDA = Target.the("resultados de búsqueda")
            .locatedBy("div.nav-bounds.nav-bounds-with-cart");
    public static final Target CAMISETA_SELECCIONADA = Target.the("camiseta seleccionada")
            .locatedBy("a.poly-component__title");
    public static final Target MENSAJE_ERROR = Target.the("mensaje de error")
            .locatedBy(".error-message");
}