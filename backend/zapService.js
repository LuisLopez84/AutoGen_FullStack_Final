import axios from 'axios';
import fs from 'fs';
import path from 'path';

const ZAP_BASE_URL = process.env.ZAP_API_URL || 'http://localhost:8080/JSON';
const ZAP_API_KEY = process.env.ZAP_API_KEY || ''; // Si ZAP no requiere key, déjalo vacío

// Función auxiliar para construir URLs con API Key
const getZapUrl = (endpoint) => {
  const separator = endpoint.includes('?') ? '&' : '?';
  return `${ZAP_BASE_URL}${endpoint}${separator}apikey=${ZAP_API_KEY}`;
};

export class ZapService {

  // 1. Iniciar Spider (Crawler) para encontrar enlaces
  static async startSpider(targetUrl) {
    try {
      const response = await axios.get(getZapUrl(`/spider/action/scan/?url=${encodeURIComponent(targetUrl)}`));
      return response.data.scan;
    } catch (error) {
      console.error('Error iniciando Spider:', error.message);
      throw new Error('No se pudo iniciar el spider en ZAP');
    }
  }

  // 2. Iniciar Active Scan (Escaneo de vulnerabilidades)
  static async startActiveScan(targetUrl) {
    try {
      const response = await axios.get(getZapUrl(`/ascan/action/scan/?url=${encodeURIComponent(targetUrl)}&recurse=true`));
      return response.data.scan;
    } catch (error) {
      console.error('Error iniciando Active Scan:', error.message);
      throw new Error('No se pudo iniciar el escaneo activo en ZAP');
    }
  }

  // 3. Verificar estado del escaneo (Polling)
  static async getScanStatus(scanId) {
    try {
      // Primero chequeamos spider
      const spiderStatus = await axios.get(getZapUrl(`/spider/view/status/?scanId=${scanId}`));
      if (parseInt(spiderStatus.data.status) < 100) {
        return { progress: parseInt(spiderStatus.data.status), status: 'SPIDER' };
      }

      // Luego chequeamos active scan
      const activeStatus = await axios.get(getZapUrl(`/ascan/view/status/?scanId=${scanId}`));
      return { progress: parseInt(activeStatus.data.status), status: 'ACTIVE_SCAN' };

    } catch (error) {
      return { progress: 0, status: 'ERROR' };
    }
  }

  // 4. Obtener Resultados (Alertas)
  static async getAlerts(targetUrl) {
    try {
      const response = await axios.get(getZapUrl(`/core/view/alerts/?baseurl=${encodeURIComponent(targetUrl)}&start=0&count=100`));
      // Agrupamos y formateamos las alertas para el frontend
      const alerts = response.data.alerts || [];

      // Formatear para que sea más fácil leer
      return alerts.map(alert => ({
        id: alert.id,
        name: alert.name,
        risk: alert.risk, // High, Medium, Low, Informational
        confidence: alert.confidence,
        url: alert.url,
        description: alert.description,
        solution: alert.solution || 'No proporcionada',
        param: alert.param || 'N/A',
        attack: alert.attack || 'N/A',
        cweId: alert.cweId,
        wascId: alert.wascId
      }));
    } catch (error) {
      console.error('Error obteniendo alertas:', error.message);
      throw new Error('No se pudieron obtener las alertas de ZAP');
    }
  }
}