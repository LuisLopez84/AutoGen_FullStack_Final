package co.com.template.automation.testing.definitions;

import net.serenitybdd.screenplay.annotations.Step;
import net.serenitybdd.screenplay.actors.OnStage;
import co.com.template.automation.testing.tasks.ComputadoresTask;
import co.com.template.automation.testing.questions.ComputadoresQuestion;

public class ComputadoresputadoresDefinitions {

    @Given("el usuario navega a la página principal de Mercado Libre")
    public void elUsuarioNavegaALaPaginaPrincipal() {
        OnStage.theActorInTheSpotlight().attemptsTo(ComputadoresTask.navegarALaPaginaPrincipal());
    }

    @When("el usuario ingresa '{string}' en la barra de búsqueda")
    public void elUsuarioIngresaEnLaBarraDeBusqueda(String producto) {
        OnStage.theActorInTheSpotlight().attemptsTo(ComputadoresTask.ingresarProductoEnLaBusqueda(producto));
    }

    @When("el usuario envía el formulario de búsqueda")
    public void elUsuarioEnvioElFormularioDeBusqueda() {
        OnStage.theActorInTheSpotlight().attemptsTo(ComputadoresTask.enviarFormularioDeBusqueda());
    }

    @Then("debe ver una lista de resultados de búsqueda de computadores")
    public void debeVerResultadosDeBusqueda() {
        OnStage.theActorInTheSpotlight().should(Ensure.that(ComputadoresQuestion.resultadosDeBusqueda()).isNotEmpty());
    }

    @When("el usuario selecciona un computador de la lista")
    public void elUsuarioSeleccionaUnComputador() {
        OnStage.theActorInTheSpotlight().attemptsTo(ComputadoresTask.seleccionarComputador());
    }

    @Then("debe ver la página de detalles del computador seleccionado")
    public void debeVerPaginaDeDetalles() {
        OnStage.theActorInTheSpotlight().should(Ensure.that(ComputadoresQuestion.paginaDeDetalles()).isDisplayed());
    }

    @When("el usuario ingresa '{string}' en la barra de búsqueda")
    public void elUsuarioIngresaProductoInexistente(String producto) {
        OnStage.theActorInTheSpotlight().attemptsTo(ComputadoresTask.ingresarProductoEnLaBusqueda(producto));
    }

    @Then("debe ver un mensaje de error indicando que no se encontraron resultados")
    public void debeVerMensajeDeError() {
        OnStage.theActorInTheSpotlight().should(Ensure.that(ComputadoresQuestion.mensajeDeError()).isDisplayed());
    }
}