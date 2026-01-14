package co.com.template.automation.testing.definitions;

import net.serenitybdd.screenplay.annotations.Step;
import net.serenitybdd.screenplay.Given;
import net.serenitybdd.screenplay.When;
import net.serenitybdd.screenplay.Then;
import co.com.template.automation.testing.tasks.*;
import co.com.template.automation.testing.questions.*;

public class BankQAConsultaCuentaDefinitions {

    @Given("el usuario navega a la página de inicio de sesión del banco")
    public void elUsuarioNavegaAPaginaDeInicioDeSesion() {
        // Implementación de la navegación a la página de inicio de sesión
    }

    @When("ingresa su correo electrónico '{string}'")
    public void ingresaSuCorreoElectronico(String email) {
        // Implementación de la acción de ingresar el correo electrónico
    }

    @When("ingresa su contraseña '{string}'")
    public void ingresaSuContrasena(String password) {
        // Implementación de la acción de ingresar la contraseña
    }

    @When("hace clic en el botón de inicio de sesión")
    public void haceClicEnElBotonDeInicioDeSesion() {
        // Implementación de la acción de hacer clic en el botón de inicio de sesión
    }

    @Then("debe ser redirigido a la página de consulta de cuenta")
    public void debeSerRedirigidoAPaginaDeConsultaDeCuenta() {
        // Implementación de la validación de redirección
    }

    @Then("debe ver un mensaje de error '{string}'")
    public void debeVerMensajeDeError(String errorMessage) {
        // Implementación de la validación del mensaje de error
    }
}