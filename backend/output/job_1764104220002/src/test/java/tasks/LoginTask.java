package tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import static commons.StepUrl.BASE_URL;
import static net.serenitybdd.screenplay.Tasks.instrumented;

public class LoginTask implements Task {
    private final String username;
    private final String password;

    public LoginTask(String username, String password) {
        this.username = username;
        this.password = password;
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Enter.theValue(username).into(ShadowDomUtils.getShadowElement(getDriver(), "vaadin-form-layout", "vaadin-text-field", "input")),
            Enter.theValue(password).into(ShadowDomUtils.getShadowElement(getDriver(), "vaadin-form-layout", "vaadin-password-field", "input"))
        );
    }

    public static LoginTask withCredentials(String username, String password) {
        return instrumented(LoginTask.class, username, password);
    }
}