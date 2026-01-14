package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import co.com.template.automation.testing.ui.BankQADepositKOPage;

public class BankQADepositKOTask {

    public static Task login(String email, String password) {
        return Task.where("El usuario inicia sesión",
            Enter.theValue(email).into(BankQADepositKOPage.EMAIL_FIELD),
            Enter.theValue(password).into(BankQADepositKOPage.PASSWORD_FIELD),
            Click.on(BankQADepositKOPage.LOGIN_BUTTON)
        );
    }

    public static Task deposit(String amount) {
        return Task.where("El usuario realiza un depósito",
            Enter.theValue(amount).into(BankQADepositKOPage.DEPOSIT_AMOUNT_FIELD),
            Click.on(BankQADepositKOPage.CONFIRM_BUTTON)
        );
    }
}