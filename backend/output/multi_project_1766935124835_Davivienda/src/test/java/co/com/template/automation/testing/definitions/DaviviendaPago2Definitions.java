package co.com.template.automation.testing.definitions;

import net.serenitybdd.screenplay.annotations.Step;
import net.serenitybdd.screenplay.actors.OnStage;
import co.com.template.automation.testing.tasks.*;

public class DaviviendaPago2Definitions {

    @Given("el usuario navega a la página principal de Davivienda")
    public void elUsuarioNavegaAPaginaPrincipal() {
        OnStage.theActorInTheSpotlight().attemptsTo(NavigateToDaviviendaPage.instrumented());
    }

    @When("el usuario selecciona la opción de pago")
    public void elUsuarioSeleccionaOpcionDePago() {
        OnStage.theActorInTheSpotlight().attemptsTo(SelectPaymentOption.instrumented());
    }

    @When("ingresa el número de cuenta '(.*)'\")
    public void ingresaNumeroDeCuenta(String accountNumber) {
        OnStage.theActorInTheSpotlight().attemptsTo(EnterAccountNumber.instrumented(accountNumber));
    }

    @When("ingresa el valor '(.*)'\")
    public void ingresaValor(String amount) {
        OnStage.theActorInTheSpotlight().attemptsTo(EnterPaymentAmount.instrumented(amount));
    }

    @Then("debe ver un mensaje de confirmación de pago exitoso")
    public void debeVerMensajeConfirmacionExito() {
        OnStage.theActorInTheSpotlight().attemptsTo(VerifySuccessMessage.instrumented());
    }

    @Then("debe ver un mensaje de error indicando que el número de cuenta es inválido")
    public void debeVerMensajeError() {
        OnStage.theActorInTheSpotlight().attemptsTo(VerifyErrorMessage.instrumented());
    }
}