const pomXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>co.com.template.automation.testing</groupId>
    <artifactId>serenity-automation-template</artifactId>
    <version>1.0.0</version>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <serenity.version>4.2.22</serenity.version>
        <cucumber.version>7.20.1</cucumber.version>
        <junit.version>5.11.0</junit.version>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
    </properties>

    <dependencies>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-core</artifactId>
            <version>\${serenity.version}</version>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-cucumber</artifactId>
            <version>\${serenity.version}</version>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-screenplay</artifactId>
            <version>\${serenity.version}</version>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-screenplay-webdriver</artifactId>
            <version>\${serenity.version}</version>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-ensure</artifactId>
            <version>\${serenity.version}</version>
        </dependency>

        <dependency>
            <groupId>io.cucumber</groupId>
            <artifactId>cucumber-junit-platform-engine</artifactId>
            <version>\${cucumber.version}</version>
        </dependency>

        <dependency>
            <groupId>org.junit.platform</groupId>
            <artifactId>junit-platform-suite</artifactId>
            <version>1.13.1</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-engine</artifactId>
            <version>\${junit.version}</version>
        </dependency>

        <dependency>
            <groupId>org.junit.vintage</groupId>
            <artifactId>junit-vintage-engine</artifactId>
            <version>\${junit.version}</version>
        </dependency>

        <dependency>
            <groupId>ch.qos.logback</groupId>
            <artifactId>logback-classic</artifactId>
            <version>1.2.10</version>
        </dependency>

        <dependency>
            <groupId>io.github.bonigarcia</groupId>
            <artifactId>webdrivermanager</artifactId>
            <version>5.7.0</version>
        </dependency>

        <dependency>
            <groupId>org.assertj</groupId>
            <artifactId>assertj-core</artifactId>
            <version>3.23.1</version>
        </dependency>

        <dependency>
            <groupId>net.java.dev.jna</groupId>
            <artifactId>jna</artifactId>
            <version>5.13.0</version>
        </dependency>
        <dependency>
            <groupId>net.java.dev.jna</groupId>
            <artifactId>jna-platform</artifactId>
            <version>5.13.0</version>
        </dependency>

        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-model</artifactId>
            <version>4.2.22</version>
        </dependency>

        <dependency>
            <groupId>net.serenity-bdd.maven.plugins</groupId>
            <artifactId>serenity-maven-plugin</artifactId>
            <version>\${serenity.version}</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.8.1</version>
                <configuration>
                    <source>\${maven.compiler.source}</source>
                    <target>\${maven.compiler.target}</target>
                </configuration>
            </plugin>
            <plugin>
                <groupId>net.serenity-bdd.maven.plugins</groupId>
                <artifactId>serenity-maven-plugin</artifactId>
                <version>\${serenity.version}</version>
                <configuration>
                    <reports>single-page-html</reports>
                </configuration>
                <executions>
                    <execution>
                        <id>serenity-reports</id>
                        <phase>post-integration-test</phase>
                        <goals>
                            <goal>aggregate</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>`;

export function buildProjectPrompt({ url, flow, testData, recording }) {
  return `
COPIA EXACTAMENTE este contenido para pom.xml - NO MODIFIQUES NADA:

${pomXmlContent}

AHORA genera el objeto JSON con esta estructura exacta:

{
  "pom.xml": "[EL CONTENIDO EXACTO DE ARRIBA - COPIA Y PEGA SIN CAMBIOS]",
  "src/main/java/co/com/automation/testing/utils/ShadowDomUtils.java": "[contenido de ShadowDomUtils con métodos para shadow DOM]",
  "src/main/java/co/com/automation/testing/utils/EnvironmentProperties.java": "[clase para manejar propiedades del entorno]",
  "src/test/java/co/com/automation/testing/runners/CucumberTestSuiteTest.java": "[runner de Cucumber con JUnit 5]",
  "src/test/java/co/com/automation/testing/stepdefinitions/commons/StepUrl.java": "[step definitions comunes]",
  "src/test/java/co/com/automation/testing/stepdefinitions/hooks/Hooks.java": "[hooks para setup y teardown]",
  "src/test/resources/features/flujos.feature": "[feature file con el flujo: ${flow}]",
  "src/test/resources/junit-platform.properties": "[configuración JUnit Platform]",
  "src/test/resources/logback-test.xml": "[configuración de logging]",
  "src/test/resources/serenity.conf": "[configuración de Serenity BDD]",
  ".gitignore": "[archivos ignorados para Git]",
  "browserstack.yml": "[configuración BrowserStack]",
  "LICENSE": "[licencia MIT]",
  "README.md": "[documentación del proyecto]",
  "serenity.properties": "[propiedades de Serenity]",
  "sonar-project-custom.properties": "[propiedades para SonarQube]"
}

URL: ${url}
Flujo: ${flow}
Datos: ${JSON.stringify(testData)}
Grabación: ${recording ? JSON.stringify(recording) : "none"}

RESPONDE SOLO CON EL JSON. NADA MÁS.
`;
}

export function buildTransformPrompt({ recording, url, testData }) {
  return `
Genera el proyecto usando el pom.xml exacto proporcionado en el prompt principal.

RESPONDE SOLO CON JSON.
`;
}

export default {
  buildProjectPrompt,
  buildTransformPrompt
};