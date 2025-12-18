package co.com.template.automation.testing.definitions;

import net.serenitybdd.screenplay.annotations.Step;
import net.serenitybdd.screenplay.actors.OnStage;
import co.com.template.automation.testing.tasks.TelevisoresTask;
import co.com.template.automation.testing.questions.TelevisoresQuestion;

public class TelevisoresDefinitions {

    @Given("el usuario navega a la página principal de Mercado Libre")
    public void elUsuarioNavegaAPaginaPrincipal() {
        OnStage.theActorInTheSpotlight().attemptsTo(TelevisoresTask.navegarAPaginaPrincipal());
    }

    @When("busca 'televisores' en la barra de búsqueda")
    public void buscaTelevisoresEnLaBarraDeBusqueda() {
        OnStage.theActorInTheSpotlight().attemptsTo(TelevisoresTask.buscarProducto("televisores"));
    }

    @Then("debe ver una lista de resultados de búsqueda")
    public void debeVerResultadosDeBusqueda() {
        OnStage.theActorInTheSpotlight().should(Ensure.that(TelevisoresQuestion.verificarResultados()).isTrue());
    }

    @Given("el usuario navega a la página de resultados de búsqueda de televisores")
    public void elUsuarioNavegaAPaginaResultados() {
        OnStage.theActorInTheSpotlight().attemptsTo(TelevisoresTask.navegarAPaginaResultados());
    }

    @When("selecciona la marca 'Hyundai'")
    public void seleccionaMarcaHyundai() {
        OnStage.theActorInTheSpotlight().attemptsTo(TelevisoresTask.seleccionarMarca("Hyundai"));
    }

    @Then("debe ver resultados filtrados por la marca seleccionada")
    public void debeVerResultadosFiltrados() {
        OnStage.theActorInTheSpotlight().should(Ensure.that(TelevisoresQuestion.verificarFiltradoPorMarca()).isTrue());
    }

    @When("busca 'televisor que no existe' en la barra de búsqueda")
    public void buscaTelevisorInexistente() {
        OnStage.theActorInTheSpotlight().attemptsTo(TelevisoresTask.buscarProducto("televisor que no existe"));
    }

    @Then("debe ver un mensaje de error indicando que no se encontraron resultados")
    public void debeVerMensajeDeError() {
        OnStage.theActorInTheSpotlight().should(Ensure.that(TelevisoresQuestion.verificarMensajeDeError()).isTrue());
    }
}