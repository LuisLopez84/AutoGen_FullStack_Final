package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import net.serenitybdd.screenplay.actions.Submit;
import static co.com.template.automation.testing.ui.MercadolibrePCPage.*;

public class MercadolibrePCTask {

    public static Task NavigateToMercadoLibrePage() {
        return Task.where("el usuario navega a la página principal",
                // Aquí se puede agregar la acción de navegación si es necesario
        );
    }

    public static Task SearchForProduct(String product) {
        return Task.where("el usuario busca un producto",
                Enter.theValue(product).into(SEARCH_BAR),
                Submit.theForm(SEARCH_FORM)
        );
    }

    public static Task SelectProduct() {
        return Task.where("el usuario selecciona un producto",
                Click.on(PRODUCT_LINK)
        );
    }
}