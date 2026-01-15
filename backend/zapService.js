import axios from 'axios';

const ZAP_BASE_URL = process.env.ZAP_API_URL || 'http://localhost:8080/JSON';
const ZAP_API_KEY = process.env.ZAP_API_KEY || '';
// Nota: Si deshabilitaste la key en Docker con -config api.disablekey=true, esta variable debe estar vacía o ignorarse.

export class ZapService {

  // Función auxiliar para construir URL
  static buildUrl(endpoint) {
    let url = `${ZAP_BASE_URL}${endpoint}`;
    // Solo agregar API Key si está definida
    if (ZAP_API_KEY && ZAP_API_KEY.trim() !== '') {
      const separator = endpoint.includes('?') ? '&' : '?';
      url += `${separator}apikey=${ZAP_API_KEY}`;
    }
    return url;
  }

  static async startSpider(targetUrl) {
    try {
      console.log(`🕷️ Iniciando Spider en ZAP para: ${targetUrl}`);
      console.log(`🌐 Conectando a ZAP en: ${ZAP_BASE_URL}`);

      const url = this.buildUrl(`/spider/action/scan/?url=${encodeURIComponent(targetUrl)}&maxDepth=5`);

      console.log(`URL de la petición: ${url}`);

      const response = await axios.get(url, { timeout: 10000 }); // 10 segundos de timeout

      console.log(`✅ Spider iniciado. ID: ${response.data.scan}`);
      return response.data.scan;
    } catch (error) {
      console.error('❌ Error crítico iniciando Spider en ZAP:', error.message);

      if (error.code === 'ECONNREFUSED') {
        throw new Error('CONEXIÓN RECHAZADA: El contenedor de ZAP no está corriendo en el puerto 8080.');
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error('TIMEOUT: ZAP tardó demasiado en responder (10s).');
      }

      throw new Error(`No se pudo conectar con ZAP: ${error.message}`);
    }
  }

  static async startActiveScan(targetUrl) {
    try {
      console.log('⚡ Iniciando Active Scan...');

      const url = this.buildUrl(`/ascan/action/scan/?url=${encodeURIComponent(targetUrl)}&recurse=true`);
      const response = await axios.get(url, { timeout: 60000 }); // 60 segundos timeout

      console.log(`✅ Active Scan iniciado. ID: ${response.data.scan}`);
      return response.data.scan;
    } catch (error) {
      console.error('❌ Error iniciando Active Scan:', error.message);
      throw new Error(`No se pudo iniciar Active Scan: ${error.message}`);
    }
  }

    static async getScanStatus(scanId) {
      try {
        console.log(`🔍 Consultando estado para ID: ${scanId}`);

        // 1. Consultar estado del Spider PRIMERO
        const spiderStatus = await axios.get(this.buildUrl(`/spider/view/status/?scanId=${scanId}`));
        const spiderProgress = parseInt(spiderStatus.data.status || 0);

        // 2. Si el Spider sigue corriendo (< 100%), devolver su estado.
        //    NO intentamos consultar Active Scan todavía para evitar el error 400.
        if (spiderProgress < 100) {
          console.log(`   🕷️ Spider corriendo: ${spiderProgress}%`);
          return { progress: spiderProgress, status: 'SPIDER' };
        }

        // 3. Solo si el Spider terminó (100%), intentamos consultar Active Scan
        //    Si esto falla (ej. ID diferente o Active Scan no iniciado), asumimos 100 para cerrar el bucle.
        try {
          const activeStatus = await axios.get(this.buildUrl(`/ascan/view/status/?scanId=${scanId}`));
          const activeProgress = parseInt(activeStatus.data.status || 0);

          console.log(`   ⚡ Active Scan corriendo: ${activeProgress}%`);
          return { progress: activeProgress, status: 'ACTIVE_SCAN' };

        } catch (innerError) {
          // Si hay error 400 al consultar Active Scan (probable porque usa ID de Spider),
          // devolvemos progreso 100 para que el bucle del Spider termine y el servidor inicie el Active Scan real.
          console.log(`   ⚠️ Spider terminado, pero Active Scan aún no listo (Error esperado).`);
          return { progress: 100, status: 'SPIDER_FINISHED' };
        }

      } catch (error) {
        // Si falla la petición de Spider también (ej. ZAP apagado), lanzamos error.
        console.error('Error consultando estado:', error.message);
        if (error.code === 'ECONNREFUSED') {
          throw new Error('ZAP desconectado');
        }
        throw new Error(`Error de estado: ${error.message}`);
      }
    }

  static async getAlerts(targetUrl) {
    try {
      console.log('🔍 Obteniendo alertas de ZAP...');
      // Aumentamos el límite a 100 para ver más resultados
      const url = this.buildUrl(`/core/view/alerts/?baseurl=${encodeURIComponent(targetUrl)}&start=0&count=100`);
      const response = await axios.get(url);

      const alerts = response.data.alerts || [];
      console.log(`✅ ${alerts.length} alertas obtenidas.`);

      return alerts.map(alert => ({
        id: alert.id,
        name: alert.name,
        risk: alert.risk,
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
      console.error('❌ Error obteniendo alertas:', error.message);
      throw new Error('No se pudieron obtener las alertas de ZAP');
    }
  }
}