export function buildDynamicPrompt({ recording, url, testData, flow, domainName }) {
  const steps = recording.steps || [];

  return `Eres un ingeniero senior de automatización Java con Serenity BDD y Screenplay Pattern.

IMPORTANTE - ESTRUCTURA CORRECTA DE ARCHIVOS:

ARCHIVOS EN src/main/java/co/com/template/automation/testing/:
- ui/ (Page Objects)
- tasks/ (Screenplay Tasks)
- questions/ (Screenplay Questions)
- utils/ (Utility classes)

ARCHIVOS EN src/test/java/co/com/template/automation/testing/:
- definitions/ (Step Definitions) - SOLO aquí
- runners/ (Test Runners) - SOLO aquí
- hooks/ (Cucumber Hooks) - SOLO aquí

NO generes archivos de ui, tasks, questions o utils en src/test/java/

INSTRUCCIONES ESPECÍFICAS PARA FEATURE FILE:
1. Palabras clave Gherkin (Given, When, Then, And, But) en INGLÉS
2. Descripciones detalladas en ESPAÑOL después de cada paso en inglés
3. Formato:
   Given I am on the login page
     "Dado que estoy en la página de inicio de sesión"
4. Usar comentarios (#) en español si es necesario

Ejemplo CORRECTO:
Feature: User Login and Search

  Scenario: User logs in and searches for a user
    Given Dado que estoy en la página de inicio de sesión
    When Cuando ingreso "Admin" en el campo de usuario
    And Y ingreso "admin123" en el campo de contraseña
    And Y hago clic en el botón de inicio de sesión
    Then Entonces debo estar en el dashboard

INFORMACIÓN DE LA GRABACIÓN:
- URL principal: ${url || recording.steps[0]?.url || 'https://example.com'}
- Dominio: ${domainName}
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
   - Usar nombres basados en el dominio (${domainName}Page, LoginPage, etc.)
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
     "src/test/resources/features/${domainName.toLowerCase()}.feature": "Feature: ${domainName} Automation\\n\\n  Scenario: Execute recorded flow\\n    Given Dado que estoy en la página de ${domainName}\\n    When Cuando realizo las acciones grabadas\\n    Then Entonces debo ver los resultados esperados",

     "src/test/java/co/com/template/automation/testing/definitions/${domainName}Definitions.java": "package co.com.template.automation.testing.definitions;\\n\\nimport io.cucumber.java.en.*;\\nimport net.serenitybdd.screenplay.actors.OnStage;\\n\\npublic class ${domainName}Definitions {\\n    \\n    @Given(\\"I am on the ${domainName} page\\")\\n    public void iAmOnThePage() {\\n        // Abrir la página de ${domainName}\\n    }\\n    \\n    @When(\\"I perform the recorded actions\\")\\n    public void iPerformRecordedActions() {\\n        // Realizar acciones grabadas\\n    }\\n    \\n    @Then(\\"I should see expected results\\")\\n    public void iShouldSeeExpectedResults() {\\n        // Verificar resultados\\n    }\\n}",

     "src/main/java/co/com/template/automation/testing/ui/${domainName}Page.java": "package co.com.template.automation.testing.ui;\\n\\nimport net.serenitybdd.core.pages.PageObject;\\nimport net.serenitybdd.screenplay.targets.Target;\\n\\npublic class ${domainName}Page extends PageObject {\\n    \\n    // Targets basados en la grabación\\n    public static final Target MAIN_ELEMENT = Target\\n        .the(\\"elemento principal de ${domainName}\\")\\n        .locatedBy(\\"selector\\");\\n}",

     "src/main/java/co/com/template/automation/testing/tasks/${domainName}Task.java": "package co.com.template.automation.testing.tasks;\\n\\nimport net.serenitybdd.screenplay.Actor;\\nimport net.serenitybdd.screenplay.Task;\\nimport net.serenitybdd.screenplay.actions.*;\\nimport static net.serenitybdd.screenplay.Tasks.instrumented;\\n\\npublic class ${domainName}Task implements Task {\\n\\n    private final String parametro;\\n\\n    public ${domainName}Task(String parametro) {\\n        this.parametro = parametro;\\n    }\\n\\n    @Override\\n    public <T extends Actor> void performAs(T actor) {\\n        actor.attemptsTo(\\n            // Acciones específicas para ${domainName}\\n        );\\n    }\\n\\n    public static ${domainName}Task conParametro(String parametro) {\\n        return instrumented(${domainName}Task.class, parametro);\\n    }\\n}",

     "src/main/java/co/com/template/automation/testing/questions/${domainName}Question.java": "package co.com.template.automation.testing.questions;\\n\\nimport net.serenitybdd.screenplay.Actor;\\nimport net.serenitybdd.screenplay.Question;\\nimport net.serenitybdd.screenplay.ensure.Ensure;\\n\\npublic class ${domainName}Question implements Question<Boolean> {\\n\\n    @Override\\n    public Boolean answeredBy(Actor actor) {\\n        actor.attemptsTo(\\n            Ensure.that(\\"elemento de ${domainName}\\").isDisplayed()\\n        );\\n        return true;\\n    }\\n\\n    public static ${domainName}Question validacionExitosa() {\\n        return new ${domainName}Question();\\n    }\\n}"
   }

   IMPORTANTE:
   1. Las palabras clave (Given/When/Then) deben estar en INGLÉS
   2. Los detalles descriptivos pueden estar en ESPAÑOL
   3. Genera múltiples archivos según la complejidad de la grabación
   4. Los selectores CSS deben ser robustos
   5. Incluir esperas (WaitUntil) cuando sea necesario
   6. Usar Ensure.that() para verificaciones en Questions
   7. Usar nombres coherentes basados en ${domainName}

   GRABACIÓN PARA ANALIZAR:
   ${JSON.stringify(steps.slice(0, 15), null, 2)}`;
   }

   export function buildTransformPrompt({ recording, url, testData, flow }) {
     const steps = recording.steps || [];

     return `Eres un ingeniero senior de automatización Java con Serenity BDD y Screenplay Pattern.

   ANALIZA ESTA GRABACIÓN DE USUARIO y genera código de automatización COMPLETO:

   INFORMACIÓN DE LA GRABACIÓN:
   - URL principal: ${url || recording.steps[0]?.url || 'https://example.com'}
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