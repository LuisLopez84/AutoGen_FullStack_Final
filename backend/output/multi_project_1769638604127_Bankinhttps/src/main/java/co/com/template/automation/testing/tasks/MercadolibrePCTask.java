package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import net.serenitybdd.screenplay.actions.Open;
import co.com.template.automation.testing.ui.MercadolibrePCPage;

public class MercadolibrePCTask {
    public static Task NavigateToHomePage() {
        return Task.where("El usuario navega a la página de inicio",
                Open.url("https://www.mercadolibre.com.co/"));
    }

    public static Task SearchForProduct(String product) {
        return Task.where("El usuario busca un producto",
                Enter.theValue(product).into(MercadolibrePCPage.SEARCH_BAR),
                Click.on(MercadolibrePCPage.SEARCH_BUTTON));
    }

    public static Task SelectProduct() {
        return Task.where("El usuario selecciona un producto",
                Click.on(MercadolibrePCPage.PRODUCT_LINK));
    }
}