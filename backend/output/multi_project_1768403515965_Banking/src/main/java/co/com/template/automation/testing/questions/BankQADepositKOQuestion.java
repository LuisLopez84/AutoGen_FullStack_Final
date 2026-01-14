package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import static net.serenitybdd.screenplay.actors.OnStage.theActorInTheSpotlight;
import co.com.template.automation.testing.ui.BankQADepositKOPage;

public class BankQADepositKOQuestion {

    public static Question<String> successMessage() {
        return actor -> BankQADepositKOPage.SUCCESS_MESSAGE.resolveFor(theActorInTheSpotlight()).getText();
    }

    public static Question<String> errorMessage() {
        return actor -> BankQADepositKOPage.ERROR_MESSAGE.resolveFor(theActorInTheSpotlight()).getText();
    }
}