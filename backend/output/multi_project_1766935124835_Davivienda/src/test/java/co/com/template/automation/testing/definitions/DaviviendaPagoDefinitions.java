package co.com.template.automation.testing.definitions;

import net.serenitybdd.screenplay.annotations.Given;
import net.serenitybdd.screenplay.annotations.When;
import net.serenitybdd.screenplay.annotations.Then;
import co.com.template.automation.testing.tasks.DaviviendaPagoTask;
import co.com.template.automation.testing.questions.DaviviendaPagoQuestion;

public class DaviviendaPagoDefinitions {

    @Given("el usuario navega a la página principal de Davivienda")
    public void elUsuarioNavegaAPaginaPrincipal() {
        // Implementación de la navegación a la página principal
    }

    @When("selecciona el servicio de Acueducto La Herradura")
    public void seleccionaServicioAcueducto() {
        // Implementación de la selección del servicio
    }

    @When("ingresa el número de papel '{string}'")
    public void ingresaNumeroDePapel(String numero) {
        // Implementación de la entrada del número de papel
    }

    @When("ingresa el total a pagar '{string}'")
    public void ingresaTotalAPagar(String total) {
        // Implementación de la entrada del total a pagar
    }

    @Then("debe ver un mensaje de confirmación de pago exitoso")
    public void debeVerMensajeConfirmacion() {
        // Implementación de la verificación del mensaje de confirmación
    }

    @Then("debe ver un mensaje de error indicando que el número de papel es inválido")
    public void debeVerMensajeError() {
        // Implementación de la verificación del mensaje de error
    }
}