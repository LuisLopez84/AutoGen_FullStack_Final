package co.com.template.automation.testing.ui;

import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.screenplay.targets.Target;

public class LoginPage extends PageObject {
    
    // Username field
    public static final Target USERNAME_FIELD = Target
        .the("username field")
        .locatedBy("input[name='username']");
    
    // Password field
    public static final Target PASSWORD_FIELD = Target
        .the("password field")
        .locatedBy("input[name='password']");
    
    // Login button
    public static final Target LOGIN_BUTTON = Target
        .the("login button")
        .locatedBy("button[type='submit']");
}