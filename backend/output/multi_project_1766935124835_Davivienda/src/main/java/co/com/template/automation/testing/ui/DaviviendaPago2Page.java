package co.com.template.automation.testing.ui;

import net.serenitybdd.screenplay.targets.Target;

public class DaviviendaPago2Page {
    public static final Target PAGE_TITLE = Target.the("título de la página").locatedBy("h1.page-title");
    public static final Target PAYMENT_OPTION_BUTTON = Target.the("botón de opción de pago").locatedBy("span.ButtonCorestyle__StyledButtonCoreBlock-canvas-core__sc-v39ho0-1.bfdKLe.ButtonCore__block");
    public static final Target ACCOUNT_NUMBER_INPUT = Target.the("campo de número de cuenta").locatedBy("input.Zgj7Oz_fol4bc2YwRJHc");
    public static final Target AMOUNT_INPUT = Target.the("campo de monto").locatedBy("input.Zgj7Oz_fol4bc2YwRJHc");
    public static final Target SUCCESS_MESSAGE = Target.the("mensaje de éxito").locatedBy("div.success-message");
    public static final Target ERROR_MESSAGE = Target.the("mensaje de error").locatedBy("div.error-message");
}