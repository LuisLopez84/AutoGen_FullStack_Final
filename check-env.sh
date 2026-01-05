#!/bin/bash

echo "🔍 Verificando configuración de PageSpeed API Key..."
echo ""

echo "1. Verificando archivo .env:"
if [ -f ./.env ]; then
  echo "   ✅ .env encontrado"
  echo "   Contenido (solo keys):"
  grep -i "key" ./.env
else
  echo "   ❌ .env NO encontrado"
fi

echo ""
echo "2. Verificando docker-compose.yml:"
if [ -f ./docker-compose.yml ]; then
  echo "   ✅ docker-compose.yml encontrado"
  echo "   Variables configuradas:"
  grep -A2 -B2 "PAGESPEED\|GOOGLE" ./docker-compose.yml
else
  echo "   ❌ docker-compose.yml NO encontrado"
fi

echo ""
echo "3. Ejecutando diagnóstico del backend:"
curl -s http://localhost:3000/api/debug-pagespeed | python3 -m json.tool

echo ""
echo "📋 Pasos para solucionar:"
echo "   1. Asegúrate de que .env tenga: PAGESPEED_API_KEY=AIza..."
echo "   2. Ejecuta: docker-compose down"
echo "   3. Ejecuta: docker-compose up --build"
echo "   4. Verifica: http://localhost:3000/api/debug-pagespeed"