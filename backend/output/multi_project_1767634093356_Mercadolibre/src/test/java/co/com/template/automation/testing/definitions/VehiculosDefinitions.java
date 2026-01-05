package co.com.template.automation.testing.definitions;

import net.serenitybdd.screenplay.annotations.Step;
import net.serenitybdd.screenplay.actors.OnStage;
import co.com.template.automation.testing.tasks.VehiculosTask;
import co.com.template.automation.testing.questions.VehiculosQuestion;

public class VehiculosDefinitions {

    @Given("el usuario navega a la página principal de Mercado Libre")
    public void elUsuarioNavegaALaPaginaPrincipalDeMercadoLibre() {
        OnStage.theActorInTheSpotlight().attemptsTo(VehiculosTask.navegarALaPaginaPrincipal());
    }

    @When("el usuario ingresa 'Vehiculos' en la barra de búsqueda")
    public void elUsuarioIngresaVehiculosEnLaBarraDeBusqueda() {
        OnStage.theActorInTheSpotlight().attemptsTo(VehiculosTask.buscarVehiculos());
    }

    @Then("debe ser redirigido a la página de resultados de búsqueda de vehículos")
    public void debeSerRedirigidoAPaginaDeResultados() {
        Ensure.that(VehiculosQuestion.verificarResultados()).isTrue();
    }

    @When("el usuario selecciona el filtro de 'Usado'")
    public void elUsuarioSeleccionaElFiltroDeUsado() {
        OnStage.theActorInTheSpotlight().attemptsTo(VehiculosTask.filtrarVehiculosUsados());
    }

    @Then("debe ver solo vehículos usados en los resultados")
    public void debeVerSoloVehiculosUsados() {
        Ensure.that(VehiculosQuestion.verificarVehiculosUsados()).isTrue();
    }

    @When("el usuario ingresa un término vacío en la barra de búsqueda")
    public void elUsuarioIngresaTerminoVacioEnLaBarraDeBusqueda() {
        OnStage.theActorInTheSpotlight().attemptsTo(VehiculosTask.buscarTerminoVacio());
    }

    @Then("debe ver un mensaje de error indicando que debe ingresar un término de búsqueda")
    public void debeVerMensajeDeError() {
        Ensure.that(VehiculosQuestion.verificarMensajeDeError()).isTrue();
    }
}