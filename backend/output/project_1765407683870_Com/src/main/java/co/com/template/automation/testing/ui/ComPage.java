package co.com.template.automation.testing.ui;

import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.screenplay.targets.Target;

public class ComPage extends PageObject {
    
    public static final Target SEARCH_INPUT = Target
        .the("search input field")
        .locatedBy("#cb1-edit");

    public static final Target SEARCH_BUTTON = Target
        .the("search button")
        .locatedBy(".nav-search-btn");

    public static final Target SEARCH_RESULTS = Target
        .the("search results").locatedBy(".search-results");
}