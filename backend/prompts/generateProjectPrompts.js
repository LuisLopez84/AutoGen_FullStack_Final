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

  return `ERES UN INGENIERO DE AUTOMATIZACIÓN SENIOR ESPECIALIZADO EN SERENITY BDD.

IMPORTANTE ABSOLUTO: DEBES SEGUIR ESTE FORMATO EXACTO PARA EL FEATURE FILE:

1. PALABRAS GIVEN/WHEN/THEN/AND/BUT SIEMPRE EN INGLÉS
2. DESCRIPCIÓN COMPLETA DEL STEP ENTRE COMILLAS DOBLES EN ESPAÑOL
3. FORMATO: Given "descripción completa en español"
4. NO MEZCLAR IDIOMAS DENTRO DEL MISMO STEP

EJEMPLO CORRECTO OBLIGATORIO:
  Scenario: Escenario exitoso - Buscar producto
    Given el usuario navega a la página principal de Mercado Libre
    When busca 'televisores' en la barra de búsqueda
    Then debe ver una lista de resultados de búsqueda

EJEMPLO INCORRECTO (NO PERMITIDO):
  Scenario: Escenario exitoso - Buscar producto
    Given I am on the Mercado Libre homepage
    When I search for "televisores"
    Then I should see search results

---

GENERA LOS SIGUIENTES ARCHIVOS PARA: ${domainName}
URL: ${mainUrl}
Total pasos grabados: ${steps.length}

ARCHIVOS REQUERIDOS:

1. FEATURE FILE (${domainName.toLowerCase()}.feature):
   - Mínimo 3 escenarios (2 exitosos + 1 de error)
   - Todos los steps en formato: Given/When/Then "descripción en español"
   - Nombres de escenarios descriptivos en español

2. STEP DEFINITIONS (${domainName}Definitions.java):
   - @Given, @When, @Then con texto en INGLÉS
   - Métodos con nombres descriptivos en español
   - Usar Serenity Screenplay Pattern

3. PAGE OBJECTS (${domainName}Page.java):
   - Selectores CSS robustos basados en la grabación

4. TASKS (${domainName}Task.java):
   - Tasks para acciones exitosas y de error
   - Usar instrumented() para instanciación

5. QUESTIONS (${domainName}Question.java):
   - Questions para verificaciones
   - Usar Ensure.that() para validaciones

---

DEVUELVE UN JSON CON LA SIGUIENTE ESTRUCTURA:

{
  "src/test/resources/features/${domainName.toLowerCase()}.feature": "Feature: ${domainName} Automation\\n\\n  Scenario: Escenario exitoso 1...",

  "src/test/java/co/com/template/automation/testing/definitions/${domainName}Definitions.java": "package co.com.template.automation.testing.definitions;\\n\\npublic class ${domainName}Definitions { ... }",

  "src/main/java/co/com/template/automation/testing/ui/${domainName}Page.java": "package co.com.template.automation.testing.ui;\\n\\npublic class ${domainName}Page { ... }",

  "src/main/java/co/com/template/automation/testing/tasks/${domainName}Task.java": "package co.com.template.automation.testing.tasks;\\n\\npublic class ${domainName}Task { ... }",

  "src/main/java/co/com/template/automation/testing/questions/${domainName}Question.java": "package co.com.template.automation.testing.questions;\\n\\npublic class ${domainName}Question { ... }"
}

---

INFORMACIÓN DE LA GRABACIÓN (primeros 50 pasos):
${JSON.stringify(detailedSteps, null, 2)}

RECUERDA: TODOS LOS STEPS DEL FEATURE DEBEN SER EN FORMATO: Given "texto en español"`;
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