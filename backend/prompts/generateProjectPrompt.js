export function buildProjectPrompt({ url, flow, testData, recording }) {
  return `Generate a Maven Java project for UI automation using Serenity BDD + Screenplay pattern.
Return a single JSON object mapping full file paths (relative to project root) to file contents (strings).
Include: pom.xml (with JDK 21), serenity.conf, src/test/java packages for tasks, questions, runners, pages, utils, hooks, and features under src/test/resources.
Base URL: ${url}
Flow: ${flow}
Test data: ${JSON.stringify(testData)}
Recording: ${recording ? JSON.stringify(recording) : "none"}

Important: output ONLY valid JSON object, no extra text.`;
}

export function buildTransformPrompt({ recording, url, testData }) {
  return `
You are a senior Java automation engineer.
Generate a complete Serenity BDD + Screenplay project in Java (Maven).

IMPORTANT — SHADOW DOM SUPPORT:
- The recording array includes steps with a property "shadow: true".
- For these steps, generate Page Objects that use SHADOW DOM selectors.
- Include a utility class "ShadowDomUtils.java" with helper methods to query inside shadowRoot.
- When a selector path contains " >> ", interpret each segment as a shadow boundary.

SHADOW DOM TRANSFORMATION RULE:
- Example recording selector: "vaadin-form-layout >> vaadin-text-field >> input"
- MUST be converted to Java code using:

WebElement element = ShadowDomUtils.getShadowElement(
    getDriver(),
    "vaadin-form-layout",
    "vaadin-text-field",
    "input"
);

- Split the selector by " >> " and pass each segment as a string parameter.
- Tasks and Page Objects MUST use this helper instead of By.cssSelector for shadow elements.

PROJECT REQUIREMENTS:
- Include Page Objects in src/test/java/.../ui
- Include Tasks, Questions, Runners, Hooks
- Include serenity.conf
- Include Cucumber feature files (.feature)
- Include utils/ShadowDomUtils.java
- Base URL: ${url}

RECORDING:
${JSON.stringify(recording)}

Return ONLY a JSON object mapping file paths to file contents.
    `;
}

