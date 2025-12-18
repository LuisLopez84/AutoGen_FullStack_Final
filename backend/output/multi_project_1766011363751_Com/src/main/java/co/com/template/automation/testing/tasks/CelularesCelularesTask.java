package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import net.serenitybdd.screenplay.actions.Submit;
import net.serenitybdd.screenplay.actors.Actor;
import co.com.template.automation.testing.ui.CelularesPage;

public class CelularesTask {

    public static Task NavigateToHomePage() {
        return Task.where("el usuario navega a la página principal",
                Click.on(CelularesPage.SEARCH_BAR)
        );
    }

    public static Task SearchFor(String product) {
        return Task.where("el usuario busca un producto",
                Enter.theValue(product).into(CelularesPage.SEARCH_BAR),
                Click.on(CelularesPage.SEARCH_BUTTON)
        );
    }

    public static Task FilterBy(String brand) {
        return Task.where("el usuario filtra por marca",
                Click.on(CelularesPage.BRAND_FILTER)
        );
    }
}