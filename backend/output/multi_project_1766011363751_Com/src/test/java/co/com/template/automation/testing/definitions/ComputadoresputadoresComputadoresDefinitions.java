package co.com.template.automation.testing.definitions;

import net.serenitybdd.screenplay.annotations.Step;
import net.serenitybdd.screenplay.actors.OnStage;
import co.com.template.automation.testing.tasks.ComputadoresTask;

public class ComputadoresputadoresDefinitions {

    @Given("el usuario navega a la página principal de Mercado Libre")
    public void elUsuarioNavegaALaPaginaPrincipalDeMercadoLibre() {
        OnStage.theActorInTheSpotlight().attemptsTo(ComputadoresTask.navegarALaPaginaPrincipal());
    }

    @When("el usuario busca 'computadores' en la barra de búsqueda")
    public void elUsuarioBuscaComputadoresEnLaBarraDeBusqueda() {
        OnStage.theActorInTheSpotlight().attemptsTo(ComputadoresTask.buscarProducto("computadores"));
    }

    @When("el usuario selecciona un computador de la lista")
    public void elUsuarioSeleccionaUnComputadorDeLaLista() {
        OnStage.theActorInTheSpotlight().attemptsTo(ComputadoresTask.seleccionarComputador());
    }

    @When("el usuario busca 'producto_inexistente' en la barra de búsqueda")
    public void elUsuarioBuscaProductoInexistenteEnLaBarraDeBusqueda() {
        OnStage.theActorInTheSpotlight().attemptsTo(ComputadoresTask.buscarProducto("producto_inexistente"));
    }

    @Then("debe ver una lista de resultados de búsqueda relacionados")
    public void debeVerUnaListaDeResultadosDeBusquedaRelacionados() {
        // Validación de resultados
    }

    @Then("debe ser redirigido a la página del producto")
    public void debeSerRedirigidoALaPaginaDelProducto() {
        // Validación de redirección
    }

    @Then("debe ver un mensaje de error indicando que no se encontraron resultados")
    public void debeVerUnMensajeDeErrorIndicandoQueNoSeEncontraronResultados() {
        // Validación de mensaje de error
    }
}