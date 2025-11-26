package questions;

import net.serenitybdd.screenplay.Question;

public class LoginStatusQuestion {
    public static Question<Boolean> isLoggedIn() {
        return actor -> {
            // Logic to determine if user is logged in
            return true;
        };
    }
}