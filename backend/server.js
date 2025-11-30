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
import { buildProjectPrompt, buildTransformPrompt } from "./prompts/generateProjectPrompt.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors({ origin: "*" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req,res,next)=>{ console.log(new Date().toISOString(), req.method, req.url); next(); });

// Función para aplanar estructura JSON anidada - VERSIÓN AGRESIVA
function flattenFileStructure(files) {
  console.log("🔄 Aplanando estructura de archivos de forma mejorada...");
  const flattened = {};

  function processObject(obj, currentPath = '') {
    for (const [key, value] of Object.entries(obj)) {
      const newPath = currentPath ? `${currentPath}/${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Es un objeto, procesar recursivamente
        processObject(value, newPath);
      } else if (typeof value === 'string') {
        // Es un string, tratar como contenido de archivo
        flattened[newPath] = value;
        console.log(`  📍 ${newPath}: ${value.length} caracteres`);
      } else if (value === null || value === undefined) {
        // Valor nulo, omitir
        console.warn(`⚠️  Valor nulo para ${newPath}, omitiendo`);
      } else {
        // Otro tipo, convertir a string
        flattened[newPath] = String(value);
        console.log(`  📍 ${newPath} (convertido a string): ${String(value).length} caracteres`);
      }
    }
  }

  // Procesar el objeto files
  processObject(files);

  console.log(`✅ Estructura aplanada: ${Object.keys(flattened).length} archivos`);

  // Si no encontramos archivos, devolver la estructura original
  if (Object.keys(flattened).length === 0) {
    console.warn("⚠️  No se pudieron extraer archivos, usando estructura original");
    return files;
  }

  return flattened;
}



// Función para reemplazar el pom.xml básico con el completo
function replacePomXml(projectData) {
  const completePomXml = `<?xml version="1.0" encoding="UTF-8"?>
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

  console.log('🔧 Reemplazando pom.xml básico con versión completa...');

  // AÑADIR ESTOS LOGS DENTRO DE LA FUNCIÓN
  console.log('📊 projectData antes del reemplazo:');
  console.log('  - Keys:', Object.keys(projectData));
  console.log('  - pom.xml existe?:', 'pom.xml' in projectData);
  if (projectData['pom.xml']) {
    console.log('  - pom.xml actual tipo:', typeof projectData['pom.xml']);
    console.log('  - pom.xml actual longitud:', projectData['pom.xml'].length);
  }

  // Asegurarnos de que projectData es un objeto válido
  if (typeof projectData !== 'object' || projectData === null) {
    console.error('❌ projectData no es un objeto válido:', projectData);
    return projectData;
  }

  // Reemplazar SOLO el campo pom.xml
  projectData['pom.xml'] = completePomXml;

  // AÑADIR ESTOS LOGS ANTES DEL RETURN
  console.log('✅ pom.xml reemplazado exitosamente');
  console.log('📊 projectData después del reemplazo:');
  console.log('  - Keys:', Object.keys(projectData));
  console.log('  - nuevo pom.xml tipo:', typeof projectData['pom.xml']);
  console.log('  - nuevo pom.xml longitud:', projectData['pom.xml'].length);

  return projectData;
}

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
          content: "Eres un ingeniero senior de automatización Java. Devuelve SOLO un objeto JSON válido que mapee rutas de archivos a contenidos, sin texto adicional, sin markdown, sin ```json."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 8000
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    console.log("📥 Raw OpenAI response:", raw);

    let files;
    try {
      // Método robusto para extraer JSON
      let cleaned = raw.trim();

      // Eliminar markdown code blocks
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.substring(7);
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.substring(3);
      }

      if (cleaned.endsWith('```')) {
        cleaned = cleaned.substring(0, cleaned.length - 3);
      }

      cleaned = cleaned.trim();

      // Buscar el primer { y el último }
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      }

      console.log("🧹 Texto limpiado:", cleaned.substring(0, 200) + "...");

      files = JSON.parse(cleaned);
      console.log("✅ JSON parseado correctamente");

      // Aplanar la estructura
      files = flattenFileStructure(files);

    } catch(e){
      console.error("❌ JSON parse error:", e.message);

      // Intentar un fallback: buscar cualquier objeto JSON en el texto
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          files = JSON.parse(jsonMatch[0]);
          console.log("✅ JSON recuperado con fallback");
          files = flattenFileStructure(files);
        } else {
          throw new Error("No se encontró JSON en la respuesta");
        }
      } catch (fallbackError) {
        console.error("❌ Fallback también falló:", fallbackError.message);
        return res.status(500).json({
          error: "OpenAI returned non-JSON",
          raw: raw.substring(0, 1000),
          suggestion: "La IA no está devolviendo JSON válido. Revisa el prompt."
        });
      }
    }

    // Validar que files es un objeto
    if (typeof files !== 'object' || files === null) {
      console.error("❌ files no es un objeto válido:", typeof files);
      return res.status(500).json({ error: "OpenAI response is not a valid object", files });
    }

    console.log("📁 Archivos recibidos:", Object.keys(files).length, "archivos");

    // REEMPLAZAR EL POM.XML BÁSICO CON EL COMPLETO
    console.log("🔄 Reemplazando pom.xml...");
    files = replacePomXml(files);
    console.log("✅ pom.xml reemplazado");

    // ========== LOGS DE DEPURACIÓN ==========
    console.log("🔍 DEBUG: Tipos de contenido de archivos después del reemplazo:");
    for(const [fname, content] of Object.entries(files)){
      console.log(`  - ${fname}: tipo = ${typeof content}, es string = ${typeof content === 'string'}, es null = ${content === null}, es undefined = ${content === undefined}`);
      if (typeof content !== 'string') {
        console.log(`    ⚠️  CONTENIDO PROBLEMÁTICO: ${fname} no es string! Valor:`, content);
      }
    }

    // Verificar específicamente el pom.xml
    if (files['pom.xml']) {
      console.log(`📊 pom.xml: tipo = ${typeof files['pom.xml']}, longitud = ${files['pom.xml'].length}`);
    } else {
      console.log("❌ pom.xml NO EXISTE en files!");
    }
    // ========== FIN DE LOGS DE DEPURACIÓN ==========

    // save files into output/job
    const jobId = `job_${Date.now()}`;
    const outDir = path.join(__dirname, "output", jobId);
    fs.mkdirSync(outDir, { recursive: true });

    console.log("💾 Guardando archivos en:", outDir);
    for(const [fname, content] of Object.entries(files)){
      const p = path.join(outDir, fname);

      try {
        fs.mkdirSync(path.dirname(p), { recursive: true });

        // Asegurar que el contenido es string de manera más robusta
        let contentStr;
        if (typeof content === 'string') {
          contentStr = content;
        } else if (content === null || content === undefined) {
          contentStr = '';
          console.warn(`⚠️  Contenido nulo para ${fname}, usando string vacío`);
        } else if (typeof content === 'object') {
          contentStr = JSON.stringify(content, null, 2);
          console.warn(`⚠️  Contenido es objeto para ${fname}, convirtiendo a JSON`);
        } else {
          contentStr = String(content);
        }

        console.log(`📄 Guardando ${fname} (${contentStr.length} caracteres)`);
        fs.writeFileSync(p, contentStr, "utf8");

      } catch (fileError) {
        console.error(`❌ Error guardando ${fname}:`, fileError.message);
        // Continuar con los demás archivos
      }
    }

    const zipPath = path.join(__dirname, "output", `${jobId}.zip`);
    const zip = new AdmZip();
    zip.addLocalFolder(outDir);
    zip.writeZip(zipPath);

    console.log("🎉 Proyecto generado exitosamente:", jobId);
    res.json({ jobId, download: `/api/download/${jobId}` });
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