// En generateProjectPrompt.js, actualizar buildDynamicPrompt:
export function buildDynamicPrompt({ recording, url, testData, flow, domainName }) {
  const steps = recording.steps || [];
  const mainUrl = url || extractMainUrl(steps) || "${baseUrl}";

  // Generar pasos detallados para el análisis de GPT
  const detailedSteps = steps.slice(0, 50).map((step, index) => {
    return {
      step: index + 1,
      action: step.action,
      element: step.element?.selector || step.element?.tagName || 'unknown',
      value: step.value || '',
      url: step.url || mainUrl
    };
  });

  return `Eres un ingeniero senior de automatización Java con Serenity BDD y Screenplay Pattern.

ANALIZA ESTA GRABACIÓN DE USUARIO y genera código de automatización COMPLETO:

URL PRINCIPAL DETECTADA: ${mainUrl}
DOMINIO: ${domainName}
TOTAL PASOS: ${steps.length}
FLUJO GRABADO: ${flow || 'Flujo de usuario'}

IMPORTANTE - ESTRUCTURA CORRECTA DE ARCHIVOS:
1. Palabras clave Gherkin (Dado, Cuando, Entonces, Y, Pero) en INGLES
2. NO incluir descripciones en inglés
3. NO incluir descripciones adicionales entre comillas
4. Generar MÚLTIPLES ESCENARIOS: exitosos y de error
5. Formato de feature file:
   Feature: Validación funcional flujos ${domainName}

   Scenario: Escenario exitoso - [descripción en español]
     Given [paso completo en español]
     When [paso completo en español]
     Then [paso completo en español]

   Scenario: Escenario de error - [descripción en español]
     Given [paso completo en español]
     When [paso completo en español]
     Then [paso completo en español]

PASOS GRABADOS PARA ANALIZAR (primeros 50):
${JSON.stringify(detailedSteps, null, 2)}

GENERA LOS SIGUIENTES ARCHIVOS:

1. FEATURE FILE CON MÚLTIPLES ESCENARIOS:
   - Mínimo 3 escenarios (2 exitosos + 1 de error)
   - Escenarios exitosos: flujo normal de usuario
   - Escenarios de error: validaciones negativas, datos incorrectos
   - Nombres descriptivos en español
   - Given/When/Then en inglés

2. STEP DEFINITIONS (JAVA - Screenplay Pattern):
   - @Given, @When, @Then en INGLÉS
   - Métodos descriptivos en español
   - Usar Serenity Screenplay (OnStage, Task, Question)
   - Manejar tanto escenarios exitosos como de error

3. PAGE OBJECTS (JAVA):
   - Generar páginas según los elementos interactuados
   - Usar selectores CSS robustos basados en la grabación
   - Incluir elementos para validaciones de error

4. TASKS (JAVA - Screenplay):
   - Tasks para acciones exitosas
   - Tasks para acciones que generan errores
   - Usar instrumented() para instanciación

5. QUESTIONS (JAVA - Screenplay):
   - Questions para verificaciones exitosas
   - Questions para verificaciones de error
   - Usar Ensure.that() para verificaciones

DEVUELVE UN JSON CON LA SIGUIENTE ESTRUCTURA:

{
  "src/test/resources/features/${domainName.toLowerCase()}.feature": "Feature: Validación funcional flujos ${domainName}\\n\\n  Scenario: Escenario exitoso - [descripción]\\n    Given [paso]\\n      \\\"Descripción\\\"\\n    When [paso]\\n      \\\"Descripción\\\"\\n    Then [paso]\\n      \\\"Descripción\\\"\\n\\n  Scenario: Escenario de error - [descripción]\\n    Given [paso]\\n      \\\"Descripción\\\"\\n    When [paso]\\n      \\\"Descripción\\\"\\n    Then [paso]\\n      \\\"Descripción\\\"",

  "src/test/java/co/com/template/automation/testing/definitions/${domainName}Definitions.java": "[código Java]",

  "src/main/java/co/com/template/automation/testing/ui/${domainName}Page.java": "[código Java]",

  "src/main/java/co/com/template/automation/testing/tasks/${domainName}Task.java": "[código Java]",

  "src/main/java/co/com/template/automation/testing/questions/${domainName}Question.java": "[código Java]"
}

REGLAS IMPORTANTES:
1. La URL ${mainUrl} DEBE usarse en todos los archivos de configuración
2. Generar selectores CSS robustos basados en los elementos de la grabación
3. Incluir manejo de esperas (WaitUntil) en todos los Tasks
4. Usar Ensure.that() para todas las verificaciones
5. Los escenarios deben ser realistas basados en la grabación
6. Incluir comentarios en español explicando la lógica`;
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