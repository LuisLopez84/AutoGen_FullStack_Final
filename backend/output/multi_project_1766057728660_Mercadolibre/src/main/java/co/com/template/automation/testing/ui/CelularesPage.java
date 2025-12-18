package co.com.template.automation.testing.ui;

import net.serenitybdd.screenplay.targets.Target;

public class CelularesPage {
    public static final Target SEARCH_BAR = Target.the("barra de búsqueda")
            .locatedBy("#cb1-edit");
    public static final Target SEARCH_BUTTON = Target.the("botón de búsqueda")
            .locatedBy("button.nav-search-btn");
    public static final Target FILTER_BRAND = Target.the("filtro de marca")
            .locatedBy("span.ui-search-filter-name");
    public static final Target ERROR_MESSAGE = Target.the("mensaje de error")
            .locatedBy(".ui-search-error-message");
}