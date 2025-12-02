export function buildTransformPrompt({ recording, url, testData, flow }) {
  const steps = recording.steps || [];

  // Extraer información clave de la grabación
  const pageLoads = steps.filter(step => step.action === 'page_load');
  const clicks = steps.filter(step => step.action === 'click');
  const inputs = steps.filter(step => step.action === 'input');
  const formSubmits = steps.filter(step => step.action === 'form_submit');

  // Analizar flujo principal
  let flowDescription = "User login and search";
  if (flow) {
    flowDescription = flow;
  } else if (pageLoads.length > 0) {
    const lastPage = pageLoads[pageLoads.length - 1];
    if (lastPage.title.includes('Admin') || lastPage.title.includes('Search')) {
      flowDescription = "User login and search in admin panel";
    } else if (lastPage.title.includes('Dashboard')) {
      flowDescription = "User login and navigation";
    }
  }

  // Crear prompt más específico y detallado
  return `Eres un ingeniero senior de automatización Java con Serenity BDD y Screenplay Pattern.

  ANALIZA ESTA GRABACIÓN DE USUARIO y genera código de automatización COMPLETO:

  INFORMACIÓN DE LA GRABACIÓN:
  - URL principal: ${url || recording.steps[0]?.url || 'https://example.com'}
  - Total pasos: ${steps.length}
  - Acciones principales: ${clicks.length} clicks, ${inputs.length} inputs, ${formSubmits.length} form submissions
  - Flujo: ${flowDescription}

  GENERA LOS SIGUIENTES ARCHIVOS EN INGLÉS:

  1. FEATURE FILE (Gherkin syntax in ENGLISH):
     - Scenario con Given/When/Then en inglés
     - Basado en el flujo grabado: login → navegación → búsqueda

  2. STEP DEFINITIONS (JAVA - Screenplay Pattern):
     - @Given, @When, @Then en INGLÉS
     - Usar Serenity Screenplay (OnStage, Task, Question)
     - Steps para: abrir navegador, ingresar credenciales, hacer click, buscar

  3. PAGE OBJECTS (JAVA):
     - LoginPage con Targets para username, password, login button
     - AdminPage con Targets para search fields si aplica
     - Usar selectores CSS de la grabación: input.oxd-input, button.oxd-button, etc.

  4. TASKS (JAVA - Screenplay):
     - LoginTask: Enter username/password, click login
     - SearchTask: Enter search criteria, click search button
     - NavigationTask: Click on menu items

  5. QUESTIONS (JAVA - Screenplay):
     - LoginSuccessfulQuestion: Verificar que login fue exitoso
     - SearchResultsQuestion: Verificar resultados de búsqueda

  ESTRUCTURA ESPERADA DEL JSON (devuelve SOLO este objeto JSON):

  {
    "src/test/resources/features/login_admin_search.feature": "Feature: ${flowDescription}\\n  Scenario: ${flowDescription}\\n    Given I open the OrangeHRM application\\n    When I login with username \\"Admin\\" and password \\"admin123\\"\\n    And I navigate to Admin section\\n    And I search for user \\"Wateen Saud Alzaqdi\\"\\n    Then I should see search results",

    "src/test/java/co/com/template/automation/testing/definitions/LoginDefinitions.java": "package co.com.template.automation.testing.definitions;\\n\\nimport io.cucumber.java.en.*;\\nimport net.serenitybdd.screenplay.actors.OnStage;\\nimport net.serenitybdd.screenplay.actors.OnlineCast;\\nimport static co.com.template.automation.testing.tasks.LoginTask.*;\\nimport static co.com.template.automation.testing.tasks.NavigateToAdminTask.*;\\nimport static co.com.template.automation.testing.tasks.SearchUserTask.*;\\nimport static co.com.template.automation.testing.questions.LoginSuccessfulQuestion.*;\\nimport static co.com.template.automation.testing.questions.SearchResultsQuestion.*;\\n\\npublic class LoginDefinitions {\\n    \\n    @Given(\\"I open the OrangeHRM application\\")\\n    public void iOpenTheApplication() {\\n        OnStage.setTheStage(new OnlineCast());\\n        // Navigation handled by StepUrl class\\n    }\\n    \\n    @When(\\"I login with username {string} and password {string}\\") \\n    public void iLoginWithCredentials(String username, String password) {\\n        OnStage.theActorInTheSpotlight().attemptsTo(\\n            loginWithCredentials(username, password)\\n        );\\n    }\\n    \\n    @When(\\"I navigate to Admin section\\")\\n    public void iNavigateToAdminSection() {\\n        OnStage.theActorInTheSpotlight().attemptsTo(\\n            navigateToAdminSection()\\n        );\\n    }\\n    \\n    @When(\\"I search for user {string}\\")\\n    public void iSearchForUser(String userName) {\\n        OnStage.theActorInTheSpotlight().attemptsTo(\\n            searchForUser(userName)\\n        );\\n    }\\n    \\n    @Then(\\"I should see search results\\")\\n    public void iShouldSeeSearchResults() {\\n        OnStage.theActorInTheSpotlight().should(\\n            seeThat(searchResultsAreDisplayed())\\n        );\\n    }\\n}",

    "src/main/java/co/com/template/automation/testing/ui/LoginPage.java": "package co.com.template.automation.testing.ui;\\n\\nimport net.serenitybdd.core.pages.PageObject;\\nimport net.serenitybdd.screenplay.targets.Target;\\n\\npublic class LoginPage extends PageObject {\\n    \\n    // Username field\\n    public static final Target USERNAME_FIELD = Target\\n        .the(\\"username field\\")\\n        .locatedBy(\\"input[name='username']\\");\\n    \\n    // Password field\\n    public static final Target PASSWORD_FIELD = Target\\n        .the(\\"password field\\")\\n        .locatedBy(\\"input[name='password']\\");\\n    \\n    // Login button\\n    public static final Target LOGIN_BUTTON = Target\\n        .the(\\"login button\\")\\n        .locatedBy(\\"button[type='submit']\\");\\n}",

    "src/main/java/co/com/template/automation/testing/ui/AdminPage.java": "package co.com.template.automation.testing.ui;\\n\\nimport net.serenitybdd.core.pages.PageObject;\\nimport net.serenitybdd.screenplay.targets.Target;\\n\\npublic class AdminPage extends PageObject {\\n    \\n    // Admin menu item\\n    public static final Target ADMIN_MENU = Target\\n        .the(\\"admin menu\\")\\n        .locatedBy(\\"a.oxd-main-menu-item:has(span:contains('Admin'))\\");\\n    \\n    // Username search field\\n    public static final Target USERNAME_SEARCH_FIELD = Target\\n        .the(\\"username search field\\")\\n        .locatedBy(\\"input.oxd-input:first-of-type\\");\\n    \\n    // User role dropdown\\n    public static final Target USER_ROLE_DROPDOWN = Target\\n        .the(\\"user role dropdown\\")\\n        .locatedBy(\\"div.oxd-select-text-input:first-of-type\\");\\n    \\n    // Employee name search\\n    public static final Target EMPLOYEE_NAME_FIELD = Target\\n        .the(\\"employee name field\\")\\n        .locatedBy(\\"input[placeholder='Type for hints...']\\");\\n    \\n    // Status dropdown\\n    public static final Target STATUS_DROPDOWN = Target\\n        .the(\\"status dropdown\\")\\n        .locatedBy(\\"div.oxd-select-text-input:last-of-type\\");\\n    \\n    // Search button\\n    public static final Target SEARCH_BUTTON = Target\\n        .the(\\"search button\\")\\n        .locatedBy(\\"button[type='submit']:contains('Search')\\");\\n}",

    "src/main/java/co/com/template/automation/testing/tasks/LoginTask.java": "package co.com.template.automation.testing.tasks;\\n\\nimport net.serenitybdd.screenplay.Task;\\nimport net.serenitybdd.screenplay.actions.*;\\nimport static co.com.template.automation.testing.ui.LoginPage.*;\\n\\npublic class LoginTask {\\n    \\n    public static Task loginWithCredentials(String username, String password) {\\n        return Task.where(\\"{0} logs in with username \\" + username + \\" and password \\" + password,\\n            Enter.theValue(username).into(USERNAME_FIELD),\\n            Enter.theValue(password).into(PASSWORD_FIELD),\\n            Click.on(LOGIN_BUTTON)\\n        );\\n    }\\n}",

    "src/main/java/co/com/template/automation/testing/tasks/NavigateToAdminTask.java": "package co.com.template.automation.testing.tasks;\\n\\nimport net.serenitybdd.screenplay.Task;\\nimport net.serenitybdd.screenplay.actions.Click;\\nimport static co.com.template.automation.testing.ui.AdminPage.*;\\n\\npublic class NavigateToAdminTask {\\n    \\n    public static Task navigateToAdminSection() {\\n        return Task.where(\\"{0} navigates to Admin section\\",\\n            Click.on(ADMIN_MENU)\\n        );\\n    }\\n}",

    "src/main/java/co/com/template/automation/testing/tasks/SearchUserTask.java": "package co.com.template.automation.testing.tasks;\\n\\nimport net.serenitybdd.screenplay.Task;\\nimport net.serenitybdd.screenplay.actions.*;\\nimport static co.com.template.automation.testing.ui.AdminPage.*;\\n\\npublic class SearchUserTask {\\n    \\n    public static Task searchForUser(String userName) {\\n        return Task.where(\\"{0} searches for user \\" + userName,\\n            Enter.theValue(\\"Admin\\").into(USERNAME_SEARCH_FIELD),\\n            Click.on(USER_ROLE_DROPDOWN),\\n            // Note: Need additional steps to select 'Admin' from dropdown\\n            Enter.theValue(userName).into(EMPLOYEE_NAME_FIELD),\\n            Click.on(STATUS_DROPDOWN),\\n            // Note: Need additional steps to select 'Enabled' from dropdown\\n            Click.on(SEARCH_BUTTON)\\n        );\\n    }\\n}",

    "src/main/java/co/com/template/automation/testing/questions/LoginSuccessfulQuestion.java": "package co.com.template.automation.testing.questions;\\n\\nimport net.serenitybdd.screenplay.Question;\\nimport net.serenitybdd.screenplay.questions.Visibility;\\nimport static co.com.template.automation.testing.ui.AdminPage.*;\\n\\npublic class LoginSuccessfulQuestion {\\n    \\n    public static Question<Boolean> isSuccessful() {\\n        return actor -> Visibility.of(ADMIN_MENU).answeredBy(actor);\\n    }\\n}",

    "src/main/java/co/com/template/automation/testing/questions/SearchResultsQuestion.java": "package co.com.template.automation.testing.questions;\\n\\nimport net.serenitybdd.screenplay.Question;\\nimport net.serenitybdd.screenplay.questions.Visibility;\\nimport net.serenitybdd.screenplay.targets.Target;\\n\\npublic class SearchResultsQuestion {\\n    \\n    private static final Target RESULTS_TABLE = Target\\n        .the(\\"results table\\")\\n        .locatedBy(\\"div.oxd-table\\");\\n    \\n    public static Question<Boolean> areDisplayed() {\\n        return actor -> Visibility.of(RESULTS_TABLE).answeredBy(actor);\\n    }\\n}",

    "src/test/java/co/com/template/automation/testing/definitions/hooks/Hooks.java": "package co.com.template.automation.testing.definitions.hooks;\\n\\nimport io.cucumber.java.Before;\\nimport net.serenitybdd.screenplay.actors.OnStage;\\nimport net.serenitybdd.screenplay.actors.OnlineCast;\\n\\npublic class Hooks {\\n    \\n    @Before\\n    public void setTheStage() {\\n        OnStage.setTheStage(new OnlineCast());\\n    }\\n}"
  }

  NOTAS IMPORTANTES:
  - Todo en INGLÉS (feature, steps, nombres de clases)
  - Usar Screenplay Pattern (Tasks, Questions, Pages)
  - Los selectores CSS deben ser robustos y basados en la grabación
  - Mantener el código limpio y bien estructurado

  GRABACIÓN PARA ANALIZAR (primeros 10 pasos):
  ${JSON.stringify(steps.slice(0, 10), null, 2)}
  `;
}