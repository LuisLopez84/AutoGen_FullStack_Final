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
  return `You are a senior Java automation engineer. Given this recording JSON exported by a simple page recorder (array of steps containing action, selector, value, and optional frame), generate a complete Maven Java project (Serenity + Screenplay) implementing the flow.
Return a single JSON object mapping file paths to contents. Include pom.xml, serenity.conf, src/test/resources/features/*.feature, and Java classes (tasks, questions, pages, runners, utils).
Base URL: ${url}
Recording: ${JSON.stringify(recording)}
TestData: ${JSON.stringify(testData)}

Return ONLY a JSON object.`;
}
