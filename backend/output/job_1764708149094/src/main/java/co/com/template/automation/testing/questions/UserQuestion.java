package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.questions.Text;

import static co.com.template.automation.testing.ui.UserPage.USERNAME_DISPLAY;

public class UserQuestion {

    public static Question<String> displayedUsername() {
        return actor -> Text.of(USERNAME_DISPLAY).viewedBy(actor).asString();
    }
}