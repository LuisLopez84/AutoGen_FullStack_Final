package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import static net.serenitybdd.screenplay.Tasks.instrumented;
import static co.com.template.automation.testing.ui.ComPage.*;

public class ComTask {

    public static Task navigateToHomePage() {
        return instrumented(NavigateToHomePage.class);
    }

    public static Task searchForProduct(String product) {
        return instrumented(SearchForProduct.class, product);
    }

    public static Task selectProduct() {
        return instrumented(SelectProduct.class);
    }

    private static class NavigateToHomePage implements Task {
        @Override
        public <T extends Actor> void performAs(T actor) {
            // Logic to navigate to the homepage
        }
    }

    private static class SearchForProduct implements Task {
        private final String product;

        public SearchForProduct(String product) {
            this.product = product;
        }

        @Override
        public <T extends Actor> void performAs(T actor) {
            actor.attemptsTo(
                Enter.theValue(product).into(SEARCH_BAR),
                Click.on(SEARCH_BUTTON)
            );
        }
    }

    private static class SelectProduct implements Task {
        @Override
        public <T extends Actor> void performAs(T actor) {
            actor.attemptsTo(Click.on(PRODUCT_LIST));
        }
    }
}