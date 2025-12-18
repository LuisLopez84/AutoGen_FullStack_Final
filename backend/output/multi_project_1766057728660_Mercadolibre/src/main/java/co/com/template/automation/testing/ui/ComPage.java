package co.com.template.automation.testing.ui;

import net.serenitybdd.screenplay.targets.Target;

public class ComPage {
    public static final Target SEARCH_BAR = Target.the("barra de búsqueda")
            .locatedBy("#cb1-edit");
    public static final Target SEARCH_BUTTON = Target.the("botón de búsqueda")
            .locatedBy("button.nav-search-btn");
    public static final Target PRODUCT_LIST = Target.the("lista de productos")
            .locatedBy(".ui-search-link");
    public static final Target ERROR_MESSAGE = Target.the("mensaje de error")
            .locatedBy(".ui-search-error-message");
}