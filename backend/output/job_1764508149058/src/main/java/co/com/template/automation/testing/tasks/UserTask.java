package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Open;
import co.com.template.automation.testing.ui.LoginPage;
import net.serenitybdd.screenplay.Actor;

public class UserTask implements Task {
    private final LoginPage loginPage;

    public UserTask(LoginPage loginPage) {
        this.loginPage = loginPage;
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(Open.browserOn(loginPage));
    }
}