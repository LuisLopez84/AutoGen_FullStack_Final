export function normalizePageSpeed(lighthouseResult) {
  if (!lighthouseResult) return null;

  const categories = {};
  Object.entries(lighthouseResult.categories || {}).forEach(([key, cat]) => {
    categories[key] = {
      id: key,
      title: cat.title,
      score: Math.round((cat.score || 0) * 100),
      value: Math.round((cat.score || 0) * 100),
      description: cat.description || ''
    };
  });

  const metrics = {};
  Object.entries(lighthouseResult.audits || {}).forEach(([key, audit]) => {
    if (audit.numericValue !== undefined) {
      metrics[key] = {
        title: audit.title,
        description: audit.description,
        displayValue: audit.displayValue,
        numericValue: audit.numericValue,
        numericUnit: audit.numericUnit,
        score: audit.score
      };
    }
  });

  const audits = {
    opportunities: {},
    passed: {}
  };

  Object.entries(lighthouseResult.audits || {}).forEach(([key, audit]) => {
    if (audit.score !== null && audit.score < 0.9) {
      audits.opportunities[key] = audit;
    } else if (audit.score !== null) {
      audits.passed[key] = audit;
    }
  });

  return {
    categories,
    metrics: {
      performance: {
        items: Object.values(metrics)
      }
    },
    audits: {
      opportunities: {
        items: Object.values(audits.opportunities)
      },
      passed: {
        items: Object.values(audits.passed)
      }
    }
  };
}
