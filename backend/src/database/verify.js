import { pathToFileURL } from 'node:url';
import { initializeDatabase } from './init.js';
import { ensurePlatformSeeded } from '../repositories/platformRepository.js';

function isDirectExecution() {
  return process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
}

export function verifyDatabase(db = initializeDatabase()) {
  ensurePlatformSeeded(db);

  const counts = {
    parks: db.prepare('SELECT COUNT(*) AS value FROM parks').get().value,
    users: db.prepare('SELECT COUNT(*) AS value FROM users').get().value,
    greenhouses: db.prepare('SELECT COUNT(*) AS value FROM greenhouses').get().value,
    alerts: db.prepare('SELECT COUNT(*) AS value FROM alerts').get().value,
    decisions: db.prepare('SELECT COUNT(*) AS value FROM decisions').get().value,
    experiments: db.prepare('SELECT COUNT(*) AS value FROM experiments').get().value,
    fieldExperiments: db.prepare('SELECT COUNT(*) AS value FROM field_experiments').get().value,
    fieldPlots: db.prepare('SELECT COUNT(*) AS value FROM field_plots').get().value,
    fieldNodes: db.prepare('SELECT COUNT(*) AS value FROM field_nodes').get().value,
    fieldReadings: db.prepare('SELECT COUNT(*) AS value FROM field_readings').get().value,
    fieldAlerts: db.prepare('SELECT COUNT(*) AS value FROM field_alerts').get().value,
    fieldSamples: db.prepare('SELECT COUNT(*) AS value FROM field_samples').get().value,
  };

  const dashboard = db
    .prepare(`
      SELECT
        (SELECT COUNT(*) FROM greenhouses) AS totalGreenhouses,
        (SELECT COALESCE(SUM(online_device_count), 0) FROM greenhouses) AS onlineDevices,
        (SELECT COUNT(*) FROM alerts WHERE status = 'active' AND resolved = 0) AS activeAlerts,
        (SELECT COUNT(*) FROM irrigation_events WHERE substr(started_at, 1, 10) = '2026-04-03') AS todayIrrigations
    `)
    .get();

  const platform = db
    .prepare(`
      SELECT
        (SELECT COUNT(*) FROM field_plots) AS totalPlots,
        (SELECT COUNT(*) FROM field_plots WHERE online = 1) AS onlinePlots,
        (SELECT COUNT(*) FROM field_nodes WHERE status != 'offline') AS onlineNodes,
        (SELECT COUNT(*) FROM field_alerts WHERE status = '未处理') AS activeFieldAlerts,
        (SELECT COUNT(*) FROM field_samples WHERE lab_fill_status != '已回填') AS pendingSamples
    `)
    .get();

  return { counts, dashboard, platform };
}

if (isDirectExecution()) {
  const db = initializeDatabase();
  const result = verifyDatabase(db);
  console.log(JSON.stringify(result, null, 2));
  db.close();
}
