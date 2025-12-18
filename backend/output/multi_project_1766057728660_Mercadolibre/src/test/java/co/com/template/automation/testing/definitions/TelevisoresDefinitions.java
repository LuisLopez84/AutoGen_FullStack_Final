package co.com.template.automation.testing.definitions;

import net.serenitybdd.screenplay.annotations.Step;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Given;
import net.serenitybdd.screenplay.When;
import net.serenitybdd.screenplay.Then;
import co.com.template.automation.testing.tasks.TelevisoresTask;
import co.com.template.automation.testing.questions.TelevisoresQuestion;

public class TelevisoresDefinitions {

    @Given("el usuario navega a la página principal de Mercado Libre")
    public void elUsuarioNavegaALaPaginaPrincipal(Actor actor) {
        actor.attemptsTo(TelevisoresTask.navegarAPaginaPrincipal());
    }

    @When("el usuario busca 'televisores' en la barra de búsqueda")
    public void elUsuarioBuscaTelevisores(Actor actor) {
        actor.attemptsTo(TelevisoresTask.buscarProducto("televisores"));
    }

    @Then("debe ver una lista de resultados de búsqueda")
    public void debeVerResultadosDeBusqueda(Actor actor) {
        actor.should(Ensure.that(TelevisoresQuestion.resultadosDeBusqueda()).isNotEmpty());
    }

    @When("el usuario busca 'producto_inexistente' en la barra de búsqueda")
    public void elUsuarioBuscaProductoInexistente(Actor actor) {
        actor.attemptsTo(TelevisoresTask.buscarProducto("producto_inexistente"));
    }

    @Then("debe ver un mensaje de error indicando que no se encontraron resultados")
    public void debeVerMensajeDeError(Actor actor) {
        actor.should(Ensure.that(TelevisoresQuestion.mensajeDeError()).isEqualTo("No se encontraron resultados"));
    }

    @When("el usuario busca 'televisores' y selecciona un televisor")
    public void elUsuarioSeleccionaTelevisor(Actor actor) {
        actor.attemptsTo(TelevisoresTask.buscarProducto("televisores"), TelevisoresTask.seleccionarTelevisor());
    }

    @Then("debe ser redirigido a la página del producto")
    public void debeSerRedirigidoAPaginaDelProducto(Actor actor) {
        actor.should(Ensure.that(TelevisoresQuestion.urlDelProducto()).isNotEmpty());
    }
}