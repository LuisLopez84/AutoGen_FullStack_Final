package co.com.template.automation.testing.ui;

import net.serenitybdd.screenplay.targets.Target;

public class BankQADepositKOPage {
    public static final Target EMAIL_FIELD = Target.the("campo de correo electrónico").locatedBy("#email");
    public static final Target PASSWORD_FIELD = Target.the("campo de contraseña").locatedBy("#password");
    public static final Target LOGIN_BUTTON = Target.the("botón de inicio de sesión").locatedBy("button.MuiButton-contained");
    public static final Target ACCOUNT_SECTION = Target.the("sección de cuentas").locatedBy("button.MuiButton-text");
    public static final Target DEPOSIT_AMOUNT_FIELD = Target.the("campo de monto de depósito").locatedBy("#«r2l»");
    public static final Target CONFIRM_BUTTON = Target.the("botón de confirmar depósito").locatedBy("button.MuiButton-contained");
    public static final Target SUCCESS_MESSAGE = Target.the("mensaje de éxito").locatedBy(".success-message");
    public static final Target ERROR_MESSAGE = Target.the("mensaje de error").locatedBy(".error-message");
}