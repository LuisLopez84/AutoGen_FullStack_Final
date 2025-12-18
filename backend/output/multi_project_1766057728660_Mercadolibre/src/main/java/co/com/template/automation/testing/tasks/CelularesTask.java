package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import co.com.template.automation.testing.ui.CelularesPage;

public class CelularesTask {
    public static Task SearchFor(String product) {
        return Task.where("Buscar un producto",
                Enter.theValue(product).into(CelularesPage.SEARCH_BAR),
                Click.on(CelularesPage.SEARCH_BUTTON)
        );
    }

    public static Task FilterBy(String brand) {
        return Task.where("Filtrar por marca",
                Click.on(CelularesPage.FILTER_BRAND)
        );
    }

    public static Task NavigateTo.theHomePage() {
        return Task.where("Navegar a la página principal",
                // Implementar navegación a la página principal
        );
    }

    public static Task NavigateTo.theSearchResultsPage() {
        return Task.where("Navegar a la página de resultados de búsqueda",
                // Implementar navegación a la página de resultados
        );
    }
}