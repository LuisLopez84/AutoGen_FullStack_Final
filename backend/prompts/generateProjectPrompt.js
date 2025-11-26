export function buildProjectPrompt({ url, flow, testData, recording }) {
  return `Genera un proyecto Maven Java para automatización UI usando Serenity BDD + patrón Screenplay.
Devuelve un único objeto JSON mapeando rutas completas de archivos (relativas al root del proyecto) a contenidos de archivos (strings).
Incluye: pom.xml (con JDK 21), serenity.conf, src/test/java packages para tasks, questions, runners, pages, utils, hooks, y features bajo src/test/resources.
URL Base: ${url}
Flujo: ${flow}
Datos de prueba: ${JSON.stringify(testData)}
Grabación: ${recording ? JSON.stringify(recording) : "none"}

Importante: devuelve SOLO un objeto JSON válido, sin texto extra.`;
}

export function buildTransformPrompt({ recording, url, testData }) {
  return `
Eres un ingeniero senior de automatización Java. Genera un proyecto completo Serenity BDD + Screenplay en Java (Maven).

IMPORTANTE - SOPORTE SHADOW DOM:
- El array de grabación incluye pasos con propiedad "shadow: true".
- Para estos pasos, genera Page Objects que usen selectores SHADOW DOM.
- Incluye una clase utilitaria "ShadowDomUtils.java" con métodos helper para consultar dentro de shadowRoot.
- Cuando un selector de ruta contiene " >> ", interpreta cada segmento como un límite de shadow DOM.

REGLAS DE TRANSFORMACIÓN SHADOW DOM:
- Selector de ejemplo: "vaadin-form-layout >> vaadin-text-field >> input"
- DEBE convertirse a código Java usando:

WebElement element = ShadowDomUtils.getShadowElement(
    getDriver(),
    "vaadin-form-layout",
    "vaadin-text-field",
    "input"
);

- Divide el selector por " >> " y pasa cada segmento como parámetro string.
- Tasks y Page Objects DEBEN usar este helper en lugar de By.cssSelector para elementos shadow.

REQUISITOS DEL PROYECTO:
- JDK 21
- Serenity BDD 3.0.0+ con patrón Screenplay
- Cucumber 7.0+
- JUnit 5
- Estructura Maven estándar
- Incluir Page Objects en src/test/java/.../ui
- Incluir Tasks, Questions, Runners, Hooks
- Incluir serenity.conf con configuración para Chrome y Edge
- Incluir archivos .feature con Gherkin (mínimo 1 escenario y 1 scenario outline)
- Incluir utils/ShadowDomUtils.java
- URL base: ${url || "https://ejemplo.com"}

ESTRUCTURA OBLIGATORIA:
- pom.xml (dependencias: serenity, cucumber, junit)
- src/test/java/runners/CucumberTestSuiteTest.java
- src/test/java/stepdefinitions/Hooks.java
- src/test/java/stepdefinitions/StepDefinitions.java
- src/test/java/commons/StepUrl.java
- src/test/java/tasks/ (clases Task)
- src/test/java/ui/ (Page Objects)
- src/test/java/questions/ (clases Question)
- src/test/java/utils/ShadowDomUtils.java
- src/test/resources/serenity.conf
- src/test/resources/features/ (archivos .feature)

INSTRUCCIÓN CRÍTICA:
Devuelve SOLO un objeto JSON válido que mapee rutas de archivo a contenidos.
NO incluyas texto explicativo, NO uses markdown, NO uses \`\`\`json.

EJEMPLO DE FORMATO CORRECTO:
{
  "pom.xml": "<?xml version=\\"1.0\\"?>...",
  "src/test/java/runners/CucumberTestSuiteTest.java": "package runners;...",
  ...
}

GRABACIÓN:
${JSON.stringify(recording, null, 2).substring(0, 12000)}
`;
}

// Exportación por defecto para compatibilidad
export default {
  buildProjectPrompt,
  buildTransformPrompt
};