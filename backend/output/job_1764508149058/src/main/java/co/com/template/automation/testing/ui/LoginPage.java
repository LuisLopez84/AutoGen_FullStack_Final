package co.com.template.automation.testing.ui;

import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.screenplay.targets.Target;

public class LoginPage extends PageObject {
    public static final Target USERNAME_FIELD = Target.the("username field").located(By.id("username"));
    public static final Target PASSWORD_FIELD = Target.the("password field").located(By.id("password"));
    public static final Target LOGIN_BUTTON = Target.the("login button").located(By.id("login"));
}