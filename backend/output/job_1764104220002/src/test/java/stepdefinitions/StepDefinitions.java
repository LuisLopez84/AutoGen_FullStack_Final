package stepdefinitions;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;

public class StepDefinitions {
    @Given("the user is on the login page")
    public void theUserIsOnTheLoginPage() {
        // Navigate to login page
    }

    @When("the user enters username and password")
    public void theUserEntersUsernameAndPassword() {
        // Enter credentials
    }

    @Then("the user should be logged in")
    public void theUserShouldBeLoggedIn() {
        // Verify login
    }
}