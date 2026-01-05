package co.com.template.automation.testing.definitions;

import net.serenitybdd.screenplay.annotations.Step;
import co.com.template.automation.testing.tasks.JugueteriaTask;
import co.com.template.automation.testing.questions.JugueteriaQuestion;

public class JugueteriaDefinitions {

    @Given("el usuario navega a la página principal de Mercado Libre")
    public void elUsuarioNavegaAPaginaPrincipal() {
        // Implementación de la navegación a la página principal
        JugueteriaTask.navegarAPaginaPrincipal();
    }

    @When("el usuario ingresa '{string}' en la barra de búsqueda")
    public void elUsuarioIngresaEnLaBarraDeBusqueda(String producto) {
        // Implementación de la búsqueda
        JugueteriaTask.buscarProducto(producto);
    }

    @Then("debe ver una lista de resultados relacionados con '{string}'")
    public void debeVerResultadosRelacionados(String producto) {
        // Implementación de la validación de resultados
        Ensure.that(JugueteriaQuestion.resultadosDeBusqueda(producto)).isDisplayed();
    }

    @When("el usuario selecciona un producto de la lista")
    public void elUsuarioSeleccionaUnProducto() {
        // Implementación de la selección de un producto
        JugueteriaTask.seleccionarProducto();
    }

    @Then("debe ser redirigido a la página del producto seleccionado")
    public void debeSerRedirigidoAPaginaDelProducto() {
        // Implementación de la validación de redirección
        Ensure.that(JugueteriaQuestion.paginaDelProducto()).isDisplayed();
    }

    @When("el usuario ingresa '{string}' en la barra de búsqueda")
    public void elUsuarioIngresaProductoInexistente(String producto) {
        // Implementación de la búsqueda de un producto inexistente
        JugueteriaTask.buscarProducto(producto);
    }

    @Then("debe ver un mensaje indicando que no se encontraron resultados")
    public void debeVerMensajeSinResultados() {
        // Implementación de la validación de mensaje de error
        Ensure.that(JugueteriaQuestion.mensajeSinResultados()).isDisplayed();
    }
}