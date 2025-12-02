// En generateProjectPrompt.js, cambia buildTransformPrompt a:
export function buildTransformPrompt({ recording, url, testData, flow }) {
  return `Eres un ingeniero senior de automatización Java. Genera contenido SOLO para estos archivos específicos:

DEVUELVE SOLO ESTE OBJETO JSON:

{
  "src/main/java/co/com/template/automation/testing/questions/UserQuestion.java": "package co.com.template.automation.testing.questions;\\nimport net.serenitybdd.screenplay.Question;\\nimport net.serenitybdd.screenplay.questions.WebElementQuestion;\\npublic class UserQuestion { ... }",

  "src/main/java/co/com/template/automation/testing/tasks/UserTask.java": "package co.com.template.automation.testing.tasks;\\nimport net.serenitybdd.screenplay.Task;\\nimport net.serenitybdd.screenplay.actions.*;\\npublic class UserTask implements Task { ... }",

  "src/main/java/co/com/template/automation/testing/ui/LoginPage.java": "package co.com.template.automation.testing.ui;\\nimport net.serenitybdd.core.pages.PageObject;\\nimport net.serenitybdd.screenplay.targets.Target;\\npublic class LoginPage extends PageObject { ... }",

  "src/main/java/co/com/template/automation/testing/utils/ShadowDomUtils.java": "package co.com.template.automation.testing.utils;\\nimport org.openqa.selenium.*;\\nimport org.openqa.selenium.support.ui.ExpectedConditions;\\npublic class ShadowDomUtils { ... }",

  "src/main/java/co/com/template/automation/testing/utils/EnvironmentProperties.java": "package co.com.template.automation.testing.utils;\\nimport java.io.*;\\nimport java.util.Properties;\\npublic class EnvironmentProperties { ... }",

  "src/test/java/co/com/template/automation/testing/definitions/hooks/Hooks.java": "package co.com.template.automation.testing.definitions.hooks;\\nimport io.cucumber.java.*;\\nimport net.serenitybdd.screenplay.actors.OnStage;\\nimport net.serenitybdd.screenplay.actors.OnlineCast;\\npublic class Hooks { ... }",

  "src/test/java/co/com/template/automation/testing/definitions/FlujosDefinitions.java": "package co.com.template.automation.testing.definitions;\\nimport io.cucumber.java.es.*;\\nimport net.serenitybdd.screenplay.actors.OnStage;\\npublic class FlujosDefinitions { ... }",

  "src/test/resources/features/flujos.feature": "Feature: ${flow || 'Automation Flow'}\\n  Scenario: Execute flow\\n    Given the user navigates to ${url || 'https://example.com'}\\n    When the user performs actions\\n    Then the results should be verified"
}

IMPORTANTE: Solo genera contenido para estos archivos. Los demás archivos (pom.xml, serenity.conf, etc.) serán generados automáticamente por el sistema.`;
}
