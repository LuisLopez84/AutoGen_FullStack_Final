package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.actors.OnStage;
import co.com.template.automation.testing.ui.CelularesPage;

public class CelularesQuestion {

    public static Question<Boolean> SearchResults() {
        return actor -> !OnStage.theActorInTheSpotlight().asksFor(CelularesPage.PRODUCT_LIST).isEmpty();
    }

    public static Question<Boolean> ErrorMessage() {
        return actor -> OnStage.theActorInTheSpotlight().asksFor(CelularesPage.ERROR_MESSAGE).isDisplayed();
    }
}