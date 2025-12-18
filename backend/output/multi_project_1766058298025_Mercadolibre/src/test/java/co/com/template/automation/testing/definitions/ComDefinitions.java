package co.com.template.automation.testing.definitions;

import net.serenitybdd.screenplay.annotations.Step;
import net.serenitybdd.screenplay.Actor;
import co.com.template.automation.testing.tasks.*;

public class ComDefinitions {

    @Given("el usuario navega a la página principal de Mercado Libre")
    public void elUsuarioNavegaALaPaginaPrincipal(Actor actor) {
        actor.attemptsTo(VisitarLaPaginaPrincipal.deMercadoLibre());
    }

    @When("el usuario ingresa 'computadores' en la barra de búsqueda")
    public void elUsuarioIngresaComputadores(Actor actor) {
        actor.attemptsTo(BuscarProducto.enLaBarraDeBusqueda("computadores"));
    }

    @Then("el usuario debe ver una lista de resultados de búsqueda")
    public void elUsuarioVeResultados(Actor actor) {
        actor.should(seeThat(ResultadosDeBusqueda.sonVisibles()));
    }

    @When("el usuario no ingresa ningún texto en la barra de búsqueda y presiona buscar")
    public void elUsuarioNoIngresaTexto(Actor actor) {
        actor.attemptsTo(BuscarProducto.enLaBarraDeBusqueda("").sinTexto());
    }

    @Then("el usuario debe ver un mensaje de error indicando que la búsqueda no puede estar vacía")
    public void elUsuarioVeMensajeDeError(Actor actor) {
        actor.should(seeThat(MensajeDeError.esVisible()));
    }
}