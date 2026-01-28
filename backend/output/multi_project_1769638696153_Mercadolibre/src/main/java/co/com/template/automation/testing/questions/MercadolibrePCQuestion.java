package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import static co.com.template.automation.testing.ui.MercadolibrePCPage.*;

public class MercadolibrePCQuestion {

    public static Question<Boolean> isDisplayed() {
        return actor -> PRODUCT_LINK.resolveFor(actor).isVisible();
    }

    public static Question<Boolean> errorMessageIsDisplayed() {
        return actor -> ERROR_MESSAGE.resolveFor(actor).isVisible();
    }
}