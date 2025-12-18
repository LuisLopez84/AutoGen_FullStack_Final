package co.com.template.automation.testing.definitions;

import net.serenitybdd.screenplay.annotations.Step;
import net.serenitybdd.screenplay.actors.OnStage;
import co.com.template.automation.testing.tasks.*;
import co.com.template.automation.testing.questions.*;

public class CelularesDefinitions {

    @Given("el usuario navega a la página principal de Mercado Libre")
    public void elUsuarioNavegaALaPaginaPrincipal() {
        OnStage.theActorInTheSpotlight().attemptsTo(NavigateTo.theHomePage());
    }

    @When("el usuario busca 'celulares' en la barra de búsqueda")
    public void elUsuarioBuscaCelulares() {
        OnStage.theActorInTheSpotlight().attemptsTo(SearchFor.product("celulares"));
    }

    @Then("debe ver una lista de resultados de búsqueda")
    public void debeVerResultadosDeBusqueda() {
        OnStage.theActorInTheSpotlight().should(Ensure.that(SearchResults.areDisplayed()));
    }

    @Given("el usuario navega a la página de resultados de búsqueda de celulares")
    public void elUsuarioNavegaAPaginaResultados() {
        OnStage.theActorInTheSpotlight().attemptsTo(NavigateTo.searchResults());
    }

    @When("el usuario selecciona la marca 'Honor'")
    public void elUsuarioSeleccionaMarcaHonor() {
        OnStage.theActorInTheSpotlight().attemptsTo(FilterBy.brand("Honor"));
    }

    @Then("debe ver productos de la marca 'Honor'")
    public void debeVerProductosDeMarcaHonor() {
        OnStage.theActorInTheSpotlight().should(Ensure.that(ProductResults.areFromBrand("Honor"))); 
    }

    @When("el usuario busca 'producto_inexistente'")
    public void elUsuarioBuscaProductoInexistente() {
        OnStage.theActorInTheSpotlight().attemptsTo(SearchFor.product("producto_inexistente"));
    }

    @Then("debe ver un mensaje de error indicando que no se encontraron resultados")
    public void debeVerMensajeDeError() {
        OnStage.theActorInTheSpotlight().should(Ensure.that(ErrorMessage.isDisplayed()));
    }
}