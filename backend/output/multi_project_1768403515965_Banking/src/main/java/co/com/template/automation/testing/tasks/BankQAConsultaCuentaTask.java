package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import static co.com.template.automation.testing.ui.BankQAConsultaCuentaPage.*;

public class BankQAConsultaCuentaTask {
    public static Task loginWithValidCredentials(String email, String password) {
        return Task.where("El usuario inicia sesión con credenciales válidas",
            Enter.theValue(email).into(EMAIL_FIELD),
            Enter.theValue(password).into(PASSWORD_FIELD),
            Click.on(LOGIN_BUTTON)
        );
    }

    public static Task loginWithInvalidCredentials(String email, String password) {
        return Task.where("El usuario intenta iniciar sesión con credenciales inválidas",
            Enter.theValue(email).into(EMAIL_FIELD),
            Enter.theValue(password).into(PASSWORD_FIELD),
            Click.on(LOGIN_BUTTON)
        );
    }
}