package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import static net.serenitybdd.screenplay.Tasks.instrumented;
import static co.com.template.automation.testing.ui.ComPage.*;

public class SearchForProduct implements Task {

    private final String product;

    public SearchForProduct(String product) {
        this.product = product;
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Enter.theValue(product).into(SEARCH_INPUT),
            Click.on(SEARCH_BUTTON)
        );
    }

    public static SearchForProduct withName(String product) {
        return instrumented(SearchForProduct.class, product);
    }
}