package co.com.template.automation.testing.definitions;

import io.cucumber.java.es.*;
import net.serenitybdd.screenplay.actors.OnStage;
import co.com.template.automation.testing.questions.UserQuestion;

public class FlujosDefinitions {
    @Then("the results should be verified")
    public void theResultsShouldBeVerified() {
        String title = UserQuestion.title().answeredBy(OnStage.theActorInTheSpotlight());
        // Add verification logic here
    }
}