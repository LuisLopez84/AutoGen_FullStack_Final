package co.com.template.automation.testing.ui;

import net.serenitybdd.core.pages.PageObject;
import org.openqa.selenium.By;

public class TelevisoresPage extends PageObject {
    public static final By BARRA_BUSQUEDA = By.cssSelector("#cb1-edit");
    public static final By BOTON_BUSCAR = By.cssSelector("button.nav-search-btn");
    public static final By FILTRO_MARCA = By.cssSelector("span.ui-search-filter-name");
    public static final By RESULTADOS_BUSQUEDA = By.cssSelector("a.ui-search-link");
    public static final By MENSAJE_ERROR = By.cssSelector(".ui-search-error-message");
}