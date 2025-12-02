package co.com.template.automation.testing.definitions;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
import net.serenitybdd.screenplay.actors.OnStage;

import static co.com.template.automation.testing.tasks.UserTask.*;
import static co.com.template.automation.testing.questions.UserQuestion.*;

public class FlujosDefinitions {

    @Given("the user is on the login page")
    public void userIsOnLoginPage() {
        OnStage.theActorInTheSpotlight().attemptsTo(
            // Open the application
        );
    }

    @When("the user logs in with {string} and {string}")
    public void userLogsIn(String username, String password) {
        OnStage.theActorInTheSpotlight().attemptsTo(
            loginWithCredentials(username, password)
        );
    }

    @Then("the user should see their username displayed")
    public void userShouldSeeUsername() {
        OnStage.theActorInTheSpotlight().should(
            seeThat(displayedUsername(), equalTo("expected_username"))
        );
    }
}