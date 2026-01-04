package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import co.com.template.automation.testing.ui.DaviviendaPago2Page;

public class DaviviendaPago2Task {

    public static Task NavigateToDaviviendaPage() {
        return Task.where("Navigate to Davivienda page",
            Click.on(DaviviendaPago2Page.PAYMENT_OPTION)
        );
    }

    public static Task SelectPaymentOption() {
        return Task.where("Select payment option",
            Click.on(DaviviendaPago2Page.PAYMENT_OPTION)
        );
    }

    public static Task EnterValidAccountNumber() {
        return Task.where("Enter valid account number",
            Enter.theValue("123456789").into(DaviviendaPago2Page.ACCOUNT_NUMBER_INPUT)
        );
    }

    public static Task EnterValidAmount() {
        return Task.where("Enter valid amount",
            Enter.theValue("1000").into(DaviviendaPago2Page.AMOUNT_INPUT)
        );
    }

    public static Task EnterZeroAmount() {
        return Task.where("Enter zero amount",
            Enter.theValue("0").into(DaviviendaPago2Page.AMOUNT_INPUT)
        );
    }

    public static Task EnterInvalidAccountNumber() {
        return Task.where("Enter invalid account number",
            Enter.theValue("invalid").into(DaviviendaPago2Page.ACCOUNT_NUMBER_INPUT)
        );
    }
}