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

// Transform recording -> project files (calls OpenAI)
app.post("/api/transform-recording", async (req,res)=>{
  try {
    const { recording, url, testData } = req.body;
    if (!recording) return res.status(400).json({ error: "recording required" });
    const prompt = buildTransformPrompt({ recording, url, testData });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a senior Java automation engineer that outputs a JSON mapping of file paths to file contents for a Maven Serenity+Screenplay project." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 4000
    });
    const raw = completion.choices?.[0]?.message?.content ?? "";
    let files;
    try { files = JSON.parse(raw); } catch(e){ return res.status(500).json({ error: "OpenAI returned non-JSON", raw }); }
    // save files into output/job
    const jobId = `job_${Date.now()}`;
    const outDir = path.join(__dirname, "output", jobId);
    fs.mkdirSync(outDir, { recursive: true });
    for(const [fname, content] of Object.entries(files)){
      const p = path.join(outDir, fname);
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, content, "utf8");
    }
    const zipPath = path.join(__dirname, "output", `${jobId}.zip`);
    const zip = new AdmZip();
    zip.addLocalFolder(outDir);
    zip.writeZip(zipPath);
    res.json({ jobId, download: `/api/download/${jobId}` });
  } catch(err){
    console.error("transform error", err);
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
