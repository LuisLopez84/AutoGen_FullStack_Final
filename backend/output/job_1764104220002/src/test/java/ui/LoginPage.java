package ui;

import net.serenitybdd.screenplay.targets.Target;

public class LoginPage {
    public static final Target USERNAME_FIELD = Target.the("username field").locatedBy("input.oxd-input.oxd-input--focus");
    public static final Target PASSWORD_FIELD = Target.the("password field").locatedBy("input.oxd-input.oxd-input--focus");
}