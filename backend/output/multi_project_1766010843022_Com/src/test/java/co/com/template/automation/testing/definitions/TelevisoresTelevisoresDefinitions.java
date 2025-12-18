package co.com.template.automation.testing.definitions;

import net.serenitybdd.screenplay.annotations.Step;
import net.serenitybdd.screenplay.Given;
import net.serenitybdd.screenplay.When;
import net.serenitybdd.screenplay.Then;
import co.com.template.automation.testing.tasks.TelevisoresTask;
import co.com.template.automation.testing.questions.TelevisoresQuestion;

public class TelevisoresDefinitions {

    @Given("el usuario navega a la página principal de Mercado Libre")
    public void elUsuarioNavegaALaPaginaPrincipal() {
        // Implementación de la navegación a la página principal
        TelevisoresTask.navegarAPaginaPrincipal().performAs(actor);
    }

    @When("busca 'televisores' en la barra de búsqueda")
    public void buscaTelevisoresEnLaBarraDeBusqueda() {
        // Implementación de la búsqueda de televisores
        TelevisoresTask.buscarProducto("televisores").performAs(actor);
    }

    @Then("debe ver una lista de resultados de búsqueda")
    public void debeVerResultadosDeBusqueda() {
        // Implementación de la validación de resultados
        Ensure.that(TelevisoresQuestion.verificarResultados()).isTrue();
    }

    @Given("el usuario navega a la página de resultados de búsqueda de televisores")
    public void elUsuarioNavegaAPaginaResultados() {
        // Implementación de la navegación a la página de resultados
        TelevisoresTask.navegarAPaginaResultados().performAs(actor);
    }

    @When("selecciona un televisor de la lista")
    public void seleccionaUnTelevisorDeLaLista() {
        // Implementación de la selección de un televisor
        TelevisoresTask.seleccionarTelevisor().performAs(actor);
    }

    @Then("debe ver la página de detalles del televisor")
    public void debeVerPaginaDetallesTelevisor() {
        // Implementación de la validación de la página de detalles
        Ensure.that(TelevisoresQuestion.verificarPaginaDetalles()).isTrue();
    }

    @When("busca 'producto_inexistente' en la barra de búsqueda")
    public void buscaProductoInexistenteEnLaBarraDeBusqueda() {
        // Implementación de la búsqueda de un producto inexistente
        TelevisoresTask.buscarProducto("producto_inexistente").performAs(actor);
    }

    @Then("debe ver un mensaje de error indicando que no se encontraron resultados")
    public void debeVerMensajeDeError() {
        // Implementación de la validación del mensaje de error
        Ensure.that(TelevisoresQuestion.verificarMensajeError()).isTrue();
    }
}