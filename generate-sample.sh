#!/usr/bin/env bash
# Simple script to call transform endpoint with sample recording
BACKEND=${BACKEND:-http://localhost:3000}
curl -s -X POST "$BACKEND/api/transform-recording" \  -H "Content-Type: application/json" \  -d @- <<'JSON'
{
  "url":"https://opensource-demo.orangehrmlive.com/web/index.php/auth/login",
  "testData":{"user":"Admin","pass":"admin123"},
  "recording":[
    {"action":"goto","selector":"","value":"https://opensource-demo.orangehrmlive.com/web/index.php/auth/login"},
    {"action":"input","selector":"input[name=username]","value":"Admin"},
    {"action":"input","selector":"input[name=password]","value":"admin123"},
    {"action":"click","selector":"button[type=submit]","value":null}
  ]
}
JSON
