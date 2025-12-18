package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import co.com.template.automation.testing.ui.ComPage;

public class ComQuestion {
    public static Question<Boolean> searchResultsAreDisplayed(String searchTerm) {
        return actor -> !ComPage.SEARCH_RESULTS.resolveFor(actor).isEmpty();
    }

    public static Question<Boolean> noResultsMessageIsDisplayed() {
        return actor -> ComPage.NO_RESULTS_MESSAGE.resolveFor(actor).isDisplayed();
    }
}