import { AUDIT_TRANSLATIONS } from './auditTranslations.js';

export function translateToSpanish(data) {
  if (!data) return data;

  const translate = (text) => AUDIT_TRANSLATIONS[text] || text;

  Object.values(data.categories || {}).forEach(cat => {
    cat.title = translate(cat.title);
    cat.description = translate(cat.description);
  });

  Object.values(data.metrics?.performance || {}).forEach(metric => {
    metric.title = translate(metric.title);
    metric.description = translate(metric.description);
  });

  ['opportunities', 'passed'].forEach(type => {
    Object.values(data.audits?.[type] || {}).forEach(audit => {
      audit.title = translate(audit.title);
      audit.description = translate(audit.description);
    });
  });

  return data;
}
