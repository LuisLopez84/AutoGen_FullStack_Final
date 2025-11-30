package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.questions.WebElementQuestion;
import net.serenitybdd.screenplay.actors.OnStage;
import org.openqa.selenium.By;

public class UserQuestion {
    public static Question<String> title() {
        return WebElementQuestion.the(By.tagName("h1"));
    }
}