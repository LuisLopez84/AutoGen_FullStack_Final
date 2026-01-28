package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import co.com.template.automation.testing.ui.MercadolibrePCPage;
import net.serenitybdd.screenplay.questions.Text;

public class MercadolibrePCQuestion {
    public static Question<Boolean> ResultsAreDisplayed() {
        return actor -> !Text.of(MercadolibrePCPage.PRODUCT_LINK).viewedBy(actor).isEmpty();
    }

    public static Question<Boolean> ProductPageIsDisplayed() {
        return actor -> // lógica para verificar si la página del producto está visible
    }

    public static Question<Boolean> ErrorMessageIsDisplayed() {
        return actor -> !Text.of(MercadolibrePCPage.ERROR_MESSAGE).viewedBy(actor).isEmpty();
    }
}