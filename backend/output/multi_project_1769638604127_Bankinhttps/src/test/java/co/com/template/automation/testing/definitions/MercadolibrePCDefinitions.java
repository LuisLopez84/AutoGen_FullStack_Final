package co.com.template.automation.testing.definitions;

import net.serenitybdd.screenplay.annotations.Step;
import net.serenitybdd.screenplay.Given;
import net.serenitybdd.screenplay.When;
import net.serenitybdd.screenplay.Then;
import co.com.template.automation.testing.tasks.*;
import co.com.template.automation.testing.questions.*;

public class MercadolibrePCDefinitions {

    @Given("el usuario navega a la página de inicio de Mercado Libre")
    public void elUsuarioNavegaAPaginaDeInicio() {
        // Implementación de la navegación a la página de inicio
        actor.attemptsTo(NavigateToHomePage.instrumented());
    }

    @When("el usuario ingresa 'computadores' en la barra de búsqueda")
    public void elUsuarioIngresaEnLaBarraDeBusqueda() {
        // Implementación de la búsqueda
        actor.attemptsTo(SearchForProduct.instrumented("computadores"));
    }

    @Then("el usuario debe ver una lista de resultados de búsqueda")
    public void elUsuarioVeResultadosDeBusqueda() {
        // Implementación de la validación de resultados
        Ensure.that(ResultsAreDisplayed.question()).isTrue();
    }

    @When("el usuario busca 'computadores' y selecciona un producto")
    public void elUsuarioSeleccionaUnProducto() {
        // Implementación de la selección de un producto
        actor.attemptsTo(SelectProduct.instrumented());
    }

    @Then("el usuario debe ser redirigido a la página del producto")
    public void elUsuarioEsRedirigidoAPaginaDelProducto() {
        // Implementación de la validación de redirección
        Ensure.that(ProductPageIsDisplayed.question()).isTrue();
    }

    @When("el usuario ingresa 'producto_inexistente' en la barra de búsqueda")
    public void elUsuarioIngresaProductoInexistente() {
        // Implementación de la búsqueda de un producto inexistente
        actor.attemptsTo(SearchForProduct.instrumented("producto_inexistente"));
    }

    @Then("el usuario debe ver un mensaje de error indicando que no se encontraron resultados")
    public void elUsuarioVeMensajeDeError() {
        // Implementación de la validación de mensaje de error
        Ensure.that(ErrorMessageIsDisplayed.question()).isTrue();
    }
}