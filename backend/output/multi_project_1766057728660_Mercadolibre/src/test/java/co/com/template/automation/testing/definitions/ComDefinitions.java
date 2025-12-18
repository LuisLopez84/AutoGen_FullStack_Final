package co.com.template.automation.testing.definitions;

import net.serenitybdd.screenplay.annotations.Step;
import net.serenitybdd.screenplay.Actor;
import co.com.template.automation.testing.tasks.ComTask;
import static net.serenitybdd.screenplay.GivenWhenThen.*;

public class ComDefinitions {

    @Given("el usuario navega a la página principal de Mercado Libre")
    public void elUsuarioNavegaALaPaginaPrincipal(Actor actor) {
        actor.attemptsTo(ComTask.navigateToHomePage());
    }

    @When("el usuario ingresa 'computadores' en la barra de búsqueda")
    public void elUsuarioIngresaComputadores(Actor actor) {
        actor.attemptsTo(ComTask.searchForProduct("computadores"));
    }

    @When("el usuario selecciona un producto de la lista")
    public void elUsuarioSeleccionaUnProducto(Actor actor) {
        actor.attemptsTo(ComTask.selectProduct());
    }

    @When("el usuario ingresa 'producto_inexistente' en la barra de búsqueda")
    public void elUsuarioIngresaProductoInexistente(Actor actor) {
        actor.attemptsTo(ComTask.searchForProduct("producto_inexistente"));
    }

    @Then("debe ver una lista de resultados de búsqueda de computadores")
    public void debeVerResultadosDeBusqueda(Actor actor) {
        actor.should(seeThat(ComQuestion.resultsAreDisplayed()));
    }

    @Then("debe ser redirigido a la página del producto")
    public void debeSerRedirigidoALaPaginaDelProducto(Actor actor) {
        actor.should(seeThat(ComQuestion.productPageIsDisplayed()));
    }

    @Then("debe ver un mensaje de error indicando que no se encontraron resultados")
    public void debeVerMensajeDeError(Actor actor) {
        actor.should(seeThat(ComQuestion.errorMessageIsDisplayed()));
    }
}