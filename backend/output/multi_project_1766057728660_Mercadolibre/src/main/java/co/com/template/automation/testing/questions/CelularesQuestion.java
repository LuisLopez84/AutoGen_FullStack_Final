package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import co.com.template.automation.testing.ui.CelularesPage;

public class CelularesQuestion {
    public static Question<Boolean> SearchResults() {
        return actor -> CelularesPage.SEARCH_RESULTS.resolveFor(actor).isVisible();
    }

    public static Question<Boolean> FilterResults(String brand) {
        return actor -> CelularesPage.FILTER_RESULTS.resolveFor(actor).isVisible();
    }

    public static Question<Boolean> ErrorMessage() {
        return actor -> CelularesPage.ERROR_MESSAGE.resolveFor(actor).isVisible();
    }
}