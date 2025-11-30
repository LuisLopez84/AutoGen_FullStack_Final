package co.com.template.automation.testing.definitions.commons;

import io.cucumber.java.en.*;
import net.serenitybdd.screenplay.actors.OnStage;
import co.com.template.automation.testing.tasks.UserTask;
import co.com.template.automation.testing.ui.LoginPage;

public class StepUrl {
    private LoginPage loginPage = new LoginPage();

    @Given("the user navigates to {string}")
    public void theUserNavigatesTo(String url) {
        OnStage.theActorInTheSpotlight().attemptsTo(new UserTask(loginPage));
    }
}