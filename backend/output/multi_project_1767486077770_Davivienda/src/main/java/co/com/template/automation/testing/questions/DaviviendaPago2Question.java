package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.targets.Target;

public class DaviviendaPago2Question {
    public static Question<Boolean> PaymentSuccessMessage() {
        return actor -> Target.the("mensaje de éxito").locatedBy("css-selector-de-mensaje-exito").resolveFor(actor).isDisplayed();
    }

    public static Question<Boolean> ZeroAmountErrorMessage() {
        return actor -> Target.the("mensaje de error por monto cero").locatedBy("css-selector-de-error-monto-cero").resolveFor(actor).isDisplayed();
    }

    public static Question<Boolean> InvalidAccountErrorMessage() {
        return actor -> Target.the("mensaje de error por cuenta inválida").locatedBy("css-selector-de-error-cuenta-invalida").resolveFor(actor).isDisplayed();
    }
}