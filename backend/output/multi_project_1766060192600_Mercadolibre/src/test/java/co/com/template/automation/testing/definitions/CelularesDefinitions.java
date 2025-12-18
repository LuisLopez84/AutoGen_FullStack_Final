package co.com.template.automation.testing.definitions;

import net.serenitybdd.screenplay.annotations.Step;
import net.serenitybdd.screenplay.actors.OnStage;
import co.com.template.automation.testing.tasks.CelularesTask;
import co.com.template.automation.testing.questions.CelularesQuestion;

public class CelularesDefinitions {

    @Given("el usuario navega a la página principal de Mercado Libre")
    public void elUsuarioNavegaALaPaginaPrincipal() {
        OnStage.theActorInTheSpotlight().attemptsTo(CelularesTask.navegarALaPaginaPrincipal());
    }

    @When("busca 'celulares' en la barra de búsqueda")
    public void buscaCelularesEnLaBarraDeBusqueda() {
        OnStage.theActorInTheSpotlight().attemptsTo(CelularesTask.buscarProducto("celulares"));
    }

    @Then("debe ver una lista de resultados de búsqueda")
    public void debeVerResultadosDeBusqueda() {
        OnStage.theActorInTheSpotlight().should(Ensure.that(CelularesQuestion.verificarResultados()).isTrue());
    }

    @Given("el usuario navega a la página de resultados de búsqueda de celulares")
    public void elUsuarioNavegaAPaginaResultados() {
        OnStage.theActorInTheSpotlight().attemptsTo(CelularesTask.navegarAPaginaResultados());
    }

    @When("selecciona la marca 'Honor'")
    public void seleccionaMarcaHonor() {
        OnStage.theActorInTheSpotlight().attemptsTo(CelularesTask.seleccionarMarca("Honor"));
    }

    @Then("debe ver productos de la marca 'Honor'")
    public void debeVerProductosMarcaHonor() {
        OnStage.theActorInTheSpotlight().should(Ensure.that(CelularesQuestion.verificarMarca("Honor")).isTrue());
    }

    @When("busca 'producto_inexistente' en la barra de búsqueda")
    public void buscaProductoInexistente() {
        OnStage.theActorInTheSpotlight().attemptsTo(CelularesTask.buscarProducto("producto_inexistente"));
    }

    @Then("debe ver un mensaje de error indicando que no se encontraron resultados")
    public void debeVerMensajeDeError() {
        OnStage.theActorInTheSpotlight().should(Ensure.that(CelularesQuestion.verificarMensajeError()).isTrue());
    }
}