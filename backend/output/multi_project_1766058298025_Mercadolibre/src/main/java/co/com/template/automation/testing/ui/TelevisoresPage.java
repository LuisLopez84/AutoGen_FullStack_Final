package co.com.template.automation.testing.ui;

import net.serenitybdd.screenplay.targets.Target;

public class TelevisoresPage {
    public static final Target BARRA_BUSQUEDA = Target.the("barra de búsqueda")
            .locatedBy("#cb1-edit");
    public static final Target BOTON_BUSCAR = Target.the("botón de búsqueda")
            .locatedBy("button.nav-search-btn");
    public static final Target RESULTADOS_BUSQUEDA = Target.the("resultados de búsqueda")
            .locatedBy(".ui-search-link");
    public static final Target FILTRO_MARCA = Target.the("filtro de marca")
            .locatedBy("span.ui-search-filter-name");
    public static final Target TELEVISOR_TITULO = Target.the("título del televisor")
            .locatedBy("a.poly-component__title");
}