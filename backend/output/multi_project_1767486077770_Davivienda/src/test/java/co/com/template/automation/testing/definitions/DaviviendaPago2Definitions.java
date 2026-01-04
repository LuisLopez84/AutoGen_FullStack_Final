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

    @When("ingresa un número de cuenta válido")
    public void ingresaNumeroDeCuentaValido() {
        OnStage.theActorInTheSpotlight().attemptsTo(EnterValidAccountNumber.instrumented());
    }

    @When("ingresa un monto válido")
    public void ingresaMontoValido() {
        OnStage.theActorInTheSpotlight().attemptsTo(EnterValidAmount.instrumented());
    }

    @When("ingresa un monto de cero")
    public void ingresaMontoCero() {
        OnStage.theActorInTheSpotlight().attemptsTo(EnterZeroAmount.instrumented());
    }

    @When("ingresa un número de cuenta inválido")
    public void ingresaNumeroDeCuentaInvalido() {
        OnStage.theActorInTheSpotlight().attemptsTo(EnterInvalidAccountNumber.instrumented());
    }

    @Then("el usuario debe ver un mensaje de pago exitoso")
    public void elUsuarioVeMensajePagoExitoso() {
        OnStage.theActorInTheSpotlight().should(Ensure.that(PaymentSuccessMessage.isDisplayed()));
    }

    @Then("el usuario debe ver un mensaje de error indicando que el monto no puede ser cero")
    public void elUsuarioVeMensajeErrorMontoCero() {
        OnStage.theActorInTheSpotlight().should(Ensure.that(ZeroAmountErrorMessage.isDisplayed()));
    }

    @Then("el usuario debe ver un mensaje de error indicando que el número de cuenta es inválido")
    public void elUsuarioVeMensajeErrorNumeroCuentaInvalido() {
        OnStage.theActorInTheSpotlight().should(Ensure.that(InvalidAccountErrorMessage.isDisplayed()));
    }
}