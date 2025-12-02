#!/usr/bin/env node
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import AdmZip from "adm-zip";
import OpenAI from "openai";
import { execSync } from "child_process";
import { chromium } from "playwright";
import { diffLines } from "diff";
import { buildTransformPrompt } from "./prompts/generateProjectPrompt.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors({ origin: "*" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req,res,next)=>{ console.log(new Date().toISOString(), req.method, req.url); next(); });

// Transform recording -> project files (calls OpenAI)
app.post("/api/transform-recording", async (req,res)=>{
  try {
    const { recording, url, testData, flow } = req.body;
    if (!recording) return res.status(400).json({ error: "recording required" });
    const prompt = buildTransformPrompt({ recording, url, testData, flow });

    console.log("📤 Enviando prompt a OpenAI...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres un ingeniero senior de automatización Java.
          IMPORTANTE: Genera SOLO los archivos que se te piden explícitamente.
          NO incluyas: pom.xml, serenity.conf, runners, ni archivos de configuración.
          Devuelve SOLO un objeto JSON válido, sin texto adicional.`
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 4000
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    console.log("📥 Raw OpenAI response recibida");

    // Limpiar la respuesta
    let cleaned = raw.trim();

    // Eliminar markdown code blocks
    if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
    if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.substring(0, cleaned.length - 3);
    cleaned = cleaned.trim();

    // Extraer solo el JSON
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }

    console.log("🧹 Texto limpiado (primeros 200 chars):", cleaned.substring(0, 200) + "...");

    let openaiFiles = {};
    try {
      openaiFiles = JSON.parse(cleaned);
      console.log("✅ JSON parseado correctamente de OpenAI");
    } catch(e) {
      console.error("❌ Error parseando JSON de OpenAI:", e.message);
      openaiFiles = {};
    }

    // ========== CONSTRUIR PROYECTO DESDE CERO ==========
    console.log("🏗️  Construyendo estructura del proyecto...");

    const files = {};

    // 1. ARCHIVOS CRÍTICOS DEL SISTEMA (Siempre generados por nosotros)
    console.log("🔧 Generando archivos críticos del sistema...");

        // A) POM.XML (siempre nuestra versión)
        files['pom.xml'] = `<?xml version="1.0" encoding="UTF-8"?>
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
                <groupId>io.cucumber</groupId>
                <artifactId>cucumber-junit-platform-engine</artifactId>
                <version>\${cucumber.version}</version>
            </dependency>
            <dependency>
                <groupId>org.junit.jupiter</groupId>
                <artifactId>junit-jupiter-engine</artifactId>
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
                    <executions>
                        <execution>
                            <id>serenity-reports</id>
                            <phase>post-integration-test</phase>
                            <goals><goal>aggregate</goal></goals>
                        </execution>
                    </executions>
                </plugin>
            </plugins>
        </build>
    </project>`;

        // B) SERENITY.CONF (nuestra versión)
        files['src/test/resources/serenity.conf'] = `serenity {
      project.name = "Serenity Automation Project"
      logging = VERBOSE
    }
    webdriver {
      driver = chrome
    }
    pages {
      url = "${url || 'https://opensource-demo.orangehrmlive.com/'}"
    }
    environments {
      local {
        chrome {
          webdriver.driver = chrome
          switches = [
            "--start-maximized",
            "--ignore-certificate-errors",
            "--incognito",
            "--accept-insecure-certs",
            "--disable-popup-blocking",
            "--disable-infobars",
            "--remote-allow-origins=*",
            "--headless=new",
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--window-size=1920,1080"
          ]
        }
      }
    }`;

        // C) RUNNER (nuestra versión)
        files['src/test/java/co/com/template/automation/testing/runners/CucumberTestSuiteTest.java'] = `package co.com.template.automation.testing.runners;
    import io.cucumber.junit.CucumberOptions;
    import net.serenitybdd.cucumber.CucumberWithSerenity;
    import org.junit.runner.RunWith;
    @RunWith(CucumberWithSerenity.class)
    @CucumberOptions(
        plugin = {"pretty", "html:target/cucumber-reports/cucumber.html", "json:target/cucumber-reports/cucumber.json"},
        features = "src/test/resources/features",
        glue = "co.com.template.automation.testing.definitions",
        snippets = CucumberOptions.SnippetType.CAMELCASE
    )
    public class CucumberTestSuiteTest {}`;

    // D) STEP URL (nuestra versión)
        files['src/test/java/co/com/template/automation/testing/definitions/commons/StepUrl.java'] = `package co.com.template.automation.testing.definitions.commons;
    import io.cucumber.java.en.Given;
    import net.serenitybdd.screenplay.actions.Open;
    import net.serenitybdd.screenplay.actors.OnStage;
    public class StepUrl {
        @Given("{string} abre la página web")
        public void abreLaPáginaWeb(String actor) {
            OnStage.theActorCalled(actor);
            OnStage.theActorInTheSpotlight().wasAbleTo(Open.browserOn().thePageNamed("pages.url"));
        }
    }`;



// 2. ARCHIVOS DE OPENAI (versión corregida)
console.log("🤖 Procesando archivos de OpenAI...");

// Función mejorada para buscar archivos en la respuesta de OpenAI
function findFileContentInOpenAIResponse(filenamePattern) {
  // Primero, intentar búsqueda directa en el objeto
  function deepSearch(obj, targetKey) {
    if (!obj || typeof obj !== 'object') return null;

    // Buscar en propiedades del objeto actual
    for (const [key, value] of Object.entries(obj)) {
      // Si la clave coincide con el patrón
      if (key.toLowerCase().includes(filenamePattern.toLowerCase())) {
        if (typeof value === 'string' && value.length > 10) {
          return value;
        }
      }

      // Si el valor es un objeto, buscar recursivamente
      if (typeof value === 'object' && value !== null) {
        const found = deepSearch(value, targetKey);
        if (found) return found;
      }
    }
    return null;
  }

  // También buscar en todo el texto si el objeto está anidado de forma extraña
  const jsonString = JSON.stringify(openaiFiles);
  const lines = jsonString.split('\n');

  // Buscar patrones específicos
  const searchPatterns = [
    filenamePattern,
    filenamePattern.replace('.java', ''),
    filenamePattern.toLowerCase(),
    filenamePattern.replace('.java', '').toLowerCase()
  ];

  for (const pattern of searchPatterns) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(pattern.toLowerCase())) {
        // Intentar extraer el contenido Java
        let content = '';
        let inCodeBlock = false;

        // Buscar desde esta línea hacia adelante
        for (let j = i; j < Math.min(i + 50, lines.length); j++) {
          if (lines[j].includes('package ') || lines[j].includes('import ') ||
              lines[j].includes('public class') || lines[j].includes('class ')) {
            inCodeBlock = true;
          }

          if (inCodeBlock) {
            content += lines[j] + '\n';

            // Detectar fin de bloque de código (línea vacía después de llave de cierre)
            if (lines[j].includes('}') && (j + 1 < lines.length) &&
                (lines[j + 1].trim() === '' || lines[j + 1].includes('"'))) {
              break;
            }
          }
        }

        if (content.length > 100) {
          // Limpiar el contenido de caracteres JSON
          content = content.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
          return content;
        }
      }
    }
  }

  return null;
}

// Archivos esperados de OpenAI con sus placeholders por defecto
const expectedOpenAIFiles = {
  // Questions
  'UserQuestion.java': {
    path: 'src/main/java/co/com/template/automation/testing/questions/UserQuestion.java',
    placeholder: `package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.questions.Text;

import static co.com.template.automation.testing.ui.UserPage.USERNAME_DISPLAY;

public class UserQuestion {

    public static Question<String> displayedUsername() {
        return actor -> Text.of(USERNAME_DISPLAY).viewedBy(actor).asString();
    }
}`
  },

  // Tasks
  'UserTask.java': {
    path: 'src/main/java/co/com/template/automation/testing/tasks/UserTask.java',
    placeholder: `package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Click;
import net.serenitybdd.screenplay.actions.Enter;

import static co.com.template.automation.testing.ui.UserPage.*;

public class UserTask {

    public static Task loginWithCredentials(String username, String password) {
        return Task.where("{0} logs in with username " + username,
            Enter.theValue(username).into(USERNAME_FIELD),
            Enter.theValue(password).into(PASSWORD_FIELD),
            Click.on(LOGIN_BUTTON)
        );
    }
}`
  },

  // Pages
  'LoginPage.java': {
    path: 'src/main/java/co/com/template/automation/testing/ui/LoginPage.java',
    placeholder: `package co.com.template.automation.testing.ui;

import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.screenplay.targets.Target;

public class LoginPage extends PageObject {

    public static final Target USERNAME_FIELD = Target
        .the("username field")
        .locatedBy("input[name='username']");

    public static final Target PASSWORD_FIELD = Target
        .the("password field")
        .locatedBy("input[name='password']");

    public static final Target LOGIN_BUTTON = Target
        .the("login button")
        .locatedBy("button[type='submit']");
}`
  },

  // Utils
  'ShadowDomUtils.java': {
    path: 'src/main/java/co/com/template/automation/testing/utils/ShadowDomUtils.java',
    placeholder: `package co.com.template.automation.testing.utils;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class ShadowDomUtils {

    public static WebElement expandShadowRoot(WebDriver driver, WebElement shadowHost) {
        JavascriptExecutor js = (JavascriptExecutor) driver;
        return (WebElement) js.executeScript(
            "return arguments[0].shadowRoot", shadowHost
        );
    }

    public static WebElement findInShadowRoot(WebDriver driver, WebElement shadowHost, String cssSelector) {
        JavascriptExecutor js = (JavascriptExecutor) driver;
        return (WebElement) js.executeScript(
            "return arguments[0].shadowRoot.querySelector(arguments[1])",
            shadowHost, cssSelector
        );
    }
}`
  },

  'EnvironmentProperties.java': {
    path: 'src/main/java/co/com/template/automation/testing/utils/EnvironmentProperties.java',
    placeholder: `package co.com.template.automation.testing.utils;

import net.serenitybdd.model.environment.EnvironmentSpecificConfiguration;
import net.thucydides.model.environment.SystemEnvironmentVariables;

public final class EnvironmentProperties {

    private EnvironmentProperties() {
        // Utility class
    }

    public static String getProperty(String propertyName) {
        return EnvironmentSpecificConfiguration.from(
            SystemEnvironmentVariables.createEnvironmentVariables()
        ).getProperty(propertyName);
    }

    public static String getUrl() {
        return getProperty("webdriver.base.url");
    }
}`
  },

  // Definitions
  'FlujosDefinitions.java': {
    path: 'src/test/java/co/com/template/automation/testing/definitions/FlujosDefinitions.java',
    placeholder: `package co.com.template.automation.testing.definitions;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
import net.serenitybdd.screenplay.actors.OnStage;

import static co.com.template.automation.testing.tasks.UserTask.*;
import static co.com.template.automation.testing.questions.UserQuestion.*;

public class FlujosDefinitions {

    @Given("the user is on the login page")
    public void userIsOnLoginPage() {
        OnStage.theActorInTheSpotlight().attemptsTo(
            // Open the application
        );
    }

    @When("the user logs in with {string} and {string}")
    public void userLogsIn(String username, String password) {
        OnStage.theActorInTheSpotlight().attemptsTo(
            loginWithCredentials(username, password)
        );
    }

    @Then("the user should see their username displayed")
    public void userShouldSeeUsername() {
        OnStage.theActorInTheSpotlight().should(
            seeThat(displayedUsername(), equalTo("expected_username"))
        );
    }
}`
  },

  // Hooks
  'Hooks.java': {
    path: 'src/test/java/co/com/template/automation/testing/definitions/hooks/Hooks.java',
    placeholder: `package co.com.template.automation.testing.definitions.hooks;

import io.cucumber.java.Before;
import io.cucumber.java.After;
import net.serenitybdd.screenplay.actors.Cast;
import net.serenitybdd.screenplay.actors.OnStage;
import net.thucydides.model.util.EnvironmentVariables;
import org.openqa.selenium.WebDriver;

public class Hooks {

    private EnvironmentVariables environmentVariables;
    private WebDriver driver;

    @Before
    public void setTheStage() {
        OnStage.setTheStage(new Cast());
    }

    @After
    public void tearDown() {
        OnStage.drawTheCurtain();
        if (driver != null) {
            driver.quit();
        }
    }
}`
  }
};

// Procesar cada archivo esperado
for (const [fileName, fileInfo] of Object.entries(expectedOpenAIFiles)) {
  let content = findFileContentInOpenAIResponse(fileName);

  if (!content || content.length < 100) {
    // También buscar por nombre sin extensión
    const fileNameWithoutExt = fileName.replace('.java', '');
    content = findFileContentInOpenAIResponse(fileNameWithoutExt);
  }

  if (content && content.length > 100) {
    // Verificar que sea código Java válido
    if (content.includes('package ') || content.includes('public class')) {
      files[fileInfo.path] = content;
      console.log(`✅ ${fileInfo.path} obtenido de OpenAI (${content.length} chars)`);
    } else {
      files[fileInfo.path] = fileInfo.placeholder;
      console.log(`⚠️  ${fileInfo.path} contenido inválido, usando placeholder`);
    }
  } else {
    files[fileInfo.path] = fileInfo.placeholder;
    console.log(`⚠️  ${fileInfo.path} no encontrado en OpenAI, usando placeholder (${fileInfo.placeholder.length} chars)`);
  }
}




        // 3. FEATURE FILE (especial)
        if (openaiFiles['src/test/resources/features/flujos.feature']) {
          files['src/test/resources/features/flujos.feature'] = openaiFiles['src/test/resources/features/flujos.feature'];
        } else if (openaiFiles['flujos.feature']) {
          files['src/test/resources/features/flujos.feature'] = openaiFiles['flujos.feature'];
        } else {
          files['src/test/resources/features/flujos.feature'] = `Feature: Automation Flow
      Scenario: Test Scenario
        Given the user opens the application
        When the user performs actions
        Then the results should be verified`;
        }

        // 4. ARCHIVOS DE CONFIGURACIÓN BÁSICOS
        console.log("⚙️  Agregando archivos de configuración...");

        files['src/test/resources/junit-platform.properties'] = "cucumber.junit-platform.naming-strategy=long\ncucumber.plugin=pretty,html:target/cucumber-report.html";
        files['src/test/resources/logback-test.xml'] = `<?xml version="1.0" encoding="UTF-8"?>
    <configuration>
        <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
            <encoder><pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern></encoder>
        </appender>
        <root level="INFO"><appender-ref ref="STDOUT" /></root>
    </configuration>`;
        files['.gitignore'] = "target/\n*.iml\n.idea/\n.DS_Store\n*.log\nnode_modules/\ndist/\nbuild/";
        files['browserstack.yml'] = `browserstack:
      user: "your_user"
      key: "your_key"
      browsers:
        - browserName: chrome
          browserVersion: latest
          os: Windows
          osVersion: 10`;
        files['LICENSE'] = "MIT License\n\nCopyright (c) 2024 Automation Project";
        files['README.md'] = `# Serenity BDD Automation Project\n\nProyecto generado automáticamente para automatización de pruebas.`;
        files['serenity.properties'] = "serenity.project.name=serenity-automation-template\nserenity.take.screenshots=FOR_EACH_ACTION\nserenity.logging=VERBOSE\nwebdriver.driver=chrome";
        files['sonar-project-custom.properties'] = "sonar.projectKey=co.com.template.automation.testing\nsonar.projectName=Serenity Automation Template\nsonar.projectVersion=1.0.0\nsonar.sources=src/main/java\nsonar.tests=src/test/java\nsonar.java.binaries=target/classes";


        // En server.js, dentro del endpoint /api/transform-recording, después de procesar openaiFiles:

        // Asegurar que tenemos todos los archivos necesarios
        const requiredFiles = {
          'feature': 'src/test/resources/features/login_admin_search.feature',
          'stepdef': 'src/test/java/co/com/template/automation/testing/definitions/LoginDefinitions.java',
          'loginPage': 'src/main/java/co/com/template/automation/testing/ui/LoginPage.java',
          'adminPage': 'src/main/java/co/com/template/automation/testing/ui/AdminPage.java',
          'loginTask': 'src/main/java/co/com/template/automation/testing/tasks/LoginTask.java',
          'adminTask': 'src/main/java/co/com/template/automation/testing/tasks/NavigateToAdminTask.java',
          'searchTask': 'src/main/java/co/com/template/automation/testing/tasks/SearchUserTask.java',
          'loginQuestion': 'src/main/java/co/com/template/automation/testing/questions/LoginSuccessfulQuestion.java',
          'searchQuestion': 'src/main/java/co/com/template/automation/testing/questions/SearchResultsQuestion.java',
          'hooks': 'src/test/java/co/com/template/automation/testing/definitions/hooks/Hooks.java'
        };

        // Verificar y crear placeholders si faltan archivos
        for (const [key, filePath] of Object.entries(requiredFiles)) {
          if (!files[filePath] || files[filePath].length < 50) {
            console.log(`⚠️  ${filePath} no generado por OpenAI, creando placeholder...`);

            switch(key) {
              case 'feature':
                files[filePath] = `Feature: OrangeHRM Automation
          Scenario: Login and search user
            Given I open the OrangeHRM application
            When I login with username "Admin" and password "admin123"
            And I navigate to Admin section
            And I search for user "Test User"
            Then I should see search results`;
                break;

              case 'stepdef':
                files[filePath] = `package co.com.template.automation.testing.definitions;

        import io.cucumber.java.en.*;
        import net.serenitybdd.screenplay.actors.OnStage;

        public class LoginDefinitions {

            @Given("I open the OrangeHRM application")
            public void iOpenTheApplication() {
                // Navigation handled by StepUrl class
            }

            @When("I login with username {string} and password {string}")
            public void iLoginWithCredentials(String username, String password) {
                // Implement login logic
            }

            @When("I navigate to Admin section")
            public void iNavigateToAdminSection() {
                // Implement navigation logic
            }

            @When("I search for user {string}")
            public void iSearchForUser(String userName) {
                // Implement search logic
            }

            @Then("I should see search results")
            public void iShouldSeeSearchResults() {
                // Implement verification logic
            }
        }`;
                break;

              case 'loginPage':
                files[filePath] = `package co.com.template.automation.testing.ui;

        import net.serenitybdd.core.pages.PageObject;
        import net.serenitybdd.screenplay.targets.Target;

        public class LoginPage extends PageObject {

            public static final Target USERNAME_FIELD = Target
                .the("username field")
                .locatedBy("input[name='username']");

            public static final Target PASSWORD_FIELD = Target
                .the("password field")
                .locatedBy("input[name='password']");

            public static final Target LOGIN_BUTTON = Target
                .the("login button")
                .locatedBy("button[type='submit']");
        }`;
                break;

           case 'EnvironmentProperties':
              files[filePath] = `package co.com.template.automation.testing.utils.EnvironmentProperties.java;

        import net.serenitybdd.model.environment.EnvironmentSpecificConfiguration;
        import net.thucydides.model.configuration.SystemPropertiesConfiguration;
        import net.thucydides.model.environment.SystemEnvironmentVariables;
        import net.thucydides.model.util.EnvironmentVariables;

        public final class EnvironmentProperties {

            private static final SystemPropertiesConfiguration CONFIGURATION = new SystemPropertiesConfiguration(SystemEnvironmentVariables.createEnvironmentVariables());
            private static final EnvironmentVariables ENV_VARIABLES = CONFIGURATION.getEnvironmentVariables();

            private EnvironmentProperties() {
            }

            public static String getProperty(String nameProperty) {
                return EnvironmentSpecificConfiguration.from(ENV_VARIABLES).getProperty(nameProperty);
            }

            public static String getProperties() {

                return EnvironmentProperties.getProperties();
            }
        }`

            break;

              // ... agregar más placeholders según sea necesario
            }
          }
        }





        // ========== GUARDAR ARCHIVOS ==========
        const jobId = `job_${Date.now()}`;
        const outDir = path.join(__dirname, "output", jobId);
        fs.mkdirSync(outDir, { recursive: true });

        console.log(`💾 Guardando ${Object.keys(files).length} archivos en: ${outDir}`);

        for(const [fname, content] of Object.entries(files)){
          const p = path.join(outDir, fname);
          try {
            fs.mkdirSync(path.dirname(p), { recursive: true });
            fs.writeFileSync(p, content, "utf8");
            console.log(`   📄 ${fname} (${content.length} chars)`);
          } catch (fileError) {
            console.error(`❌ Error guardando ${fname}:`, fileError.message);
          }
        }

        // ========== CREAR ZIP ==========
        const zipPath = path.join(__dirname, "output", `${jobId}.zip`);
        const zip = new AdmZip();
        zip.addLocalFolder(outDir);
        zip.writeZip(zipPath);

        console.log("🎉 Proyecto generado exitosamente:", jobId);
        res.json({ jobId, download: `/api/download/${jobId}`, fileCount: Object.keys(files).length });

      } catch(err){
        console.error("❌ transform error", err);
        res.status(500).json({ error: err.message });
      }
    });

    // existing validate-locators (Playwright)
    app.post("/api/validate-locators", async (req,res)=>{
      const { baseUrl, selectors } = req.body;
      if (!baseUrl || !selectors) return res.status(400).json({ error: "baseUrl/selectors required" });
      const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
      const page = await browser.newPage();
      const results = [];
      try {
          await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
          for(const s of selectors){
            try{ await page.waitForSelector(s.selector, { timeout: 3000 }); results.push({ selector: s.selector, ok: true }); }
            catch(e){ results.push({ selector: s.selector, ok: false, message: e.message }); }
          }
        } catch(e){ console.error(e); return res.status(500).json({ error: e.message }); } finally { await browser.close(); }
        res.json({ total: selectors.length, results });
      });

      // download
      app.get("/api/download/:jobId", (req,res)=>{
        const { jobId } = req.params;
        const p = path.join(__dirname, "output", `${jobId}.zip`);
        if (!fs.existsSync(p)) return res.status(404).send("Not found");
        res.download(p);
      });

      // save recording
      app.post("/api/record", (req,res)=>{
        try {
          const rec = req.body;
          const id = `rec_${Date.now()}`;
          const file = path.join(__dirname, "output", `${id}.json`);
          fs.writeFileSync(file, JSON.stringify(rec, null, 2), "utf8");
          res.json({ id, path: `/api/record/${id}` });
        } catch(e){ res.status(500).json({ error: e.message }); }
      });

      app.listen(PORT, "0.0.0.0", ()=>console.log("Listening", PORT));

