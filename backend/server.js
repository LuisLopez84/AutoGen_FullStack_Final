#!/usr/bin/env node

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


import { generatePDF, generateCSV, generateZapPDF, generateZapCSV } from './exportUtils.js';
import { ZapService } from './zapService.js'; // Importar la clase
//import { generateZapPDF, generateZapCSV } from './exportUtils.js'; // Importar utilidades
import { normalizePageSpeed } from './pagespeed/normalizePageSpeed.js';
import { translateToSpanish } from './pagespeed/translateToSpanish.js';
import { AUDIT_TRANSLATIONS } from './pagespeed/auditTranslations.js';
//import { generatePDF, generateCSV } from './exportUtils.js';
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import AdmZip from "adm-zip";
import OpenAI from "openai";
import { chromium } from "playwright";
import { buildDynamicPrompt, buildTransformPrompt } from "./prompts/generateProjectPrompts.js";
import dotenv from 'dotenv';

// Cargar .env inmediatamente
const envPath = path.join(__dirname, '.env');
console.log("🌍 Cargando variables de entorno...");
console.log("   - Ruta del .env:", envPath);
console.log("   - Existe .env:", fs.existsSync(envPath));

// Forzar recarga desde la ruta correcta
dotenv.config({ path: envPath });

// Ahora inicializar OpenAI DESPUÉS de cargar dotenv
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Verificar que dotenv esté cargando correctamente
console.log("🌍 Cargando variables de entorno...");
console.log("   - Ruta del .env:", path.join(__dirname, '.env'));
console.log("   - Existe .env:", fs.existsSync(path.join(__dirname, '.env')));

// Forzar recarga de .env
dotenv.config({ path: path.join(__dirname, '.env') });

// Verificar variables cargadas
console.log("🔍 Variables de entorno cargadas:");
console.log("   - OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "✅ Presente" : "❌ Ausente");
console.log("   - PAGESPEED_API_KEY:", process.env.PAGESPEED_API_KEY ? "✅ Presente" : "❌ Ausente");
console.log("   - NODE_ENV:", process.env.NODE_ENV || "development");


const CATEGORY_DESCRIPTIONS = {
  'performance': 'Mide qué tan rápido carga tu página y responde a la interacción del usuario.',
  'accessibility': 'Evalúa qué tan accesible es tu sitio para personas con discapacidades.',
  'best-practices': 'Verifica si tu sitio sigue las mejores prácticas web modernas.',
  'seo': 'Analiza la optimización para motores de búsqueda de tu sitio.',
  'pwa': 'Evalúa las capacidades de Progressive Web App.'
};

const SCORE_LABELS = {
  90: 'Excelente',
  70: 'Bueno',
  50: 'Necesita Mejora',
  0: 'Pobre'
};


// ==========================================
// CONTENIDO ESTÁTICO DEL PROYECTO (Tu código real)
// ==========================================

const PLAYWRIGHT_TEMPLATE_FILES = {

// 1. HOOKS.JAVA
  "src/test/java/co/com/automation/testing/base/Hooks.java":

`package co.com.automation.testing.base;

import co.com.automation.testing.utils.DataProvider;
import com.microsoft.playwright.*;
import io.cucumber.java.*;
import io.qameta.allure.Allure;

import java.io.FileInputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

public class Hooks {

    private static Page page;
    private static Browser browser;
    private static BrowserContext context;

    @BeforeAll
    public static void beforeAll() {
        System.out.println("🚀 INICIANDO EJECUCIÓN DE TESTS");

        createDirectories();

        Playwright playwright = Playwright.create();

        // Obtener dimensiones de pantalla
        java.awt.Dimension screenSize = java.awt.Toolkit.getDefaultToolkit().getScreenSize();
        int screenWidth = (int) screenSize.getWidth();
        int screenHeight = (int) screenSize.getHeight();

        System.out.println("📐 Resolución de pantalla detectada: " +
                screenWidth + "x" + screenHeight);

        BrowserType.LaunchOptions launchOptions = new BrowserType.LaunchOptions()
                .setHeadless(false)
                .setArgs(java.util.Arrays.asList(
                        "--start-maximized",  // Maximizar ventana
                        "--disable-infobars",
                        "--disable-dev-shm-usage",
                        "--disable-gpu",
                        "--no-sandbox",
                        "--window-size=" + screenWidth + "," + screenHeight  // Tamaño completo
                ))
                .setSlowMo(50);

        browser = playwright.chromium().launch(launchOptions);
        System.out.println("✅ Navegador iniciado en modo maximizado");
    }

    private static void createDirectories() {
        try {
            Path videosDir = Paths.get("target/videos");
            if (!Files.exists(videosDir)) Files.createDirectories(videosDir);

            Path screenshotsDir = Paths.get("target/screenshots");
            if (!Files.exists(screenshotsDir)) Files.createDirectories(screenshotsDir);

            Path allureResultsDir = Paths.get("target/allure-results");
            if (!Files.exists(allureResultsDir)) Files.createDirectories(allureResultsDir);

        } catch (Exception e) {
            System.err.println("❌ Error creando directorios: " + e.getMessage());
        }
    }

    @Before
    public void before(Scenario scenario) {
        System.out.println("\n" + "=".repeat(50));
        System.out.println("🎬 INICIANDO ESCENARIO: " + scenario.getName());
        System.out.println("=".repeat(50));

        // Mostrar datos cargados de CSV
        DataProvider.printDataSummary();

        System.out.println("📋 Usuarios en login.csv: " + DataProvider.getAllLoginUsers());
        System.out.println("📋 Usuarios en busqueda.csv: " + DataProvider.getAllSearchUsers());

        // Obtener dimensiones de pantalla
        java.awt.Dimension screenSize = java.awt.Toolkit.getDefaultToolkit().getScreenSize();
        int screenWidth = (int) screenSize.getWidth();
        int screenHeight = (int) screenSize.getHeight();

        System.out.println("🖥️ Configurando viewport: " + screenWidth + "x" + screenHeight);

        // Configurar contexto con tamaño completo
        context = browser.newContext(new Browser.NewContextOptions()
                .setViewportSize(screenWidth, screenHeight)  // Tamaño completo
                .setScreenSize(screenWidth, screenHeight)     // Tamaño de pantalla
                .setRecordVideoDir(Paths.get("target/videos"))
                .setRecordVideoSize(screenWidth, screenHeight)  // Video en resolución completa
                .setIgnoreHTTPSErrors(true)
                .setDeviceScaleFactor(1.0));

        page = context.newPage();

        // Maximizar ventana del navegador
        try {
            // Intentar maximizar mediante JavaScript
            page.evaluate("() => window.moveTo(0, 0)");
            page.evaluate("() => window.resizeTo(screen.width, screen.height)");
        } catch (Exception e) {
            System.out.println("⚠️ No se pudo maximizar ventana via JS");
        }

        // Configurar timeouts
        page.setDefaultTimeout(60000);
        page.setDefaultNavigationTimeout(60000);

        // Adjuntar información
        Allure.addAttachment("Screen Configuration",
                "text/plain",
                "Resolution: " + screenWidth + "x" + screenHeight + "\n" +
                        "Video Size: " + screenWidth + "x" + screenHeight + "\n" +
                        "Scenario: " + scenario.getName());

        System.out.println("✅ Contexto configurado en resolución completa");
    }

    @After
    public void after(Scenario scenario) {
        System.out.println("\n" + "=".repeat(50));
        System.out.println("🏁 FINALIZANDO ESCENARIO: " + scenario.getName());
        System.out.println("=".repeat(50));

        try {
            // Tomar screenshot final
            takeFullPageScreenshot(scenario);

            // Esperar para video completo
            Thread.sleep(1000);

        } catch (Exception e) {
            System.err.println("⚠️ Error final: " + e.getMessage());
        } finally {
            try {
                // Cerrar contexto (guarda video)
                if (context != null) {
                    context.close();
                    System.out.println("✅ Contexto cerrado");

                    // Procesar video
                    processVideo(scenario.getName(), getScreenSize());
                }

            } catch (Exception e) {
                System.err.println("❌ Error cerrando: " + e.getMessage());
            }
        }
    }

    private java.awt.Dimension getScreenSize() {
        return java.awt.Toolkit.getDefaultToolkit().getScreenSize();
    }

    private void takeFullPageScreenshot(Scenario scenario) {
        try {
            // Tomar screenshot de toda la página - REMOVER .setQuality(100) para PNG
            byte[] screenshot = page.screenshot(new Page.ScreenshotOptions()
                    .setFullPage(true));
            // .setQuality(100)); // ← REMOVER ESTA LÍNEA

            String fileName = scenario.getName().replaceAll("[^a-zA-Z0-9]", "_") + ".png";
            Path screenshotPath = Paths.get("target/screenshots/" + fileName);
            Files.write(screenshotPath, screenshot);

            // Adjuntar a Allure
            scenario.attach(screenshot, "image/png", "Full Page Screenshot");

            System.out.println("📸 Screenshot completo guardado: " +
                    Files.size(screenshotPath) / 1024 + " KB");

        } catch (Exception e) {
            System.err.println("⚠️ Error tomando screenshot: " + e.getMessage());
        }
    }

    private void processVideo(String scenarioName, java.awt.Dimension screenSize) {
        try {
            System.out.println("🎥 Procesando video...");

            Path videoDir = Paths.get("target/videos");
            if (!Files.exists(videoDir)) {
                System.err.println("❌ No existe directorio de videos");
                return;
            }

            // Buscar video más reciente
            var videos = Files.list(videoDir)
                    .filter(p -> p.toString().toLowerCase().endsWith(".webm"))
                    .sorted((p1, p2) -> {
                        try {
                            return Files.getLastModifiedTime(p2).compareTo(Files.getLastModifiedTime(p1));
                        } catch (Exception e) { return 0; }
                    })
                    .toList();

            if (videos.isEmpty()) {
                System.err.println("❌ No hay videos");
                return;
            }

            Path videoFile = videos.get(0);
            System.out.println("📹 Video encontrado: " + videoFile.getFileName());

            // Renombrar
            String safeName = scenarioName.replaceAll("[^a-zA-Z0-9-_]", "_");
            String newName = "video_" + safeName + "_" +
                    screenSize.width + "x" + screenSize.height +
                    "_" + System.currentTimeMillis() + ".webm";

            // Copiar a allure-results
            Path allurePath = Paths.get("target/allure-results/" + newName);
            Files.createDirectories(allurePath.getParent());
            Files.copy(videoFile, allurePath, StandardCopyOption.REPLACE_EXISTING);

            // Adjuntar
            try (FileInputStream fis = new FileInputStream(allurePath.toFile())) {
                Allure.addAttachment("Video: " + scenarioName + " [" +
                                screenSize.width + "x" + screenSize.height + "]",
                        "video/webm",
                        fis,
                        ".webm");

                System.out.println("✅ Video adjuntado: " + newName);
                System.out.println("📐 Resolución: " + screenSize.width + "x" + screenSize.height);
            }

            // Limpiar original
            Files.deleteIfExists(videoFile);

        } catch (Exception e) {
            System.err.println("❌ Error procesando video: " + e.getMessage());
        }
    }

    @AfterAll
    public static void afterAll() {
        System.out.println("\n" + "=".repeat(50));
        System.out.println("🏁 TESTS FINALIZADOS");
        System.out.println("=".repeat(50));

        if (browser != null) {
            browser.close();
            System.out.println("✅ Navegador cerrado");
        }
    }

    public static Page getPage() {
        return page;
    }
}`,









// 2. CommonSteps.JAVA
  "src/test/java/co/com/automation/testing/commons/CommonSteps.java":

`package co.com.automation.testing.commons;

import co.com.automation.testing.base.Hooks;
import co.com.automation.testing.config.UserConstants;
import co.com.automation.testing.tasks.LoginTasks;
import co.com.automation.testing.questions.LoginQuestions;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
import org.junit.jupiter.api.Assertions;

public class CommonSteps {
    private LoginTasks loginTasks;
    private LoginQuestions loginQuestions;

    // ========== STEPS TRANSVERSALES DE NAVEGACIÓN ==========

    @Given("que el usuario navega a la página de login")
    public void navegarPaginaLogin() {
        System.out.println("🔗 Navegando a página de login...");
        loginTasks = new LoginTasks(Hooks.getPage());
        loginQuestions = new LoginQuestions(Hooks.getPage());
        loginTasks.navigateToLogin();
    }

    @Given("el usuario está en la página principal")
    public void usuarioEnPaginaPrincipal() {
        // Navegar a la página principal de la aplicación
        Hooks.getPage().navigate("https://opensource-demo.orangehrmlive.com");
        System.out.println("🏠 Usuario en página principal");
    }

    @Given("el usuario recarga la página")
    public void recargarPagina() {
        Hooks.getPage().reload();
        System.out.println("🔄 Página recargada");
    }

    // ========== STEPS TRANSVERSALES DE ESPERA ==========

    @When("el usuario espera {int} segundos")
    public void esperarSegundos(int segundos) {
        System.out.println("⏳ Esperando " + segundos + " segundos...");
        try {
            Thread.sleep(segundos * 1000L);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            System.out.println("⚠️ Interrupción durante la espera");
        }
    }

    @When("el usuario espera a que cargue la página")
    public void esperarCargaPagina() {
        Hooks.getPage().waitForLoadState();
        System.out.println("✅ Página cargada completamente");
    }

    // ========== STEPS TRANSVERSALES DE VALIDACIÓN GENÉRICA ==========

    @Then("la página se carga correctamente")
    public void validarCargaPagina() {
        String currentUrl = Hooks.getPage().url();
        Assertions.assertFalse(currentUrl.contains("error"),
                "La página contiene 'error' en la URL: " + currentUrl);
        System.out.println("✓ Página cargada correctamente: " + currentUrl);
    }

    @Then("se muestra el título {string}")
    public void validarTituloPagina(String tituloEsperado) {
        String tituloActual = Hooks.getPage().title();
        Assertions.assertTrue(tituloActual.contains(tituloEsperado),
                String.format("Título esperado: '%s', Título actual: '%s'",
                        tituloEsperado, tituloActual));
        System.out.println("✓ Título verificado: " + tituloEsperado);
    }

    @Then("la URL contiene {string}")
    public void validarURLContiene(String texto) {
        String urlActual = Hooks.getPage().url();
        Assertions.assertTrue(urlActual.contains(texto),
                String.format("URL debería contener '%s', URL actual: '%s'",
                        texto, urlActual));
        System.out.println("✓ URL contiene: " + texto);
    }

    // ========== STEPS TRANSVERSALES DE AUTENTICACIÓN ==========

    @Given("el usuario está autenticado como administrador")
    public void usuarioAutenticadoComoAdmin() {
        navegarPaginaLogin();

        // Ahora puede buscar por "admin" (userType) o "Admin" (username)
        loginTasks.loginAs("admin");

        Assertions.assertTrue(loginQuestions.isDashboardDisplayed(),
                "El usuario no pudo autenticarse como administrador");
        System.out.println("👨‍💼 Usuario autenticado como administrador");
    }

    @Given("el usuario está autenticado como {string}")
    public void usuarioAutenticadoComo(String tipoUsuario) {
        navegarPaginaLogin();

        // El método mejorado busca automáticamente
        loginTasks.loginAs(tipoUsuario);

        Assertions.assertTrue(loginQuestions.isDashboardDisplayed(),
                String.format("El usuario no pudo autenticarse como %s", tipoUsuario));
        System.out.println("👤 Usuario autenticado como: " + tipoUsuario);
    }

    // ========== STEPS TRANSVERSALES DE NAVEGACIÓN ENTRE MÓDULOS ==========

    @Given("el usuario navega al módulo {string}")
    public void navegarAModulo(String modulo) {
        // Este step es TRANSVERSAL porque puede usarse para ir a cualquier módulo
        switch (modulo.toLowerCase()) {
            case "admin":
                Hooks.getPage().click("a[href*='viewAdminModule']");
                System.out.println("📊 Navegando al módulo Admin");
                break;
            case "pim":
                Hooks.getPage().click("a[href*='viewPimModule']");
                System.out.println("👥 Navegando al módulo PIM");
                break;
            case "leave":
                Hooks.getPage().click("a[href*='viewLeaveModule']");
                System.out.println("🏖️ Navegando al módulo Leave");
                break;
            case "dashboard":
                Hooks.getPage().click("a[href*='dashboard']");
                System.out.println("📈 Navegando al Dashboard");
                break;
            default:
                throw new IllegalArgumentException("Módulo no reconocido: " + modulo);
        }

        // Esperar carga del módulo
        Hooks.getPage().waitForLoadState();
    }

    // ========== STEPS TRANSVERSALES DE UTILIDAD ==========

    @When("el usuario toma un screenshot")
    public void tomarScreenshot() {
        byte[] screenshot = Hooks.getPage().screenshot();
        System.out.println("📸 Screenshot tomado");
        // Aquí podrías adjuntarlo a Allure si lo necesitas
    }

    @When("el usuario navega hacia atrás")
    public void navegarAtras() {
        Hooks.getPage().goBack();
        System.out.println("↩️ Navegando hacia atrás");
    }

    @When("el usuario navega hacia adelante")
    public void navegarAdelante() {
        Hooks.getPage().goForward();
        System.out.println("↪️ Navegando hacia adelante");
    }
}`,








// 3. Config.JAVA
  "src/test/java/co/com/automation/testing/config/Config.java":

`package co.com.automation.testing.config;

public class Config {

    private Config() {}

    public static final String BASE_URL =
            System.getProperty(
                    "base.url",
                    "https://opensource-demo.orangehrmlive.com"
            );

    public static final String BROWSER =
            System.getProperty("browser", "Chromium");

    public static final String ENV =
            System.getProperty("env", "QA");

    public static final boolean HEADLESS =
            Boolean.parseBoolean(System.getProperty("headless", "false"));
}`,







// 4. DeviceConfig.JAVA
  "src/test/java/co/com/automation/testing/config/DeviceConfig.java":

`package co.com.automation.testing.config;

import com.microsoft.playwright.Browser;

public class DeviceConfig {

    public static Browser.NewContextOptions get(DeviceType type) {

        Browser.NewContextOptions options = new Browser.NewContextOptions();

        switch (type) {
            case MOBILE -> options
                    .setViewportSize(390, 844)   // iPhone 12
                    .setDeviceScaleFactor(3)
                    .setIsMobile(true)
                    .setHasTouch(true)
                    .setUserAgent(
                            "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)"
                    );

            case TABLET -> options
                    .setViewportSize(768, 1024)
                    .setIsMobile(true);

            default -> options
                    .setViewportSize(1920, 1080);
        }

        return options;
    }
}`,











// 5. DeviceType.JAVA
  "src/test/java/co/com/automation/testing/config/DeviceType.java":

`package co.com.automation.testing.config;

public enum DeviceType {
    DESKTOP,
    MOBILE,
    TABLET
}`,






// 6. UserConstants.JAVA
  "src/test/java/co/com/automation/testing/config/UserConstants.java":

`package co.com.automation.testing.config;

public class UserConstants {

    // ========== REFERENCIAS (NO valores hardcodeados) ==========
    // Estos nombres son referencias que usamos en el código
    // Los valores REALES vienen del CSV

    public static final String REF_ADMIN = "Admin";
    public static final String REF_LOPEZ = "LLOPEZ";
    public static final String REF_ESS = "ESS";
    public static final String REF_USER1 = "User1";

    // ========== TIPOS DE USUARIO (PARA CSV login.csv - MANTENER PARA BACKWARD COMPATIBILITY) ==========
    public static final String USER_TYPE_ADMIN = "Admin";      // ← AGREGAR ESTA
    public static final String USER_TYPE_REGULAR = "User1";    // ← AGREGAR ESTA
    public static final String USER_TYPE_ESS = "ESS";          // ← AGREGAR ESTA

    // ========== CONSTANTES FIJAS (que no vienen de CSV) ==========
    public static final String ROLE_ADMIN = "Admin";
    public static final String ROLE_ESS = "ESS";
    public static final String STATUS_ENABLED = "Enabled";
    public static final String STATUS_DISABLED = "Disabled";

    // ========== NOMBRES DE EMPLEADOS (para referencia) ==========
    public static final String EMPLOYEE_LOPEZ = "Joseph Evans";
    public static final String EMPLOYEE_ADMIN = "FirstNameTestTest 28 akhil LastNameTest";
}`,







// 7 . AllureListener.JAVA
  "src/test/java/co/com/automation/testing/listeners/AllureListener.java":

`package co.com.automation.testing.listeners;

import io.qameta.allure.Allure;
import io.qameta.allure.listener.StepLifecycleListener;
import io.qameta.allure.model.StepResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.UUID;

public class AllureListener implements StepLifecycleListener {

    private static final Logger logger = LoggerFactory.getLogger(AllureListener.class);

    @Override
    public void beforeStepStart(StepResult result) {
        // Agregar información antes de cada paso
        result.setName(result.getName() + " [" + UUID.randomUUID().toString().substring(0, 8) + "]");
        logger.info("Iniciando paso: {}", result.getName());
    }

    @Override
    public void afterStepUpdate(StepResult result) {
        logger.info("Finalizando paso: {}", result.getName());
    }
}`,








// 8. MenuComponent.JAVA
  "src/test/java/co/com/automation/testing/pages/components/MenuComponent.java":

`package co.com.automation.testing.pages.components;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.Locator;

public class MenuComponent {

    private final Page page;

    // Locators del menú
    private final String adminMenu = "a[href*='viewAdminModule']";
    private final String pimMenu = "a[href*='viewPimModule']";
    private final String leaveMenu = "a[href*='viewLeaveModule']";
    private final String timeMenu = "a[href*='viewTimeModule']";
    private final String recruitmentMenu = "a[href*='viewRecruitmentModule']";
    private final String myInfoMenu = "a[href*='viewMyDetails']";
    private final String performanceMenu = "a[href*='viewPerformanceModule']";
    private final String dashboardMenu = "a[href*='dashboard']";
    private final String directoryMenu = "a[href*='viewDirectory']";
    private final String maintenanceMenu = "a[href*='viewMaintenanceModule']";
    private final String buzzMenu = "a[href*='viewBuzz']";

    public MenuComponent(Page page) {
        this.page = page;
    }

    public void clickAdmin() {
        page.click(adminMenu);
    }

    public void clickPIM() {
        page.click(pimMenu);
    }

    public void clickLeave() {
        page.click(leaveMenu);
    }

    public void clickTime() {
        page.click(timeMenu);
    }

    public void clickRecruitment() {
        page.click(recruitmentMenu);
    }

    public void clickMyInfo() {
        page.click(myInfoMenu);
    }

    public void clickPerformance() {
        page.click(performanceMenu);
    }

    public void clickDashboard() {
        page.click(dashboardMenu);
    }

    public void clickDirectory() {
        page.click(directoryMenu);
    }

    public void clickMaintenance() {
        page.click(maintenanceMenu);
    }

    public void clickBuzz() {
        page.click(buzzMenu);
    }

    public boolean isMenuVisible() {
        return page.locator(adminMenu).isVisible();
    }
}`,








// 9. AdminPage.JAVA
  "src/test/java/co/com/automation/testing/pages/AdminPage.java":

`package co.com.automation.testing.pages;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.options.WaitForSelectorState;

public class AdminPage {

    private final Page page;

    // Locators - Menú
    private final String adminMenu = "a[href*='viewAdminModule']";

    // Locators - Filtros
    private final String usernameFilter = "//label[contains(text(),'Username')]/following::input[1]";
    private final String userRoleDropdown = "//label[contains(text(),'User Role')]/following::div[contains(@class,'oxd-select-text')][1]";
    private final String employeeNameInput = "//label[contains(text(),'Employee Name')]/following::input[1]";
    private final String statusDropdown = "//label[contains(text(),'Status')]/following::div[contains(@class,'oxd-select-text')][1]";
    private final String searchButton = "//button[contains(@class,'oxd-button') and normalize-space()='Search']";

    // Locators - Resultados
    private final String gridRows = "div.oxd-table-card";
    private final String gridBody = "//div[@class='oxd-table-body']";

    public AdminPage(Page page) {
        this.page = page;
    }

    // === MÉTODOS DEL MENÚ ===
    public void clickAdminMenu() {
        page.click(adminMenu);
    }

    public void waitForAdminPageLoad() {
        page.waitForSelector("a[href*='viewAdminModule']",
                new Page.WaitForSelectorOptions().setTimeout(10000));
    }

    // === MÉTODOS DE FILTROS ===
    public void enterUsernameFilter(String username) {
        page.fill(usernameFilter, username);
    }

    public void selectUserRole(String role) {
        page.click(userRoleDropdown);
        page.waitForSelector("//div[@role='listbox']");
        String roleOption = String.format("//div[@role='option']//span[text()='%s']", role);
        page.click(roleOption);
    }

    public void selectEmployeeName(String employeeName) {
        Locator empField = page.locator(employeeNameInput);
        empField.click();
        empField.clear();
        empField.fill(employeeName);
        page.waitForTimeout(1500);
        empField.press("ArrowDown");
        page.waitForTimeout(500);
        empField.press("Enter");
        page.waitForTimeout(1000);
    }

    public void selectStatus(String status) {
        page.click(statusDropdown);
        page.waitForSelector("//div[@role='listbox']");
        String statusOption = String.format("//div[@role='option']//span[text()='%s']", status);
        page.click(statusOption);
    }

    public void clickSearchButton() {
        page.click(searchButton);
        page.waitForTimeout(2000);
        waitForGridToLoad();
    }

    // === MÉTODOS DE RESULTADOS Y GRID ===
    private void waitForGridToLoad() {
        page.waitForSelector(gridRows,
                new Page.WaitForSelectorOptions().setTimeout(10000));
    }

    public boolean isGridVisible() {
        try {
            return page.locator(gridRows).first().isVisible();
        } catch (Exception e) {
            return false;
        }
    }

    public int getGridRowCount() {
        return page.locator(gridRows).count();
    }

    public boolean isUserInGrid(String username) {
        String xpath = String.format("//div[@class='oxd-table-card']//div[contains(@class,'oxd-table-cell')][2]//div[text()='%s']", username);
        return page.locator(xpath).isVisible();
    }

    public boolean isUserInGridWithDetails(String username, String employeeName) {
        // Primero encontrar la fila con el username
        String rowXpath = String.format("//div[@class='oxd-table-card'][.//div[text()='%s']]", username);

        if (!page.locator(rowXpath).isVisible()) {
            return false;
        }

        // Verificar que el employee name coincida (búsqueda parcial)
        String employeeXpath = rowXpath + "//div[contains(@class,'oxd-table-cell')][4]//div[contains(text(),'" +
                employeeName.split(" ")[0] + "')]";
        return page.locator(employeeXpath).isVisible();
    }

    public String getUsernameFromRow(int rowIndex) {
        // rowIndex empieza en 1 para XPath
        String xpath = String.format("(//div[@class='oxd-table-card'])[%d]//div[contains(@class,'oxd-table-cell')][2]//div", rowIndex + 1);
        return page.locator(xpath).innerText().trim();
    }

    public String getEmployeeNameFromRow(int rowIndex) {
        String xpath = String.format("(//div[@class='oxd-table-card'])[%d]//div[contains(@class,'oxd-table-cell')][4]//div", rowIndex + 1);
        return page.locator(xpath).innerText().trim();
    }

    // === MÉTODOS DE VALIDACIÓN ===
    public boolean isAdminPageLoaded() {
        return page.url().contains("/admin") &&
                page.locator("//h5[contains(text(),'System Users')]").isVisible();
    }

    // === MÉTODO PARA DEBUG/LOGGING ===
    public void printGridInfo() {
        try {
            int rowCount = getGridRowCount();
            System.out.println("=== INFORMACIÓN DE LA GRILLA ===");
            System.out.println("Filas encontradas: " + rowCount);

            if (rowCount > 0) {
                System.out.println("Primeras 3 filas:");
                for (int i = 1; i <= Math.min(rowCount, 3); i++) {
                    String username = page.locator(
                            String.format("(//div[@class='oxd-table-card'])[%d]//div[contains(@class,'oxd-table-cell')][2]//div", i)
                    ).innerText().trim();

                    String employeeName = page.locator(
                            String.format("(//div[@class='oxd-table-card'])[%d]//div[contains(@class,'oxd-table-cell')][4]//div", i)
                    ).innerText().trim();

                    System.out.println("  Fila " + i + ": Username=" + username + ", Employee=" + employeeName);
                }
            }
        } catch (Exception e) {
            System.out.println("Error al imprimir información de la grilla: " + e.getMessage());
        }
    }
}`,








// 10. LoginPage.JAVA
  "src/test/java/co/com/automation/testing/pages/LoginPage.java":

`package co.com.automation.testing.pages;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.Locator;
import co.com.automation.testing.config.Config;

public class LoginPage {

    private final Page page;

    // Locators
    private final String usernameInput = "input[name='username']";
    private final String passwordInput = "input[name='password']";
    private final String loginButton = "button[type='submit']";
    private final String dashboardHeader = "h6.oxd-topbar-header-breadcrumb";
    private final String errorMessage = "//div[@role='alert']//p";

    public LoginPage(Page page) {
        this.page = page;
    }

    // ========== ACCIONES BÁSICAS ==========

    public void navigate() {
        page.navigate(Config.BASE_URL + "/web/index.php/auth/login");
        page.waitForLoadState();
    }

    public void enterUsername(String username) {
        page.fill(usernameInput, username);
    }

    public void enterPassword(String password) {
        page.fill(passwordInput, password);
    }

    public void clickLoginButton() {
        page.click(loginButton);
        page.waitForLoadState();
    }

    // ========== ACCIONES COMPUESTAS ==========

    public void login(String username, String password) {
        enterUsername(username);
        enterPassword(password);
        clickLoginButton();
    }

    // ========== VALIDACIONES ==========

    public boolean isLoginPageVisible() {
        return page.locator(usernameInput).isVisible() &&
                page.locator(passwordInput).isVisible();
    }

    public boolean isDashboardVisible() {
        return page.url().contains("/dashboard") ||
                page.locator(dashboardHeader).isVisible();
    }

    public boolean isErrorMessageVisible() {
        return page.locator(errorMessage).isVisible();
    }

    public String getErrorMessage() {
        if (isErrorMessageVisible()) {
            return page.locator(errorMessage).innerText();
        }
        return "";
    }
}`,









// 11. AdminQuestions.JAVA
  "src/test/java/co/com/automation/testing/questions/AdminQuestions.java":

`package co.com.automation.testing.questions;

import co.com.automation.testing.pages.AdminPage;
import com.microsoft.playwright.Page;

public class AdminQuestions {

    private final AdminPage adminPage;

    public AdminQuestions(Page page) {
        this.adminPage = new AdminPage(page);
    }

    public boolean isAdminPageDisplayed() {
        return adminPage.isAdminPageLoaded();
    }

    public boolean isUserFoundInGrid(String username) {
        return adminPage.isUserInGrid(username);
    }

    public boolean isUserFoundWithDetails(String username, String employeeName) {
        return adminPage.isUserInGridWithDetails(username, employeeName);
    }

    public int getNumberOfResults() {
        return adminPage.getGridRowCount();
    }

    public String getUsernameFromGrid(int rowIndex) {
        return adminPage.getUsernameFromRow(rowIndex);
    }

    public String getEmployeeNameFromGrid(int rowIndex) {
        return adminPage.getEmployeeNameFromRow(rowIndex);
    }
}`,











// 11. GridQuestions.JAVA
  "src/test/java/co/com/automation/testing/questions/GridQuestions.java":

`package co.com.automation.testing.questions;

import co.com.automation.testing.pages.AdminPage;
import com.microsoft.playwright.Page;

public class GridQuestions {

    private final AdminPage adminPage;

    public GridQuestions(Page page) {
        this.adminPage = new AdminPage(page);
    }

    public boolean isGridDisplayed() {
        return adminPage.isGridVisible();
    }

    public boolean isGridNotEmpty() {
        return adminPage.getGridRowCount() > 0;
    }

    public boolean isUserInGrid(String username) {
        return adminPage.isUserInGrid(username);
    }

    public boolean verifyAllColumnsHaveData() {
        int rows = adminPage.getGridRowCount();
        for (int i = 0; i < rows; i++) {
            String username = adminPage.getUsernameFromRow(i);
            String employeeName = adminPage.getEmployeeNameFromRow(i);
            if (username.isEmpty() || employeeName.isEmpty()) {
                return false;
            }
        }
        return true;
    }
}`,










// 12. LoginQuestions.JAVA
  "src/test/java/co/com/automation/testing/questions/LoginQuestions.java":

`package co.com.automation.testing.questions;

import co.com.automation.testing.pages.LoginPage;
import com.microsoft.playwright.Page;

public class LoginQuestions {

    private final LoginPage loginPage;

    public LoginQuestions(Page page) {
        this.loginPage = new LoginPage(page);
    }

    public boolean isLoginPageDisplayed() {
        return loginPage.isLoginPageVisible();
    }

    public boolean isDashboardDisplayed() {
        return loginPage.isDashboardVisible();
    }

    public boolean isErrorMessageDisplayed() {
        return loginPage.isErrorMessageVisible();
    }

    public String getErrorMessageText() {
        return loginPage.getErrorMessage();
    }
}`,








// 13. CucumberTest.JAVA
  "src/test/java/co/com/automation/testing/runners/CucumberTest.java":

`package co.com.automation.testing.runners;

import org.junit.platform.suite.api.ConfigurationParameter;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

import static io.cucumber.junit.platform.engine.Constants.*;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(
        key = GLUE_PROPERTY_NAME,
        value = "co.com.automation.testing.stepdefinitions," +
                "co.com.automation.testing.base," +
                "co.com.automation.testing.commons"
)
@ConfigurationParameter(
        key = PLUGIN_PROPERTY_NAME,
        value = "pretty," +
                "io.qameta.allure.cucumber7jvm.AllureCucumber7Jvm," +
                "json:target/cucumber.json," +
                "html:target/cucumber.html"
)
@ConfigurationParameter(
        key = "cucumber.filter.tags",
        value = "@consultaUsuarioLopez"
)
@ConfigurationParameter(
        key = "cucumber.execution.dry-run", //Solo verifica que los pasos existen, NO ejecuta
        value = "false"
)
@ConfigurationParameter(
        key = "cucumber.publish.quiet",
        value = "false" //true: No muestra el mensaje de Cucumber Reports - false: Muestra "Share your Cucumber Report..."
)
@ConfigurationParameter(
        key = "cucumber.execution.parallel.enabled",
        value = "false" //true: Ejecuta varios tests al mismo tiempo - false: Ejecuta tests uno por uno
)
public class CucumberTest {
}`,











// 14. AdminSteps.JAVA
  "src/test/java/co/com/automation/testing/stepdefinitions/AdminSteps.java":

`package co.com.automation.testing.stepdefinitions;

import co.com.automation.testing.base.Hooks;
import co.com.automation.testing.tasks.AdminTasks;
import co.com.automation.testing.questions.AdminQuestions;
import co.com.automation.testing.questions.GridQuestions;
import co.com.automation.testing.tasks.SearchTasks;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.*;
import org.junit.jupiter.api.Assertions;

import java.util.Map;

public class AdminSteps {

    private AdminTasks adminTasks;
    private SearchTasks searchTasks;
    private AdminQuestions adminQuestions;
    private GridQuestions gridQuestions;

    @When("accede al módulo Admin")
    public void accederAdmin() {
        adminTasks = new AdminTasks(Hooks.getPage());
        adminQuestions = new AdminQuestions(Hooks.getPage());
        gridQuestions = new GridQuestions(Hooks.getPage());

        adminTasks.navigateToAdminModule();
        System.out.println("📊 Accediendo al módulo Admin");
    }

    @And("realiza la búsqueda específica del usuario LLOPEZ101")
    public void buscarUsuarioLopez() {
        adminTasks.searchUserLopez();
        System.out.println("🔍 Buscando usuario LLOPEZ101");
    }

    @And("realiza la búsqueda del usuario Admin")
    public void buscarUsuarioAdmin() {
        searchTasks = new SearchTasks(Hooks.getPage());
        searchTasks.searchForUser("Admin");
        System.out.println("🔍 Buscando usuario Admin");
    }

    @And("realiza búsqueda con filtros:")
    public void buscarConFiltros(DataTable dataTable) {
        Map<String, String> filters = dataTable.asMaps().get(0);

        adminTasks.searchUserWithFilters(
                filters.get("username"),
                filters.get("userRole"),
                filters.get("employeeName"),
                filters.get("status")
        );
        System.out.println("🔍 Buscando con filtros personalizados");
    }

    @Then("se visualiza el empleado {string}")
    public void validarEmpleado(String employeeName) {
        Assertions.assertTrue(
                adminQuestions.isUserFoundWithDetails("Admin", employeeName),
                "El empleado " + employeeName + " no fue encontrado"
        );
        System.out.println("✅ Empleado encontrado: " + employeeName);
    }

    @Then("se valida que el usuario LLOPEZ101 aparece en los resultados")
    public void validarUsuarioLopezEnResultados() {
        // Verificar que la grilla tiene resultados
        Assertions.assertTrue(
                gridQuestions.isGridNotEmpty(),
                "La grilla está vacía"
        );

        // Verificar que LLOPEZ está en los resultados
        Assertions.assertTrue(
                adminQuestions.isUserFoundWithDetails("LLOPEZ101", "Amelia  Brown"),
                "El usuario LLOPEZ101 no fue encontrado en los resultados"
        );
        System.out.println("✅ Usuario LLOPEZ101 encontrado en resultados");
    }

    @Then("se muestran resultados en la grilla")
    public void validarResultadosEnGrilla() {
        Assertions.assertTrue(
                gridQuestions.isGridDisplayed(),
                "La grilla no es visible"
        );

        Assertions.assertTrue(
                gridQuestions.isGridNotEmpty(),
                "No hay resultados en la grilla"
        );

        // Opcional: validar que todas las filas tienen datos
        Assertions.assertTrue(
                gridQuestions.verifyAllColumnsHaveData(),
                "Algunas filas tienen datos incompletos"
        );
        System.out.println("✅ Grilla muestra resultados correctamente");
    }

    @Then("no se muestran resultados en la grilla")
    public void validarSinResultados() {
        Assertions.assertFalse(
                gridQuestions.isGridNotEmpty(),
                "Se encontraron resultados cuando no debería haber"
        );
        System.out.println("✅ Validado: No hay resultados en la grilla (comportamiento esperado)");
    }
}`,










// 15. AuthenticationSteps.JAVA
  "src/test/java/co/com/automation/testing/stepdefinitions/AuthenticationSteps.java":

`package co.com.automation.testing.stepdefinitions;

import co.com.automation.testing.base.Hooks;
import co.com.automation.testing.tasks.LoginTasks;
import co.com.automation.testing.questions.LoginQuestions;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.*;
import org.junit.jupiter.api.Assertions;

import java.util.List;
import java.util.Map;

public class AuthenticationSteps {

    private LoginTasks loginTasks;
    private LoginQuestions loginQuestions;

    // ========== STEPS ESPECÍFICOS DE LOGIN ==========

    @When("el usuario ingresa nombre de usuario {string}")
    public void ingresarNombreUsuario(String username) {
        loginTasks = new LoginTasks(Hooks.getPage());
        loginTasks.enterUsername(username);
        System.out.println("📝 Ingresando username: " + username);
    }

    @When("el usuario ingresa contraseña {string}")
    public void ingresarContraseña(String password) {
        loginTasks.enterPassword(password);
        System.out.println("🔒 Ingresando password: ***");
    }

    @When("el usuario hace clic en el botón de login")
    public void hacerClicBotonLogin() {
        loginTasks.clickLoginButton();
        System.out.println("🖱️ Haciendo clic en botón Login");
    }

    @When("el usuario intenta iniciar sesión con credenciales incorrectas")
    public void intentarLoginCredencialesIncorrectas() {
        loginTasks = new LoginTasks(Hooks.getPage());
        loginQuestions = new LoginQuestions(Hooks.getPage());

        loginTasks.loginWithCredentials("usuario_incorrecto", "password_incorrecto");
        System.out.println("❌ Intentando login con credenciales incorrectas");
    }

    @When("el usuario intenta iniciar sesión con usuario vacío")
    public void intentarLoginUsuarioVacio() {
        loginTasks = new LoginTasks(Hooks.getPage());
        loginTasks.enterUsername("");
        loginTasks.enterPassword("admin123");
        loginTasks.clickLoginButton();
        System.out.println("⚠️ Intentando login con usuario vacío");
    }

    @When("el usuario intenta iniciar sesión con contraseña vacía")
    public void intentarLoginPasswordVacio() {
        loginTasks = new LoginTasks(Hooks.getPage());
        loginTasks.enterUsername("Admin");
        loginTasks.enterPassword("");
        loginTasks.clickLoginButton();
        System.out.println("⚠️ Intentando login con contraseña vacía");
    }

    // ========== STEPS ESPECÍFICOS DE VALIDACIÓN DE LOGIN ==========

    @Then("el login es exitoso")
    public void validarLoginExitoso() {
        loginQuestions = new LoginQuestions(Hooks.getPage());
        Assertions.assertTrue(loginQuestions.isDashboardDisplayed(),
                "El login no fue exitoso - Dashboard no visible");
        System.out.println("✅ Login exitoso");
    }

    @Then("el login falla")
    public void validarLoginFalla() {
        loginQuestions = new LoginQuestions(Hooks.getPage());
        Assertions.assertFalse(loginQuestions.isDashboardDisplayed(),
                "El login no debería ser exitoso pero lo fue");
        System.out.println("✅ Validado: Login falló como se esperaba");
    }

    @Then("se muestra mensaje de error en el login")
    public void validarMensajeErrorLogin() {
        loginQuestions = new LoginQuestions(Hooks.getPage());
        Assertions.assertTrue(loginQuestions.isErrorMessageDisplayed(),
                "No se mostró mensaje de error en el login");
        System.out.println("⚠️ Mensaje de error de login mostrado");
    }

    @Then("el mensaje de error contiene {string}")
    public void validarContenidoMensajeError(String textoEsperado) {
        String mensajeActual = loginQuestions.getErrorMessageText();
        Assertions.assertTrue(mensajeActual.contains(textoEsperado),
                String.format("Mensaje esperado: '%s', Mensaje actual: '%s'",
                        textoEsperado, mensajeActual));
        System.out.println("✓ Mensaje de error contiene: " + textoEsperado);
    }

    @Then("el campo de usuario muestra indicación de error")
    public void validarErrorCampoUsuario() {
        // Verificar estilos de error en el campo de usuario
        String usernameClass = Hooks.getPage()
                .locator("input[name='username']")
                .getAttribute("class");
        Assertions.assertTrue(usernameClass.contains("error") ||
                        usernameClass.contains("invalid"),
                "El campo de usuario no muestra indicación de error");
        System.out.println("✓ Campo de usuario muestra error");
    }

    @Then("el campo de contraseña muestra indicación de error")
    public void validarErrorCampoPassword() {
        // Verificar estilos de error en el campo de contraseña
        String passwordClass = Hooks.getPage()
                .locator("input[name='password']")
                .getAttribute("class");
        Assertions.assertTrue(passwordClass.contains("error") ||
                        passwordClass.contains("invalid"),
                "El campo de contraseña no muestra indicación de error");
        System.out.println("✓ Campo de contraseña muestra error");
    }

    // ========== STEPS ESPECÍFICOS PARA DATA TABLES COMPLEJAS ==========

    @When("el usuario intenta iniciar sesión múltiples veces:")
    public void intentarLoginMultiplesVeces(DataTable dataTable) {
        loginTasks = new LoginTasks(Hooks.getPage());
        loginQuestions = new LoginQuestions(Hooks.getPage());

        List<Map<String, String>> credenciales = dataTable.asMaps();

        for (Map<String, String> credencial : credenciales) {
            String username = credencial.get("username");
            String password = credencial.get("password");
            String resultadoEsperado = credencial.get("resultado");

            System.out.println("🔍 Probando: " + username + "/" + password);

            loginTasks.enterUsername(username);
            loginTasks.enterPassword(password);
            loginTasks.clickLoginButton();

            // Pequeña espera entre intentos
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            boolean loginExitoso = loginQuestions.isDashboardDisplayed();

            if ("éxito".equalsIgnoreCase(resultadoEsperado)) {
                Assertions.assertTrue(loginExitoso,
                        String.format("Login debería ser exitoso para %s", username));
            } else if ("fallo".equalsIgnoreCase(resultadoEsperado)) {
                Assertions.assertFalse(loginExitoso,
                        String.format("Login debería fallar para %s", username));
            }

            // Volver a la página de login para el siguiente intento
            if (!loginExitoso) {
                Hooks.getPage().goBack();
                Hooks.getPage().waitForLoadState();
            }
        }
    }

    // ========== STEPS ESPECÍFICOS DE LOGOUT ==========

    @When("el usuario cierra sesión")
    public void cerrarSesion() {
        Hooks.getPage().click(".oxd-userdropdown-tab");
        Hooks.getPage().click("text=Logout");
        Hooks.getPage().waitForLoadState();
        System.out.println("🚪 Sesión cerrada");
    }

    @Then("el usuario es redirigido a la página de login")
    public void validarRedireccionLogin() {
        String currentUrl = Hooks.getPage().url();
        Assertions.assertTrue(currentUrl.contains("auth/login"),
                "No se redirigió a la página de login. URL actual: " + currentUrl);
        System.out.println("✓ Redirigido a página de login");
    }
}`,











// 16. LoginSteps.JAVA
  "src/test/java/co/com/automation/testing/stepdefinitions/LoginSteps.java":

`package co.com.automation.testing.stepdefinitions;

import co.com.automation.testing.base.Hooks;
import co.com.automation.testing.tasks.LoginTasks;
import co.com.automation.testing.questions.LoginQuestions;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.*;
import org.junit.jupiter.api.Assertions;

import java.util.Map;

public class LoginSteps {
    private LoginTasks loginTasks;
    private LoginQuestions loginQuestions;

    @When("ingresa credenciales válidas")
    public void ingresarCredencialesValidas() {
        loginTasks = new LoginTasks(Hooks.getPage());
        // Usa cualquier Admin que esté en CSV
        loginTasks.loginAs("Admin");
    }

    @When("ingresa credenciales:")
    public void ingresarCredenciales(DataTable dataTable) {
        loginTasks = new LoginTasks(Hooks.getPage());
        Map<String, String> credentials = dataTable.asMaps().get(0);

        // Usa directamente lo que viene en la tabla
        loginTasks.loginWithCredentials(
                credentials.get("username"),
                credentials.get("password")
        );
    }

    @When("ingresa credenciales de {string}")
    public void ingresarCredencialesDeUsuario(String userIdentifier) {
        loginTasks = new LoginTasks(Hooks.getPage());
        // Busca dinámicamente en CSV
        loginTasks.loginAs(userIdentifier);
    }

    @Then("el acceso al sistema es exitoso")
    public void validarAccesoExitoso() {
        loginQuestions = new LoginQuestions(Hooks.getPage());
        Assertions.assertTrue(
                loginQuestions.isDashboardDisplayed(),
                "El dashboard no es visible después del login"
        );
    }

    @Then("se muestra mensaje de error de credenciales")
    public void validarMensajeError() {
        loginQuestions = new LoginQuestions(Hooks.getPage());
        Assertions.assertTrue(
                loginQuestions.isErrorMessageDisplayed(),
                "No se mostró mensaje de error"
        );
    }

    @Then("se muestra la página de login")
    public void validarPaginaLogin() {
        loginQuestions = new LoginQuestions(Hooks.getPage());
        Assertions.assertTrue(
                loginQuestions.isLoginPageDisplayed(),
                "La página de login no es visible"
        );
    }
}`,










// 17. AdminTasks.JAVA
  "src/test/java/co/com/automation/testing/tasks/AdminTasks.java":

`package co.com.automation.testing.tasks;

import co.com.automation.testing.pages.AdminPage;
import co.com.automation.testing.utils.DataProvider;
import com.microsoft.playwright.Page;

import java.util.Map;

    public class AdminTasks {
        private final AdminPage adminPage;

        public AdminTasks(Page page) {
            this.adminPage = new AdminPage(page);
        }

        public void searchUserLopez() {
            // ¡NO más hardcodeado! Busca dinámicamente en CSV
            Map<String, String> searchData = DataProvider.getLopezSearchData();

            System.out.println("🔎 Buscando usuario LOPEZ101 (encontrado como: " +
                    searchData.get("username") + ")");

            searchUserWithFilters(
                    searchData.get("username"),      // Lo que está en CSV
                    searchData.get("userRole"),
                    searchData.get("employee"),
                    searchData.get("status")
            );
        }

        public void searchUserAdmin() {
            // Similar para Admin
            Map<String, String> searchData = DataProvider.getSearchData("Admin");

            searchUserWithFilters(
                    searchData.get("username"),
                    searchData.get("userRole"),
                    searchData.get("employee"),
                    searchData.get("status")
            );
        }

    public void navigateToAdminModule() {
        adminPage.clickAdminMenu();
        adminPage.waitForAdminPageLoad();
    }

    public void searchUserWithFilters(String username, String userRole,
                                      String employeeName, String status) {
        adminPage.enterUsernameFilter(username);
        adminPage.selectUserRole(userRole);
        adminPage.selectEmployeeName(employeeName);
        adminPage.selectStatus(status);
        adminPage.clickSearchButton();
    }
}`,











// 18. LoginTasks.JAVA
  "src/test/java/co/com/automation/testing/tasks/LoginTasks.java":

`package co.com.automation.testing.tasks;

import co.com.automation.testing.pages.LoginPage;
import co.com.automation.testing.utils.DataProvider;
import com.microsoft.playwright.Page;

import java.util.Map;

public class LoginTasks {
    private final LoginPage loginPage;

    public LoginTasks(Page page) {
        this.loginPage = new LoginPage(page);
    }

    // ========== MÉTODOS BÁSICOS (sin cambios) ==========

    public void navigateToLogin() {
        loginPage.navigate();
    }

    public void enterUsername(String username) {
        loginPage.enterUsername(username);
    }

    public void enterPassword(String password) {
        loginPage.enterPassword(password);
    }

    public void clickLoginButton() {
        loginPage.clickLoginButton();
    }

    // ========== MÉTODOS COMPUESTOS ==========

    public void loginWithCredentials(String username, String password) {
        enterUsername(username);
        enterPassword(password);
        clickLoginButton();
    }

    // ========== MÉTODO MEJORADO para CSV ==========

    public void loginWithCredentialsFromCSV(String userIdentifier) {
        System.out.println("🔐 Intentando login con identificador: " + userIdentifier);

        Map<String, String> credentials = null; // Inicializar como null

        try {
            // PRIMERO: Intentar como username directo
            credentials = DataProvider.getLoginCredentials(userIdentifier);
            System.out.println("✅ Encontrado como username: " + userIdentifier);

        } catch (RuntimeException e1) {
            System.out.println("⚠️ No encontrado como username, buscando por coincidencia...");

            // SEGUNDO: Buscar cualquier usuario que contenga el identificador
            for (String username : DataProvider.getAllLoginUsers()) {
                if (username.toLowerCase().contains(userIdentifier.toLowerCase())) {
                    credentials = DataProvider.getLoginCredentials(username);
                    System.out.println("✅ Encontrado por coincidencia: " + username);
                    break;
                }
            }

            // TERCERO: Si aún no se encontró, buscar por "userType"
            if (credentials == null) {
                try {
                    // Buscar en todos los usuarios del CSV
                    for (String username : DataProvider.getAllLoginUsers()) {
                        Map<String, String> userData = DataProvider.getLoginCredentials(username);
                        String userType = userData.get("userType");
                        if (userType != null && userIdentifier.equalsIgnoreCase(userType)) {
                            credentials = userData;
                            System.out.println("✅ Encontrado por userType: " + userIdentifier + " -> " + username);
                            break;
                        }
                    }
                } catch (Exception e2) {
                    System.out.println("ℹ️ No se pudo buscar por userType: " + e2.getMessage());
                }
            }
        }

        // Verificar que se encontraron credenciales
        if (credentials == null) {
            throw new RuntimeException("❌ No se pudo encontrar usuario con identificador: '" +
                    userIdentifier + "'. Usuarios disponibles: " +
                    DataProvider.getAllLoginUsers());
        }

        // Ejecutar login con las credenciales encontradas
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (username == null || password == null) {
            throw new RuntimeException("Credenciales incompletas para usuario: " +
                    userIdentifier + ". Datos: " + credentials);
        }

        System.out.println("🔑 Login con: " + username + "/***");
        loginWithCredentials(username, password);
    }

    // ========== MÉTODOS PARA FLUJOS ESPECÍFICOS ==========

    public void attemptLoginWithEmptyUsername() {
        enterUsername("");
        enterPassword("admin123");
        clickLoginButton();
    }

    public void attemptLoginWithEmptyPassword() {
        enterUsername("Admin");
        enterPassword("");
        clickLoginButton();
    }

    public void attemptLoginWithInvalidCredentials() {
        enterUsername("usuario_incorrecto");
        enterPassword("password_incorrecto");
        clickLoginButton();
    }

    // ========== MÉTODOS CONVENCIONALES ==========

    public void loginAsAdmin() {
        loginWithCredentialsFromCSV("Admin");
    }

    public void loginAsRegularUser() {
        loginWithCredentialsFromCSV("User1");
    }

    public void loginAs(String userIdentifier) {
        loginWithCredentialsFromCSV(userIdentifier);
    }
}`,









// 19. SearchTasks.JAVA
  "src/test/java/co/com/automation/testing/tasks/SearchTasks.java":

`package co.com.automation.testing.tasks;

import co.com.automation.testing.pages.AdminPage;
import com.microsoft.playwright.Page;

public class SearchTasks {

    private final AdminPage adminPage;

    public SearchTasks(Page page) {
        this.adminPage = new AdminPage(page);
    }

    public void searchForUser(String username) {
        adminPage.enterUsernameFilter(username);
        adminPage.clickSearchButton();
    }

    public void searchForUserWithRole(String username, String role) {
        adminPage.enterUsernameFilter(username);
        adminPage.selectUserRole(role);
        adminPage.clickSearchButton();
    }
}`,









// 20. SearchTasks.JAVA
  "src/test/java/co/com/automation/testing/utils/AllureEnvironmentWriter.java":

`package co.com.automation.testing.utils;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Properties;
import co.com.automation.testing.config.Config;

public class AllureEnvironmentWriter {

    private static final String RESULTS_DIR =
            System.getProperty("allure.results.directory", "target/allure-results");

    public static void writeEnvironment() {
        try {
            File resultsDir = new File(RESULTS_DIR);
            if (!resultsDir.exists()) {
                resultsDir.mkdirs();
            }

            Properties props = new Properties();
            props.setProperty("Browser", System.getProperty("browser", "Chromium"));
            props.setProperty("Environment", System.getProperty("env", "QA"));
            props.setProperty("Base URL", Config.BASE_URL);
            props.setProperty("Browser", Config.BROWSER);
            props.setProperty("Environment", Config.ENV);


            FileWriter writer = new FileWriter(
                    new File(resultsDir, "environment.properties")
            );
            props.store(writer, "Allure Environment");
            writer.close();

        } catch (IOException e) {
            throw new RuntimeException("Error creando environment.properties", e);
        }
    }
}`,











// 21. CsvReader.JAVA
  "src/test/java/co/com/automation/testing/utils/CsvReader.java":

`package co.com.automation.testing.utils;

import com.opencsv.CSVReader;
import java.io.*;
import java.util.*;

public class CsvReader {

    public static List<Map<String, String>> read(String path) {

        List<Map<String, String>> data = new ArrayList<>();

        try (CSVReader reader = new CSVReader(new FileReader(path))) {

            String[] headers = reader.readNext();
            String[] row;

            while ((row = reader.readNext()) != null) {
                Map<String, String> map = new HashMap<>();
                for (int i = 0; i < headers.length; i++) {
                    map.put(headers[i], row[i]);
                }
                data.add(map);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return data;
    }
}`,












// 22. DataProvider.JAVA
  "src/test/java/co/com/automation/testing/utils/DataProvider.java":

`package co.com.automation.testing.utils;

import co.com.automation.testing.config.UserConstants;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DataProvider {

    private static final String LOGIN_CSV_PATH = "src/test/resources/data/login.csv";
    private static final String BUSQUEDA_CSV_PATH = "src/test/resources/data/busqueda.csv";

    private static Map<String, Map<String, String>> loginCache = new HashMap<>();
    private static Map<String, Map<String, String>> searchCache = new HashMap<>();

    static {
        loadLoginData();
        loadSearchData();
        validateRequiredData(); // Nueva validación
    }

    // ========== CARGA DE DATOS ==========

    private static void loadLoginData() {
        try {
            List<Map<String, String>> loginData = CsvReader.read(LOGIN_CSV_PATH);

            System.out.println("📥 CARGANDO login.csv:");
            for (Map<String, String> row : loginData) {
                String username = row.get("username");
                loginCache.put(username, row);
                System.out.println("   ✅ " + username);
            }

        } catch (Exception e) {
            System.err.println("❌ Error cargando login.csv: " + e.getMessage());
            throw new RuntimeException("No se pudo cargar login.csv", e);
        }
    }

    private static void loadSearchData() {
        try {
            List<Map<String, String>> searchData = CsvReader.read(BUSQUEDA_CSV_PATH);

            System.out.println("📥 CARGANDO busqueda.csv:");
            for (Map<String, String> row : searchData) {
                String username = row.get("username");

                // Asegurar valores por defecto
                row.putIfAbsent("userRole", UserConstants.ROLE_ADMIN);
                row.putIfAbsent("status", UserConstants.STATUS_ENABLED);

                searchCache.put(username, row);
                System.out.println("   ✅ " + username + " -> " + row.get("employee"));
            }

        } catch (Exception e) {
            System.err.println("❌ Error cargando busqueda.csv: " + e.getMessage());
            throw new RuntimeException("No se pudo cargar busqueda.csv", e);
        }
    }

    // ========== VALIDACIÓN (opcional pero útil) ==========

    private static void validateRequiredData() {
        System.out.println("\n🔍 VALIDANDO DATOS REQUERIDOS:");

        // Verificar que tenemos al menos un usuario Admin en login.csv
        boolean hasAdminInLogin = loginCache.keySet().stream()
                .anyMatch(user -> user.toLowerCase().contains("admin"));

        if (!hasAdminInLogin) {
            System.err.println("⚠️ ADVERTENCIA: No se encontró usuario Admin en login.csv");
        } else {
            System.out.println("✅ login.csv tiene usuario Admin");
        }

        // Verificar que tenemos datos de búsqueda para los usuarios en login
        int missingSearchData = 0;
        for (String loginUser : loginCache.keySet()) {
            if (!searchCache.containsKey(loginUser)) {
                System.err.println("⚠️ ADVERTENCIA: Usuario '" + loginUser +
                        "' está en login.csv pero NO en busqueda.csv");
                missingSearchData++;
            }
        }

        if (missingSearchData == 0) {
            System.out.println("✅ Todos los usuarios de login tienen datos en busqueda.csv");
        }

        System.out.println("=======================================\n");
    }

    // ========== MÉTODOS PÚBLICOS ==========

    public static Map<String, String> getLoginCredentials(String username) {
        Map<String, String> credentials = loginCache.get(username);

        if (credentials == null) {
            // Listar usuarios disponibles para ayudar al tester
            System.err.println("\n❌ ERROR: No se encontró '" + username + "' en login.csv");
            System.err.println("   Usuarios disponibles en login.csv:");
            for (String availableUser : loginCache.keySet()) {
                System.err.println("   - " + availableUser);
            }
            throw new RuntimeException("Usuario '" + username + "' no encontrado en login.csv. " +
                    "Usuarios disponibles: " + loginCache.keySet());
        }

        System.out.println("🔐 Obteniendo credenciales para: " + username);
        return credentials;
    }

    public static Map<String, String> getSearchData(String username) {
        Map<String, String> searchData = searchCache.get(username);

        if (searchData == null) {
            // Listar usuarios disponibles para ayudar al tester
            System.err.println("\n❌ ERROR: No se encontró '" + username + "' en busqueda.csv");
            System.err.println("   Usuarios disponibles en busqueda.csv:");
            for (String availableUser : searchCache.keySet()) {
                System.err.println("   - " + availableUser + " -> " +
                        searchCache.get(availableUser).get("employee"));
            }

            throw new RuntimeException("Usuario '" + username + "' no encontrado en busqueda.csv. " +
                    "Usuarios disponibles: " + searchCache.keySet());
        }

        System.out.println("🔍 Obteniendo datos de búsqueda para: " + username);
        return searchData;
    }

    // ========== MÉTODOS CONVENCIONALES (para facilitar) ==========

    public static Map<String, String> getDefaultAdminCredentials() {
        // Busca cualquier usuario que contenga "admin" (case insensitive)
        for (String username : loginCache.keySet()) {
            if (username.toLowerCase().contains("admin")) {
                return getLoginCredentials(username);
            }
        }
        throw new RuntimeException("No se encontró ningún usuario Admin en login.csv");
    }

    public static Map<String, String> getLopezSearchData() {
        // Busca cualquier usuario que contenga "lopez" (case insensitive)
        for (String username : searchCache.keySet()) {
            if (username.toLowerCase().contains("lopez")) {
                return getSearchData(username);
            }
        }
        throw new RuntimeException("No se encontró ningún usuario Lopez en busqueda.csv");
    }

    // ========== MÉTODOS DE UTILIDAD ==========

    public static List<String> getAllLoginUsers() {
        return List.copyOf(loginCache.keySet());
    }

    public static List<String> getAllSearchUsers() {
        return List.copyOf(searchCache.keySet());
    }

    public static void printDataSummary() {
        System.out.println("\n📊 RESUMEN DE DATOS CARGADOS:");
        System.out.println("login.csv: " + loginCache.size() + " usuarios");
        System.out.println("busqueda.csv: " + searchCache.size() + " usuarios");
    }
}`,








// 23. ExcelReader.JAVA
  "src/test/java/co/com/automation/testing/utils/ExcelReader.java":


`package co.com.automation.testing.utils;

import org.apache.poi.ss.usermodel.*;
import java.io.*;
import java.util.*;

public class ExcelReader {

    public static List<Map<String, String>> read(String file, String sheetName) {

        List<Map<String, String>> data = new ArrayList<>();

        try (InputStream is = new FileInputStream(file)) {

            Workbook workbook = WorkbookFactory.create(is);
            Sheet sheet = workbook.getSheet(sheetName);

            Row headerRow = sheet.getRow(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                Map<String, String> map = new HashMap<>();

                for (int j = 0; j < row.getLastCellNum(); j++) {
                    map.put(
                            headerRow.getCell(j).getStringCellValue(),
                            row.getCell(j).toString()
                    );
                }
                data.add(map);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return data;
    }
}`,








// 24. VideoRecorder.JAVA
  "src/test/java/co/com/automation/testing/utils/VideoRecorder.java":


`package co.com.automation.testing.utils;

import com.microsoft.playwright.BrowserContext;
import io.qameta.allure.Allure;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;

public class VideoRecorder {

    private static ThreadLocal<String> scenarioName = new ThreadLocal<>();
    private static ThreadLocal<Path> videoFilePath = new ThreadLocal<>();

    public static void startRecording(BrowserContext context, String name) {
        scenarioName.set(name);

        // Configurar directorio de videos
        Path videoDir = Paths.get("target/videos");
        Path harDir = Paths.get("target/hars");

        try {
            if (!Files.exists(videoDir)) {
                Files.createDirectories(videoDir);
            }
            if (!Files.exists(harDir)) {
                Files.createDirectories(harDir);
            }

            System.out.println("🎬 Grabación de video iniciada para: " + name);

            // En Playwright, el video se guarda automáticamente en el directorio especificado
            // No necesitamos obtenerlo del contexto directamente

        } catch (IOException e) {
            System.err.println("❌ Error creando directorios: " + e.getMessage());
        }
    }

    public static void stopAndAttach(BrowserContext context) {
        try {
            String name = scenarioName.get();
            if (name == null) {
                System.err.println("⚠️ No hay nombre de escenario para el video");
                return;
            }

            System.out.println("🎥 Buscando video para escenario: " + name);

            // Buscar el archivo de video más reciente en el directorio
            Path videoDir = Paths.get("target/videos");
            if (!Files.exists(videoDir)) {
                System.err.println("⚠️ Directorio de videos no existe: " + videoDir);
                return;
            }

            // Buscar archivos .webm en el directorio
            Optional<Path> latestVideo = Files.list(videoDir)
                    .filter(path -> path.toString().endsWith(".webm"))
                    .sorted((p1, p2) -> {
                        try {
                            return Files.getLastModifiedTime(p2).compareTo(Files.getLastModifiedTime(p1));
                        } catch (IOException e) {
                            return 0;
                        }
                    })
                    .findFirst();

            if (latestVideo.isPresent()) {
                Path videoFile = latestVideo.get();
                System.out.println("📁 Video encontrado: " + videoFile.getFileName());

                // Renombrar con nombre del escenario
                String safeName = name
                        .replace(" ", "_")
                        .replace(":", "")
                        .replace("/", "_")
                        .replace("\\", "_")
                        .replace("\"", "")
                        .replace("?", "")
                        .replace("*", "")
                        .replace("<", "")
                        .replace(">", "")
                        .replace("|", "");

                String newFileName = "video_" + safeName + "_" +
                        System.currentTimeMillis() + ".webm";

                Path targetPath = Paths.get("target/allure-results/" + newFileName);

                // Asegurar que el directorio existe
                if (!Files.exists(targetPath.getParent())) {
                    Files.createDirectories(targetPath.getParent());
                }

                // Copiar el video
                Files.copy(videoFile, targetPath, StandardCopyOption.REPLACE_EXISTING);

                // Adjuntar a Allure
                try (FileInputStream fis = new FileInputStream(targetPath.toFile())) {
                    Allure.addAttachment("Video: " + name,
                            "video/webm",
                            fis,
                            ".webm");
                }

                System.out.println("✅ Video adjuntado a Allure: " + newFileName);

                // Renombrar el archivo original también
                Path renamedOriginal = Paths.get("target/videos/" + newFileName);
                Files.move(videoFile, renamedOriginal, StandardCopyOption.REPLACE_EXISTING);

                videoFilePath.set(renamedOriginal);

            } else {
                System.err.println("❌ No se encontró archivo de video en: " + videoDir);
            }

        } catch (Exception e) {
            System.err.println("❌ Error procesando video: " + e.getMessage());
            e.printStackTrace();
        } finally {
            // Limpiar thread local
            scenarioName.remove();
        }
    }

    // Método para obtener el path del video (opcional)
    public static Path getVideoPath() {
        return videoFilePath.get();
    }
}`,










// 25. busqueda.csv
  "src/test/resources/data/busqueda.csv":

`username,employee,userRole,status
LLOPEZ101,Amelia  Brown,Admin,Enabled`,










// 26. login.csv
  "src/test/resources/data/login.csv":

`username,password,userType
Admin,admin123,admin
User1,pass123,user
ESS,ess123,ess
AdminUser,admin456,admin`,





// 27. login.csv
  "src/test/resources/features/login.feature":


`@epic:Autenticacion
@feature:Login
@story:LoginExitoso
@all
Feature: Login OrangeHRM

  @login @csv
  Scenario: Login exitoso con datos desde CSV
    Given que el usuario navega a la página de login
    When ingresa credenciales válidas
    Then el acceso al sistema es exitoso

  @login @csv @desktop
  Scenario: Login exitoso desktop con datos desde CSV
    Given que el usuario navega a la página de login
    When ingresa credenciales:
      | username | password |
      | Admin    | admin123 |
    Then el acceso al sistema es exitoso

  @login @csv @user1
  Scenario: Login con usuario regular desde CSV
    Given que el usuario navega a la página de login
    When ingresa credenciales de "User1"
    Then el acceso al sistema es exitoso

  @admin @searchUser @csv
  Scenario: Consulta de usuario en el módulo Admin con datos desde CSV
    Given que el usuario navega a la página de login
    And ingresa credenciales válidas
    When accede al módulo Admin
    And realiza la búsqueda del usuario Admin
    Then se visualiza el empleado "FirstNameTestTest 28 akhil LastNameTest"
    And se muestran resultados en la grilla

  @admin @mobile @csv
  Scenario: Consulta de usuario en móvil con datos desde CSV
    Given que el usuario navega a la página de login
    When ingresa credenciales de "Admin"
    When accede al módulo Admin
    Then se visualiza el empleado "FirstNameTestTest 28 akhil LastNameTest"

  @admin @consultaUsuarioLopez @csv
  Scenario: Consulta específica del usuario LLOPEZ con datos desde CSV
    Given que el usuario navega a la página de login
    And ingresa credenciales válidas
    When accede al módulo Admin
    And realiza la búsqueda específica del usuario LLOPEZ101
    Then se valida que el usuario LLOPEZ101 aparece en los resultados
    And se muestran resultados en la grilla

  @admin @filtros
  Scenario: Búsqueda con múltiples filtros
    Given que el usuario navega a la página de login
    And ingresa credenciales de "Admin"
    When accede al módulo Admin
    And realiza búsqueda con filtros:
      | username | userRole | employeeName  | status  |
      | LLOPEZ   | Admin    | Joseph  Evans | Enabled |
    Then se muestran resultados en la grilla`,









// 28. allure.properties
  "src/test/resources/allure.properties":

`# Configuración de Allure
allure.results.directory=target/allure-results
allure.report.directory=target/allure-report

# Configuración de plugins
allure.link.issue.pattern=https://example.com/issue/{}
allure.link.tms.pattern=https://example.com/tms/{}

# Habilitar captura de videos y screenshots
allure.attach.video=true
allure.attach.screenshot=true

# Configurar el aspecto del reporte
allure.report.remove.categories=KNOWN_ISSUES,TO_DEFINE
allure.report.show.allure.1=true`,








// 29. junit-platform.properties
  "src/test/resources/junit-platform.properties":

`# More info: https://github.com/cucumber/cucumber-jvm/tree/main/cucumber-junit-platform-engine#configuration-options

cucumber.plugin=io.cucumber.core.plugin.SerenityReporterParallel,json:target/destination/cucumber.json,pretty,timeline:target/timeline,pretty,html:target/cucumber-reports/cucumber.html
cucumber.publish.enabled=false

# Habilita la ejecucion paralela: true: activado, false: desactivado
cucumber.execution.parallel.enabled=true
cucumber.execution.parallel.config.strategy=fixed
cucumber.execution.parallel.config.fixed.parallelism=2

# Estrategia de paralelos dinamicos:
#cucumber.execution.parallel.config.strategy=dynamic
#cucumber.execution.parallel.config.dynamic.factor=1.0  # Cantidad de hilos por nucleo (Opcional)
#cucumber.execution.parallel.config.fixed.parallelism=4

# Estrategia de paralelos fijos:
#cucumber.execution.parallel.config.strategy=fixed
#cucumber.execution.parallel.config.fixed.parallelism=2  # Numero fijo de hilos (Opcional)
#cucumber.execution.parallel.config.fixed.max-pool-size=4  # Limite superior de hilos (Opcional)`,







// 30. logback-test.xml
  "src/test/resources/logback-test.xml":

`<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>
                %d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n
            </pattern>
        </encoder>
    </appender>

    <logger name="root" level="WARN"/>
    <logger name="net.serenitybdd" level="INFO"/>
    <logger name="net.thucydides" level="INFO"/>

    <root level="WARN">
        <appender-ref ref="STDOUT"/>
    </root>

</configuration>`,







// 31. playwright.config.json
  "src/test/resources/playwright.config.json":

`{
  "video": {
    "mode": "on",
    "size": {
      "width": 1920,
      "height": 1080
    },
    "codec": "libvpx-vp9",
    "crf": 23,
    "bitrate": "1M"
  },
  "timeout": 60000,
  "navigationTimeout": 60000,
  "expect": {
    "timeout": 10000
  }
}`,








// 32. simplelogger.properties
  "src/test/resources/simplelogger.properties":

`org.slf4j.simpleLogger.defaultLogLevel=info
org.slf4j.simpleLogger.logFile=System.out
org.slf4j.simpleLogger.showDateTime=true
org.slf4j.simpleLogger.dateTimeFormat=yyyy-MM-dd HH:mm:ss`,









// 33. users.yml
  "src/test/resources/users.yml":

`users:
  lopez:
    codeName: "LLOPEZ"           # Lo que usa el código
    csvName: "LLOPEZ"            # Lo que está en CSV (cambia esto solo)
    fullName: "Joseph Evans"
    role: "Admin"
    status: "Enabled"

  admin:
    codeName: "Admin"
    csvName: "Admin"
    fullName: "FirstNameTestTest 28 akhil LastNameTest"
    role: "Admin"
    status: "Enabled"`,






// 34. users.yml
  "Template_PlayWright_BDD_2026
└── browserstack.yml":

`userName: ${BROWSERSTACK_USER}
accessKey: ${BROWSERSTACK_KEY}
platforms:
  - browserName: Safari
    os: OS X
    osVersion: Monterey
    browserVersion: 15.6
parallelsPerPlatform: 4
browserstackLocal: false
buildName: ${BROWSERSTACK_BUILD}
projectName: ${BROWSERSTACK_PROJECT}
testContextOptions:
  skipSessionName: true
buildIdentifier: null
autoWait: 60
debug: false
networkLogs: false
consoleLogs: errors
testObservability: false
browserstackAutomation: ${BROWSERSTACK_ENABLED}`,






// 35. users.yml
  "Template_PlayWright_BDD_2026
└── pom.xml":



`<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <groupId>co.com.template</groupId>
    <artifactId>playwright-pom</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>22</maven.compiler.source>
        <maven.compiler.target>22</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <playwright.version>1.43.0</playwright.version>
        <junit.jupiter.version>5.10.1</junit.jupiter.version>
        <allure.results.directory>${project.build.directory}/allure-results</allure.results.directory>

    </properties>

    <dependencies>

        <!-- Playwright -->
        <dependency>
            <groupId>com.microsoft.playwright</groupId>
            <artifactId>playwright</artifactId>
            <version>${playwright.version}</version>
        </dependency>

        <!-- JUnit 5 -->
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>${junit.jupiter.version}</version>
            <scope>test</scope>
        </dependency>

        <!-- JUnit Platform Suite (OBLIGATORIA para @Suite) -->
        <dependency>
            <groupId>org.junit.platform</groupId>
            <artifactId>junit-platform-suite</artifactId>
            <version>1.10.1</version>
            <scope>test</scope>
        </dependency>


        <!-- AssertJ (opcional pero recomendado) -->
        <dependency>
            <groupId>org.assertj</groupId>
            <artifactId>assertj-core</artifactId>
            <version>3.25.3</version>
            <scope>test</scope>
        </dependency>

        <!-- Cucumber -->
        <dependency>
            <groupId>io.cucumber</groupId>
            <artifactId>cucumber-java</artifactId>
            <version>7.15.0</version>
        </dependency>

        <dependency>
            <groupId>io.cucumber</groupId>
            <artifactId>cucumber-junit-platform-engine</artifactId>
            <version>7.15.0</version>
        </dependency>

        <!-- Allure Cucumber 7 -->
        <dependency>
            <groupId>io.qameta.allure</groupId>
            <artifactId>allure-cucumber7-jvm</artifactId>
            <version>2.25.0</version>
            <scope>test</scope>
        </dependency>

        <!-- Allure JUnit Platform -->
        <dependency>
            <groupId>io.qameta.allure</groupId>
            <artifactId>allure-junit-platform</artifactId>
            <version>2.25.0</version>
            <scope>test</scope>
        </dependency>

        <!-- Excel -->
        <dependency>
            <groupId>org.apache.poi</groupId>
            <artifactId>poi-ooxml</artifactId>
            <version>5.2.5</version>
        </dependency>

        <!-- CSV -->
        <dependency>
            <groupId>com.opencsv</groupId>
            <artifactId>opencsv</artifactId>
            <version>5.9</version>
        </dependency>

        <!-- Para mejor manejo de videos -->
        <dependency>
            <groupId>org.bytedeco</groupId>
            <artifactId>javacv-platform</artifactId>
            <version>1.5.9</version>
        </dependency>

        <!-- SLF4J Implementation -->
        <dependency>
            <groupId>ch.qos.logback</groupId>
            <artifactId>logback-classic</artifactId>
            <version>1.4.14</version>
            <scope>test</scope>
        </dependency>

    </dependencies>

    <build>
        <plugins>
            <!-- Surefire -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>3.2.5</version>
                <configuration>
                    <systemPropertyVariables>
                        <allure.results.directory>${allure.results.directory}</allure.results.directory>
                    </systemPropertyVariables>

                    <includes>
                        <include>**/*Test.java</include>
                    </includes>
                </configuration>
            </plugin>
            <plugin>
                <groupId>io.qameta.allure</groupId>
                <artifactId>allure-maven</artifactId>
                <version>2.12.0</version>
                <configuration>
                    <reportVersion>2.25.0</reportVersion>
                    <resultsDirectory>${project.build.directory}/allure-results</resultsDirectory>
                    <reportDirectory>${project.build.directory}/allure-report</reportDirectory>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>`,








// 36. users.yml
  "Template_PlayWright_BDD_2026
└── README.md":


`
🚀 Proyecto Template_PlayWright_BDD_2025 – Guía para Testers
¡Hola tester! 👋 Este proyecto es una plantilla de automatización de pruebas que combina Playwright (para interactuar con el navegador) con BDD (Behavior-Driven Development) usando Cucumber. Aquí te explico cada parte del proyecto de manera sencilla, como si estuviéramos tomando un café ☕.

Framework de automatización de pruebas funcionales basado en Playwright + Cucumber (BDD) + Allure, diseñado bajo buenas prácticas para ejecución Desktop y Mobile, con soporte de DataTable, CSV, videos por escenario y paralelismo.

🧰 Tecnologías utilizadas
Java 17+
Playwright Java
Cucumber (BDD)
Maven
Allure Report
JUnit 5
CSV / DataTable
Paralelismo por escenarios
Emulación de dispositivos móviles
📁 Estructura del proyecto
Template_PlayWright_BDD_2025/
├── 📁 src/
│   ├── 📁 main/
│   │   └── 📁 java/
│   │       └── 📁 co/com/automation/testing/
│   │           ├── 📁 base/
│   │           │   └── 📄 Hooks.java
│   │           ├── 📁 commons/
│   │           │   └── 📄 CommonSteps.java
│   │           ├── 📁 config/
│   │           │   ├── 📄 Config.java
│   │           │   ├── 📄 DeviceConfig.java
│   │           │   ├── 📄 DeviceType.java
│   │           │   └── 📄 UserConstants.java
│   │           ├── 📁 listeners/
│   │           │   └── 📄 AllureListener.java
│   │           ├── 📁 pages/
│   │           │   ├── 📁 components/
│   │           │   │   └── 📄 CDComponents.java
│   │           │   ├── 📄 AdminPages.java
│   │           │   └── 📄 LoginPages.java
│   │           ├── 📁 questions/
│   │           │   ├── 📄 AdminQuestions.java
│   │           │   ├── 📄 GridQuestions.java
│   │           │   └── 📄 LoginQuestions.java
│   │           ├── 📁 stepdefinitions/
│   │           │   ├── 📄 AdminSteps.java
│   │           │   ├── 📄 AuthenticationSteps.java
│   │           │   └── 📄 LoginSteps.java
│   │           ├── 📁 tasks/
│   │           │   ├── 📄 AdminTasks.java
│   │           │   ├── 📄 LoginTasks.java
│   │           │   └── 📄 SearchTasks.java
│   │           └── 📁 utils/
│   │               ├── 📄 AllureEnvironmentWriter.java
│   │               ├── 📄 CsvReader.java
│   │               ├── 📄 DataProvider.java
│   │               ├── 📄 ExcelReader.java
│   │               └── 📄 VideoRecorder.java
│   └── 📁 test/
│       └── 📁 resources/
│           ├── 📁 data/
│           │   ├── 📄 busqueda.csv
│           │   └── 📄 login.csv
│           └── 📁 features/
│               └── 📄 login.feature
├── 📁 target/                    (Generado automáticamente)
├── 📄 allure.properties
├── 📄 junit-platform.properties
├── 📄 login-test.xml
├── 📄 playwright.config.js
├── 📄 playwright.config.json
├── 📄 simplelogger.properties
├── 📄 users.yml
├── 📄 .gitignore
├── 📄 browserstack.xml
├── 📄 debug_grid_results.png
├── 📄 mvnw
├── 📄 mvnw.cmd
├── 📄 pom.xml
└── 📄 README.md

🎯 Explicación Visual de la Estructura

📦 PROYECTO COMPLETO
├── 📂 CÓDIGO FUENTE (src/)
│   ├── 📂 LÓGICA DE PRUEBAS (main/java/...)
│   │   ├── 📂 BASE → Configuración inicial/final
│   │   ├── 📂 COMMONS → Pasos reutilizables
│   │   ├── 📂 CONFIG → Configuraciones variables
│   │   ├── 📂 LISTENERS → Reportes y listeners
│   │   ├── 📂 PAGES → Elementos web (Page Objects)
│   │   ├── 📂 QUESTIONS → Validaciones
│   │   ├── 📂 STEPDEFINITIONS → Pasos Cucumber
│   │   ├── 📂 TASKS → Acciones de usuario
│   │   └── 📂 UTILS → Herramientas auxiliares
│   └── 📂 RECURSOS DE PRUEBA (test/resources/)
│       ├── 📂 DATA → Datos parametrizados
│       └── 📂 FEATURES → Escenarios BDD (.feature)
├── 📂 RESULTADOS (target/) → Generado automáticamente
└── 📄 CONFIGURACIONES → Archivos de configuración global

🔄 Flujo de Dependencias (Quién llama a quién)

Archivo .feature
↓ (ejecuta)
StepDefinitions
↓ (usa)
Tasks
↓ (usa)
Pages
↓ (interactúa con)
Navegador (Playwright)
↑ (valida con)
Questions

📊 Estructura por Capas (Clean Architecture para Tests)

┌─────────────────────────────────────────┐
│         FEATURES (BDD - Gherkin)        │ ← Los casos de negocio
└─────────────────────────────────────────┘
↓
┌─────────────────────────────────────────┐
│         STEP DEFINITIONS                 │ ← Conectan lenguaje con código
└─────────────────────────────────────────┘
↓
┌─────────────────────────────────────────┐
│         TASKS                           │ ← Flujos de usuario
└─────────────────────────────────────────┘
↓                  ↓
┌──────────────┐    ┌──────────────┐
│   PAGES      │    │  QUESTIONS   │
│ (Acciones)   │    │ (Validaciones)│
└──────────────┘    └──────────────┘
↓                  ↓
┌─────────────────────────────────────────┐
│         PLAYWRIGHT API                  │ ← Control del navegador

🗂️ Qué va en cada carpeta (Regla Mnemotécnica)

Carpeta					Para Guarda				Ejemplo						Regla Memoria
pages					Elementos web			botones, inputs				"Páginas web"
tasks					Acciones complejas		login(), buscar()			"Tareas de usuario"
questions				Validaciones			estáLogueado()				"Preguntas de validación"
stepdefinitions			Pasos Gherkin → Java	@Dado("que...")				"Traductor BDD"
utils					Herramientas			leerExcel(), grabarVideo()	"Utilidades"
config					Configuraciones			URLs, usuarios				"Ajustes del sistema"
data (resources)		Datos de prueba			usuarios.csv				"Datos de entrada"
features (resources)	Escenarios BDD			login.feature				"Historias de usuario"

🚀 Estructura para Nuevos Tests

-Cuando añadas una nueva funcionalidad (ej: "Búsqueda"):

-Crea feature: features/busqueda.feature

-Crea pages: pages/BusquedaPages.java

-Crea tasks: tasks/BusquedaTasks.java

-Crea questions: questions/BusquedaQuestions.java

-Crea steps: stepdefinitions/BusquedaSteps.java

-Añade datos: data/busqueda.csv
​
📁 Estructura del Proyecto
📂 src/main/java/co/com/automation/testing/
Aquí vive todo el código Java de automatización.

📁 base/
Hooks.java: Clase que maneja “antes y después” de cada escenario. Por ejemplo, abre el navegador antes de empezar y lo cierra al final.

Depende de: Playwright, configuraciones del proyecto.

Sirve para: Inicializar y cerrar recursos automáticamente.

📁 commons/
CommonSteps.java: Pasos genéricos que se pueden reusar en cualquier feature (como “dado que estoy en la página principal”).

Depende de: Playwright, páginas.

Sirve para: Evitar repetir código en distintos escenarios.

📁 config/
Config.java: Lee configuraciones generales del proyecto (URLs, tiempo de espera, etc.).

DeviceConfig.java: Configura el dispositivo simulado (móvil, tablet, escritorio).

DeviceType.java: Define tipos de dispositivos disponibles.

UserConstants.java: Almacena constantes como usuarios y contraseñas.

Dependen de: Archivos .properties o .yml.

Sirven para: Centralizar configuraciones y evitar hardcode.

📁 listeners/
AllureListener.java: Escucha eventos de las pruebas y los reporta a Allure para generar reportes bonitos 📊.

Depende de: Allure, Cucumber.

Sirve para: Generar reportes detallados de ejecución.

📁 pages/
Aquí definimos las páginas web como objetos (Page Object Model).

CDComponents.java: Componentes reusables (botones, inputs, modales).

AdminPages.java: Páginas de la sección de administración.

LoginPages.java: Página de login.

Dependen de: Playwright.

Sirven para: Mapear elementos web y sus acciones (click, escribir, etc.).

📁 questions/
Patrón “Question”: valida el estado de la aplicación.

AdminQuestions.java: Valida cosas en la sección de admin.

GridQuestions.java: Valida datos en tablas/grids.

LoginQuestions.java: Valida si el login fue exitoso.

Dependen de: Páginas, tasks.

Sirven para: Hacer afirmaciones (asserts) legibles en los steps.

📁 stepdefinitions/
Los “pasos” de Cucumber escritos en Java.

AdminSteps.java: Pasos para features de administración.

AuthenticationSteps.java: Pasos para autenticación.

LoginSteps.java: Pasos específicos de login.

Dependen de: Tasks, Questions.

Sirven para: Ejecutar acciones y validaciones desde los archivos .feature.

📁 tasks/
Patrón “Task”: agrupa acciones de usuario.

AdminTasks.java: Tareas de administración (crear, editar, eliminar).

LoginTasks.java: Tareas de login (ingresar usuario, contraseña, enviar).

SearchTasks.java: Tareas de búsqueda.

Dependen de: Páginas.

Sirven para: Encapsular flujos de usuario reusables.

📁 utils/
Utilidades varias.

AllureEnvironmentWriter.java: Escribe datos de entorno en los reportes de Allure.

CsvReader.java: Lee archivos CSV.

DataProvider.java: Provee datos para pruebas parametrizadas.

ExcelReader.java: Lee archivos Excel.

VideoRecorder.java: Graba video de la ejecución (útil para debug).

Dependen de: Librerías externas (Apache POI, OpenCSV, etc.).

Sirven para: Leer datos, grabar ejecuciones, enriquecer reportes.

📂 src/test/resources/
Recursos de prueba.

📁 data/
busqueda.csv: Datos para pruebas de búsqueda.

login.csv: Datos para pruebas de login.

Sirven para: Parametrizar pruebas sin tocar el código.

📁 features/
login.feature: Archivo BDD con escenarios de login escritos en lenguaje Gherkin (Dado/Cuando/Entonces).

Depende de: StepDefinitions.

Sirve para: Definir casos de prueba en lenguaje natural.

📄 Archivos de Configuración en Raíz
allure.properties: Configuración de Allure (rutas, versiones).

junit-platform.properties: Configuración de JUnit (ejecución paralela, etc.).

login-test.xml: Configuración de suite de pruebas de login.

playwright.config.js / playwright.config.json: Configuración de Playwright (navegadores, viewport, timeouts).

simplelogger.properties: Configuración de logs (consola, archivo).

users.yml: Usuarios y roles en formato YAML.

.gitignore: Archivos que Git debe ignorar (target, logs, etc.).

browserstack.xml: Configuración para ejecución en BrowserStack (nube).

debug_grid_results.png: Imagen de ejemplo de resultados en grid (debug).

pom.xml: Archivo Maven: define dependencias, plugins y configuración del proyecto.

README.md: Este archivo 🎯.

🧩 Flujo de Ejecución Típico
Cucumber lee un archivo .feature (ej: login.feature).

Busca los step definitions que coincidan (en stepdefinitions/).

Los steps llaman a tasks para realizar acciones.

Las tasks usan pages para interactuar con la web.

Luego se usan questions para validar.

Hooks se ejecutan antes/después para setup/teardown.

Allure genera reportes con los resultados y videos (si está configurado).

🛠️ Cómo Empezar
Clona el proyecto.

Ejecuta mvn clean test para correr las pruebas.

Revisa los reportes en target/allure-reports/.

Modifica los archivos .feature para añadir nuevos casos.

Implementa los steps, tasks y pages necesarios.

🧪 URL de prueba
https://opensource-demo.orangehrmlive.com/web/index.php/auth/login

👨‍💻 Autor
Luis Ernesto Lopez Caicedo
Ingeniero de Sistemas – QA Automation & Performance
Especialista en pruebas funcionales, no funcionales y automatización`,








// 37. users.yml
  "Template_PlayWright_BDD_2026
└── settings.xml":



`<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd">
    <offline>false</offline>
    <mirrors>
        <mirror>
            <id>central</id>
            <mirrorOf>*</mirrorOf>
            <url>https://bbogdigital.jfrog.io/bbogdigital/maven-public/</url>
            <name>Artifactory</name>
        </mirror>
    </mirrors>
    <servers>
        <server>
            <id>central</id>
            <username>${ARTIFACTORY_READER_USER}</username>
            <password>${ARTIFACTORY_READER_API_KEY}</password>
        </server>
    </servers>
</settings>`,






// 38. users.yml
  "Template_PlayWright_BDD_2026
└── sonar-project-custom.properties":


`sonar.projectName=${env.SONAR_CLOUD_PROJECT_NAME}
sonar.login=${env.SONAR_CLOUD_TOKEN}
sonar.organization=${env.SONAR_CLOUD_ORG}
sonar.projectKey=${env.SONAR_CLOUD_PROJECT_KEY}
sonar.branch.name=${env.CURRENT_BRANCH}
sonar.sources=src/main
sonar.java.binaries=src
sonar.coverage.exclusions=**/*.java`,


};

// ========== FUNCIONES DE TRADUCCIÓN ==========
function translateText(text) {
  if (!text || typeof text !== 'string') return text;

  // Buscar traducción exacta
  if (AUDIT_TRANSLATIONS[text]) {
    return AUDIT_TRANSLATIONS[text];
  }

  // Buscar traducción parcial (para descripciones largas)
  for (const [english, spanish] of Object.entries(AUDIT_TRANSLATIONS)) {
    if (text.includes(english)) {
      return text.replace(english, spanish);
    }
  }

  // Limpiar links y referencias que causan problemas en PDF
  if (text.includes('http://') || text.includes('https://') || text.includes('developer.chrome.com')) {
    // Extraer solo el texto descriptivo, eliminando los links
    const cleanedText = text.replace(/\[.*?\]\(.*?\)/g, ''); // Eliminar markdown links
    const withoutLinks = cleanedText.replace(/https?:\/\/[^\s]+/g, ''); // Eliminar URLs
    const withoutLearnMore = withoutLinks.replace(/Learn more about.*/gi, ''); // Eliminar "Learn more"
    const finalText = withoutLearnMore.replace(/\(https?:\/\/[^)]+\)/g, ''); // Eliminar URLs entre paréntesis

    // Si el texto quedó muy corto, devolver una versión genérica
    if (finalText.trim().length < 10) {
      return "Consulte la documentación oficial para más detalles.";
    }

    return finalText.trim() || text;
  }

  return text;
}

// ========== FUNCIÓN PARA VALIDAR Y LIMPIAR DATOS PARA PDF ==========
function validarDatosParaPDF(data) {
  try {
    console.log("🔍 Validando datos para PDF:", {
      hasMetricsItems: !!data.metrics?.performance?.items,
      hasAuditsOpportunities: !!data.audits?.opportunities?.items,
      hasAuditsPassed: !!data.audits?.passed?.items
    });

    // Crear estructura mínima garantizada
    const datosValidados = {
      ...data,
      // Información básica
      url: data.url || data.analyzedUrl || 'URL no disponible',
      strategy: data.strategy || 'desktop',
      strategyLabel: data.strategyLabel ||
                    (data.strategy === 'mobile' ? '📱 Móvil' : '🖥️ Escritorio'),
      fecha: data.fecha || new Date().toLocaleDateString('es-ES'),

      // CATEGORÍAS (obligatorio)
      categories: data.categories || {},

      // MÉTRICAS (con items array obligatorio)
      metrics: {
        performance: {
          items: Array.isArray(data.metrics?.performance?.items)
            ? data.metrics.performance.items
            : Object.values(data.metrics?.performance || {})
                    .filter(m => m && m.title)
                    .map(m => ({
                      id: m.id || m.title.toLowerCase().replace(/\s+/g, '-'),
                      title: m.title || 'Sin título',
                      description: m.description || '',
                      displayValue: m.displayValue || '',
                      numericValue: m.numericValue,
                      numericUnit: m.numericUnit,
                      score: m.score
                    }))
        }
      },

      // AUDITORÍAS (estructura obligatoria con items)
      audits: {
        opportunities: {
          items: Array.isArray(data.audits?.opportunities?.items)
            ? data.audits.opportunities.items
            : Object.values(data.audits?.opportunities || {})
                    .filter(a => a && a.title)
        },
        passed: {
          items: Array.isArray(data.audits?.passed?.items)
            ? data.audits.passed.items
            : Object.values(data.audits?.passed || {})
                    .filter(a => a && a.title)
        }
      },

      // DIAGNÓSTICOS (array obligatorio)
      diagnostics: Array.isArray(data.diagnostics)
        ? data.diagnostics
        : [],

      // RECOMENDACIONES (array obligatorio)
      recommendations: Array.isArray(data.recommendations)
        ? data.recommendations
        : [],

      // EXPERIENCIA DE CARGA
      loadingExperience: data.loadingExperience || null,

      // RESUMEN
      summary: data.summary || {
        performanceScore: data.categories?.performance?.score || 0
      }
    };

    // Log de validación
    console.log("✅ Datos validados para PDF:", {
      metricsItems: datosValidados.metrics.performance.items.length,
      opportunities: datosValidados.audits.opportunities.items.length,
      passed: datosValidados.audits.passed.items.length,
      diagnostics: datosValidados.diagnostics.length,
      recommendations: datosValidados.recommendations.length
    });

    return datosValidados;
  } catch (error) {
    console.error('❌ Error validando datos para PDF:', error);

    // Retornar datos mínimos para evitar error
    return {
      url: 'Error en datos',
      strategy: 'desktop',
      strategyLabel: 'Escritorio',
      fecha: new Date().toLocaleDateString('es-ES'),
      categories: {},
      metrics: { performance: { items: [] } },
      audits: { opportunities: { items: [] }, passed: { items: [] } },
      diagnostics: [],
      recommendations: [
        {
          priority: 'ALTA',
          title: 'Error en datos de análisis',
          description: 'No se pudieron procesar los datos correctamente',
          impact: 'No se puede generar reporte completo',
          action: 'Verificar la URL y volver a intentar'
        }
      ],
      loadingExperience: null,
      summary: { performanceScore: 0 }
    };
  }
}

function translateAudit(audit) {
  if (!audit) return audit;

  const translated = { ...audit };

  // Traducir título
  if (audit.title) {
    translated.title = translateText(audit.title);
  }

  // Traducir descripción
  if (audit.description) {
    translated.description = translateText(audit.description);
  }

  // Traducir displayValue
  if (audit.displayValue) {
    let displayValue = audit.displayValue;

    // Traducir unidades comunes
    displayValue = displayValue.replace(/\b(\d+(\.\d+)?)\s*s\b/g, '$1 segundos');
    displayValue = displayValue.replace(/\b(\d+(\.\d+)?)\s*ms\b/g, '$1 milisegundos');
    displayValue = displayValue.replace(/\b(\d+(\.\d+)?)\s*KB\b/g, '$1 KB');
    displayValue = displayValue.replace(/\b(\d+(\.\d+)?)\s*MB\b/g, '$1 MB');

    // Traducir texto en displayValue
    displayValue = translateText(displayValue);
    translated.displayValue = displayValue;
  }

  // Traducir detalles si existen - CON VALIDACIÓN SEGURA
  if (audit.details) {
    const details = { ...audit.details };

    // Validar que items sea un array antes de mapear
    if (details.items && Array.isArray(details.items)) {
      details.items = details.items.map(item => translateAuditItem(item));
    } else if (details.items && typeof details.items === 'object') {
      // Si items es un objeto pero no un array, convertirlo a array
      details.items = [translateAuditItem(details.items)];
    } else if (details.items) {
      // Si items existe pero no es array ni objeto, crear array vacío
      details.items = [];
    }

    translated.details = details;
  }

  return translated;
}

function translateAuditItem(item) {
  if (!item || typeof item !== 'object') return item;

  const translated = { ...item };

  // Traducir propiedades comunes
  Object.keys(translated).forEach(key => {
    if (typeof translated[key] === 'string') {
      translated[key] = translateText(translated[key]);
    }
  });

  return translated;
}

function translateCategory(category) {
  if (!category) return category;

  const translated = { ...category };

  // Traducir título
  if (category.title) {
    translated.title = translateText(category.title);
  }

  // Traducir descripción
  if (category.description) {
    translated.description = translateText(category.description);
  }

  // Agregar descripción detallada si no existe
  if (!translated.detailedDescription && CATEGORY_DESCRIPTIONS[category.id]) {
    translated.detailedDescription = CATEGORY_DESCRIPTIONS[category.id];
  }

  return translated;
}

function getScoreLabel(score) {
  const numericScore = Math.round(score * 100);

  if (numericScore >= 90) return SCORE_LABELS[90];
  if (numericScore >= 70) return SCORE_LABELS[70];
  if (numericScore >= 50) return SCORE_LABELS[50];
  return SCORE_LABELS[0];
}

function translateLoadingExperience(loadingExp) {
  if (!loadingExp) return loadingExp;

  const translated = { ...loadingExp };

  // Traducir categorías
  if (loadingExp.overall_category) {
    translated.overall_category = translateText(loadingExp.overall_category);
  }

  // Traducir métricas
  if (loadingExp.metrics) {
    Object.keys(loadingExp.metrics).forEach(key => {
      if (loadingExp.metrics[key].category) {
        loadingExp.metrics[key].category = translateText(loadingExp.metrics[key].category);
      }
    });
  }

  return translated;
}




app.use(cors({ origin: "*" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req,res,next)=>{ console.log(new Date().toISOString(), req.method, req.url); next(); });


// ==========================================
// MIDDLEWARE DE DEPURACIÓN GLOBAL (DEBUG)
// ==========================================
app.use((req, res, next) => {
    console.log(`[DEBUG GLOBAL] ${new Date().toISOString()} - Método: ${req.method} | Ruta: ${req.url}`);

    // Si el cuerpo trae datos, imprimir los primeros 300 caracteres
    if (req.body && Object.keys(req.body).length > 0) {
        console.log(`[DEBUG] Body recibido:`, JSON.stringify(req.body).substring(0, 300) + "...");
    } else {
        console.log(`[DEBUG] Sin cuerpo en la petición.`);
    }

    next();
});

// Transform recording -> project files (calls OpenAI)
app.post("/api/transform-recording", async (req, res) => {
  try {
    const { recording, url: userUrl, testData, flow, projectName = "automation-project" } = req.body;

    if (!recording) return res.status(400).json({ error: "recording required" });

    // HACER LA URL OBLIGATORIA - CAMBIO PRINCIPAL
    if (!userUrl) {
      return res.status(400).json({
        error: "URL Base de la Aplicación es obligatoria. Por favor, ingresa la URL donde se realizará la automatización."
      });
    }

    // Validar que la URL sea válida
    try {
      new URL(userUrl);
    } catch (e) {
      return res.status(400).json({
        error: "URL inválida. Por favor, ingresa una URL válida (ej: https://www.ejemplo.com)"
      });
    }

    // Ya no extraemos URL del recording, usamos la que proporciona el usuario
    const finalUrl = userUrl;

    // Extraer dominio para nombres de clases
    const domainName = extractDomainName(finalUrl);
    const projectId = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    console.log(`🌐 Generando proyecto para URL OBLIGATORIA: ${finalUrl}`);
    console.log(`🏷️  Domain name: ${domainName}`);
    console.log(`📊 Recording steps: ${recording.steps?.length || 0}`);

    // Usar la URL extraída en el prompt
    const prompt = buildDynamicPrompt({
      recording,
      url: finalUrl,
      testData,
      flow,
      domainName
    });

    // En la llamada a OpenAI, actualizar el system prompt:
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres un ingeniero senior de automatización Java con experiencia en Serenity BDD Screenplay.

        CRITERIOS OBLIGATORIOS - NO NEGOCIABLES:

        1. FORMATO DE FEATURE FILE:
           - Feature: [Nombre en español o inglés]
           - Scenario: [Nombre descriptivo en español]
           - Steps: Given/When/Then/And/But EN INGLÉS seguido de "texto descriptivo completo en español"
           - Usar 'And' para continuar con pasos del mismo tipo (Given And..., When And..., Then And...)

        2. EJEMPLOS CORRECTOS (OBLIGATORIO):
           Scenario: Escenario exitoso - Login de usuario
                Given el usuario navega a la página de inicio de sesión
                And el usuario ingresa su nombre de usuario
                And el usuario ingresa su contraseña
                When el usuario hace clic en el botón de login
                Then debe ser redirigido al dashboard principal

           Scenario: Escenario de error - Credenciales inválidas
             Given el usuario está en la página de login
             When ingresa un usuario incorrecto y contraseña errónea
             Then debe ver un mensaje de error de autenticación

        3. EJEMPLOS INCORRECTOS (PROHIBIDOS):
           ❌ Given I am on the login page
           ❌ When I enter valid credentials
           ❌ Then I should be redirected to dashboard

        4. PARA STEP DEFINITIONS:
           - Usar @And para los steps que sean continuaciones
           - Importar io.cucumber.java.en.And
           - Ejemplo: @And("el usuario ingresa su nombre de usuario")
             public void elUsuarioIngresaSuNombreDeUsuario() { ... }

        5. ESTRUCTURA EXACTA DE CADA STEP:
           [Keyword en inglés] "[Descripción completa en español]"

        6. VALIDACIÓN: Antes de entregar, verifica que:
           - Ningún step comience con "I am", "I click", "I enter", "I should"
           - Todos los steps NO tengan comillas dobles
           - El texto dentro de LOS STEPS esté completamente en español

        URL BASE: ${finalUrl}
        Dominio: ${domainName}

        Genera código funcional y ejecutable.`
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 8000
    });

    console.log("📤 Enviando prompt a OpenAI...");

            const raw = completion.choices?.[0]?.message?.content ?? "";
            console.log("📥 Raw OpenAI response recibida");

            // Limpiar la respuesta
            let cleaned = raw.trim();

            // Extraer JSON de la respuesta
            let openaiFiles = {};
            try {
            // Intentar diferentes patrones de extracción
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
             if (jsonMatch) {
             cleaned = jsonMatch[0];
             }

             // Limpiar markdown
             cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');

             openaiFiles = JSON.parse(cleaned);
             console.log("✅ JSON parseado correctamente de OpenAI");
             console.log(`📁 Archivos recibidos: ${Object.keys(openaiFiles).length}`);
             } catch(e) {
             console.error("❌ Error parseando JSON de OpenAI:", e.message);
             console.log("Primeros 500 chars de la respuesta:", cleaned.substring(0, 500));
             openaiFiles = {};
             }

             // Después de procesar openaiFiles, verificar y corregir los definitions
             for (const [filePath, content] of Object.entries(allFiles)) {
               if (filePath.includes('Definitions.java') && filePath.includes('src/test/java/')) {
                 // Extraer steps del feature correspondiente
                 const featurePath = filePath.replace('definitions/', 'resources/features/')
                                             .replace('Definitions.java', '.feature')
                                             .replace('src/test/java/', 'src/test/');

                 if (allFiles[featurePath]) {
                   const featureSteps = parseFeatureSteps(allFiles[featurePath]);
                   const correctedDefinitions = generateDefinitionsFromSteps(featureSteps, domainName);

                   // Si encontramos steps 'And' en el feature, asegurarnos de que estén en definitions
                   const hasAndSteps = featureSteps.some(step => step.keyword === 'And');
                   if (hasAndSteps && !content.includes('@And')) {
                     console.log(`🔄 Corrigiendo definitions para incluir @And: ${filePath}`);
                     allFiles[filePath] = correctedDefinitions;
                   }
                 }
               }
             }

             // ========== CONSTRUIR PROYECTO DINÁMICO ==========
             console.log(`🏗️  Construyendo proyecto dinámico para ${finalUrl}...`);
             const files = {};

             // 1. ARCHIVOS CRÍTICOS DEL SISTEMA (Dinámicos)
             console.log("🔧 Generando archivos críticos del sistema...");

             // A) POM.XML (siempre nuestra versión)
             files['pom.xml'] = generatePomXml(projectId);

             // B) SERENITY.CONF (dinámico con la URL proporcionada)
             files['src/test/resources/serenity.conf'] = generateSerenityConf(finalUrl, domainName);

             // C) RUNNER (genérico)
             files['src/test/java/co/com/template/automation/testing/runners/CucumberTestSuiteTest.java'] = generateRunner();

             // D) STEP URL (dinámico)
             files['src/test/java/co/com/template/automation/testing/definitions/commons/StepUrl.java'] = generateStepUrl();

             // E) HOOKS (genérico pero robusto)
            files['src/test/java/co/com/template/automation/testing/definitions/hooks/Hooks.java'] = generateHooks();

            // F) UTILIDADES COMUNES
            files['src/main/java/co/com/template/automation/testing/utils/EnvironmentProperties.java'] = generateEnvironmentProperties();
            files['src/main/java/co/com/template/automation/testing/utils/ShadowDomUtils.java'] = generateShadowDomUtils();
            files['src/main/java/co/com/template/automation/testing/utils/WaitUtils.java'] = generateWaitUtils();

            // 2. PROCESAR Y COMPLETAR ARCHIVOS DE OPENAI
            console.log("🤖 Procesando archivos de OpenAI...");

            // Clasificar archivos de OpenAI por categorías
            const openaiFilesByCategory = {
            features: {},
            definitions: {},
            pages: {},
            tasks: {},
            questions: {},
            others: {}
            };

            // Limpiar feature files de OpenAI
            for (const [filePath, content] of Object.entries(openaiFiles)) {
              if (filePath.includes('.feature')) {
                // Primero limpiar el feature file
                let cleanedContent = generateCleanFeature(content, domainName);

                // Luego forzar descripciones en español
                cleanedContent = forceSpanishDescriptions(cleanedContent);
                cleanedContent = enforceStrictFormat(cleanedContent);

                if (cleanedContent) {
                  openaiFiles[filePath] = cleanedContent;
                }
                openaiFilesByCategory.features[filePath] = openaiFiles[filePath];
              } else if (filePath.includes('/definitions/')) {
                openaiFilesByCategory.definitions[filePath] = content;
              } else if (filePath.includes('/ui/')) {
               openaiFilesByCategory.pages[filePath] = content;
              } else if (filePath.includes('/tasks/')) {
                openaiFilesByCategory.tasks[filePath] = content;
              } else if (filePath.includes('/questions/')) {
                openaiFilesByCategory.questions[filePath] = content;
              } else {
                openaiFilesByCategory.others[filePath] = content;
                }
                 }

             // Archivos base que SIEMPRE deben generarse
             const baseFiles = {
             // Feature file dinámico con inglés/español
             'feature': {
              path: `src/test/resources/features/${domainName.toLowerCase()}.feature`,
              template: generateDynamicFeature(recording, flow, domainName),
              optional: false
              },
  // Definitions principales
  'definitions': {
     path: `src/test/java/co/com/template/automation/testing/definitions/${domainName}Definitions.java`,
     template: generateDynamicDefinitions(domainName, recording),
     optional: false
  },

  // Página principal (solo si OpenAI no proporciona páginas)
         'mainPage': {
        path: `src/main/java/co/com/template/automation/testing/ui/${domainName}Page.java`,
        template: generatePageTemplate(`${domainName}Page`, recording.steps),
        optional: true
      },

      // Task principal (solo si OpenAI no proporciona tasks)
      'mainTask': {
        path: `src/main/java/co/com/template/automation/testing/tasks/${domainName}Task.java`,
        template: generateTaskTemplate(`${domainName}Task`, `${domainName}Page`),
        optional: true
      },

      // Question principal (solo si OpenAI no proporciona questions)
      'mainQuestion': {
        path: `src/main/java/co/com/template/automation/testing/questions/${domainName}Question.java`,
        template: generateQuestionTemplate(`${domainName}Question`, `${domainName}Page`),
        optional: true
      }
    };

    // Combinar archivos
    for (const [key, fileInfo] of Object.entries(baseFiles)) {
      // Buscar si OpenAI proporcionó este archivo en la categoría correspondiente
      let openaiContent = null;
      let category = key === 'feature' ? 'features' :
                     key === 'definitions' ? 'definitions' :
                     key === 'mainPage' ? 'pages' :
                     key === 'mainTask' ? 'tasks' :
                     key === 'mainQuestion' ? 'questions' : 'others';

      for (const [openaiPath, content] of Object.entries(openaiFilesByCategory[category])) {
        if (openaiPath.includes(fileInfo.path.split('/').pop())) {
          openaiContent = content;
          break;
        }
      }

      // Usar contenido de OpenAI si existe y es bueno, o usar template si es requerido
      if (openaiContent && openaiContent.length > 50) {
        files[fileInfo.path] = openaiContent;
        console.log(`✅ ${fileInfo.path} desde OpenAI`);
      } else if (!fileInfo.optional) {
        files[fileInfo.path] = fileInfo.template;
        console.log(`📝 ${fileInfo.path} generado`);
      }
    }

    // Agregar archivos de OpenAI que no están en baseFiles pero que son útiles
    for (const category of ['pages', 'tasks', 'questions']) {
      for (const [filePath, content] of Object.entries(openaiFilesByCategory[category])) {
        // Solo agregar archivos de src/main, NO de src/test
        if (filePath.includes('src/main/') && !files[filePath]) {
          files[filePath] = content;
          console.log(`➕ ${filePath} agregado desde OpenAI`);
        }
      }
    }

    // Asegurar estructura de directorios test correcta
    // Eliminar cualquier archivo que no debería estar en src/test/java
    Object.keys(files).forEach(filePath => {
      if (filePath.includes('src/test/java/co/com/template/automation/testing/')) {
        // Solo permitir estas carpetas en test
        const validTestPaths = [
          'definitions',
          'runners'
        ];

        const isInvalid = !validTestPaths.some(validPath => filePath.includes(validPath));
        if (isInvalid) {
          console.log(`🗑️  Eliminando archivo inválido en test: ${filePath}`);
          delete files[filePath];
        }
      }
    });

    // 3. ASEGURAR QUE TENEMOS LOS ARCHIVOS MÍNIMOS NECESARIOS
    console.log("🔍 Validando archivos mínimos necesarios...");

    // Crear estructura para organizar archivos de OpenAI
    const openaiFileMap = {
      features: {},
      definitions: {},
      pages: {},
      tasks: {},
      questions: {},
      others: {}
    };
  // Clasificar archivos de OpenAI en categorías
  for (const [filePath, content] of Object.entries(openaiFiles)) {
     if (filePath.includes('.feature')) {
       openaiFileMap.features[filePath] = content;
     } else if (filePath.includes('/definitions/')) {
       openaiFileMap.definitions[filePath] = content;
     } else if (filePath.includes('/ui/')) {
       openaiFileMap.pages[filePath] = content;
     } else if (filePath.includes('/tasks/')) {
       openaiFileMap.tasks[filePath] = content;
     } else if (filePath.includes('/questions/')) {
       openaiFileMap.questions[filePath] = content;
     } else {
       openaiFileMap.others[filePath] = content;
     }
  }

  // Si no hay feature file, crear uno básico
  if (Object.keys(openaiFileMap.features).length === 0) {
     const featureContent = generateDefaultFeature(recording, domainName);
     openaiFileMap.features[`src/test/resources/features/${domainName.toLowerCase()}.feature`] = featureContent;

  console.log("⚠️  No se encontró feature file, generando uno por defecto");
  }

  // Si no hay definitions, crear unas básicas
  if (Object.keys(openaiFileMap.definitions).length === 0) {
     const definitionsContent = generateDefaultDefinitions(domainName);
     openaiFileMap.definitions[`src/test/java/co/com/template/automation/testing/definitions/${domainName}Definitions.java`] = definitionsContent;
     console.log("⚠️  No se encontraron definitions, generando por defecto");
  }

  // Si no hay pages, crear al menos una página principal
  if (Object.keys(openaiFileMap.pages).length === 0) {
     const mainPageContent = generateMainPage(domainName);
     openaiFileMap.pages[`src/main/java/co/com/template/automation/testing/ui/${domainName}Page.java`] = mainPageContent;
     console.log("⚠️  No se encontraron pages, generando página principal");
  }

  // 4. COMBINAR TODOS LOS ARCHIVOS
  console.log("🔗 Combinando todos los archivos...");

  // Crear un nuevo objeto para todos los archivos
  const allFiles = {};

  // Primero agregar archivos del sistema
  for (const [fname, content] of Object.entries(files)) {
     allFiles[fname] = content;
  }

  // Luego agregar archivos de OpenAI con validación de nombres
  for (const category of ['features', 'definitions', 'pages', 'tasks', 'questions', 'others']) {
    for (const [filePath, content] of Object.entries(openaiFileMap[category])) {
      // Validar y corregir nombres duplicados
      const fileName = path.basename(filePath, path.extname(filePath));
      const cleanFileName = validateAndCleanFileName(fileName, domainName);

      if (cleanFileName !== fileName) {
        // Construir nueva ruta con nombre corregido
        const dirPath = path.dirname(filePath);
        const extension = path.extname(filePath);
        const cleanFilePath = path.join(dirPath, cleanFileName + extension);

        // Actualizar referencias en el contenido
        let cleanContent = content;
        cleanContent = cleanContent.replace(
          new RegExp(`\\bclass ${fileName}\\b`, 'g'),
          `class ${cleanFileName}`
        );

        allFiles[cleanFilePath] = cleanContent;
      } else {
        allFiles[filePath] = content;
      }
    }
  }

  // 5. ARCHIVOS DE CONFIGURACIÓN ADICIONALES
  console.log("⚙️  Agregando archivos de configuración...");

  // Agregar directamente a allFiles
  allFiles['src/test/resources/junit-platform.properties'] = "cucumber.junit-platform.naming-strategy=long\ncucumber.plugin=pretty,html:target/cucumber-report.html";
  allFiles['src/test/resources/logback-test.xml'] = generateLogbackConfig();
  allFiles['.gitignore'] = generateGitignore();
  allFiles['README.md'] = generateReadme(finalUrl, domainName);
  allFiles['serenity.properties'] = generateSerenityProperties(projectId);

  // Si hay testData, crear un archivo de datos de prueba
  if (testData) {
     allFiles['src/test/resources/testdata/test-data.json'] = JSON.stringify(testData, null, 2);
  }

  // 6. VALIDAR ESTRUCTURA DEL PROYECTO
  console.log("📋 Validando estructura del proyecto...");

  const validationResult = validateProjectStructure(allFiles);
  if (!validationResult.valid) {
     console.warn("⚠️  Advertencias en la estructura:", validationResult.warnings);
  }

  // ========== GUARDAR ARCHIVOS ==========
  const jobId = `project_${Date.now()}_${domainName}`;
  const outDir = path.join(__dirname, "output", jobId);
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`💾 Guardando ${Object.keys(allFiles).length} archivos en: ${outDir}`);

  for(const [fname, content] of Object.entries(allFiles)){
    const p = path.join(outDir, fname);
    try {
      fs.mkdirSync(path.dirname(p), { recursive: true });

      // Aplicar deduplicación solo para archivos Definitions
      let finalContent = content;
      if (fname.includes('Definitions.java') && fname.includes('src/test/java/')) {
        finalContent = deduplicateDefinitions(content);
      }

      fs.writeFileSync(p, finalContent, "utf8");
      console.log(`   📄 ${fname} (${finalContent.length} chars)`);
    } catch (fileError) {
      console.error(`❌ Error guardando ${fname}:`, fileError.message);
    }
  }

          // ========== CREAR ZIP ==========
          const zipPath = path.join(__dirname, "output", `${jobId}.zip`);
          const zip = new AdmZip();
          zip.addLocalFolder(outDir);
          zip.writeZip(zipPath);

          console.log("🎉 Proyecto generado exitosamente!");
          console.log(`📦 Job ID: ${jobId}`);
          console.log(`🌐 URL: ${finalUrl}`);
          console.log(`📁 Total archivos: ${Object.keys(allFiles).length}`);

          res.json({
            success: true,
            jobId,
            download: `/api/download/${jobId}`,
            fileCount: Object.keys(allFiles).length,
            domain: domainName,
            url: finalUrl,
            warnings: validationResult.warnings
          });

        } catch(err) {
          console.error("❌ transform error", err);
          res.status(500).json({
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
          });
        }
      });

app.post("/api/transform-recordings", async (req, res) => {
    try {
      const { recordings, url: userUrl, testData, flow, projectName = "automation-project" } = req.body;

      if (!recordings || !Array.isArray(recordings) || recordings.length === 0) {
        return res.status(400).json({ error: "Se requiere al menos una grabación" });
      }

      if (!userUrl) {
        return res.status(400).json({
          error: "URL Base de la Aplicación es obligatoria."
        });
      }

      try {
        new URL(userUrl);
      } catch (e) {
        return res.status(400).json({
          error: "URL inválida."
        });
      }

      const finalUrl = userUrl;
      const domainName = extractDomainName(finalUrl);
      const projectId = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-');

      console.log(`🌐 Generando proyecto con ${recordings.length} grabaciones para: ${finalUrl}`);

      // Preparar respuesta acumulativa
      let allFiles = {};

      // Procesar cada grabación individualmente
      for (let i = 0; i < recordings.length; i++) {
        const recording = recordings[i].data;
        const recordingName = recordings[i].name || `Recording${i + 1}`;
        // Limpiar y normalizar el nombre de la grabación
        const safeRecordingName = recordingName
          .replace(/[^a-zA-Z0-9]/g, '') // Remover caracteres especiales
          .replace(/^(Celulares|Computadores|Televisores).*$/i, (match) => {
            // Normalizar nombres comunes
            const normalized = match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
            return normalized.replace(/putadores$/i, '');
          })
          .replace(/(Celulares|Computadores|Televisores)\1+/i, '$1'); // Remover duplicados

        // Si el nombre es muy largo, truncarlo
        if (safeRecordingName.length > 20) {
          safeRecordingName = safeRecordingName.substring(0, 20);
        }

        console.log(`📝 Procesando grabación ${i + 1}: ${safeRecordingName}`);

        // Construir prompt para esta grabación
        const prompt = buildDynamicPrompt({
          recording,
          url: finalUrl,
          testData,
          flow: `${flow} - ${safeRecordingName}`,
          domainName: safeRecordingName
        });

        // Llamar a OpenAI para esta grabación
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Eres un ingeniero senior de automatización Java con experiencia en Serenity BDD Screenplay.

  IMPORTANTE: Genera código COMPLETO y FUNCIONAL para la grabación proporcionada.
  NOMBRE DE LA GRABACIÓN: ${safeRecordingName}
  URL BASE: ${finalUrl}

  REGLAS:
  1. Genera MÚLTIPLES ESCENARIOS (2 exitosos + 1 de error)
  2. Usa el nombre "${safeRecordingName}" en todos los archivos generados
  3. Palabras Gherkin (Given/When/Then/And/But) en INGLÉS, descripciones en ESPAÑOL entre comillas
  4. Incluir manejo de errores y validaciones
  5. Usar selectores CSS robustos basados en la grabación`
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 4000
        });

        const raw = completion.choices?.[0]?.message?.content ?? "";
        let openaiFiles = {};

        try {
          const jsonMatch = raw.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const cleaned = jsonMatch[0]
              .replace(/```json\n?/g, '')
              .replace(/```\n?/g, '');
            openaiFiles = JSON.parse(cleaned);
          }
        } catch(e) {
        console.error(`❌ Error parseando JSON para ${safeRecordingName}:`, e.message);
              }

              // Renombrar archivos para evitar conflictos - VERSIÓN CORREGIDA
              const renamedFiles = {};
              for (const [filePath, content] of Object.entries(openaiFiles)) {
                // Extraer el nombre base del archivo sin extensión
                const fileName = path.basename(filePath, path.extname(filePath));

                // Determinar el nuevo nombre basado en el tipo de archivo
                let newFileName = fileName;

                // Solo renombrar si el archivo tiene un sufijo específico
                if (fileName.endsWith('Definitions') ||
                    fileName.endsWith('Page') ||
                    fileName.endsWith('Task') ||
                    fileName.endsWith('Question')) {

                  // Extraer el nombre base sin el sufijo
                  const baseName = fileName.replace(/Definitions$|Page$|Task$|Question$/, '');

                  // Si el baseName ya contiene safeRecordingName, no duplicar
                  if (baseName.includes(safeRecordingName)) {
                    newFileName = fileName; // Mantener como está
                  } else {
                    // Crear nuevo nombre: safeRecordingName + Sufijo
                    const suffix = fileName.match(/(Definitions|Page|Task|Question)$/)[0];
                    newFileName = `${safeRecordingName}${suffix}`;
                  }
                }

                // Construir nueva ruta
                const dirPath = path.dirname(filePath);
                const extension = path.extname(filePath);
                const newPath = path.join(dirPath, newFileName + extension);

                // Actualizar referencias internas de manera segura
                let updatedContent = content;

                // Solo reemplazar si el nombre original es diferente al nuevo
                if (fileName !== newFileName) {
                  // Reemplazar declaraciones de clase
                  updatedContent = updatedContent.replace(
                    new RegExp(`\\bclass ${fileName}\\b`, 'g'),
                    `class ${newFileName}`
                  );

                  // Reemplazar referencias en imports y usos
                  updatedContent = updatedContent.replace(
                    new RegExp(`\\b${fileName}\\.`, 'g'),
                    `${newFileName}.`
                  );
                }

                renamedFiles[newPath] = updatedContent;
              }

              // Agregar al conjunto total de archivos
              Object.assign(allFiles, renamedFiles);
            }

            // AGREGAR ARCHIVOS DEL SISTEMA (solo una vez)
            console.log("🔧 Generando archivos del sistema...");

            // Archivos de configuración (solo una vez)
            allFiles['pom.xml'] = generatePomXml(projectId);
            allFiles['src/test/resources/serenity.conf'] = generateSerenityConf(finalUrl, domainName);
                        allFiles['src/test/java/co/com/template/automation/testing/runners/CucumberTestSuiteTest.java'] = generateMultiFlowRunner(recordings);
                        allFiles['src/test/java/co/com/template/automation/testing/definitions/commons/StepUrl.java'] = generateStepUrl();
                        allFiles['src/test/java/co/com/template/automation/testing/definitions/hooks/Hooks.java'] = generateHooks();
                        allFiles['src/main/java/co/com/template/automation/testing/utils/EnvironmentProperties.java'] = generateEnvironmentProperties();
                        allFiles['src/main/java/co/com/template/automation/testing/utils/ShadowDomUtils.java'] = generateShadowDomUtils();
                        allFiles['src/main/java/co/com/template/automation/testing/utils/WaitUtils.java'] = generateWaitUtils();
                        allFiles['src/test/resources/logback-test.xml'] = generateLogbackConfig();
                        allFiles['.gitignore'] = generateGitignore();
                        allFiles['README.md'] = generateMultiFlowReadme(finalUrl, domainName, recordings);
                        allFiles['serenity.properties'] = generateSerenityProperties(projectId);

                        // Crear feature principal que importe todos los features
                        allFiles['src/test/resources/features/AllFeatures.feature'] = generateMasterFeature(recordings);

                        // ========== GUARDAR ARCHIVOS ==========
                        const jobId = `multi_project_${Date.now()}_${domainName}`;
                        const outDir = path.join(__dirname, "output", jobId);
                        fs.mkdirSync(outDir, { recursive: true });

                        console.log(`💾 Guardando ${Object.keys(allFiles).length} archivos en: ${outDir}`);

                        for(const [fname, content] of Object.entries(allFiles)){
                          const p = path.join(outDir, fname);
                          try {
                            fs.mkdirSync(path.dirname(p), { recursive: true });
                            fs.writeFileSync(p, content, "utf8");
                          } catch (fileError) {
                            console.error(`❌ Error guardando ${fname}:`, fileError.message);
                          }
                        }

                        // Crear ZIP
                        const zipPath = path.join(__dirname, "output", `${jobId}.zip`);
                        const zip = new AdmZip();
                        zip.addLocalFolder(outDir);
                        zip.writeZip(zipPath);

                        console.log("🎉 Proyecto multi-flujo generado exitosamente!");

                        res.json({
                          success: true,
                          jobId,
                          download: `/api/download/${jobId}`,
                          fileCount: Object.keys(allFiles).length,
                          domain: domainName,
                          url: finalUrl,
                          recordingCount: recordings.length
                        });

                      } catch(err) {
                        console.error("❌ transform-recordings error", err);
                        res.status(500).json({
                          error: err.message,
                          stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
                        });
                      }
                    });

            // ========== FUNCIONES AUXILIARES ==========

            // Modificar también la función extractDomainName para que sea más robusta:
            function extractDomainName(url) {
              try {
                const urlObj = new URL(url);
                const hostname = urlObj.hostname;

                // Remover www, subdominios y extensiones comunes
                let domain = hostname
                  .replace(/^www\./, '')
                  .replace(/\.(com|co|net|org|edu|gov|io|ai|dev)$/i, '')
                  .replace(/\..+$/, ''); // Remover cualquier otra extensión

                // Capitalizar primera letra
                domain = domain.charAt(0).toUpperCase() + domain.slice(1);

                // Eliminar caracteres no alfabéticos
                domain = domain.replace(/[^a-zA-Z]/g, '');

                // Si el dominio queda vacío o muy corto, usar un nombre por defecto
                if (!domain || domain.length < 2) {
                  domain = 'WebPage';
                }

                // Asegurar que no sea un nombre redundante
                if (domain.endsWith('putadores') && domain !== 'Computadores') {
                  domain = 'Computadores';
                }

                return domain;
              } catch (e) {
                return 'WebPage';
              }
            }

            // Modificar la función extractMainUrl para que sea más efectiva:
            function extractMainUrl(steps) {
              try {
                if (!steps || steps.length === 0) {
                  return null; // Retornar null si no hay pasos
                }

                // 1. Primero intentar encontrar la URL más frecuente en page_load
                const urlCounts = {};
                steps.forEach(step => {
                  if (step.url && step.url !== '') {
                    // Limpiar la URL (remover query parameters y fragments)
                    const cleanUrl = step.url.split('?')[0].split('#')[0];
                            urlCounts[cleanUrl] = (urlCounts[cleanUrl] || 0) + 1;
                          }
                        });

                        // Encontrar la URL más común
                        let mainUrl = null;
                        let maxCount = 0;

                        Object.entries(urlCounts).forEach(([url, count]) => {
                          if (count > maxCount) {
                            maxCount = count;
                            mainUrl = url;
                          }
                        });

                        // 2. Si no encontramos una URL común, buscar la primera URL válida
                        if (!mainUrl) {
                          for (const step of steps) {
                            if (step.url &&
                                step.url.startsWith('http') &&
                                !step.url.includes('mail.google.com') &&
                                !step.url.includes('auth.openai.com') &&
                                !step.url.includes('cursos.raiola.link')) {
                              // Filtrar URLs que no son de la aplicación objetivo
                              mainUrl = step.url.split('?')[0].split('#')[0];
                              break;
                            }
                          }
                        }

                        // 3. Para casos específicos como las grabaciones proporcionadas
                        if (mainUrl) {
                          // Si es Mercado Libre
                          if (mainUrl.includes('mercadolibre.com.co')) {
                            return 'https://www.mercadolibre.com.co/';
                          }
                          // Si es Bancolombia
                          if (mainUrl.includes('bancolombia.com')) {
                            return 'https://www.bancolombia.com/personas';
                          }
                          return mainUrl;
                        }

                        return null;
                      } catch (e) {
                        console.error('Error extracting main URL:', e);
                        return null;
                      }
                    }

                    function generateDynamicFeatureWithScenarios(recording, domainName, mainUrl) {
                      const steps = recording.steps || [];

                      // Analizar el flujo para identificar acciones clave
                      const keyActions = analyzeKeyActions(steps);

                      // Generar feature con múltiples escenarios (solo español, sin detalles en inglés)
                      let feature = `Feature: Validación funcional flujos ${domainName}

                      # URL Base: ${mainUrl}
                      # Total pasos grabados: ${steps.length}
                      # Generado automáticamente desde grabación de usuario

                      Scenario: Escenario exitoso - Navegación y búsqueda básica
                        Given que navego a la página principal de ${domainName}
                        When busco un producto en la barra de búsqueda
                        Then debo ver los resultados de búsqueda

                      Scenario: Escenario exitoso - Selección y visualización de producto
                        Given que estoy en la página de resultados de búsqueda
                        When selecciono un producto específico de la lista
                        Then debo ver los detalles del producto seleccionado

                      Scenario: Escenario de error - Intento de acción sin autenticación
                        Given que estoy viendo los detalles de un producto
                        When intento agregar al carrito sin estar autenticado
                        Then debo ver el mensaje que requiere inicio de sesión

                      Scenario: Escenario de error - Formulario con datos inválidos
                        Given que estoy en la página de registro
                        When ingreso un formato de email inválido
                        Then debo ver el mensaje de error de validación

                      Scenario: Escenario exitoso - Registro de nuevo usuario
                        Given que estoy en el formulario de registro
                        When completo el registro con datos válidos
                        Then debo ver la confirmación de registro exitoso`;

                      return feature;
                    }

                    function generateCleanFeature(openaiFeatureContent, domainName) {
                      if (!openaiFeatureContent) return '';

                      let cleaned = openaiFeatureContent;

                      // Reemplazar el nombre del dominio en el Feature
                      cleaned = cleaned.replace(/Feature:.*/, `Feature: ${domainName} Automation`);

                      // Normalizar saltos de línea
                      cleaned = cleaned.replace(/\r\n/g, '\n');

                      // CORREGIR: Eliminar comillas dobles de los steps
                      // Patrón para encontrar steps con comillas dobles
                      const stepWithQuotesPattern = /^\s*(Given|When|Then|And|But)\s+["']([^"']+)["']$/gm;

                      cleaned = cleaned.replace(stepWithQuotesPattern, (match, keyword, text) => {
                        // Retornar sin comillas
                        return `    ${keyword} ${text.trim()}`;
                      });

                      // También manejar casos donde hay comillas simples
                      const singleQuotesPattern = /^\s*(Given|When|Then|And|But)\s+'([^']+)'$/gm;
                      cleaned = cleaned.replace(singleQuotesPattern, '    $1 $2');

                      return cleaned;
                    }

                    // Función auxiliar para analizar acciones clave
                    function analyzeKeyActions(steps) {
                      const actions = {
                        clicks: 0,
                        inputs: 0,
                        navigations: 0,
                        validations: 0
                      };

                      steps.forEach(step => {
                        const action = step.action?.toLowerCase() || '';

                        if (action.includes('click')) actions.clicks++;
                        if (action.includes('input') || action.includes('type')) actions.inputs++;
                        if (action.includes('page_load') || action.includes('navigate')) actions.navigations++;
                        if (action.includes('verify') || action.includes('check')) actions.validations++;
                                                           });

                                                           return actions;
                                                         }

// Agregar en server.js:
function enhanceSelectors(steps) {
  return steps.map(step => {
    if (!step.element) return step;

    const enhancedStep = { ...step };
    const element = step.element;

    // Mejorar selector si existe
    if (element.selector) {
      // Priorizar IDs
      if (element.id) {
        enhancedStep.element.enhancedSelector = `#${element.id}`;
      }
      // Luego clases específicas
      else if (element.className && element.className.includes(' ')) {
        const classSelector = element.tagName.toLowerCase() +
          '.' + element.className.split(' ').join('.');
        enhancedStep.element.enhancedSelector = classSelector;
      }
      // Usar el selector original como fallback
      else {
        enhancedStep.element.enhancedSelector = element.selector;
      }
    }

    return enhancedStep;
  });
}

function generatePomXml(projectId) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>co.com.automation</groupId>
    <artifactId>${projectId}</artifactId>
    <version>1.0.0</version>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <serenity.version>4.0.18</serenity.version>
        <serenity.maven.version>4.0.18</serenity.maven.version>
        <cucumber.version>7.14.0</cucumber.version>
        <junit.version>4.13.1</junit.version>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
    </properties>

    <dependencies>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-core</artifactId>
            <version>\${serenity.version}</version>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-junit</artifactId>
            <version>\${serenity.version}</version>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-screenplay</artifactId>
            <version>\${serenity.version}</version>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-cucumber</artifactId>
            <version>\${serenity.version}</version>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-ensure</artifactId>
            <version>\${serenity.version}</version>
        </dependency>

        <dependency>
            <groupId>io.cucumber</groupId>
            <artifactId>cucumber-java</artifactId>
            <version>\${cucumber.version}</version>
        </dependency>

        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>\${junit.version}</version>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>ch.qos.logback</groupId>
            <artifactId>logback-classic</artifactId>
            <version>1.2.11</version>
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
                <version>3.11.0</version>
                <configuration>
                    <source>\${maven.compiler.source}</source>
                    <target>\${maven.compiler.target}</target>
                </configuration>
            </plugin>

            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>3.0.0-M9</version>
                <configuration>
                    <skip>true</skip>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-failsafe-plugin</artifactId>
                <version>3.0.0-M9</version>
                <configuration>
                                <includes>
                                    <include>**/CucumberTestSuiteTest.java</include>
                                </includes>
                            </configuration>
                            <executions>
                                <execution>
                                    <goals>
                                        <goal>integration-test</goal>
                                        <goal>verify</goal>
                                    </goals>
                                </execution>
                            </executions>
                        </plugin>

                        <plugin>
                            <groupId>net.serenity-bdd.maven.plugins</groupId>
                            <artifactId>serenity-maven-plugin</artifactId>
                            <version>\${serenity.maven.version}</version>
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
            }

            function generateSerenityConf(url, domainName) {
              // La URL ahora es OBLIGATORIA, no debe tener fallback
              const finalUrl = url || 'https://ejemplo.com'; // URL por defecto si por alguna razón está vacía

              console.log(`🔧 URL OBLIGATORIA en serenity.conf: ${finalUrl}`);

              return `serenity {
              project.name = "${domainName} Automation"
              take.screenshots = FOR_EACH_ACTION
              logging = VERBOSE
              restart.browser.for.each = scenario
            }

            environments {
              default {
                webdriver.base.url = "${finalUrl}"
              }

              chrome {
                webdriver {
                  driver = chrome
                  capabilities {
                    browserName = "chrome"
                    acceptInsecureCerts = true
                    "goog:chromeOptions" {
                      args = [
                        "--start-maximized",
                        "--ignore-certificate-errors",
                        "--incognito",
                        "--disable-popup-blocking",
                        "--disable-infobars",
                        "--remote-allow-origins=*",
                        "--headless=new",
                        "--no-sandbox",
                        "--disable-dev-shm-usage",
                        "--window-size=1920,1080",
                        "--disable-gpu",
                        "--disable-extensions"
                      ]
                    }
                  }
                }
              }

              firefox {
                webdriver {
                  driver = firefox
                  capabilities {
                    browserName = "firefox"
                    acceptInsecureCerts = true
                    "moz:firefoxOptions" {
                      args = ["-headless", "-width=1920", "-height=1080"]
                    }
                  }
                }
              }
            }

            pages {
              url = "\${webdriver.base.url}"
              timeout = 10000
            }

            timeouts {
              fluentwait = 30000
              implicitlywait = 10000
              pageload = 60000
              script = 30000
            }`;
            }


            function generateDefaultFeature(recording, domainName) {
              const steps = recording.steps || [];
              let feature = `Feature: ${domainName} Automation

              Scenario: Escenario exitoso - Navegación principal
                Given User abre la aplicación ${domainName}`;

              // Agregar pasos dinámicos basados en la grabación en el formato correcto
              steps.forEach((step, index) => {
                const stepType = step.action?.toLowerCase() || 'realizar';
                const element = step.element?.tagName || step.element?.selector || 'elemento';
                const value = step.value || '';
                const stepNumber = index + 1;

                if (stepType.includes('click')) {
                  feature += `\n    When hace clic en ${element} (paso ${stepNumber})`;
                } else if (stepType.includes('type') || stepType.includes('input')) {
                  feature += `\n    When ingresa '${value}' en ${element} (paso ${stepNumber})`;
                } else if (stepType.includes('select')) {
                  feature += `\n    When selecciona '${value}' de ${element} (paso ${stepNumber})`;
                } else if (stepType.includes('verify') || stepType.includes('check')) {
                  feature += `\n    Then debe ver '${value}' en ${element} (paso ${stepNumber})`;
                } else {
                  feature += `\n    When ${stepType} ${element} (paso ${stepNumber})`;
                }
              });
    feature += `\n    Then la automatización se completa exitosamente`;

      return feature;
    }


    function generateMainPage(domainName) {
      return `package co.com.template.automation.testing.ui;

    import net.serenitybdd.core.pages.PageObject;
    import net.serenitybdd.screenplay.targets.Target;
    import org.openqa.selenium.By;

    public class ${domainName}Page extends PageObject {

        // Elementos principales de la página
        public static final Target PAGE_TITLE = Target
            .the("page title")
            .located(By.tagName("h1"));

        public static final Target MAIN_CONTENT = Target
            .the("main content area")
            .located(By.id("main"));

        // Método para verificar que la página cargó
        public boolean isPageLoaded() {
            return this.containsText("${domainName}") ||
                   this.getTitle().contains("${domainName}");
        }
    }`;
    }

    function generateDynamicFeature(recording, flow, domainName) {
      const steps = recording.steps || [];
      let feature = `Feature: ${domainName} Automation

      Scenario: Escenario grabado - ${flow || 'Flujo principal'}
        Given el usuario abre la aplicación ${domainName}`;

      // Agregar pasos dinámicos en ESPAÑOL SIN COMILLAS
      steps.forEach((step, index) => {
        const stepType = step.action?.toLowerCase() || 'realizar';
        const element = step.element?.tagName || step.element?.selector || 'elemento';
        const value = step.value || '';
        const stepNumber = index + 1;

        if (stepType.includes('click')) {
          feature += `\n    When hace clic en ${element} (paso ${stepNumber})`;
        } else if (stepType.includes('type') || stepType.includes('input') || stepType.includes('enter')) {
          feature += `\n    When ingresa ${value} en ${element} (paso ${stepNumber})`;
        } else if (stepType.includes('select')) {
          feature += `\n    When selecciona ${value} de ${element} (paso ${stepNumber})`;
        } else if (stepType.includes('verify') || stepType.includes('check') || stepType.includes('should')) {
          feature += `\n    Then debe ver ${value} en ${element} (paso ${stepNumber})`;
        } else if (stepType.includes('navigate') || stepType.includes('go')) {
          feature += `\n    When navega a ${element} (paso ${stepNumber})`;
        } else {
          feature += `\n    When ${stepType} ${element} (paso ${stepNumber})`;
        }
      });

      feature += `\n    Then la automatización se completa exitosamente`;

      return feature;
    }


    function generateDynamicDefinitions(domainName, recording, featureContent = '') {
      // Analizar el feature content para extraer los steps
      const steps = [];

      if (featureContent) {
        // MODIFICACIÓN: Agregar 'And' y 'But' al patrón de búsqueda
        const stepRegex = /^\s*(Given|When|Then|And|But)\s+(.+)$/gm;
        let match;
        while ((match = stepRegex.exec(featureContent)) !== null) {
          steps.push({
            keyword: match[1],
            description: match[2]
          });
        }
      }

      // Si no hay steps del feature, crear algunos genéricos
      if (steps.length === 0) {
        steps.push(
          { keyword: 'Given', description: 'User abre la aplicación' },
          { keyword: 'When', description: 'realiza una acción' },
          { keyword: 'And', description: 'continúa con otra acción' }, // Agregar ejemplo con And
          { keyword: 'Then', description: 'debe ver el resultado esperado' }
        );
      }

      // Generar métodos únicos basados en los steps
      const methods = steps.map((step, index) => {
        const methodName = generateMethodName(step.description, index);
        // MODIFICACIÓN: Usar la anotación correcta para cada keyword
        const annotation = `@${step.keyword}("${step.description}")`;

        // MODIFICACIÓN: Agregar manejo de parámetros
        let hasParameter = false;
        let parameterType = '';
        let parameterName = '';

        // Detectar si el step tiene parámetros
        if (step.description.includes("'{string}'")) {
          hasParameter = true;
          parameterType = 'String';
          parameterName = 'parametro';
        } else if (step.description.includes("'{int}'")) {
          hasParameter = true;
          parameterType = 'Integer';
          parameterName = 'parametro';
        }

        return `
            ${annotation}
            public void ${methodName}(${hasParameter ? `${parameterType} ${parameterName}` : ''}) {
                // Implementación para: ${step.description}
                ${hasParameter ? `System.out.println("Ejecutando: ${step.description.replace("'{string}'", "'" + parameterName + "'")}");` : 'System.out.println("Ejecutando: ' + step.description + '");'}
            }`;
      }).join('\n\n');

      return `package co.com.template.automation.testing.definitions;

    import io.cucumber.java.en.Given;
    import io.cucumber.java.en.When;
    import io.cucumber.java.en.Then;
    import io.cucumber.java.en.And;  // MODIFICACIÓN: Importar And
    import io.cucumber.java.en.But;   // MODIFICACIÓN: Importar But

    public class ${domainName}Definitions {
    ${methods}
    }`;
    }

// Función auxiliar para generar nombres de métodos únicos
function generateMethodName(description, index) {
  // Convertir descripción a camelCase
  let name = description
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .map((word, idx) =>
      idx === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('');

  // Asegurar que empiece con letra
  if (!/^[a-zA-Z]/.test(name)) {
    name = 'step' + name;
  }

  // Agregar índice para asegurar unicidad
  name = name + index;

  // Limitar longitud
  if (name.length > 50) {
    name = name.substring(0, 50);
  }

  return name;
}

function validateProjectStructure(files) {
  const warnings = [];
  const requiredFiles = [
    'pom.xml',
    'src/test/resources/serenity.conf',
    'src/test/resources/features/',
    'src/test/java/co/com/template/automation/testing/definitions/',
    'src/test/java/co/com/template/automation/testing/runners/'
  ];

  // Archivos que NO deberían estar en test/java
  const invalidTestPaths = [
    'src/test/java/co/com/template/automation/testing/ui/',
    'src/test/java/co/com/template/automation/testing/tasks/',
    'src/test/java/co/com/template/automation/testing/questions/',
    'src/test/java/co/com/template/automation/testing/utils/'
  ];

  for (const required of requiredFiles) {
    const found = Object.keys(files).some(f => f.includes(required));
    if (!found) {
      warnings.push(`Archivo/directorio requerido no encontrado: ${required}`);
    }
  }

  // Verificar que haya al menos un feature file
  const hasFeature = Object.keys(files).some(f => f.includes('.feature'));
  if (!hasFeature) {
    warnings.push('No se encontró ningún archivo .feature');
  }
  // Verificar archivos inválidos en test
        for (const filePath of Object.keys(files)) {
          if (filePath.includes('src/test/java/')) {
            for (const invalidPath of invalidTestPaths) {
              if (filePath.includes(invalidPath)) {
                warnings.push(`Archivo en ubicación incorrecta: ${filePath} debería estar en src/main/java/`);
              }
            }
          }
        }

        return {
          valid: warnings.length === 0,
          warnings
        };
      }

function generateRunner() {
  return `package co.com.template.automation.testing.runners;

import io.cucumber.junit.CucumberOptions;
import net.serenitybdd.cucumber.CucumberWithSerenity;
import org.junit.runner.RunWith;

@RunWith(CucumberWithSerenity.class)
@CucumberOptions(
    plugin = {
        "pretty",
        "html:target/cucumber-reports/cucumber.html",
        "json:target/cucumber-reports/cucumber.json",
        "timeline:target/cucumber-reports/timeline"
    },
    features = "src/test/resources/features",
    glue = {
        "co.com.template.automation.testing.definitions",
        "co.com.template.automation.testing.definitions.commons",
        "co.com.template.automation.testing.definitions.hooks"
    },
    snippets = CucumberOptions.SnippetType.CAMELCASE,
    tags = "@regression"
)
public class CucumberTestSuiteTest {
}`;
}

function generateStepUrl() {
  return `package co.com.template.automation.testing.definitions.commons;

import io.cucumber.java.en.Given;
import net.serenitybdd.screenplay.actions.Open;
import net.serenitybdd.screenplay.actors.OnStage;

public class StepUrl {

    @Given("{string} opens the application")
    public void userOpensTheApplication(String actorName) {
        OnStage.theActorCalled(actorName);
        OnStage.theActorInTheSpotlight().attemptsTo(
            Open.browserOn().thePageNamed("pages.url")
        );
    }
}`;
}

function generateHooks() {
  return `package co.com.template.automation.testing.definitions.hooks;

import io.cucumber.java.Before;
import io.cucumber.java.After;
import net.serenitybdd.screenplay.actors.Cast;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;
import net.serenitybdd.screenplay.actors.OnlineCast;
import net.thucydides.model.util.EnvironmentVariables;
import net.thucydides.model.environment.SystemEnvironmentVariables;
import org.openqa.selenium.WebDriver;
import io.github.bonigarcia.wdm.WebDriverManager;

       public class Hooks {

           private EnvironmentVariables environmentVariables;

           @Before(order = 1)
           public void setTheStage() {
               OnStage.setTheStage(new OnlineCast());
           }
            @Before(order = 2)
           public void setupDriver() {
               environmentVariables = SystemEnvironmentVariables.createEnvironmentVariables();
               String browser = environmentVariables.getProperty("webdriver.driver", "chrome");
                switch(browser.toLowerCase()) {
                   case "chrome":
                       WebDriverManager.chromedriver().setup();
                       break;
                   case "firefox":
                       WebDriverManager.firefoxdriver().setup();
                       break;
                   case "edge":
                       WebDriverManager.edgedriver().setup();
                       break;
               }
           }

           @After
           public void tearDown() {
               OnStage.drawTheCurtain();
           }
       }`;
       }
       function generateWaitUtils() {
             return `package co.com.template.automation.testing.utils;

           import net.serenitybdd.screenplay.Actor;
           import net.serenitybdd.screenplay.abilities.BrowseTheWeb;
           import net.serenitybdd.screenplay.waits.WaitUntil;
           import org.openqa.selenium.WebDriver;
           import org.openqa.selenium.support.ui.WebDriverWait;
           import java.time.Duration;

           import static net.serenitybdd.screenplay.matchers.WebElementStateMatchers.*;

           public class WaitUtils {

               public static WebDriverWait getWait(Actor actor, int timeoutSeconds) {
                   WebDriver driver = BrowseTheWeb.as(actor).getDriver();
                   return new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));         }

               public static void waitForPageLoad(Actor actor) {
                   getWait(actor, 30).until(driver ->
                       ((org.openqa.selenium.JavascriptExecutor) driver)
                           .executeScript("return document.readyState")
                           .equals("complete")
                   );
               }

               public static void waitForElementVisibility(Actor actor, net.serenitybdd.screenplay.targets.Target target) {
                   actor.attemptsTo(
                       WaitUntil.the(target, isVisible()).forNoMoreThan(10).seconds()
                   );
               }

               public static void waitForElementClickable(Actor actor, net.serenitybdd.screenplay.targets.Target target) {
                   actor.attemptsTo(
                       WaitUntil.the(target, isClickable()).forNoMoreThan(10).seconds()
                   );
               }
           }`;
           }

       function generateReadme(url, domainName) {
         return `# ${domainName} Automation Project

       ## Descripción
       Proyecto de automatización generado automáticamente para la URL: ${url}

       ## Tecnologías
       - Java 21
       - Serenity BDD 4.2.22
       - Cucumber 7.20.1
       - Screenplay Pattern
       - Maven

       ## Estructura del Proyecto
       \`\`\`
       src/
       ├── main/java/co/com/template/automation/testing/
       │   ├── ui/          # Page Objects
       │   ├── tasks/       # Screenplay Tasks
       │   └── questions/   # Screenplay Questions
       └── test/java/co/com/template/automation/testing/
           ├── definitions/ # Step Definitions
           ├── runners/     # Test Runners
           └── hooks/       # Cucumber Hooks
       \`\`\`

       ## Ejecución
       \`\`\`bash
       # Ejecutar todas las pruebas
       mvn clean verify

       # Ejecutar pruebas específicas
       mvn clean verify -Dcucumber.filter.tags="@smoke"
       \`\`\`

       ## Configuración
       La URL base se configura en: \`src/test/resources/serenity.conf\`

       ## Reportes
       Los reportes se generan en: \`target/site/serenity/index.html\`

       ## Notas
       Este proyecto fue generado automáticamente a partir de una grabación de usuario.`;
       }

       function generateShadowDomUtils() {
         return `package co.com.template.automation.testing.utils;

       import org.openqa.selenium.JavascriptExecutor;
       import org.openqa.selenium.WebDriver;
       import org.openqa.selenium.WebElement;

       public class ShadowDomUtils {

           public static WebElement expandShadowRoot(WebDriver driver, WebElement shadowHost) {
               JavascriptExecutor js = (JavascriptExecutor) driver;
               return (WebElement) js.executeScript(
                           "return arguments[0].shadowRoot",
                               shadowHost
       );
       }
       public static WebElement findInShadowRoot(WebDriver driver, WebElement shadowHost, String cssSelector) {
                   JavascriptExecutor js = (JavascriptExecutor) driver;
                   return (WebElement) js.executeScript(
                       "return arguments[0].shadowRoot.querySelector(arguments[1])",
                       shadowHost,
                       cssSelector
                   );
               }

       public static WebElement findInShadowRoot(WebDriver driver, String shadowHostSelector, String cssSelector) {
           JavascriptExecutor js = (JavascriptExecutor) driver;
           return (WebElement) js.executeScript(
               \`return document.querySelector("\${shadowHostSelector}").shadowRoot.querySelector("\${cssSelector}")\`
              );
            }
         }`;
       }

       function generateEnvironmentProperties() {
         return `package co.com.template.automation.testing.utils;
       import net.serenitybdd.model.environment.EnvironmentSpecificConfiguration;
       import net.thucydides.model.environment.SystemEnvironmentVariables;

       public final class EnvironmentProperties {

       private EnvironmentProperties() {
       // Utility class - private constructor
       }

       public static String getProperty(String propertyName) {
       return EnvironmentSpecificConfiguration.from(
       SystemEnvironmentVariables.createEnvironmentVariables()
       ).getProperty(propertyName);
       }

       public static String getUrl() {
       return getProperty("webdriver.base.url");
       }

       public static String getBrowser() {
       return getProperty("webdriver.driver");
       }

       public static boolean isHeadless() {
       String headless = getProperty("headless.mode");
       return "true".equalsIgnoreCase(headless) || "yes".equalsIgnoreCase(headless);
            }
         }`;
       }

       function generateLogbackConfig() {
         return `<?xml version="1.0" encoding="UTF-8"?>
       <configuration>
           <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
               <encoder>
                   <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
               </encoder>
           </appender>

           <appender name="FILE" class="ch.qos.logback.core.FileAppender">
               <file>logs/automation.log</file>
               <append>true</append>
               <encoder>
                   <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
               </encoder>
           </appender>

       <root level="INFO">
       <appender-ref ref="STDOUT" />
       <appender-ref ref="FILE" />
       </root>

       <!-- Serenity specific logging -->
       <logger name="net.serenitybdd" level="INFO"/>
       <logger name="net.thucydides" level="INFO"/>
       <logger name="org.openqa.selenium" level="WARN"/>
       </configuration>`;
       }

       function generateGitignore() {
       return `# Build outputs
       target/
       bin/
       build/
       out/
       dist/
       classes/

       # IDE files
       .idea/
       *.iml
       *.ipr
       *.iws
       .classpath
       .project
       .settings/
       .vscode/

       # OS files
       .DS_Store
       Thumbs.db

       # Logs
       *.log
       logs/

       # Temp files
       tmp/
       temp/

       # Maven
       pom.xml.tag
       pom.xml.releaseBackup
       pom.xml.versionsBackup
       pom.xml.next

       # Serenity reports
       site/
       target/site/

       # Test reports
       test-output/
       test-results/

       # Environment files
       .env
       .env.local

       # Node modules (if any)
       node_modules/
       npm-debug.log*
       yarn-debug.log*
       yarn-error.log*`;
       }

       function generateSerenityProperties(projectId) {
       return `# Serenity BDD Configuration
       serenity.project.name=${projectId}
       serenity.take.screenshots=FOR_EACH_ACTION
       serenity.logging=VERBOSE

       # WebDriver Configuration
       webdriver.driver=chrome
       webdriver.base.url=\${webdriver.base.url}
       webdriver.timeouts.implicitlywait=10000
       webdriver.timeouts.fluentwait=30000

       # Browser Configuration
       chrome.switches=--start-maximized,--ignore-certificate-errors,--incognito,--disable-popup-blocking,--headless=new,--no-sandbox,--disable-dev-shm-usage

       # Environment
       environments=default,chrome,firefox

       # Cucumber Configuration
       cucumber.features=src/test/resources/features
       cucumber.glue=co.com.template.automation.testing.definitions

       # Reports
       serenity.outputDirectory=target/site/serenity
       serenity.reports=serenity`;
       }

       function generateDefaultDefinitions(domainName) {
       return `package co.com.template.automation.testing.definitions;

       import io.cucumber.java.en.Given;
       import io.cucumber.java.en.When;
       import io.cucumber.java.en.Then;
       import io.cucumber.java.en.And;
       import io.cucumber.java.en.But;
       import net.serenitybdd.screenplay.actors.OnStage;
       import net.serenitybdd.screenplay.actors.OnlineCast;

       import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;
       import static org.hamcrest.Matchers.*;

       public class ${domainName}Definitions {

       @Given("User abre la aplicación")
       public void userAbreLaAplicacion() {
       OnStage.setTheStage(new OnlineCast());
       OnStage.theActorCalled("User");
       // Navigation is handled by StepUrl class
       }

       @When("realiza una acción")
       public void realizaUnaAccion() {
       // Implement based on recording
       }

       @And("continúa con otra acción")  // Ejemplo con @And
           public void continuaConOtraAccion() {
               // Implementación para step And
           }

       @Then("debe ver el resultado esperado")
       public void debeVerElResultadoEsperado() {
       // Verification logic here
       }
       }`;
       }

       function generateTaskTemplate(taskName, pageName) {
       return `package co.com.template.automation.testing.tasks;

       import net.serenitybdd.screenplay.Actor;
       import net.serenitybdd.screenplay.Task;
       import net.serenitybdd.screenplay.actions.Click;
       import net.serenitybdd.screenplay.actions.Enter;
       import net.serenitybdd.screenplay.actions.SelectFromOptions;
       import net.serenitybdd.screenplay.waits.WaitUntil;
       import static net.serenitybdd.screenplay.Tasks.instrumented;
       import static net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isVisible;
       import static co.com.template.automation.testing.ui.${pageName}.*;

       public class ${taskName} implements Task {

       private final String parametro;

       public ${taskName}(String parametro) {
       this.parametro = parametro;
       }

       @Override
       public <T extends Actor> void performAs(T actor) {
       actor.attemptsTo(
       // Implementar acciones específicas basadas en la grabación
       WaitUntil.the(PRIMARY_ELEMENT, isVisible()).forNoMoreThan(10).seconds(),
       Click.on(PRIMARY_ELEMENT)
           );
       }

       public static ${taskName} conParametro(String parametro) {
       return instrumented(${taskName}.class, parametro);
              }
           }`;
       }

       function generateQuestionTemplate(questionName, pageName) {
       return `package co.com.template.automation.testing.questions;

       import net.serenitybdd.screenplay.Actor;
       import net.serenitybdd.screenplay.Question;
       import net.serenitybdd.screenplay.ensure.Ensure;
       import static co.com.template.automation.testing.ui.${pageName}.*;

       public class ${questionName} implements Question<Boolean> {

       @Override
       public Boolean answeredBy(Actor actor) {
       actor.attemptsTo(
       Ensure.that(PRIMARY_ELEMENT).isDisplayed(),
       Ensure.that(PRIMARY_ELEMENT).text().contains("texto esperado")
       );
       return true;
       }

       public static ${questionName} validacionExitosa() {
       return new ${questionName}();
               }
           }`;
       }

function generatePageTemplate(pageName, selectors) {
let targets = '';
if (selectors && selectors.length > 0) {
selectors.forEach((selector, index) => {
targets += `
public static final Target ELEMENT_${index + 1} = Target
.the("elemento ${index + 1}")
.locatedBy("${selector.selector || 'selector'}");`;
});
} else {
targets = `
public static final Target PRIMARY_ELEMENT = Target
.the("elemento principal")
.locatedBy("#main");`;
}

return `package co.com.template.automation.testing.ui;

import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.screenplay.targets.Target;

public class ${pageName} extends PageObject {${targets}
    }`;
}



function generateMultiFlowRunner(recordings) {
  const features = recordings.map((rec, i) => {
    const name = rec.name || `Recording${i + 1}`;
    const safeName = name.replace(/[^a-zA-Z0-9]/g, '');
    return `      "classpath:features/${safeName.toLowerCase()}.feature",`;
  }).join('\n');

  return `package co.com.template.automation.testing.runners;

import io.cucumber.junit.CucumberOptions;
import net.serenitybdd.cucumber.CucumberWithSerenity;
import org.junit.runner.RunWith;

@RunWith(CucumberWithSerenity.class)
@CucumberOptions(
    plugin = {
        "pretty",
        "html:target/cucumber-reports/cucumber.html",
        "json:target/cucumber-reports/cucumber.json",
        "timeline:target/cucumber-reports/timeline"
    },
    features = {
${features}
    },
    glue = {
        "co.com.template.automation.testing.definitions",
        "co.com.template.automation.testing.definitions.commons",
        "co.com.template.automation.testing.definitions.hooks"
    },
    snippets = CucumberOptions.SnippetType.CAMELCASE,
    tags = "@regression"
)
public class CucumberTestSuiteTest {
}`;
}

function generateMasterFeature(recordings) {
  let masterFeature = `Feature: Suite de Automatización Completa

  # Este feature incluye todos los flujos grabados
  # Total de flujos: ${recordings.length}

`;

  recordings.forEach((rec, i) => {
    const name = rec.name || `Recording${i + 1}`;
    const safeName = name.replace(/[^a-zA-Z0-9]/g, '');
    masterFeature += `
  @include:${safeName.toLowerCase()}`;
  });

  return masterFeature;
}

function generateMultiFlowReadme(url, domainName, recordings) {
  let readme = `# ${domainName} Automation Project - Múltiples Flujos

## Descripción
Proyecto de automatización generado automáticamente para la URL: ${url}
Contiene ${recordings.length} flujos de automatización diferentes.

## Flujos Incluidos
`;

  recordings.forEach((rec, i) => {
    const name = rec.name || `Recording${i + 1}`;
    readme += `${i + 1}. **${name}** - ${rec.data.steps?.length || 0} pasos grabados\n`;
  });

  readme += `
## Estructura del Proyecto
\`\`\`
src/
├── main/java/co/com/template/automation/testing/
│   ├── ui/          # Page Objects (uno por flujo)
│   ├── tasks/       # Screenplay Tasks (uno por flujo)
│   └── questions/   # Screenplay Questions (uno por flujo)
└── test/java/co/com/template/automation/testing/
    ├── definitions/ # Step Definitions (uno por flujo)
    ├── runners/     # Test Runner (único)
    └── hooks/       # Cucumber Hooks (únicos)
\`\`\`
`;

  return readme;
}

function deduplicateDefinitions(definitionsContent) {
  const lines = definitionsContent.split('\n');
  const methods = new Map();
  let output = [];
  let inMethod = false;
  let currentMethod = '';
  let currentMethodContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detectar inicio de método
    if (line.trim().startsWith('@Given') ||
        line.trim().startsWith('@When') ||
        line.trim().startsWith('@Then') ||
        line.trim().startsWith('@And') ||
        line.trim().startsWith('@But')) {

      if (currentMethod) {
        // Guardar método anterior si existe
        if (!methods.has(currentMethod)) {
          methods.set(currentMethod, currentMethodContent.join('\n'));
        }
      }

      // Iniciar nuevo método
      currentMethod = line.trim();
      currentMethodContent = [line];
      inMethod = true;
    }
    // Detectar fin de método
    else if (inMethod && line.trim().startsWith('public void') && line.includes('(')) {
      currentMethodContent.push(line);

    // Extraer nombre del método
          const methodNameMatch = line.match(/public void (\w+)/);
          if (methodNameMatch) {
            const methodName = methodNameMatch[1];

            // Si ya existe un método con este nombre, generar uno único
            if (methods.has(methodName)) {
              let uniqueName = methodName;
              let counter = 1;
              while (methods.has(uniqueName)) {
                uniqueName = `${methodName}${counter}`;
                counter++;
              }

              // Reemplazar nombre en la línea
              currentMethodContent[currentMethodContent.length - 1] =
                line.replace(`public void ${methodName}`, `public void ${uniqueName}`);
            }

            // Guardar con el nombre como clave
            methods.set(methodName, currentMethodContent.join('\n'));
          }

          currentMethod = '';
          currentMethodContent = [];
          inMethod = false;
          output.push(...currentMethodContent);
        }
        // Continuar acumulando líneas del método
        else if (inMethod) {
          currentMethodContent.push(line);
        }
        // Línea normal
        else {
          output.push(line);
        }
      }

      // Procesar último método si existe
      if (currentMethodContent.length > 0) {
        const methodContent = currentMethodContent.join('\n');
        output.push(methodContent);
      }

      return output.join('\n');
    }


  function forceSpanishDescriptions(featureContent) {
    if (!featureContent) return '';

    let cleaned = featureContent;

    // Normalizar saltos de línea
    cleaned = cleaned.replace(/\r\n/g, '\n');

    // MODIFICACIÓN: Agregar And y But al patrón
    const gherkinKeywords = ['Given', 'When', 'Then', 'And', 'But'];

    // 1. ELIMINAR COMILLAS DE LOS STEPS
    gherkinKeywords.forEach(keyword => {
      // Patrón para steps con comillas dobles
      const doubleQuotesPattern = new RegExp(`^\\s*(${keyword})\\s+["']([^"']+)["']$`, 'gm');
      cleaned = cleaned.replace(doubleQuotesPattern, (match, kw, text) => {
        return `    ${kw} ${text.trim()}`;
      });

      // Patrón para steps con comillas simples
      const singleQuotesPattern = new RegExp(`^\\s*(${keyword})\\s+'([^']+)'$`, 'gm');
      cleaned = cleaned.replace(singleQuotesPattern, (match, kw, text) => {
        return `    ${kw} ${text.trim()}`;
      });
    });

    // 2. CORREGIR: Si no tiene comillas pero tiene paréntesis o otros caracteres, dejarlo sin comillas
    const stepWithoutQuotes = /^\s*(Given|When|Then|And|But)\s+(.+)$/gm;
    cleaned = cleaned.replace(stepWithoutQuotes, (match, keyword, text) => {
      // Limpiar texto si tiene comillas al inicio/final
      let cleanText = text.trim();
      cleanText = cleanText.replace(/^["']+|["']+$/g, '');
      return `    ${keyword} ${cleanText}`;
    });

    // 3. TRADUCIR PATRONES COMUNES DEL INGLÉS
    const translations = {
      // Given patterns
      'I am on the': 'el usuario está en la',
      'I navigate to': 'el usuario navega a',
      'User opens the application': 'el usuario abre la aplicación',
      'I am logged in': 'el usuario está autenticado',

      // When patterns
      'I click on': 'hace clic en',
      'I click the': 'hace clic en el',
      'I enter': 'ingresa',
      'I type': 'escribe',
      'I search for': 'busca',
      'I select': 'selecciona',
      'I perform': 'realiza',
      'I should see': 'debe ver',
      'I should be able to': 'debe poder',

      // Then patterns
      'I should see': 'debe ver',
      'I should not see': 'no debe ver',
      'I should be redirected to': 'debe ser redirigido a',
      'the page should display': 'la página debe mostrar',
      'an error message should appear': 'debe aparecer un mensaje de error',

      // Common words
      'homepage': 'página principal',
      'page': 'página',
      'button': 'botón',
      'link': 'enlace',
      'field': 'campo',
      'form': 'formulario',
      'search': 'búsqueda',
      'results': 'resultados',
      'product': 'producto',
      'item': 'artículo',
      'list': 'lista',
      'menu': 'menú',
      'dropdown': 'lista desplegable',
      'checkbox': 'casilla de verificación',
      'radio button': 'botón de opción',
      'submit': 'enviar',
      'login': 'inicio de sesión',
      'logout': 'cerrar sesión',
      'register': 'registro',
      'cart': 'carrito',
      'checkout': 'pago'
    };

    // Aplicar traducciones a cada línea
    const lines = cleaned.split('\n');
    const correctedLines = lines.map(line => {
      // Solo procesar líneas que son steps de Gherkin
      if (line.trim().match(/^(Given|When|Then|And|But)\s+/)) {
        let newLine = line;

        // Aplicar cada traducción
        Object.entries(translations).forEach(([english, spanish]) => {
          const regex = new RegExp(english, 'gi');
          if (regex.test(newLine)) {
            newLine = newLine.replace(regex, spanish);
          }
        });

        // 4. ASEGURAR FORMATO CORRECTO: keyword + "texto en español"
        const stepMatch = newLine.match(/^\s*(Given|When|Then|And|But)\s+(.+)$/);
        if (stepMatch) {
          const keyword = stepMatch[1];
          let description = stepMatch[2].trim();

          // Remover comillas existentes y volver a agregar
          description = description.replace(/^["']|["']$/g, '');

          // Capitalizar primera letra si es necesario
          if (!description.match(/^["']/)) {
            description = description.charAt(0).toLowerCase() + description.slice(1);
          }

          // Asegurar que termine con comilla doble
          if (!description.endsWith('"')) {
            if (!description.startsWith('"')) {
              description = `"${description}"`;
            } else {
              description = `${description}"`;
            }
          }

          // Asegurar que empiece con comilla doble
          if (!description.startsWith('"')) {
            description = `"${description}`;
          }

          return `    ${keyword} ${description}`;
        }

        return newLine;
      }

      return line;
    });

    // 5. UNIR Y LIMPIAR ESPACIOS DUPLICADOS
    cleaned = correctedLines.join('\n');

    // Remover líneas vacías múltiples
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');

    // Asegurar que cada Scenario tenga un salto de línea antes
    cleaned = cleaned.replace(/(\n)(Scenario:)/g, '\n\n$2');

    return cleaned;
  }


    function enforceStrictFormat(featureContent) {
      if (!featureContent) return '';

      let lines = featureContent.split('\n');
      let correctedLines = [];

      // MODIFICACIÓN: Agregar And y But al patrón
      const gherkinPattern = /^\s*(Given|When|Then|And|But)\s+(.+)$/;

      for (let line of lines) {
        const match = line.match(gherkinPattern);
        if (match) {
          let keyword = match[1];
          let description = match[2].trim();

          // ELIMINAR CUALQUIER COMILLA DEL TEXTO
          description = description.replace(/^["']+|["']+$/g, '');

          // Detectar y corregir inglés
          const englishPatterns = [
            { pattern: /^I am (on|in)/i, replace: 'el usuario está en' },
            { pattern: /^I navigate to/i, replace: 'el usuario navega a' },
            { pattern: /^I click (on|the)/i, replace: 'hace clic en' },
            { pattern: /^I enter/i, replace: 'ingresa' },
            { pattern: /^I type/i, replace: 'escribe' },
            { pattern: /^I search for/i, replace: 'busca' },
            { pattern: /^I select/i, replace: 'selecciona' },
            { pattern: /^I should see/i, replace: 'debe ver' },
            { pattern: /^I should be/i, replace: 'debe ser' },
            { pattern: /^the page should/i, replace: 'la página debe' }
          ];

          for (let pattern of englishPatterns) {
            if (pattern.pattern.test(description)) {
              description = description.replace(pattern.pattern, pattern.replace);
            }
          }

          // Asegurar que empiece en minúscula
          description = description.charAt(0).toLowerCase() + description.slice(1);

          // ¡IMPORTANTE! NO AGREGAR COMILLAS
          correctedLines.push(`    ${keyword} ${description}`);
        } else {
          correctedLines.push(line);
        }
      }

      return correctedLines.join('\n');
    }

    function validateAndCleanFileName(fileName, recordingName) {
      // Remover duplicaciones como "CelularesCelulares"
      let cleaned = fileName;

      // Patrones de duplicación comunes
      const duplicationPatterns = [
        /^(Celulares|Computadores|Televisores)\1+/i,
        /(Celulares|Computadores|Televisores){2,}/i
      ];

      for (const pattern of duplicationPatterns) {
        if (pattern.test(cleaned)) {
          // Extraer el nombre base sin duplicar
          const match = cleaned.match(/(Celulares|Computadores|Televisores)/i);
          if (match) {
            const baseName = match[1];
            // Reemplazar todo el nombre con el baseName + sufijo
            const suffix = cleaned.replace(new RegExp(baseName, 'gi'), '').replace(/s$/i, '');
            cleaned = baseName + suffix;
          }
        }
      }

      // Si el nombre contiene la grabación duplicada, corregir
      if (recordingName && cleaned.includes(recordingName + recordingName)) {
        cleaned = cleaned.replace(
          recordingName + recordingName,
          recordingName
        );
      }

      return cleaned;
    }


    function parseFeatureSteps(featureContent) {
      const steps = [];
      const lines = featureContent.split('\n');

      for (const line of lines) {
        // Buscar lines que comiencen con palabras clave Gherkin
        const match = line.match(/^\s*(Given|When|Then|And|But)\s+(.+)$/);
        if (match) {
          const keyword = match[1];
          let description = match[2].trim();

          // Remover comillas si existen
          description = description.replace(/^["']|["']$/g, '');

          steps.push({
            keyword,
            description,
            originalLine: line.trim()
          });
        }
      }

      return steps;
    }

    function generateDefinitionsFromSteps(steps, domainName) {
      const methods = steps.map((step, index) => {
        const methodName = generateMethodName(step.description, index);
        const annotation = `@${step.keyword}("${step.description}")`;

        // Detectar parámetros
        let methodSignature = '()';
        if (step.description.includes("'{string}'")) {
          methodSignature = '(String parametro)';
        } else if (step.description.includes("'{int}'")) {
          methodSignature = '(Integer parametro)';
        }

        return `
            ${annotation}
            public void ${methodName}${methodSignature} {
                // Implementación para: ${step.description}
                System.out.println("Ejecutando step: ${step.keyword} - ${step.description}");
            }`;
      }).join('\n\n');

      return `package co.com.template.automation.testing.definitions;

    import io.cucumber.java.en.Given;
    import io.cucumber.java.en.When;
    import io.cucumber.java.en.Then;
    import io.cucumber.java.en.And;
    import io.cucumber.java.en.But;

    public class ${domainName}Definitions {
    ${methods}
    }`;
    }



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



// Endpoint para análisis de performance con PageSpeed Insights - VERSIÓN MEJORADA
app.post("/api/analyze-performance", async (req, res) => {
try {
const { url, strategy = "mobile" } = req.body;

if (!url) {
return res.status(400).json({ error: "URL es requerida" });
}

// Validar URL
let validatedUrl;
try {
validatedUrl = new URL(url);
if (!['http:', 'https:'].includes(validatedUrl.protocol)) {
return res.status(400).json({ error: "URL debe usar HTTP o HTTPS" });
}
} catch (e) {
return res.status(400).json({ error: "URL inválida. Formato: https://ejemplo.com" });
}

console.log(`📊 Analizando performance completo de: ${url} (${strategy})`);

// Obtener API Key
let apiKey = process.env.PAGESPEED_API_KEY || "";

if (!apiKey || apiKey.trim() === '') {
return res.status(400).json({
error: "API Key de PageSpeed no configurada",
code: "MISSING_API_KEY",
instructions: "Configura PAGESPEED_API_KEY en el archivo .env"
});
}

// Parámetros para obtener TODOS los datos
const params = new URLSearchParams({
url: validatedUrl.toString(),
strategy: strategy,
category: 'Rendimiento',
category: 'Accesibilidad',
category: 'Buenas practicas',
category: 'seo',
category: 'pwa'
});

params.append('key', apiKey);

// URL de la API
const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`;

// Headers
const headers = {
'Accept': 'application/json',
'User-Agent': 'AutoGen-Performance-Analyzer/1.0'
};

// Hacer la solicitud con timeout
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 45000);

try {
const response = await fetch(apiUrl, {
headers: headers,
signal: controller.signal
});

clearTimeout(timeoutId);

if (!response.ok) {
const status = response.status;
const errorText = await response.text();

if (status === 429) {
return res.status(429).json({
error: "Límite de solicitudes alcanzado. Intenta más tarde.",
code: "RATE_LIMITED"
});
}

console.error(`Error ${status} de PageSpeed API:`, errorText.substring(0, 500));
throw new Error(`PageSpeed API error: ${status}`);
}

const data = await response.json();

// Procesar TODOS los datos de manera estructurada
const processedData = processPageSpeedData(data, validatedUrl.toString(), strategy);

res.json(processedData);

} catch (fetchError) {
clearTimeout(timeoutId);

if (fetchError.name === 'AbortError') {
throw new Error("Timeout: La solicitud tardó demasiado (45s)");
}
throw fetchError;
}

} catch (err) {
console.error("❌ Error en análisis de performance:", err.message);

res.status(500).json({
error: err.message,
code: "ANALYSIS_ERROR",
suggestion: "Verifica la URL y tu conexión a internet"
});
}
});



// ========== FUNCIÓN PARA PROCESAR DATOS COMPLETOS ==========
    function processPageSpeedData(rawData, url, strategy) {
      const lighthouse = rawData.lighthouseResult;
      const loadingExperience = rawData.loadingExperience;

      // Procesar categorías traducidas
      const categories = Object.entries(lighthouse.categories || {}).reduce((acc, [key, category]) => {
        const translatedCategory = translateCategory({
          id: key,
          title: category.title,
          description: category.description,
          score: category.score,
          scoreRaw: category.score,
          auditRefs: category.auditRefs || []
        });

        acc[key] = {
          ...translatedCategory,
          id: key, // Asegurar que exista el id
          score: Math.round((category.score || 0) * 100),
          label: getScoreLabel(category.score || 0)
        };
        return acc;
      }, {});

      // Procesar métricas traducidas
      const metrics = {
        performance: {}
      };

      // Procesar TODAS las auditorías como métricas para el PDF
      if (lighthouse.audits) {
        Object.entries(lighthouse.audits).forEach(([key, audit]) => {
          if (audit.numericValue !== undefined || audit.displayValue) {
            metrics.performance[key] = {
              id: key,
              ...translateAudit({
                title: audit.title,
                description: audit.description,
                displayValue: audit.displayValue,
                score: audit.score,
                numericValue: audit.numericValue,
                numericUnit: audit.numericUnit
              })
            };
          }
        });
      }

      // Procesar auditorías para el PDF
      const allAudits = Object.entries(lighthouse.audits || {});

      const passed = allAudits
        .filter(([_, audit]) => audit.score === 1 || audit.score === null)
        .reduce((acc, [key, audit]) => {
          acc[key] = translateAudit(audit);
          return acc;
        }, {});

      const opportunities = allAudits
        .filter(([_, audit]) => audit.score !== null && audit.score < 1)
        .reduce((acc, [key, audit]) => {
          acc[key] = translateAudit(audit);
          return acc;
        }, {});

      const informational = allAudits
        .filter(([_, audit]) => audit.score === null)
        .reduce((acc, [key, audit]) => {
          acc[key] = translateAudit(audit);
          return acc;
        }, {});

      // Procesar diagnósticos CORREGIDO
      const diagnostics = Object.entries(lighthouse.audits || {})
        .filter(([key, audit]) =>
          audit.score !== null &&
          audit.score < 1 &&
          audit.details &&
          audit.details.type === 'opportunity'
        )
        .map(([key, audit]) => {
          const severity = audit.score >= 0.9 ? 'BAJA' :
                          audit.score >= 0.5 ? 'MEDIA' : 'ALTA';

          return {
            id: key,
            title: translateText(audit.title || 'Sin título'),
            description: translateText(audit.description || 'Sin descripción'),
            displayValue: audit.displayValue || 'No disponible',
            score: audit.score,
            severity: severity,
            impact: 'ALTO'
          };
        });

      // Generar recomendaciones COMPLETAS en español
      const recommendations = generateCompleteSpanishRecommendations(lighthouse.audits, diagnostics);

      // Procesar experiencia de carga CORREGIDO
      let translatedLoadingExp = null;
      if (loadingExperience) {
        translatedLoadingExp = {
          overall_category: translateText(loadingExperience.overall_category || 'UNKNOWN'),
          metrics: {}
        };

        if (loadingExperience.metrics) {
          Object.entries(loadingExperience.metrics).forEach(([key, metric]) => {
            translatedLoadingExp.metrics[key] = {
              ...metric,
              category: translateText(metric.category || 'UNKNOWN')
            };
          });
        }
      }

      return {
        success: true,
        url: url,
        strategy: strategy,
        strategyLabel: strategy === 'mobile' ? '📱 Móvil' : '🖥️ Escritorio',
        fetchTime: lighthouse.fetchTime || new Date().toISOString(),
        fecha: new Date().toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),

        // Datos traducidos y estructurados para PDF
        categories,
        metrics: {
          performance: {
            items: Object.values(metrics.performance)
          }
        },
        audits: {
          passed,
          opportunities,
          informational
        },
        diagnostics: diagnostics || [], // Asegurar array
        recommendations: recommendations || [], // Asegurar array
        loadingExperience: translatedLoadingExp,

        // Estadísticas resumen
        summary: {
          totalAudits: allAudits.length,
          passedAudits: Object.keys(passed).length,
          opportunities: Object.keys(opportunities).length,
          diagnosticsCount: diagnostics.length,
          performanceScore: Math.round((lighthouse.categories?.performance?.score || 0) * 100)
        }
      };
    }

    // ========== FUNCIÓN ESPECÍFICA PARA DATOS DE PDF ==========
    function prepareDataForPDF(pageSpeedData, url, strategy) {
      const lighthouse = pageSpeedData.lighthouseResult;

      // 1. CATEGORÍAS
      const categories = {};
      Object.entries(lighthouse.categories || {}).forEach(([key, cat]) => {
        categories[key] = {
          id: key,
          title: translateText(cat.title),
          score: Math.round((cat.score || 0) * 100),
          value: Math.round((cat.score || 0) * 100),
          description: translateText(cat.description || '')
        };
      });

      // 2. MÉTRICAS
          // Convertir a array seguro (ya sea array u objeto)
          const auditList = Array.isArray(lighthouse.audits)
            ? lighthouse.audits
            : Object.values(lighthouse.audits || {}); // <-- CLAVE AQUÍ: Usar Object.values

          // Iterar sobre el array seguro
          auditList.forEach(audit => {
            if (audit.numericValue !== undefined || audit.displayValue) {
              metricsItems.push({
                id: audit.id,
                title: audit.title,
                description: audit.description,
                displayValue: audit.displayValue ? translateText(audit.displayValue) : '',
                numericValue: audit.numericValue,
                numericUnit: audit.numericUnit,
                score: audit.score
              });
            }
          });

      // 3. AUDITORÍAS (oportunidades y aprobadas)
      const auditsOpportunities = [];
      const auditsPassed = [];

      Object.entries(lighthouse.audits || {}).forEach(([key, audit]) => {
        const auditObj = {
          id: key,
          title: translateText(audit.title),
          description: translateText(audit.description || ''),
          displayValue: audit.displayValue ? translateText(audit.displayValue) : '',
          score: audit.score,
          numericValue: audit.numericValue
        };

        if (audit.score !== null && audit.score < 0.9) {
          auditsOpportunities.push(auditObj);
        } else if (audit.score !== null) {
          auditsPassed.push(auditObj);
        }
      });

      // 4. DIAGNÓSTICOS (auditorías con score bajo)
      const diagnostics = auditsOpportunities.slice(0, 10).map(audit => ({
        ...audit,
        severity: audit.score >= 0.5 ? 'MEDIA' : 'ALTA',
        impact: 'ALTO'
      }));

      // 5. RECOMENDACIONES EN ESPAÑOL
      const recommendations = [
        {
          priority: 'ALTA',
          title: 'Optimizar imágenes',
          description: 'Usa formatos WebP, comprime imágenes y establece dimensiones explícitas',
          impact: 'Reduce el tamaño de página y mejora LCP',
          action: 'Implementar compresión de imágenes'
        },
        {
          priority: 'ALTA',
          title: 'Minificar recursos',
          description: 'Minifica CSS, JavaScript y HTML para reducir tamaño',
          impact: 'Mejora tiempo de descarga',
          action: 'Usar herramientas de minificación'
        },
        {
          priority: 'MEDIA',
          title: 'Eliminar JavaScript no utilizado',
          description: 'Reduce código innecesario que se descarga',
          impact: 'Reduce bundle size',
          action: 'Implementar Tree Shaking'
        },
        {
          priority: 'MEDIA',
          title: 'Implementar lazy loading',
          description: 'Carga imágenes solo cuando son visibles',
          impact: 'Mejora FCP',
          action: 'Usar loading="lazy"'
        },
        {
          priority: 'BAJA',
          title: 'Optimizar fuentes web',
          description: 'Usa font-display: swap para fuentes',
          impact: 'Mejora rendimiento visual',
          action: 'Configurar fuentes optimizadas'
        }
      ];

      // 6. EXPERIENCIA DE CARGA (si existe)
      let loadingExperience = null;
      if (pageSpeedData.loadingExperience) {
        loadingExperience = {
          overall_category: translateText(pageSpeedData.loadingExperience.overall_category || 'DESCONOCIDO'),
          metrics: {}
        };

        if (pageSpeedData.loadingExperience.metrics) {
          Object.entries(pageSpeedData.loadingExperience.metrics).forEach(([key, metric]) => {
            loadingExperience.metrics[key] = {
              category: translateText(metric.category || 'DESCONOCIDO'),
              percentile: metric.percentile
            };
          });
        }
      }

      // 7. ESTRUCTURA FINAL PARA PDF
      return {
        url: url,
        strategy: strategy,
        strategyLabel: strategy === 'mobile' ? '📱 Móvil' : '🖥️ Escritorio',
        fecha: new Date().toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),

        categories: categories,

        metrics: {
          performance: {
            items: metricsItems.slice(0, 20) // Limitar para PDF
          }
        },

        audits: {
          opportunities: {
            items: auditsOpportunities.slice(0, 15)
          },
          passed: {
            items: auditsPassed.slice(0, 15)
          }
        },

        diagnostics: diagnostics,
        recommendations: recommendations,
        loadingExperience: loadingExperience,

        summary: {
          performanceScore: Math.round((lighthouse.categories?.performance?.score || 0) * 100)
        }
      };
    }

    // ========== FUNCIONES AUXILIARES ACTUALIZADAS ==========
    function getSeverity(score) {
      if (score >= 0.9) return 'bajo';
      if (score >= 0.5) return 'medio';
      return 'alto';
    }

    function generateSpanishRecommendations(audits, diagnostics) {
      const recommendations = [];

        // Función de limpieza para textos
        const cleanText = (text) => {
          if (!text) return text;
          return text
            .replace(/\[(.*?)\]\(.*?\)/g, '$1')
            .replace(/https?:\/\/[^\s]+/g, '')
            .replace(/Learn more about.*/gi, '')
            .replace(/`/g, '') // Eliminar backticks
            .replace(/\n/g, ' ') // Reemplazar saltos de línea
            .trim();
        };

      // Recomendaciones basadas en diagnósticos críticos
      diagnostics
        .filter(d => d.severity === 'alto')
        .slice(0, 5)
        .forEach(diag => {
          recommendations.push({
            priority: 'ALTA',
            title: `Corregir: ${diag.title}`,
            description: diag.description,
            impact: 'Impacto alto en el rendimiento',
            action: `Solucionar este problema puede mejorar significativamente ${diag.displayValue || 'el rendimiento'}`,
            auditId: diag.id
          });
        });

      // Recomendaciones generales en español
      const generalRecommendations = [
        {
          priority: 'MEDIA',
          title: 'Optimizar imágenes',
          description: 'Las imágenes son el recurso más pesado en la mayoría de sitios web',
          impact: 'Reduce el tamaño de la página y mejora el LCP',
          action: 'Usa formatos WebP, comprime imágenes y establece dimensiones explícitas'
        },
        {
          priority: 'MEDIA',
          title: 'Minificar recursos CSS y JavaScript',
          description: 'Archivos no minificados ocupan más espacio del necesario',
          impact: 'Reduce el tamaño de descarga y tiempo de parsing',
          action: 'Usa herramientas como Terser para JS y CSSNano para CSS'
        },
        {
          priority: 'ALTA',
          title: 'Eliminar JavaScript no utilizado',
          description: 'Código que no se ejecuta pero se descarga igualmente',
          impact: 'Reducción significativa del bundle size',
          action: 'Usa Tree Shaking y análisis de bundles'
        },
        {
          priority: 'MEDIA',
          title: 'Implementar lazy loading de imágenes',
          description: 'Cargar imágenes solo cuando son visibles en el viewport',
          impact: 'Mejora el FCP y reduce datos móviles',
          action: 'Usa el atributo loading="lazy" en imágenes'
        },
        {
          priority: 'BAJA',
          title: 'Optimizar fuentes web',
          description: 'Las fuentes custom pueden bloquear el renderizado',
          impact: 'Mejora el FCP y evita flashes de texto invisible',
          action: 'Usa font-display: swap y preload para fuentes críticas'
        },
        {
          priority: 'ALTA',
          title: 'Reducir trabajo del hilo principal',
          description: 'JavaScript pesado bloquea la interactividad',
          impact: 'Mejora el TBT y Time to Interactive',
          action: 'Divide tareas largas, usa Web Workers para procesamiento pesado'
        },
        {
          priority: 'MEDIA',
          title: 'Configurar caché apropiado',
          description: 'Recursos estáticos sin caché se descargan repetidamente',
          impact: 'Reduce solicitudes de red en visitas repetidas',
          action: 'Configura encabezados Cache-Control para recursos estáticos'
        },
        {
          priority: 'BAJA',
          title: 'Usar CDN para recursos estáticos',
          description: 'Los recursos se sirven desde ubicaciones cercanas al usuario',
          impact: 'Mejora TTFB y velocidad de descarga',
          action: 'Implementa Cloudflare, Cloud CDN o servicios similares'
        }
      ];

      // Combinar recomendaciones
      return [...recommendations, ...generalRecommendations].slice(0, 10);
    }

    function generateCompleteSpanishRecommendations(audits, diagnostics) {
      const recommendations = [];

      // 1. Recomendaciones de diagnóstico (críticas)
      diagnostics
        .filter(d => d.severity === 'ALTA')
        .slice(0, 5)
        .forEach(diag => {
          recommendations.push({
            priority: 'ALTA',
            title: `Corregir: ${diag.title}`,
            description: diag.description.substring(0, 200) + (diag.description.length > 200 ? '...' : ''),
            impact: 'Impacto alto en el rendimiento',
            action: `Implementa la solución recomendada para "${diag.title}"`,
            auditId: diag.id
          });
        });

      // 2. Recomendaciones basadas en auditorías de oportunidades
      if (audits) {
        const criticalAudits = Object.entries(audits)
          .filter(([key, audit]) => audit.score !== null && audit.score < 0.5)
          .slice(0, 5);

        criticalAudits.forEach(([key, audit]) => {
          const translatedAudit = translateAudit(audit);
          recommendations.push({
            priority: 'ALTA',
            title: translatedAudit.title || 'Oportunidad de mejora',
            description: (translatedAudit.description || '').substring(0, 150) + '...',
            impact: 'Mejora significativa del rendimiento',
            action: `Resuelve: ${translatedAudit.title}`,
            auditId: key,
            estimatedSavings: translatedAudit.displayValue
          });
        });
      }

      // 3. Recomendaciones generales en español
      const generalRecommendations = [
        {
          priority: 'ALTA',
          title: 'Optimizar imágenes para la web',
          description: 'Usa formatos modernos como WebP, comprime imágenes y establece dimensiones explícitas',
          impact: 'Reduce el tamaño de página y mejora LCP',
          action: 'Implementar compresión de imágenes y usar formatos WebP'
        },
        {
          priority: 'ALTA',
          title: 'Minificar recursos CSS y JavaScript',
          description: 'Archivos no minificados ocupan más espacio del necesario',
          impact: 'Reduce tamaño de descarga y tiempo de parsing',
          action: 'Usar herramientas como Terser para JS y CSSNano para CSS'
        },
        {
          priority: 'MEDIA',
          title: 'Eliminar JavaScript no utilizado',
          description: 'Código que no se ejecuta pero se descarga igualmente',
          impact: 'Reducción significativa del bundle size',
          action: 'Implementar Tree Shaking y análisis de bundles'
        },
        {
          priority: 'MEDIA',
          title: 'Implementar lazy loading de imágenes',
          description: 'Cargar imágenes solo cuando son visibles en el viewport',
          impact: 'Mejora FCP y reduce datos móviles',
          action: 'Usar atributo loading="lazy" en imágenes'
        },
        {
          priority: 'BAJA',
          title: 'Optimizar fuentes web',
          description: 'Las fuentes custom pueden bloquear el renderizado',
          impact: 'Mejora FCP y evita flashes de texto invisible',
          action: 'Usar font-display: swap y preload para fuentes críticas'
        }
      ];

      // Combinar todas las recomendaciones
      return [...recommendations, ...generalRecommendations].slice(0, 10);
    }

    // ========== FUNCIONES AUXILIARES ==========
    function getAuditData(audits, key) {
      const audit = audits[key];
      if (!audit) return null;

      return {
        title: audit.title,
        description: audit.description,
        displayValue: audit.displayValue,
        score: audit.score,
        numericValue: audit.numericValue,
        numericUnit: audit.numericUnit
      };
    }

    function formatAudit(audit) {
      return {
        title: audit.title,
        description: audit.description,
        displayValue: audit.displayValue,
        score: audit.score,
        numericValue: audit.numericValue,
        numericUnit: audit.numericUnit,
        details: audit.details,
        warnings: audit.warnings,
        explanation: audit.explanation
      };
    }

    function generateRecommendations(audits) {
      const recommendations = [];

      // Recomendaciones basadas en auditorías
      const criticalAudits = Object.entries(audits)
        .filter(([_, audit]) => audit.score !== null && audit.score < 0.5)
        .slice(0, 10);

      criticalAudits.forEach(([key, audit]) => {
        recommendations.push({
          priority: 'HIGH',
          title: audit.title,
          description: audit.description,
          auditId: key,
          estimatedSavings: audit.displayValue
        });
      });

      // Recomendaciones generales
      recommendations.push(
        {
          priority: 'MEDIUM',
          title: 'Optimizar imágenes',
          description: 'Comprime y usa formatos modernos como WebP'
        },
        {
          priority: 'MEDIUM',
          title: 'Minificar recursos',
          description: 'Minifica CSS, JavaScript y HTML'
        },
        {
          priority: 'LOW',
          title: 'Implementar lazy loading',
          description: 'Carga imágenes solo cuando son visibles'
        }
      );

      return recommendations;
    }

    // Endpoint alternativo usando PageSpeed Insights público (sin API)
    app.post("/api/analyze-performance-alt", async (req, res) => {
      try {
        const { url, strategy = "mobile" } = req.body;

        if (!url) {
          return res.status(400).json({ error: "URL es requerida" });
        }

        // Validar URL
        try {
          new URL(url);
        } catch (e) {
          return res.status(400).json({ error: "URL inválida" });
        }

        console.log(`📊 Usando método alternativo para: ${url}`);

        // Método alternativo: Simular análisis local básico
        // Esto es un fallback cuando la API está limitada

        // Simular delay de análisis
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Datos de ejemplo estructurados
        const mockData = {
          success: true,
          analyzedUrl: url,
          strategy: strategy,
          fetchTime: new Date().toISOString(),
          isMockData: true, // Indicar que son datos de ejemplo

          categories: {
            performance: {
              title: "Performance",
              score: 75 + Math.floor(Math.random() * 20), // Score aleatorio 75-95
              description: "Cómo de rápido carga tu página"
            },
            accessibility: {
              title: "Accessibility",
              score: 80 + Math.floor(Math.random() * 15),
              description: "Cómo de accesible es tu sitio"
            },
            'best-practices': {
              title: "Best Practices",
              score: 85 + Math.floor(Math.random() * 10),
              description: "Sigue las mejores prácticas web"
            },
            seo: {
              title: "SEO",
              score: 70 + Math.floor(Math.random() * 25),
              description: "Optimización para motores de búsqueda"
            }
          },

          audits: {
            'first-contentful-paint': {
              title: "First Contentful Paint",
              description: "Tiempo hasta el primer contenido pintado",
              displayValue: "1.8 s",
              score: 0.9
            },
            'largest-contentful-paint': {
              title: "Largest Contentful Paint",
              description: "Tiempo hasta el contenido más grande pintado",
              displayValue: "3.2 s",
              score: 0.7
            },
            'cumulative-layout-shift': {
              title: "Cumulative Layout Shift",
              description: "Estabilidad visual",
              displayValue: "0.1",
              score: 0.9
            },
            'total-blocking-time': {
              title: "Total Blocking Time",
              description: "Tiempo total bloqueando",
              displayValue: "200 ms",
              score: 0.8
            }
          },

          recommendations: [
            "Optimizar imágenes para web",
            "Minificar archivos CSS y JavaScript",
            "Implementar lazy loading para imágenes",
            "Usar CDN para recursos estáticos",
            "Reducar código JavaScript no utilizado"
          ],

          note: "⚠️ Estos son datos de ejemplo porque la API de PageSpeed está limitada. Para datos reales, agrega una API Key."
        };

        res.json(mockData);

      } catch (err) {
        console.error("❌ Error en método alternativo:", err);
        res.status(500).json({
          error: "Error en análisis alternativo",
          suggestion: "Intenta más tarde o configura una API Key"
        });
      }
    });


    // ========== ENDPOINT DE EXPORTACIÓN PDF ==========
    app.post("/api/export-pdf", async (req, res) => {
      try {
        const { analysisData } = req.body;

        if (!analysisData) {
          return res.status(400).json({ error: "Datos de análisis requeridos" });
        }

        console.log("📄 Generando PDF con datos recibidos:", {
          url: analysisData.url,
          tieneMetricsItems: !!analysisData.metrics?.performance?.items,
          tieneAuditsOpportunities: !!analysisData.audits?.opportunities?.items,
          tieneAuditsPassed: !!analysisData.audits?.passed?.items,
          estructuraCompleta: JSON.stringify(analysisData, null, 2).substring(0, 500)
        });

        // 1️⃣ VALIDAR Y NORMALIZAR DATOS PARA PDF
        const datosParaPDF = await prepararDatosParaPDF(analysisData);

        console.log("✅ Datos normalizados para PDF:", {
          metricsItems: datosParaPDF.metrics?.performance?.items?.length,
          opportunities: datosParaPDF.audits?.opportunities?.items?.length,
          passed: datosParaPDF.audits?.passed?.items?.length
        });

        // 2️⃣ GENERAR PDF CON DATOS NORMALIZADOS
        const pdfBuffer = await generatePDF(datosParaPDF, 'es');

        // 3️⃣ ENVIAR PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="analisis-performance-${Date.now()}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        res.send(pdfBuffer);

      } catch (err) {
        console.error("❌ Error generando PDF:", err);
        res.status(500).json({
          error: "Error al generar PDF",
          message: err.message,
          stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
      }
    });


    // ========== FUNCIÓN AUXILIAR: PREPARAR DATOS PARA PDF ==========
    async function prepararDatosParaPDF(analysisData) {
      console.log("🔄 Preparando datos para PDF - Entrada:", {
          tipo: typeof analysisData,
          tieneLighthouse: !!analysisData.lighthouseResult,
          tieneMetrics: !!analysisData.metrics,
          tieneAudits: !!analysisData.audits,
          entrada: JSON.stringify(analysisData).substring(0, 300)
        });

      // Si ya tiene la estructura correcta que espera generatePDF()
        if (analysisData.metrics?.performance?.items &&
            Array.isArray(analysisData.metrics.performance.items) &&
            analysisData.audits?.opportunities?.items &&
            Array.isArray(analysisData.audits.opportunities.items)) {

          console.log("✅ Datos YA tienen estructura correcta para PDF");
          return validarDatosParaPDF(analysisData);
        }

      // Si viene de PageSpeed Insights, reestructurar
      const lighthouse = analysisData.lighthouseResult;
      const loadingExp = analysisData.loadingExperience;

      if (lighthouse) {
        console.log("🔄 Reestructurando datos de Lighthouse para PDF");

        // 1. CATEGORÍAS
        const categories = {};
        Object.entries(lighthouse.categories || {}).forEach(([key, cat]) => {
          categories[key] = {
            id: key,
            title: translateText(cat.title),
            score: Math.round((cat.score || 0) * 100),
            description: translateText(cat.description || '')
          };
        });

        // 2. MÉTRICAS (convertir auditorías con valores numéricos)
        const metricItems = [];
        Object.entries(lighthouse.audits || {}).forEach(([key, audit]) => {
          if (audit.numericValue !== undefined || audit.displayValue) {
            metricItems.push({
              id: key,
              title: translateText(audit.title),
              description: translateText(audit.description || ''),
              displayValue: audit.displayValue ? translateText(audit.displayValue) : '',
              numericValue: audit.numericValue,
              numericUnit: audit.numericUnit,
              score: audit.score
            });
          }
        });

        // 3. AUDITORÍAS (oportunidades y aprobadas)
        const auditOpportunities = [];
        const auditPassed = [];

        Object.entries(lighthouse.audits || {}).forEach(([key, audit]) => {
          const auditObj = {
            id: key,
            title: translateText(audit.title),
            description: translateText(audit.description || ''),
            displayValue: audit.displayValue ? translateText(audit.displayValue) : '',
            score: audit.score,
            numericValue: audit.numericValue
          };

          if (audit.score !== null && audit.score < 0.9) {
            auditOpportunities.push(auditObj);
          } else if (audit.score !== null) {
            auditPassed.push(auditObj);
          }
        });

        // 4. DIAGNÓSTICOS (auditorías con score bajo)
        const diagnostics = auditOpportunities
          .filter(audit => audit.score < 0.9)
          .map(audit => ({
            ...audit,
            severity: audit.score >= 0.5 ? 'MEDIA' : 'ALTA',
            impact: 'ALTO'
          }))
          .slice(0, 10);

        // 5. RECOMENDACIONES
        const recommendations = generateCompleteSpanishRecommendations(lighthouse.audits, diagnostics);

        // 6. EXPERIENCIA DE CARGA
        let loadingExperience = null;
        if (loadingExp) {
          loadingExperience = {
            overall_category: translateText(loadingExp.overall_category || 'DESCONOCIDO'),
            metrics: {}
          };

          if (loadingExp.metrics) {
            Object.entries(loadingExp.metrics).forEach(([key, metric]) => {
              loadingExperience.metrics[key] = {
                category: translateText(metric.category || 'DESCONOCIDO'),
                percentile: metric.percentile
              };
            });
          }
        }

        // 7. ESTRUCTURA FINAL
        return {
          url: analysisData.url || analysisData.analyzedUrl || 'URL no disponible',
          strategy: analysisData.strategy || 'desktop',
          strategyLabel: analysisData.strategyLabel ||
                        (analysisData.strategy === 'mobile' ? '📱 Móvil' : '🖥️ Escritorio'),
          fecha: analysisData.fecha || new Date().toLocaleDateString('es-ES'),

          categories: categories,

          metrics: {
            performance: {
              items: metricItems.slice(0, 20) // Limitar para PDF
            }
          },

          audits: {
            opportunities: {
              items: auditOpportunities.slice(0, 15)
            },
            passed: {
              items: auditPassed.slice(0, 15)
            }
          },

          diagnostics: diagnostics,
          recommendations: recommendations,
          loadingExperience: loadingExperience,

          summary: {
            performanceScore: Math.round((lighthouse.categories?.performance?.score || 0) * 100)
          }
        };
      }

      // Si no es Lighthouse, usar los datos tal cual pero asegurar estructura
      return validarDatosParaPDF(analysisData);
    }


    // Exportar a CSV
    app.post("/api/export-csv", async (req, res) => {
      try {
        const { analysisData } = req.body;

        if (!analysisData) {
          return res.status(400).json({ error: "Datos de análisis requeridos" });
        }

        console.log("📊 Generando CSV para análisis...");

        const csvContent = await generateCSV(analysisData);

        // Configurar headers para descarga
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="analisis-performance-${Date.now()}.csv"`);
        res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8'));

        res.send(csvContent);

      } catch (err) {
        console.error("❌ Error generando CSV:", err);
        res.status(500).json({
          error: "Error al generar CSV",
          message: err.message
        });
      }
    });

    // También crear un endpoint combinado si prefieres
    app.post("/api/export-all", async (req, res) => {
      try {
        const { analysisData, format } = req.body;

        if (!analysisData || !format) {
          return res.status(400).json({ error: "Datos y formato requeridos" });
        }

        if (format === 'pdf') {
          const pdfBuffer = await generatePDF(analysisData, 'es');
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="analisis-performance-${Date.now()}.pdf"`);
          res.send(pdfBuffer);

        } else if (format === 'csv') {
          const csvContent = await generateCSV(analysisData);
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="analisis-performance-${Date.now()}.csv"`);
          res.send(csvContent);

        } else {
          res.status(400).json({ error: "Formato no soportado. Use 'pdf' o 'csv'" });
        }

      } catch (err) {
        console.error("❌ Error en exportación:", err);
        res.status(500).json({ error: err.message });
      }
    });


    // ========== ENDPOINT DE EXPORTACIÓN COMPLETA ==========
    app.post("/api/export-complete-report", async (req, res) => {
      try {
        const { url, strategy = "mobile", format = "pdf" } = req.body;

        if (!url) {
          return res.status(400).json({ error: "URL es requerida" });
        }

        console.log(`📤 Exportando reporte ${format.toUpperCase()} para: ${url}`);

        // Validar URL
        let validatedUrl;
        try {
          validatedUrl = new URL(url);
        } catch (e) {
          return res.status(400).json({ error: "URL inválida" });
        }

        // ================= OBTENER DATOS DE PAGESPEED =================
        const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` +
          `?url=${encodeURIComponent(validatedUrl.toString())}` +
          `&strategy=${strategy}` +
          `&category=performance` +
          `&category=accessibility` +
          `&category=best-practices` +
          `&category=seo` +
          `&locale=es`;

        // Agregar API Key si existe
        const finalApiUrl = process.env.PAGESPEED_API_KEY ?
          `${apiUrl}&key=${process.env.PAGESPEED_API_KEY}` : apiUrl;

        console.log(`🌐 Consultando PageSpeed API: ${finalApiUrl.substring(0, 100)}...`);

        const response = await fetch(finalApiUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'AutoGen-Performance-Analyzer/1.0'
          },
          timeout: 30000
        });

        if (!response.ok) {
          throw new Error(`PageSpeed API error: ${response.status}`);
        }

        const pageSpeedData = await response.json();

        if (!pageSpeedData.lighthouseResult) {
          throw new Error("No se recibieron datos de Lighthouse");
        }

        console.log("✅ Datos de PageSpeed recibidos correctamente");

        // ================= PREPARAR DATOS PARA PDF =================
        const pdfData = prepareDataForPDF(pageSpeedData, url, strategy);

        console.log("📊 Datos preparados para PDF:", {
          categories: Object.keys(pdfData.categories).length,
          metrics: pdfData.metrics?.performance?.items?.length || 0,
          opportunities: pdfData.audits?.opportunities?.items?.length || 0,
          passed: pdfData.audits?.passed?.items?.length || 0,
          diagnostics: pdfData.diagnostics?.length || 0,
          recommendations: pdfData.recommendations?.length || 0
        });

        // ================= GENERAR PDF O CSV =================
        if (format.toLowerCase() === 'pdf') {
          console.log("🖨️ Generando PDF...");

          try {
            const pdfBuffer = await generatePDF(pdfData, 'es');

            console.log(`✅ PDF generado: ${pdfBuffer.length} bytes`);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
              'Content-Disposition',
              `attachment; filename="Analisis_Performance_${strategy}_${Date.now()}.pdf"`
            );
            res.setHeader('Content-Length', pdfBuffer.length);

            return res.send(pdfBuffer);
          } catch (pdfError) {
            console.error("❌ Error generando PDF:", pdfError);
            throw new Error(`Error al generar PDF: ${pdfError.message}`);
          }

        } else if (format.toLowerCase() === 'csv') {
          console.log("📊 Generando CSV...");

          const csvContent = await generateCSV(pdfData);

          res.setHeader('Content-Type', 'text/csv; charset=utf-8');
          res.setHeader(
            'Content-Disposition',
            `attachment; filename="Datos_Performance_${strategy}_${Date.now()}.csv"`
          );

          return res.send(csvContent);
        } else {
          return res.status(400).json({ error: "Formato no soportado. Use 'pdf' o 'csv'" });
        }

      } catch (err) {
        console.error("❌ Error en exportación completa:", err);
        res.status(500).json({
          error: "Error al generar reporte",
          message: err.message,
          suggestion: "Verifica la URL y tu conexión a internet"
        });
      }
    });


    // Endpoint de diagnóstico para PageSpeed
    app.get("/api/debug-pagespeed", (req, res) => {
      const envInfo = {
        // Variables de entorno
        PAGESPEED_API_KEY: process.env.PAGESPEED_API_KEY
          ? `Presente (${process.env.PAGESPEED_API_KEY.substring(0, 15)}...)`
          : "Ausente",
        GOOGLE_API_KEY: process.env.GOOGLE_API_KEY
          ? `Presente (${process.env.GOOGLE_API_KEY.substring(0, 15)}...)`
          : "Ausente",
        API_KEY: process.env.API_KEY
          ? `Presente (${process.env.API_KEY.substring(0, 15)}...)`
          : "Ausente",

        // Archivos
        hasEnvFile: fs.existsSync(path.join(__dirname, '.env')),
        envFileContent: fs.existsSync(path.join(__dirname, '.env'))
          ? fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split('\n').filter(l => l.includes('KEY'))
          : [],

        // Docker
        dockerComposeExists: fs.existsSync(path.join(__dirname, '../docker-compose.yml')),

        // Sistema
        nodeEnv: process.env.NODE_ENV,
        cwd: process.cwd(),
        __dirname: __dirname
      };

      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        environment: envInfo,
        instructions: [
          "1. Verifica que el archivo .env esté en la raíz del proyecto backend",
          "2. Asegúrate de que la variable sea PAGESPEED_API_KEY (no PAGE_SPEED_API_KEY)",
          "3. Reinicia con: docker-compose down && docker-compose up --build",
          "4. Si usas Docker, verifica el archivo docker-compose.yml"
        ]
      });
    });

    // ========== ENDPOINT DE PRUEBA PARA PDF ==========
    app.post("/api/test-pdf-data", async (req, res) => {
      try {
        const { url } = req.body;

        if (!url) {
          return res.status(400).json({ error: "URL requerida" });
        }

        // Datos de prueba estructurados
        const testData = {
          url: url,
          strategy: "mobile",
          strategyLabel: "📱 Móvil",
          fecha: new Date().toLocaleDateString('es-ES'),

          categories: {
            performance: {
              id: "performance",
              title: "Rendimiento",
              score: 75,
              description: "Mide qué tan rápido carga tu página"
            },
            accessibility: {
              id: "accessibility",
              title: "Accesibilidad",
              score: 85,
              description: "Evalúa la accesibilidad del sitio"
            },
            'best-practices': {
              id: "best-practices",
              title: "Mejores Prácticas",
              score: 90,
              description: "Verifica prácticas web modernas"
            },
            seo: {
              id: "seo",
              title: "SEO",
              score: 80,
              description: "Optimización para motores de búsqueda"
            }
          },

          metrics: {
            performance: {
              items: [
                {
                  id: "fcp",
                  title: "Primer Pintado de Contenido",
                  description: "Tiempo hasta el primer contenido visible",
                  displayValue: "1.8 s",
                  score: 0.9,
                  numericValue: 1800,
                  numericUnit: "ms"
                },
                {
                  id: "lcp",
                  title: "Pintado de Contenido Más Grande",
                  description: "Tiempo hasta el elemento más grande",
                  displayValue: "3.2 s",
                  score: 0.7,
                  numericValue: 3200,
                  numericUnit: "ms"
                }
              ]
            }
          },

          audits: {
            opportunities: {
              items: [
                {
                  id: "opportunity-1",
                  title: "Optimizar imágenes",
                  description: "Las imágenes pueden comprimirse más",
                  displayValue: "Ahorro potencial: 1.5 s",
                  score: 0.6
                }
              ]
            },
            passed: {
              items: [
                {
                  id: "passed-1",
                  title: "Uso de HTTPS",
                  description: "El sitio usa HTTPS correctamente",
                  displayValue: "✅",
                  score: 1.0
                }
              ]
            }
          },

          diagnostics: [
            {
              id: "diagnostic-1",
              title: "JavaScript no utilizado",
              description: "Se encontró 150 KB de JS no utilizado",
              displayValue: "150 KB",
              severity: "ALTA",
              impact: "ALTO",
              score: 0.4
            }
          ],

          recommendations: [
            {
              priority: "ALTA",
              title: "Comprimir imágenes",
              description: "Usa formatos WebP para imágenes",
              impact: "Alta reducción de tamaño",
              action: "Convertir imágenes a WebP"
            }
          ],

          loadingExperience: {
            overall_category: "RÁPIDO",
            metrics: {
              "FCP": { category: "RÁPIDO", percentile: 75 },
              "LCP": { category: "PROMEDIO", percentile: 60 }
            }
          }
        };

        // Generar PDF con datos de prueba
        const pdfBuffer = await generatePDF(testData, 'es');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Test_PDF_${Date.now()}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        return res.send(pdfBuffer);

      } catch (err) {
        console.error("❌ Error en test PDF:", err);
        res.status(500).json({ error: err.message });
      }
    });

    // ========== ENDPOINT DE DIAGNÓSTICO ==========
    app.get("/api/debug-pdf", (req, res) => {
      res.json({
        status: "OK",
        pdfFunctions: {
          generatePDF: "exists",
          generateCSV: "exists"
        },
        endpoints: {
          exportCompleteReport: "/api/export-complete-report",
          testPDF: "/api/test-pdf-data",
          analyzePerformance: "/api/analyze-performance"
        },
        instructions: "Usa /api/test-pdf-data para probar el PDF con datos simulados"
      });
    });

    // En server.js, antes de app.listen
    app.post("/api/debug-pdf-data", async (req, res) => {
      try {
        const { url } = req.body;

        // Datos de prueba completos
        const testData = {
          url: url || "https://ejemplo.com",
          strategy: "mobile",
          strategyLabel: "📱 Móvil",
          fecha: new Date().toLocaleDateString('es-ES'),

          categories: {
            performance: {
              id: "performance",
              title: "Rendimiento",
              score: 75,
              description: "Mide qué tan rápido carga tu página"
            },
            accessibility: {
              id: "accessibility",
              title: "Accesibilidad",
              score: 85,
              description: "Evalúa la accesibilidad del sitio"
            }
          },

          metrics: {
            performance: {
              items: [
                {
                  id: "fcp",
                  title: "Primer Pintado de Contenido",
                  description: "Tiempo hasta el primer contenido visible",
                  displayValue: "1.8 s",
                  score: 0.9,
                  numericValue: 1800,
                  numericUnit: "ms"
                },
                {
                  id: "lcp",
                  title: "Pintado de Contenido Más Grande",
                  description: "Tiempo hasta el elemento más grande",
                  displayValue: "3.2 s",
                  score: 0.7,
                  numericValue: 3200,
                  numericUnit: "ms"
                }
              ]
            }
          },

          audits: {
            opportunities: {
              items: [
                {
                  id: "opportunity-1",
                  title: "Optimizar imágenes",
                  description: "Las imágenes pueden comprimirse más",
                  displayValue: "Ahorro potencial: 1.5 s",
                  score: 0.6
                }
              ]
            },
            passed: {
              items: [
                {
                  id: "passed-1",
                  title: "Uso de HTTPS",
                  description: "El sitio usa HTTPS correctamente",
                  displayValue: "✅",
                  score: 1.0
                }
              ]
            }
          },

          diagnostics: [
            {
              id: "diagnostic-1",
              title: "JavaScript no utilizado",
              description: "Se encontró 150 KB de JS no utilizado",
              displayValue: "150 KB",
              severity: "ALTA",
              impact: "ALTO",
              score: 0.4
            }
          ],

          recommendations: [
            {
              priority: "ALTA",
              title: "Comprimir imágenes",
              description: "Usa formatos WebP para imágenes",
              impact: "Alta reducción de tamaño",
              action: "Convertir imágenes a WebP"
            }
          ]
        };

        // Generar PDF con datos de prueba
        const pdfBuffer = await generatePDF(testData, 'es');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Test_PDF_${Date.now()}.pdf"`);
        res.send(pdfBuffer);

      } catch (err) {
        console.error("❌ Error en debug PDF:", err);
        res.status(500).json({ error: err.message });
      }
    });

    // ========== ENDPOINTS PARA OWASP ZAP ==========

    // Endpoint para iniciar escaneo ZAP
    app.post("/api/zap/scan", async (req, res) => {
      try {
        const { url, apiKey } = req.body;

        if (!url) {
          return res.status(400).json({ error: "URL es requerida" });
        }

        // Validar URL
        try {
          new URL(url);
        } catch (e) {
          return res.status(400).json({ error: "URL inválida" });
        }

        console.log(`🔒 Iniciando escaneo ZAP para: ${url}`);

        // Configurar ZAP API (modo proxy o API)
        const zapOptions = {
          apiKey: apiKey || process.env.ZAP_API_KEY || "",
          proxy: process.env.ZAP_PROXY || "http://localhost:8080",
          apiUrl: process.env.ZAP_API_URL || "http://localhost:8080/JSON"
        };

        // 1. Primero, escanear activamente la URL
        const scanResults = await performZAPScan(url, zapOptions);

        // 2. Obtener alertas del sitio
        const alerts = await getZAPAlerts(url, zapOptions);

        // 3. Obtener estadísticas
        const stats = await getZAPStats(zapOptions);

        const scanData = {
          success: true,
          url: url,
          timestamp: new Date().toISOString(),
          alerts: alerts,
          stats: stats,
          scanResults: scanResults,
          site: [{
            name: url,
            alerts: alerts.length
          }]
        };

        res.json(scanData);

      } catch (err) {
        console.error("❌ Error en escaneo ZAP:", err);
        res.status(500).json({
          error: "Error en escaneo de seguridad",
          message: err.message,
          suggestion: "Asegúrate que ZAP está corriendo y configurado correctamente"
        });
      }
    });

    // Endpoint para obtener estado del escaneo (para escaneos largos)
    app.get("/api/zap/status/:scanId", async (req, res) => {
      try {
        const { scanId } = req.params;

        // En una implementación real, aquí consultarías el estado del escaneo en ZAP
        // Por ahora, simulamos un progreso
        res.json({
          scanId: scanId,
          status: "COMPLETED",
          progress: 100,
          message: "Escaneo completado"
        });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Endpoint para obtener resultados
    app.get("/api/zap/results/:scanId", async (req, res) => {
      try {
        const { scanId } = req.params;

        // En una implementación real, obtendrías resultados de ZAP por scanId
        // Por simplicidad, devolvemos datos de ejemplo
        res.json({
          scanId: scanId,
          status: "COMPLETED",
          results: "Datos del escaneo"
        });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });


// ==========================================================
// RUTAS ESPECÍFICAS PARA EXPORTACIÓN SEGURIDAD (ZAP)
// Estas rutas NO interfieren con Performance
// ==========================================================

app.post("/api/zap/export/pdf", async (req, res) => {
  try {
    console.log("📄 [ZAP Export] Generando PDF...");

    // Obtener datos del cuerpo
    let alerts = req.body.alerts || req.body.data || [];
    const url = req.body.url || req.body.analyzedUrl || "Objetivo";

    // Validación básica
    if (!Array.isArray(alerts)) {
      return res.status(400).json({ error: "Formato de datos inválido: se espera un array." });
    }

    if (alerts.length === 0) {
      // Si no hay alertas, devolver PDF vacío informando estado
      const pdfBuffer = await generateZapPDF([], url);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="security_report.pdf"');
      return res.send(pdfBuffer);
    }

    // Generar Buffer PDF
    const pdfBuffer = await generateZapPDF(alerts, url);

    // Enviar Respuesta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="security_report.pdf"');
    res.send(pdfBuffer);

    console.log("✅ [ZAP Export] PDF enviado.");

  } catch (error) {
    console.error("❌ [ZAP Export] Error:", error);
    res.status(500).json({ error: "Error interno generando el PDF", details: error.message });
  }
});

app.post("/api/zap/export/csv", async (req, res) => {
  try {
    console.log("📊 [ZAP Export] Generando CSV...");

    let alerts = req.body.alerts || req.body.data || [];

    if (!Array.isArray(alerts)) {
      return res.status(400).json({ error: "Formato de datos inválido." });
    }

    if (alerts.length === 0) {
       return res.status(400).json({ error: "No hay alertas para exportar." });
    }

    const csvBuffer = await generateZapCSV(alerts);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="security_data.csv"');
    res.send(csvBuffer);

    console.log("✅ [ZAP Export] CSV enviado.");

  } catch (error) {
    console.error("❌ [ZAP Export] Error:", error);
    res.status(500).json({ error: "Error interno generando el CSV", details: error.message });
  }
});





    // ========== FUNCIONES AUXILIARES PARA ZAP ==========

    // Función para realizar escaneo ZAP
    async function performZAPScan(url, zapOptions) {
      try {
        // En una implementación real, usarías la API de ZAP
        // Por ahora, devolvemos datos simulados

        return {
          scanStarted: new Date().toISOString(),
          scanCompleted: new Date().toISOString(),
          duration: "120s",
          strategy: "Active Scan",
          scope: url
        };
      } catch (err) {
        console.error("Error en performZAPScan:", err);
        throw err;
      }
    }

    // Función para obtener alertas de ZAP
    async function getZAPAlerts(url, zapOptions) {
      // Datos simulados de vulnerabilidades comunes
      const mockAlerts = [
        {
          id: 1,
          name: "Cross Site Scripting (Reflected)",
          risk: "High",
          confidence: "Medium",
          description: "Cross-site Scripting (XSS) is an attack technique that involves echoing attacker-supplied code into a user's browser instance.",
          solution: "Ensure all user supplied input is properly entity encoded before output, including HTML attributes.",
          url: url,
                param: "search",
                cweid: "79"
              },
              {
                id: 2,
                name: "SQL Injection",
                risk: "High",
                confidence: "High",
                description: "SQL injection may be possible.",
                solution: "Do not trust client side input, even when there are client-side validations in place. Use parameterized queries.",
                url: `${url}/login`,
                param: "username",
                cweid: "89"
              },
              {
                id: 3,
                name: "Missing Anti-clickjacking Header",
                risk: "Medium",
                confidence: "High",
                description: "The response does not include either Content-Security-Policy with 'frame-ancestors' directive or X-Frame-Options to protect against 'ClickJacking' attacks.",
                solution: "Ensure that the web server sets the Content-Security-Policy or X-Frame-Options header appropriately.",
                url: url,
                param: null,
                cweid: "693"
              },
              {
                id: 4,
                name: "Cookie Without Secure Flag",
                risk: "Low",
                confidence: "High",
                description: "A cookie has been set without the secure flag, which means that the cookie can be accessed via unencrypted connections.",
                solution: "Whenever a cookie contains sensitive information or is a session token, then it should always be passed using an encrypted channel.",
                url: url,
                param: null,
                cweid: "614"
              },
              {
                id: 5,
                name: "Absence of Anti-CSRF Tokens",
                risk: "Medium",
                confidence: "Medium",
                description: "No Anti-CSRF tokens were found in a HTML submission form.",
                solution: "Use a vetted library or framework that does not allow this weakness to occur or provides constructs that make this weakness easier to avoid.",
                url: `${url}/contact`,
                param: null,
                cweid: "352"
              },
              {
                id: 6,
                name: "Information Disclosure - Sensitive Information in URL",
                risk: "Low",
                confidence: "High",
                description: "The request appeared to contain sensitive information leaked in the URL.",
                solution: "Do not pass sensitive information in URLs.",
                url: `${url}/profile?id=123`,
                param: "id",
                cweid: "200"
              },
              {
                id: 7,
                name: "X-Content-Type-Options Header Missing",
                risk: "Low",
                confidence: "High",
                description: "The Anti-MIME-Sniffing header X-Content-Type-Options was not set to 'nosniff'.",
                solution: "Ensure that the application/web server sets the Content-Type header appropriately.",
                url: url,
                param: null,
                cweid: "693"
              },
              {
                id: 8,
                name: "Server Leaks Information via 'X-Powered-By' HTTP Response Header",
                risk: "Low",
                confidence: "High",
                description: "The web/application server is leaking information via the 'X-Powered-By' HTTP response header.",
                solution: "Ensure that the web server, application server, load balancer, etc. is configured to suppress 'X-Powered-By' headers.",
                url: url,
                param: null,
                cweid: "200"
              }
            ];

            return mockAlerts;
          }

          // Función para obtener estadísticas de ZAP
          async function getZAPStats(zapOptions) {
            return {
              HostProcess: 1,
              NumberRequests: 245,
              NumberResponses: 220,
              NumberAlerts: 8,
              ScanDuration: "00:02:00"
            };
          }

          // Función para generar PDF de seguridad
          async function generateSecurityPDF(scanData, targetUrl) {
            const PDFDocument = require('pdfkit');

            return new Promise((resolve, reject) => {
              try {
                const doc = new PDFDocument({
                  margin: 50,
                  size: 'A4',
                  font: 'Helvetica'
                });

                const chunks = [];

                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // ========== PORTADA ==========
                doc.rect(0, 0, doc.page.width, doc.page.height)
                   .fill('#2c3e50');

                doc.fillColor('#ffffff')
                   .fontSize(36)
                   .font('Helvetica-Bold')
                   .text('🔒 INFORME DE SEGURIDAD', 50, 150, {
                     align: 'center',
                     width: doc.page.width - 100
                   });

                doc.fontSize(24)
                   .text('OWASP ZAP - Análisis de Vulnerabilidades', 50, 220, {
                     align: 'center',
                     width: doc.page.width - 100,
                     color: '#e74c3c'
                   });

                // Información básica
                doc.fontSize(14)
                   .font('Helvetica')
                   .fillColor('#ecf0f1')
                   .text('URL Analizada:', 50, 320, { continued: true });

                doc.font('Helvetica-Bold')
                   .text(` ${targetUrl || 'URL no disponible'}`, { color: '#3498db' });

                doc.font('Helvetica')
                   .text(`Fecha del Análisis: ${new Date().toLocaleDateString('es-ES', {
                     day: '2-digit',
                     month: '2-digit',
                     year: 'numeric',
                     hour: '2-digit',
                     minute: '2-digit'
                   })}`, 50, 350);

                doc.text(`Total Vulnerabilidades: ${scanData.alerts?.length || 0}`, 50, 380);
                doc.text(`Generado por: AutoGen Security Analyzer`, 50, 410);

                // ========== RESUMEN EJECUTIVO ==========
                      doc.addPage();
                      doc.fontSize(24)
                         .font('Helvetica-Bold')
                         .fillColor('#2c3e50')
                         .text('📊 RESUMEN EJECUTIVO', 50, 50, {
                           width: doc.page.width - 100,
                           align: 'center'
                         });

                      doc.moveDown(2);

                      // Estadísticas de severidad
                      const severityCounts = {
                        high: 0,
                        medium: 0,
                        low: 0,
                        informational: 0
                      };

                      scanData.alerts?.forEach(alert => {
                        const severity = alert.risk?.toLowerCase() || 'informational';
                        if (severityCounts[severity] !== undefined) {
                          severityCounts[severity]++;
                        }
                      });

                      // Tabla de severidad
                      const severityData = [
                        { label: 'Alto', count: severityCounts.high, color: '#e74c3c' },
                        { label: 'Medio', count: severityCounts.medium, color: '#f39c12' },
                        { label: 'Bajo', count: severityCounts.low, color: '#3498db' },
                        { label: 'Informativo', count: severityCounts.informational, color: '#95a5a6' }
                      ];

                      let y = doc.y;
                      severityData.forEach((item, index) => {
                        doc.fontSize(16).font('Helvetica-Bold')
                           .fillColor('#2c3e50')
                           .text(item.label, 50, y);

                        doc.fontSize(24).font('Helvetica-Bold')
                           .fillColor(item.color)
                           .text(item.count.toString(), 400, y, { align: 'right' });

                        doc.moveDown(1.5);
                        y = doc.y;
                      });

                      // ========== VULNERABILIDADES DETALLADAS ==========
                      doc.addPage();
                      doc.fontSize(24)
                         .font('Helvetica-Bold')
                         .fillColor('#2c3e50')
                         .text('🚨 VULNERABILIDADES DETALLADAS', 50, 50, {
                           width: doc.page.width - 100,
                           align: 'center'
                         });

                      doc.moveDown(2);

                      // Listar vulnerabilidades
                      scanData.alerts?.forEach((alert, index) => {
                        if (doc.y > doc.page.height - 100) {
                          doc.addPage();
                          doc.y = 50;
                        }

                        const severityColor = {
                          high: '#e74c3c',
                          medium: '#f39c12',
                          low: '#3498db',
                          informational: '#95a5a6'
                        }[alert.risk?.toLowerCase()] || '#95a5a6';

                        // Tarjeta de vulnerabilidad
                        doc.roundedRect(50, doc.y, doc.page.width - 100, 120, 5)
                           .lineWidth(1)
                           .stroke(severityColor)
                           .fill('#f8f9fa');

                        // Título y severidad
                        doc.fontSize(14).font('Helvetica-Bold')
                           .fillColor('#2c3e50')
                           .text(`${index + 1}. ${alert.name}`, 60, doc.y + 15);

                        doc.fontSize(12)
                           .fillColor('#ffffff')
                           .rect(doc.page.width - 120, doc.y + 10, 60, 25, 5)
                           .fill(severityColor);

                        doc.text(alert.risk?.toUpperCase() || 'INFO',
                                 doc.page.width - 120 + 10, doc.y + 15,
                                 { width: 40, align: 'center' });

                        // Descripción
                        doc.fontSize(10).font('Helvetica')
                           .fillColor('#666666')
                           .text(alert.description?.substring(0, 150) +
                                 (alert.description?.length > 150 ? '...' : ''),
                                 60, doc.y + 45, { width: doc.page.width - 140 });

                        // Solución
                        if (alert.solution) {
                          doc.fontSize(9)
                             .fillColor('#27ae60')
                             .text(`Solución: ${alert.solution.substring(0, 100)}...`,
                                   60, doc.y + 85, { width: doc.page.width - 140 });
                        }

                        doc.moveDown(6);
                      });

                      // ========== RECOMENDACIONES ==========
                      doc.addPage();
                      doc.fontSize(24)
                         .font('Helvetica-Bold')
                         .fillColor('#2c3e50')
                         .text('💡 RECOMENDACIONES DE SEGURIDAD', 50, 50, {
                           width: doc.page.width - 100,
                           align: 'center'
                         });

                      doc.moveDown(2);

                      const recommendations = [
                        "1. Implementar validación de entrada en todos los campos de formulario",
                        "2. Utilizar parámetros preparados para consultas SQL",
                        "3. Configurar encabezados de seguridad HTTP (CSP, HSTS, etc.)",
                        "4. Establecer cookies con flags Secure y HttpOnly",
                        "5. Implementar tokens CSRF en formularios sensibles",
                        "6. Realizar escaneos regulares de seguridad",
                        "7. Mantener actualizadas todas las dependencias",
                        "8. Configurar WAF (Web Application Firewall)",
                        "9. Implementar autenticación de dos factores",
                        "10. Realizar pruebas de penetración periódicas"
                      ];

                      recommendations.forEach((rec, index) => {
                        doc.fontSize(12)
                           .fillColor('#2c3e50')
                           .text(rec, 60, doc.y, { width: doc.page.width - 120 });
                        doc.moveDown(1);
                      });

                      doc.end();
                    } catch (err) {
                      reject(err);
                    }
                  });
                }

                // Función para generar CSV de seguridad
                async function generateSecurityCSV(scanData, targetUrl) {
                  const csvData = [];

                  // Encabezados
                  csvData.push(['INFORME DE SEGURIDAD - OWASP ZAP']);
                  csvData.push(['URL Analizada:', targetUrl]);
                  csvData.push(['Fecha:', new Date().toISOString()]);
                  csvData.push(['Total Vulnerabilidades:', scanData.alerts?.length || 0]);
                  csvData.push([]);

                  // Estadísticas
                  csvData.push(['ESTADÍSTICAS', 'VALOR']);
                  csvData.push(['Alto', scanData.alerts?.filter(a => a.risk === 'High').length || 0]);
                  csvData.push(['Medio', scanData.alerts?.filter(a => a.risk === 'Medium').length || 0]);
                  csvData.push(['Bajo', scanData.alerts?.filter(a => a.risk === 'Low').length || 0]);
                  csvData.push(['Informativo', scanData.alerts?.filter(a => !a.risk || a.risk === 'Informational').length || 0]);
                  csvData.push([]);

                   // Detalle de vulnerabilidades
                    csvData.push(['VULNERABILIDADES DETALLADAS']);
                    csvData.push(['ID', 'Nombre', 'Severidad', 'Descripción', 'Solución', 'URL', 'Parámetro', 'CWE ID']);

                    scanData.alerts?.forEach((alert, index) => {
                      csvData.push([
                        index + 1,
                        alert.name || '',
                        alert.risk || '',
                        (alert.description || '').substring(0, 200).replace(/"/g, '""'),
                        (alert.solution || '').substring(0, 150).replace(/"/g, '""'),
                        alert.url || '',
                        alert.param || '',
                        alert.cweid || ''
                      ]);
                    });

                    csvData.push([]);
                    csvData.push(['RECOMENDACIONES']);
                    csvData.push(['Prioridad', 'Recomendación']);
                    csvData.push(['Alta', 'Implementar validación de entrada en todos los formularios']);
                    csvData.push(['Alta', 'Usar parámetros preparados para consultas SQL']);
                    csvData.push(['Media', 'Configurar encabezados de seguridad HTTP']);
                    csvData.push(['Media', 'Establecer cookies con flags Secure y HttpOnly']);
                    csvData.push(['Baja', 'Realizar escaneos de seguridad periódicos']);

                    // Convertir a string CSV
                    return csvData.map(row =>
                      row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`)
                      .join(',')
                    ).join('\n');
                  }



// Ruta para iniciar escaneo
app.post('/api/zap/scan', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL es requerida' });

    // 1. Iniciar Spider
    console.log('Iniciando Spider...');
    const scanId = await ZapService.startSpider(url);

    // 2. Iniciar Active Scan (se hace en paralelo o después, aquí lo haremos secuencial simplificado para el ejemplo)
    // Nota: En producción, deberías hacer polling del status de spider primero.
    // Para simplificar la demo, lanzamos el active scan tras el spider.

    // Esperar un poco al spider (en producción usa loop de polling)
    let status = await ZapService.getScanStatus(scanId);
    while(status.progress < 100) {
        await new Promise(r => setTimeout(r, 2000));
        status = await ZapService.getScanStatus(scanId);
        console.log(`Spider Status: ${status.progress}%`);
    }

    console.log('Spider terminado. Iniciando Active Scan...');
    const activeScanId = await ZapService.startActiveScan(url);

    // Polling Active Scan
    status = await ZapService.getScanStatus(activeScanId);
    while(status.progress < 100) {
        await new Promise(r => setTimeout(r, 3000)); // 3 segundos entre checks
        status = await ZapService.getScanStatus(activeScanId);
        console.log(`Active Scan Status: ${status.progress}%`);

        // Opcional: Enviar progreso al cliente via WebSocket o Server-Sent Events
        // Aquí lo mantenemos simple: esperamos hasta el final.
    }

    // 3. Obtener Alertas
    const alerts = await ZapService.getAlerts(url);

    res.json({ success: true, alerts, total: alerts.length });

  } catch (error) {
    console.error('Error en escaneo ZAP:', error);
    res.status(500).json({ error: error.message });
  }
});


// Endpoint: Generar y descargar ZIP (Versión Estática)
app.post('/api/generate-playwright-zip', async (req, res) => {
  try {
    console.log("🚀 Preparando descarga de plantilla Playwright BDD...");

    // 1. Crear ZIP en memoria
    const zip = new AdmZip();

    // 2. Iterar sobre el objeto estático y agregar archivos al ZIP
    Object.keys(PLAYWRIGHT_TEMPLATE_FILES).forEach(filePath => {
      const content = PLAYWRIGHT_TEMPLATE_FILES[filePath];
      // Asegurarse de que sea string buffer
      zip.addFile(filePath, Buffer.from(content, "utf8"));
    });

    // 3. Enviar el ZIP al cliente
    const downloadName = `Playwright_BDD_Template_Original.zip`;
    const data = zip.toBuffer();

    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', `attachment; filename=${downloadName}`);
    res.set('Content-Length', data.length);
    res.send(data);

    console.log("✅ Plantilla generada y enviada.");

  } catch (error) {
    console.error("Error en endpoint /api/generate-playwright-zip:", error);
    res.status(500).json({ error: "Error generando el proyecto", details: error.message });
  }
});

app.listen(PORT, "0.0.0.0", ()=>console.log("Listening", PORT));