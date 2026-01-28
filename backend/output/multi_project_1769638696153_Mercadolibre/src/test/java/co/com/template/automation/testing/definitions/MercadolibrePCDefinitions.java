package co.com.template.automation.testing.definitions;

import net.serenitybdd.screenplay.annotations.Step;
import net.serenitybdd.screenplay.actors.OnStage;
import co.com.template.automation.testing.tasks.*;
import co.com.template.automation.testing.questions.*;

public class MercadolibrePCDefinitions {

    @Given("el usuario navega a la página principal de Mercado Libre")
    public void elUsuarioNavegaALaPaginaPrincipalDeMercadoLibre() {
        OnStage.theActorInTheSpotlight().attemptsTo(NavigateToMercadoLibrePage.instrumented());
    }

    @When("el usuario busca '{string}' en la barra de búsqueda")
    public void elUsuarioBuscaEnLaBarraDeBusqueda(String producto) {
        OnStage.theActorInTheSpotlight().attemptsTo(SearchForProduct.instrumented(producto));
    }

    @When("el usuario selecciona un producto de la lista")
    public void elUsuarioSeleccionaUnProductoDeLaLista() {
        OnStage.theActorInTheSpotlight().attemptsTo(SelectProduct.instrumented());
    }

    @Then("debe ver una lista de resultados de búsqueda")
    public void debeVerUnaListaDeResultadosDeBusqueda() {
        OnStage.theActorInTheSpotlight().should(Ensure.that(SearchResultsQuestion.isDisplayed()));
    }

    @Then("debe ver un mensaje de error indicando que no se encontraron resultados")
    public void debeVerUnMensajeDeError() {
        OnStage.theActorInTheSpotlight().should(Ensure.that(ErrorMessageQuestion.isDisplayed()));
    }
}