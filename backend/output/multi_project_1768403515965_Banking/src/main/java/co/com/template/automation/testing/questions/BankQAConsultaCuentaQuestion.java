package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import static co.com.template.automation.testing.ui.BankQAConsultaCuentaPage.ERROR_MESSAGE;

public class BankQAConsultaCuentaQuestion {
    public static Question<String> errorMessage() {
        return actor -> ERROR_MESSAGE.resolveFor(actor).getText();
    }
}