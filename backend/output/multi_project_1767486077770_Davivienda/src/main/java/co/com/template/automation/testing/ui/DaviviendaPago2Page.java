package co.com.template.automation.testing.ui;

import net.serenitybdd.screenplay.targets.Target;

public class DaviviendaPago2Page {
    public static final Target PAYMENT_OPTION = Target.the("opción de pago").locatedBy("css-selector-de-opcion-de-pago");
    public static final Target ACCOUNT_NUMBER_INPUT = Target.the("campo de número de cuenta").locatedBy("input[name='accountNumber']");
    public static final Target AMOUNT_INPUT = Target.the("campo de monto").locatedBy("input[name='amount']");
    public static final Target SUCCESS_MESSAGE = Target.the("mensaje de éxito").locatedBy("css-selector-de-mensaje-exito");
    public static final Target ZERO_AMOUNT_ERROR_MESSAGE = Target.the("mensaje de error por monto cero").locatedBy("css-selector-de-error-monto-cero");
    public static final Target INVALID_ACCOUNT_ERROR_MESSAGE = Target.the("mensaje de error por cuenta inválida").locatedBy("css-selector-de-error-cuenta-invalida");
}