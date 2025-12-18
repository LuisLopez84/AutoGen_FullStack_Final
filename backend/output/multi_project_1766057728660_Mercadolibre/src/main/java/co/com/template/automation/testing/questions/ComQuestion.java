package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import static co.com.template.automation.testing.ui.ComPage.*;

public class ComQuestion {

    public static Question<Boolean> resultsAreDisplayed() {
        return actor -> PRODUCT_LIST.resolveFor(actor).isVisible();
    }

    public static Question<Boolean> productPageIsDisplayed() {
        return actor -> // Logic to verify product page is displayed;
    }

    public static Question<Boolean> errorMessageIsDisplayed() {
        return actor -> ERROR_MESSAGE.resolveFor(actor).isVisible();
    }
}