package co.com.template.automation.testing.ui;

import net.serenitybdd.screenplay.targets.Target;

public class ComPage {
    public static final Target SEARCH_BAR = Target.the("barra de búsqueda")
            .locatedBy("#cb1-edit");
    public static final Target SEARCH_BUTTON = Target.the("botón de búsqueda")
            .locatedBy("button.nav-search-btn");
    public static final Target SEARCH_RESULTS = Target.the("resultados de búsqueda")
            .locatedBy(".ui-search-result");
    public static final Target NO_RESULTS_MESSAGE = Target.the("mensaje de no resultados")
            .locatedBy(".no-results-message");
}