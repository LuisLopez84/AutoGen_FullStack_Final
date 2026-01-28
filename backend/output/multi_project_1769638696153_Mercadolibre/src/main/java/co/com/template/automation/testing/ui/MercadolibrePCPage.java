package co.com.template.automation.testing.ui;

import net.serenitybdd.screenplay.targets.Target;

public class MercadolibrePCPage {
    public static final Target SEARCH_BAR = Target.the("barra de búsqueda")
            .locatedBy("#cb1-edit");
    public static final Target SEARCH_FORM = Target.the("formulario de búsqueda")
            .locatedBy("form.nav-search.nav-search-with-sugestions");
    public static final Target PRODUCT_LINK = Target.the("enlace del producto")
            .locatedBy("a.poly-component__link.poly-component__link--carousel");
    public static final Target ERROR_MESSAGE = Target.the("mensaje de error")
            .locatedBy(".error-message-selector");
}