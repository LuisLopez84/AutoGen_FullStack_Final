package co.com.template.automation.testing.ui;

import net.serenitybdd.screenplay.targets.Target;

public class BankQAConsultaCuentaPage {
    public static final Target EMAIL_FIELD = Target.the("campo de correo electrónico").locatedBy("#email");
    public static final Target PASSWORD_FIELD = Target.the("campo de contraseña").locatedBy("#password");
    public static final Target LOGIN_BUTTON = Target.the("botón de inicio de sesión").locatedBy("button[type='submit']");
    public static final Target ERROR_MESSAGE = Target.the("mensaje de error").locatedBy(".error-message");
}