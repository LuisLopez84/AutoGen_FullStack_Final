export function buildProjectPrompt({ url, flow, testData, recording }) {
  return `Genera un proyecto Serenity BDD + Screenplay en Java. Devuelve SOLO JSON con esta estructura EXACTA:

{
  "pom.xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\\n<project>\\n<groupId>co.com.template.automation.testing</groupId>\\n<artifactId>serenity-automation-template</artifactId>\\n<version>1.0.0</version>\\n...",

  "src/main/java/co/com/template/automation/testing/questions/ExampleQuestion.java": "package co.com.template.automation.testing.questions;\\nimport net.serenitybdd.screenplay.Question;\\npublic class ExampleQuestion implements Question<String> { ... }",

  "src/main/java/co/com/template/automation/testing/tasks/ExampleTask.java": "package co.com.template.automation.testing.tasks;\\nimport net.serenitybdd.screenplay.Task;\\npublic class ExampleTask implements Task { ... }",

  "src/main/java/co/com/template/automation/testing/ui/ExamplePage.java": "package co.com.template.automation.testing.ui;\\nimport net.serenitybdd.core.pages.PageObject;\\npublic class ExamplePage extends PageObject { ... }",

  "src/main/java/co/com/template/automation/testing/utils/ShadowDomUtils.java": "package co.com.template.automation.testing.utils;\\nimport org.openqa.selenium.*;\\npublic class ShadowDomUtils { ... }",

  "src/main/java/co/com/template/automation/testing/utils/EnvironmentProperties.java": "package co.com.template.automation.testing.utils;\\nimport java.util.Properties;\\npublic class EnvironmentProperties { ... }",

  "src/test/java/co/com/template/automation/testing/runners/CucumberTestSuiteTest.java": "package co.com.template.automation.testing.runners;\\nimport org.junit.platform.suite.api.*;\\n@Suite\\npublic class CucumberTestSuiteTest { ... }",

  "src/test/java/co/com/template/automation/testing/definitions/commons/StepUrl.java": "package co.com.template.automation.testing.definitions.commons;\\nimport io.cucumber.java.*;\\npublic class StepUrl { ... }",

  "src/test/java/co/com/template/automation/testing/definitions/hooks/Hooks.java": "package co.com.template.automation.testing.definitions.hooks;\\nimport io.cucumber.java.*;\\npublic class Hooks { ... }",

  "src/test/java/co/com/template/automation/testing/definitions/FlujosDefinitions.java": "package co.com.template.automation.testing.definitions;\\nimport io.cucumber.java.es.*;\\nimport net.serenitybdd.screenplay.actors.OnStage;\\npublic class FlujosDefinitions { ... }",

  "src/test/resources/features/flujos.feature": "Feature: ${flow}\\n  Scenario: Ejemplo\\n    Given ...",

  "src/test/resources/junit-platform.properties": "cucumber.junit-platform.naming-strategy=long",
  "src/test/resources/logback-test.xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\\n<configuration>\\n</configuration>",
  "src/test/resources/serenity.conf": "serenity {\\n  project.name = \\"Automation Project\\"\\n}",

  ".gitignore": "target/\\n*.iml\\n.idea/",
  "browserstack.yml": "browserstack:\\n  user: \\"your_user\\"",
  "LICENSE": "MIT License",
  "README.md": "# Automation Project",
  "serenity.properties": "serenity.project.name=automation-project",
  "sonar-project-custom.properties": "sonar.projectKey=automation"
}

URL: ${url}
Flujo: ${flow}

IMPORTANTE:
- GroupId: co.com.template.automation.testing
- Paquete base: co.com.template.automation.testing
- Cada archivo Java DEBE tener su package declaration correcta.`;
}

export function buildTransformPrompt({ recording, url, testData, flow }) {
  return `Eres un ingeniero senior de automatización Java. Genera un proyecto completo Serenity BDD + Screenplay.

DEVUELVE SOLO ESTE OBJETO JSON CON CONTENIDO COMPLETO:

{
  "pom.xml": "[POM.XML COMPLETO CON DEPENDENCIAS SERENITY]",

  "src/main/java/co/com/template/automation/testing/questions/UserQuestion.java": "package co.com.template.automation.testing.questions;\\nimport net.serenitybdd.screenplay.Question;\\nimport net.serenitybdd.screenplay.questions.WebElementQuestion;\\npublic class UserQuestion { ... }",

  "src/main/java/co/com/template/automation/testing/tasks/UserTask.java": "package co.com.template.automation.testing.tasks;\\nimport net.serenitybdd.screenplay.Task;\\nimport net.serenitybdd.screenplay.actions.*;\\npublic class UserTask implements Task { ... }",

  "src/main/java/co/com/template/automation/testing/ui/LoginPage.java": "package co.com.template.automation.testing.ui;\\nimport net.serenitybdd.core.pages.PageObject;\\nimport net.serenitybdd.screenplay.targets.Target;\\npublic class LoginPage extends PageObject { ... }",

  "src/main/java/co/com/template/automation/testing/utils/ShadowDomUtils.java": "package co.com.template.automation.testing.utils;\\nimport org.openqa.selenium.*;\\nimport org.openqa.selenium.support.ui.ExpectedConditions;\\npublic class ShadowDomUtils { ... }",

  "src/main/java/co/com/template/automation/testing/utils/EnvironmentProperties.java": "package co.com.template.automation.testing.utils;\\nimport java.io.*;\\nimport java.util.Properties;\\npublic class EnvironmentProperties { ... }",

  "src/test/java/co/com/template/automation/testing/runners/CucumberTestSuiteTest.java": "package co.com.template.automation.testing.runners;\\nimport org.junit.platform.suite.api.*;\\n@IncludeEngines(\\"cucumber\\")\\n@SelectClasspathResource(\\"features\\")\\npublic class CucumberTestSuiteTest { ... }",

  "src/test/java/co/com/template/automation/testing/definitions/commons/StepUrl.java": "package co.com.template.automation.testing.definitions.commons;\\nimport io.cucumber.java.en.*;\\nimport net.serenitybdd.screenplay.actors.OnStage;\\npublic class StepUrl { ... }",

  "src/test/java/co/com/template/automation/testing/definitions/hooks/Hooks.java": "package co.com.template.automation.testing.definitions.hooks;\\nimport io.cucumber.java.*;\\nimport net.serenitybdd.screenplay.actors.OnStage;\\nimport net.serenitybdd.screenplay.actors.OnlineCast;\\npublic class Hooks { ... }",

  "src/test/java/co/com/template/automation/testing/definitions/FlujosDefinitions.java": "package co.com.template.automation.testing.definitions;\\nimport io.cucumber.java.es.*;\\nimport net.serenitybdd.screenplay.actors.OnStage;\\npublic class FlujosDefinitions { ... }",

  "src/test/resources/features/flujos.feature": "Feature: ${flow || 'Automation Flow'}\\n  Scenario: Execute flow\\n    Given the user navigates to ${url || 'https://example.com'}\\n    When the user performs actions\\n    Then the results should be verified",

  "src/test/resources/junit-platform.properties": "cucumber.junit-platform.naming-strategy=long\\ncucumber.plugin=pretty,html:target/cucumber-report.html",

  "src/test/resources/logback-test.xml": "<?xml version=\\\"1.0\\\" encoding=\\\"UTF-8\\\"?>\\n<configuration>\\n    <appender name=\\\"STDOUT\\\" class=\\\"ch.qos.logback.core.ConsoleAppender\\\">\\n        <encoder>\\n            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>\\n        </encoder>\\n    </appender>\\n    <root level=\\\"INFO\\\">\\n        <appender-ref ref=\\\"STDOUT\\\" />\\n    </root>\\n</configuration>",

  "src/test/resources/serenity.conf": "serenity {\\n  project.name = \\\"Serenity Automation Project\\\"\\n  logging = VERBOSE\\n}\\n\\nwebdriver {\\n  driver = chrome\\n}\\n\\nchrome.switches=\\\"--headless;--disable-gpu;--window-size=1920,1080\\\"",

  ".gitignore": "target/\\n*.iml\\n.idea/\\n.DS_Store\\n*.log\\nnode_modules/\\ndist/\\nbuild/",

  "browserstack.yml": "browserstack:\\n  user: \\\"${process.env.BROWSERSTACK_USERNAME}\\\"\\n  key: \\\"${process.env.BROWSERSTACK_ACCESS_KEY}\\\"\\n  browsers:\\n    - browserName: chrome\\n      browserVersion: latest\\n      os: Windows\\n      osVersion: 10",

  "LICENSE": "MIT License\\n\\nCopyright (c) 2024 Automation Project\\n\\nPermission is hereby granted...",

  "README.md": "# Serenity BDD Automation Project\\n\\nProyecto generado automáticamente para automatización de pruebas.\\n\\n## Estructura\\n- src/main/java: Clases Screenplay (Tasks, Questions, Pages)\\n- src/test/java: Runners y Step Definitions\\n- src/test/resources: Configuraciones y Features",

  "serenity.properties": "serenity.project.name=serenity-automation-template\\nserenity.take.screenshots=FOR_EACH_ACTION\\nserenity.logging=VERBOSE\\nwebdriver.driver=chrome",

  "sonar-project-custom.properties": "sonar.projectKey=co.com.template.automation.testing\\nsonar.projectName=Serenity Automation Template\\nsonar.projectVersion=1.0.0\\nsonar.sources=src/main/java\\nsonar.tests=src/test/java\\nsonar.java.binaries=target/classes"
}

URL: ${url || "https://ejemplo.com"}
Flujo: ${flow || 'Automation Flow'}
Grabación: ${recording ? 'Pasos disponibles' : 'No disponible'}

ESTRUCTURA OBLIGATORIA:
- GroupId: co.com.template.automation.testing
- Paquete base: co.com.template.automation.testing
- Screenplay Pattern: Actor + Task + Question + PageObject
- Todas las clases Java deben tener package declaration correcta
- Usar imports de Serenity BDD
- Estructura de carpetas EXACTA según especificaciones`;
}