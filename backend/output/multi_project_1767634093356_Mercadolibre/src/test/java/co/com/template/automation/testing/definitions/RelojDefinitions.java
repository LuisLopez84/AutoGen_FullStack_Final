package co.com.template.automation.testing.definitions;

import net.serenitybdd.screenplay.annotations.Step;
import co.com.template.automation.testing.tasks.RelojTask;
import net.serenitybdd.screenplay.actors.OnStage;

public class RelojDefinitions {

    @Given("el usuario navega a la página principal de Mercado Libre")
    public void elUsuarioNavegaAPaginaPrincipal() {
        OnStage.theActorInTheSpotlight().attemptsTo(RelojTask.navegarAPaginaPrincipal());
    }

    @When("el usuario ingresa '{string}' en la barra de búsqueda")
    public void elUsuarioIngresaEnLaBarraDeBusqueda(String busqueda) {
        OnStage.theActorInTheSpotlight().attemptsTo(RelojTask.buscarProducto(busqueda));
    }

    @Then("debe ver una lista de resultados relacionados con '{string}'")
    public void debeVerResultados(String busqueda) {
        OnStage.theActorInTheSpotlight().should(RelojQuestion.verificarResultados(busqueda));
    }

    @When("el usuario selecciona un reloj de la lista")
    public void elUsuarioSeleccionaUnReloj() {
        OnStage.theActorInTheSpotlight().attemptsTo(RelojTask.seleccionarReloj());
    }

    @Then("debe ser redirigido a la página de detalles del reloj seleccionado")
    public void debeSerRedirigidoAPaginaDetalles() {
        OnStage.theActorInTheSpotlight().should(RelojQuestion.verificarPaginaDetalles());
    }

    @When("el usuario ingresa '{string}' en la barra de búsqueda")
    public void elUsuarioIngresaSinResultados(String busqueda) {
        OnStage.theActorInTheSpotlight().attemptsTo(RelojTask.buscarProducto(busqueda));
    }

    @Then("debe ver un mensaje indicando que no se encontraron resultados")
    public void debeVerMensajeSinResultados() {
        OnStage.theActorInTheSpotlight().should(RelojQuestion.verificarMensajeSinResultados());
    }
}