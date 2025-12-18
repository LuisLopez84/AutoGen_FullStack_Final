package co.com.template.automation.testing.definitions;

import net.serenitybdd.screenplay.annotations.Step;
import net.serenitybdd.screenplay.Actor;
import co.com.template.automation.testing.tasks.*;
import co.com.template.automation.testing.questions.*;

public class CelularesDefinitions {

    @Given("el usuario navega a la página principal de Mercado Libre")
    public void elUsuarioNavegaALaPaginaPrincipal(Actor actor) {
        actor.attemptsTo(NavigateTo.theHomePage());
    }

    @When("el usuario busca 'celulares' en la barra de búsqueda")
    public void elUsuarioBuscaCelulares(Actor actor) {
        actor.attemptsTo(SearchFor.product("celulares"));
    }

    @Then("debe ver una lista de resultados de búsqueda")
    public void debeVerResultadosDeBusqueda(Actor actor) {
        actor.should(Ensure.that(SearchResults.areDisplayed()));
    }

    @Given("el usuario navega a la página de resultados de búsqueda de celulares")
    public void elUsuarioNavegaAPaginaResultados(Actor actor) {
        actor.attemptsTo(NavigateTo.theSearchResultsPage());
    }

    @When("el usuario selecciona la marca 'Honor'")
    public void elUsuarioSeleccionaMarcaHonor(Actor actor) {
        actor.attemptsTo(FilterBy.brand("Honor"));
    }

    @Then("debe ver resultados filtrados por la marca seleccionada")
    public void debeVerResultadosFiltrados(Actor actor) {
        actor.should(Ensure.that(FilterResults.areDisplayedForBrand("Honor")));
    }

    @When("el usuario busca 'producto_inexistente' en la barra de búsqueda")
    public void elUsuarioBuscaProductoInexistente(Actor actor) {
        actor.attemptsTo(SearchFor.product("producto_inexistente"));
    }

    @Then("debe ver un mensaje de error indicando que no se encontraron resultados")
    public void debeVerMensajeDeError(Actor actor) {
        actor.should(Ensure.that(ErrorMessage.isDisplayed()));
    }
}