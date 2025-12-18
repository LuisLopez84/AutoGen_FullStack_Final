package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import net.serenitybdd.screenplay.actions.Open;
import co.com.template.automation.testing.ui.ComPage;

public class ComTask {
    public static Task navigateToHomePage() {
        return Task.where("el usuario navega a la página principal",
                Open.browserOn().the(ComPage.class)
        );
    }

    public static Task searchForProduct(String product) {
        return Task.where("el usuario busca un producto",
                Enter.theValue(product).into(ComPage.SEARCH_BAR),
                Click.on(ComPage.SEARCH_BUTTON)
        );
    }
}