package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Open;
import co.com.template.automation.testing.ui.DaviviendaPago2Page;
import net.serenitybdd.screenplay.actors.Actor;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;

public class DaviviendaPago2Task {

    public static Task NavigateToDaviviendaPage() {
        return Task.where("el usuario navega a la página principal de Davivienda",
            Open.url("https://www.davivienda.com/")
        );
    }

    public static Task SelectPaymentOption() {
        return Task.where("el usuario selecciona la opción de pago",
            Click.on(DaviviendaPago2Page.PAYMENT_OPTION_BUTTON)
        );
    }

    public static Task EnterAccountNumber(String accountNumber) {
        return Task.where("el usuario ingresa el número de cuenta",
            Enter.theValue(accountNumber).into(DaviviendaPago2Page.ACCOUNT_NUMBER_INPUT)
        );
    }

    public static Task EnterPaymentAmount(String amount) {
        return Task.where("el usuario ingresa el monto",
            Enter.theValue(amount).into(DaviviendaPago2Page.AMOUNT_INPUT)
        );
    }

    public static Task VerifySuccessMessage() {
        return Task.where("verifica el mensaje de éxito",
            // Implementar verificación del mensaje de éxito
        );
    }

    public static Task VerifyErrorMessage() {
        return Task.where("verifica el mensaje de error",
            // Implementar verificación del mensaje de error
        );
    }
}