package co.com.template.automation.testing.definitions;

import net.serenitybdd.screenplay.annotations.Step;
import co.com.template.automation.testing.tasks.ComTask;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Given;
import net.serenitybdd.screenplay.When;
import net.serenitybdd.screenplay.Then;

public class ComDefinitions {

    @Given("el usuario navega a la página principal de Mercado Libre")
    public void elUsuarioNavegaALaPaginaPrincipal(Actor actor) {
        actor.attemptsTo(ComTask.navigateToHomePage());
    }

    @When("el usuario ingresa '{0}' en la barra de búsqueda")
    public void elUsuarioIngresaEnLaBarraDeBusqueda(Actor actor, String searchTerm) {
        actor.attemptsTo(ComTask.searchForProduct(searchTerm));
    }

    @Then("debe ver una lista de resultados de búsqueda relacionados con '{0}'")
    public void debeVerResultadosDeBusqueda(Actor actor, String searchTerm) {
        actor.should(Ensure.that(ComQuestion.searchResultsAreDisplayed(searchTerm)));
    }

    @Then("debe ver un mensaje de error indicando que no se encontraron resultados")
    public void debeVerMensajeDeError(Actor actor) {
        actor.should(Ensure.that(ComQuestion.noResultsMessageIsDisplayed()));
    }
}