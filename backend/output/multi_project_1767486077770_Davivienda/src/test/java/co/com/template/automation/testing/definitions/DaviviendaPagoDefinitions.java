package co.com.template.automation.testing.definitions;

import net.serenitybdd.screenplay.annotations.Step;
import net.serenitybdd.screenplay.Given;
import net.serenitybdd.screenplay.When;
import net.serenitybdd.screenplay.Then;
import co.com.template.automation.testing.tasks.DaviviendaPagoTask;
import co.com.template.automation.testing.questions.DaviviendaPagoQuestion;

public class DaviviendaPagoDefinitions {

    @Given("el usuario navega a la página principal de Davivienda")
    public void elUsuarioNavegaAPaginaPrincipal() {
        // Implementación de la navegación a la página principal
        actor.attemptsTo(DaviviendaPagoTask.navegarAPaginaPrincipal());
    }

    @When("el usuario selecciona el servicio de Acueducto La Herradura")
    public void elUsuarioSeleccionaServicio() {
        // Implementación de la selección del servicio
        actor.attemptsTo(DaviviendaPagoTask.seleccionarServicio());
    }

    @When("el usuario ingresa el número de papel '{string}'")
    public void elUsuarioIngresaNumeroDePapel(String numeroPapel) {
        // Implementación de ingreso del número de papel
        actor.attemptsTo(DaviviendaPagoTask.ingresarNumeroDePapel(numeroPapel));
    }

    @When("el usuario ingresa el total a pagar '{string}'")
    public void elUsuarioIngresaTotalAPagar(String total) {
        // Implementación de ingreso del total a pagar
        actor.attemptsTo(DaviviendaPagoTask.ingresarTotalAPagar(total));
    }

    @Then("el usuario debe ver un mensaje de confirmación de pago exitoso")
    public void elUsuarioVeMensajeConfirmacion() {
        // Implementación de verificación de mensaje de confirmación
        Ensure.that(DaviviendaPagoQuestion.mensajeConfirmacion()).isEqualTo("Pago exitoso");
    }

    @Then("el usuario debe ver un mensaje de error indicando que el número de papel es inválido")
    public void elUsuarioVeMensajeError() {
        // Implementación de verificación de mensaje de error
        Ensure.that(DaviviendaPagoQuestion.mensajeError()).isEqualTo("Número de papel inválido");
    }
}