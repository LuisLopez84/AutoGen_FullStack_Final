#!/usr/bin/env node
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

    // Eliminar o simplificar la lógica de extracción de URL del recording
    // Ya que ahora la URL es obligatoria del usuario

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

    IMPORTANTE: Genera un proyecto COMPLETO y FUNCIONAL basado en la grabación proporcionada.
    REGLAS CRÍTICAS:
    1. Usa la URL principal proporcionada (${finalUrl}) en todos los archivos de configuración
    2. Genera MÚLTIPLES ESCENARIOS en el feature file (mínimo 3: 2 exitosos + 1 de error)
    3. Palabras Gherkin (Given/When/Then) en INGLÉS, descripciones en ESPAÑOL
    4. Los escenarios deben basarse en el flujo real de la grabación
    5. Incluir manejo de errores y validaciones negativas
    6. Usar selectores CSS robustos basados en los elementos de la grabación
    7. Incluir esperas explícitas para elementos dinámicos
    8. Usar Ensure.that() para todas las verificaciones
    9. El código debe ser ejecutable inmediatamente después de generado

    ESTRUCTURA DE FEATURE FILE REQUERIDA:
    Feature: [Nombre descriptivo]

      # Escenarios exitosos
      Scenario: [Nombre en español - flujo normal]
        Given [en inglés]
          "[descripción en español]"

      # Escenarios de error
      Scenario: [Nombre en español - validación negativa]
        Given [en inglés]
          "[descripción en español]"

    NO incluyas: pom.xml, serenity.conf, runners, hooks, ni archivos de configuración.`
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
        const cleanedContent = generateCleanFeature(content, domainName);
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

 // Luego agregar archivos de OpenAI (sobrescribiendo si es necesario)
 for (const category of ['features', 'definitions', 'pages', 'tasks', 'questions', 'others']) {
   for (const [filePath, content] of Object.entries(openaiFileMap[category])) {
     allFiles[filePath] = content;
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

// ========== FUNCIONES AUXILIARES ==========

// Modificar también la función extractDomainName para que sea más robusta:
function extractDomainName(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Extraer nombre del dominio sin extensiones
    const domainParts = hostname.split('.');

    // Para casos como "www.mercadolibre.com.co"
    if (domainParts.length >= 2) {
      // Tomar el penúltimo segmento (mercadolibre)
      let domain = domainParts[domainParts.length - 2];

      // Capitalizar primera letra y eliminar caracteres inválidos
      domain = domain.charAt(0).toUpperCase() + domain.slice(1);
      domain = domain.replace(/[^a-zA-Z0-9]/g, '');

      // Si el dominio es muy corto (como 'co' o 'com'), tomar otro segmento
      if (domain.length <= 2 && domainParts.length >= 3) {
        domain = domainParts[domainParts.length - 3];
        domain = domain.charAt(0).toUpperCase() + domain.slice(1);
        domain = domain.replace(/[^a-zA-Z0-9]/g, '');
      }

      return domain || 'WebPage';
    }

    return 'WebPage';
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
  cleaned = cleaned.replace(/Feature:.*/, `Feature: Validación funcional flujos ${domainName}`);

  // Eliminar detalles en inglés de los pasos Gherkin y las descripciones en español
  cleaned = cleaned.replace(/Given[^"]+"[^"]+"/g, (match) => {
    // Extraer solo la descripción en español
    const spanishMatch = match.match(/"([^"]+)"/);
    if (spanishMatch) {
      return `    Dado ${spanishMatch[1]}`;
    }
    return match;
  });

  cleaned = cleaned.replace(/When[^"]+"[^"]+"/g, (match) => {
    const spanishMatch = match.match(/"([^"]+)"/);
    if (spanishMatch) {
      return `    Cuando ${spanishMatch[1]}`;
    }
    return match;
  });

  cleaned = cleaned.replace(/Then[^"]+"[^"]+"/g, (match) => {
    const spanishMatch = match.match(/"([^"]+)"/);
    if (spanishMatch) {
      return `    Entonces ${spanishMatch[1]}`;
    }
    return match;
  });

  cleaned = cleaned.replace(/And[^"]+"[^"]+"/g, (match) => {
    const spanishMatch = match.match(/"([^"]+)"/);
    if (spanishMatch) {
      return `    Y ${spanishMatch[1]}`;
    }
    return match;
  });

  cleaned = cleaned.replace(/But[^"]+"[^"]+"/g, (match) => {
    const spanishMatch = match.match(/"([^"]+)"/);
    if (spanishMatch) {
      return `    Pero ${spanishMatch[1]}`;
    }
    return match;
  });

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
  let feature = `Feature: Validación funcional flujos ${domainName}

  Scenario: Ejecutar flujo grabado
    Dado que abro la aplicación ${domainName}`;

  // Agregar pasos dinámicos basados en la grabación (solo en español)
  steps.forEach((step, index) => {
    const stepType = step.action?.toLowerCase() || 'realizar';
    const element = step.element?.tagName || step.element?.selector || 'elemento';
    const value = step.value || '';
    const stepNumber = index + 1;

    if (stepType.includes('click')) {
      feature += `\n    Cuando hago clic en ${element} (paso ${stepNumber})`;
    } else if (stepType.includes('type') || stepType.includes('input')) {
      feature += `\n    Cuando ingreso "${value}" en ${element} (paso ${stepNumber})`;
    } else if (stepType.includes('select')) {
      feature += `\n    Cuando selecciono "${value}" de ${element} (paso ${stepNumber})`;
    } else if (stepType.includes('verify') || stepType.includes('check')) {
      feature += `\n    Entonces debo ver "${value}" en ${element} (paso ${stepNumber})`;
    } else {
      feature += `\n    Cuando ${stepType} ${element} (paso ${stepNumber})`;
    }
  });

  feature += `\n    Entonces la automatización se completa exitosamente`;

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
  let feature = `Feature: Validación funcional flujos ${domainName}

  # Palabras clave en español
  Scenario: Ejecutar flujo grabado
    Dado que estoy en la aplicación ${domainName}`;

  // Agregar pasos dinámicos basados en la grabación (solo en español)
  steps.forEach((step, index) => {
    const stepType = step.action?.toLowerCase() || 'realizar';
    const element = step.element?.tagName || step.element?.selector || 'elemento';
    const value = step.value || '';
    const stepNumber = index + 1;

    if (stepType.includes('click')) {
      feature += `\n    Cuando hago clic en ${element} (paso ${stepNumber})`;
    } else if (stepType.includes('type') || stepType.includes('input') || stepType.includes('enter')) {
      feature += `\n    Cuando ingreso "${value}" en ${element} (paso ${stepNumber})`;
    } else if (stepType.includes('select')) {
      feature += `\n    Cuando selecciono "${value}" de ${element} (paso ${stepNumber})`;
    } else if (stepType.includes('verify') || stepType.includes('check') || stepType.includes('should')) {
      feature += `\n    Entonces debo ver "${value}" en ${element} (paso ${stepNumber})`;
    } else if (stepType.includes('navigate') || stepType.includes('go')) {
      feature += `\n    Cuando navego a ${element} (paso ${stepNumber})`;
    } else {
      feature += `\n    Cuando ${stepType} ${element} (paso ${stepNumber})`;
    }
  });

  feature += `\n    Entonces la automatización se completa exitosamente`;

  return feature;
}


function generateDynamicDefinitions(domainName, recording) {
  return `package co.com.template.automation.testing.definitions;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;

import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;
import static org.hamcrest.Matchers.*;

public class ${domainName}Definitions {

    @Given("I am on the ${domainName} application")
    public void iAmOnTheApplication() {         OnStage.setTheStage(new OnlineCast());
        OnStage.theActorCalled("AutomationUser");
        // La navegación inicial se maneja en StepUrl
    }

    @When("I perform the recorded actions")
    public void iPerformRecordedActions() {
        // Aquí se implementarán las acciones específicas basadas en la grabación
        // Ejemplo:
        // OnStage.theActorInTheSpotlight().attemptsTo(
        //     new ${domainName}Task("parametro")
        // );
    }

    @Then("the automation should complete successfully")
    public void automationShouldComplete() {
        // Verificaciones finales
        // Ejemplo:
        // OnStage.theActorInTheSpotlight().should(
        //     seeThat(new ${domainName}Question().validacionExitosa(), equalTo(true))
        // );
    }
}`;
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
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;

import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;
import static org.hamcrest.Matchers.*;

public class ${domainName}Definitions {

@Given("the user opens the {string} application")
public void userOpensTheApplication(String appName) {
OnStage.setTheStage(new OnlineCast());
OnStage.theActorCalled("User");
// Navigation is handled by StepUrl class
}

 @When("the user performs the recorded actions")
public void userPerformsRecordedActions() {
// Implement based on recording
// Example: OnStage.theActorInTheSpotlight().attemptsTo(
//     Click.on(SomePage.SOME_ELEMENT),
//     Enter.theValue("text").into(SomePage.INPUT_FIELD)
// );
}

@Then("the automation should complete successfully")
public void automationShouldComplete() {
// Verification logic here
// Example: OnStage.theActorInTheSpotlight().should(
//     seeThat(SomeQuestion.isDisplayed(), equalTo(true))
// );
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