package co.com.template.automation.testing.definitions.commons;

import io.cucumber.java.en.Given;
import net.serenitybdd.screenplay.actions.Open;
import net.serenitybdd.screenplay.actors.OnStage;

public class StepUrl {

    @Given("{string} opens the application")
    public void userOpensTheApplication(String actorName) {
        OnStage.theActorCalled(actorName);
        OnStage.theActorInTheSpotlight().attemptsTo(
            Open.browserOn().thePageNamed("pages.url")
        );
    }
}