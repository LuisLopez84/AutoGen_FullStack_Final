export function buildDynamicPrompt({ recording, url, testData, flow, domainName }) {
  const steps = recording.steps || [];
  const mainUrl = url || extractMainUrl(steps) || "${baseUrl}";

  const detailedSteps = steps.slice(0, 50).map((step, index) => ({
    step: index + 1,
    action: step.action,
    element: step.element?.selector || step.element?.tagName || 'unknown',
    value: step.value || '',
    url: step.url || mainUrl
  }));

  return `Eres un ingeniero senior de automatización Java con Serenity BDD y Screenplay Pattern.

IMPORTANTE: Estás generando código para la grabación: ${domainName}
URL: ${mainUrl}
Total pasos: ${steps.length}

GENERA LOS SIGUIENTES ARCHIVOS para ESTA GRABACIÓN ESPECÍFICA:

1. FEATURE FILE (nombre: ${domainName.toLowerCase()}.feature):
   - Usar el nombre "${domainName}" en todos los nombres de clase
   - Mínimo 3 escenarios (2 exitosos + 1 de error)
   - Nombres descriptivos en español
   - Given/When/Then en inglés

2. STEP DEFINITIONS (nombre: ${domainName}Definitions.java):
   - @Given, @When, @Then en INGLÉS
   - Métodos descriptivos en español
   - Usar Serenity Screenplay

3. PAGE OBJECTS (nombre: ${domainName}Page.java):
   - Usar selectores CSS robustos
   - Incluir elementos para validaciones

4. TASKS (nombre: ${domainName}Task.java):
   - Tasks para acciones exitosas y de error
   - Usar instrumented() para instanciación

5. QUESTIONS (nombre: ${domainName}Question.java):
   - Questions para verificaciones
   - Usar Ensure.that() para verificaciones

DEVUELVE UN JSON CON LA SIGUIENTE ESTRUCTURA:

{
  "src/test/resources/features/${domainName.toLowerCase()}.feature": "Feature: ${domainName} Automation\\n\\n  Scenario: Escenario exitoso 1...",

  "src/test/java/co/com/template/automation/testing/definitions/${domainName}Definitions.java": "package co.com.template.automation.testing.definitions;\\n\\npublic class ${domainName}Definitions { ... }",

  "src/main/java/co/com/template/automation/testing/ui/${domainName}Page.java": "package co.com.template.automation.testing.ui;\\n\\npublic class ${domainName}Page { ... }",

  "src/main/java/co/com/template/automation/testing/tasks/${domainName}Task.java": "package co.com.template.automation.testing.tasks;\\n\\npublic class ${domainName}Task { ... }",

  "src/main/java/co/com/template/automation/testing/questions/${domainName}Question.java": "package co.com.template.automation.testing.questions;\\n\\npublic class ${domainName}Question { ... }"
}

PASOS GRABADOS PARA ANALIZAR (primeros 50):
${JSON.stringify(detailedSteps, null, 2)}`;
}



   export function buildTransformPrompt({ recording, url, testData, flow }) {
     const steps = recording.steps || [];

     return `Eres un ingeniero senior de automatización Java con Serenity BDD y Screenplay Pattern.

   ANALIZA ESTA GRABACIÓN DE USUARIO y genera código de automatización COMPLETO:

   INFORMACIÓN DE LA GRABACIÓN:
   - URL principal: ${url || recording.steps[0]?.url || "${baseUrl}"}
   - Total pasos: ${steps.length}
   - Flujo: ${flow || 'Flujo grabado por el usuario'}

   GENERA LOS SIGUIENTES ARCHIVOS:

   1. FEATURE FILE (Gherkin syntax):
      - Scenario con Given/When/Then en INGLÉS
      - Descripciones detalladas en ESPAÑOL entre comillas después de los pasos en inglés
      - Basado en el flujo grabado

   2. STEP DEFINITIONS (JAVA - Screenplay Pattern):
      - @Given, @When, @Then en INGLÉS
      - Descripciones de métodos en ESPAÑOL
      - Usar Serenity Screenplay (OnStage, Task, Question)

   3. PAGE OBJECTS (JAVA):
      - Generar páginas según los elementos interactuados en la grabación
      - Usar selectores CSS robustos basados en la grabación
      - Cada página debe extender PageObject

   4. TASKS (JAVA - Screenplay):
      - Estructura: public class NombreTask implements Task
      - Usar instrumented() para instanciación
      - Incluir constructor con parámetros según necesidades
      - Implementar performAs() con acciones específicas

   5. QUESTIONS (JAVA - Screenplay):
      - Estructura: public class NombreQuestion implements Question<Boolean>
      - Usar Ensure.that() para verificaciones
      - Método estático para instanciación

   DEVUELVE UN JSON CON ESTA ESTRUCTURA:

   {
     "src/test/resources/features/recording.feature": "Feature: Automation Flow\\n  Scenario: Execute recorded flow\\n    Given I open the application\\n      \\"Dado que abro la aplicación\\"\\n    When I perform the recorded actions\\n      \\"Cuando realizo las acciones grabadas\\"\\n    Then I should see expected results\\n      \\"Entonces debo ver los resultados esperados\\"",

     "src/test/java/co/com/template/automation/testing/definitions/RecordingDefinitions.java": "package co.com.template.automation.testing.definitions;\\n\\nimport io.cucumber.java.en.*;\\nimport net.serenitybdd.screenplay.actors.OnStage;\\n\\npublic class RecordingDefinitions {\\n    \\n    @Given(\\"I open the application\\")\\n    public void iOpenTheApplication() {\\n        // Abrir la aplicación\\n    }\\n    \\n    @When(\\"I perform the recorded actions\\")\\n    public void iPerformRecordedActions() {\\n        // Realizar acciones grabadas\\n    }\\n    \\n    @Then(\\"I should see expected results\\")\\n    public void iShouldSeeExpectedResults() {\\n        // Verificar resultados\\n    }\\n}",

     "src/main/java/co/com/template/automation/testing/ui/MainPage.java": "package co.com.template.automation.testing.ui;\\n\\nimport net.serenitybdd.core.pages.PageObject;\\nimport net.serenitybdd.screenplay.targets.Target;\\n\\npublic class MainPage extends PageObject {\\n    \\n    // Targets basados en la grabación\\n    public static final Target MAIN_ELEMENT = Target\\n        .the(\\"elemento principal\\")\\n        .locatedBy(\\"selector\\");\\n}",

     "src/main/java/co/com/template/automation/testing/tasks/MainTask.java": "package co.com.template.automation.testing.tasks;\\n\\nimport net.serenitybdd.screenplay.Actor;\\nimport net.serenitybdd.screenplay.Task;\\nimport net.serenitybdd.screenplay.actions.*;\\nimport static net.serenitybdd.screenplay.Tasks.instrumented;\\n\\npublic class MainTask implements Task {\\n\\n    private final String parametro;\\n\\n    public MainTask(String parametro) {\\n        this.parametro = parametro;\\n    }\\n\\n    @Override\\n    public <T extends Actor> void performAs(T actor) {\\n        actor.attemptsTo(\\n            // Acciones específicas\\n        );\\n    }\\n\\n    public static MainTask conParametro(String parametro) {\\n        return instrumented(MainTask.class, parametro);\\n    }\\n}",

     "src/main/java/co/com/template/automation/testing/questions/ValidationQuestion.java": "package co.com.template.automation.testing.questions;\\n\\nimport net.serenitybdd.screenplay.Actor;\\nimport net.serenitybdd.screenplay.Question;\\nimport net.serenitybdd.screenplay.ensure.Ensure;\\n\\npublic class ValidationQuestion implements Question<Boolean> {\\n\\n    @Override\\n    public Boolean answeredBy(Actor actor) {\\n        actor.attemptsTo(\\n            Ensure.that(\\"elemento\\").isDisplayed()\\n        );\\n        return true;\\n    }\\n\\n    public static ValidationQuestion validacionExitosa() {\\n        return new ValidationQuestion();\\n    }\\n}"
     }

     IMPORTANTE:
     1. Las palabras clave (Given/When/Then) deben estar en INGLÉS
     2. Los detalles descriptivos pueden estar en ESPAÑOL
     3. Genera múltiples archivos según la complejidad de la grabación
     4. Los selectores CSS deben ser robustos
     5. Incluir esperas (WaitUntil) cuando sea necesario
     6. Usar Ensure.that() para verificaciones en Questions

     GRABACIÓN PARA ANALIZAR:
     ${JSON.stringify(steps.slice(0, 15), null, 2)}`;
     }