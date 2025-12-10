package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.ensure.Ensure;
import static co.com.template.automation.testing.ui.ComPage.SEARCH_RESULTS;

public class SearchResults implements Question<Boolean> {

    @Override
    public Boolean answeredBy(Actor actor) {
        actor.attemptsTo(
            Ensure.that(SEARCH_RESULTS).isDisplayed()
        );
        return true;
    }

    public static Question<Boolean> displayed() {
        return new SearchResults();
    }
}