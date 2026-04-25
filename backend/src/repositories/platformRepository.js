import { getDb } from '../database/client.js';
import { nowIso, parseJson, toFlag } from '../helpers/shared.js';

const EXPERIMENT_ID = 1;
const EXPERIMENT_CODE = 'RN2026-RATOON-WATER';
const DEFAULT_RECORDED_AT = '2026-04-17T10:42:00+08:00';

const treatmentMeta = {
  W0: { name: 'W0 浅湿交替', type: '水分处理', colorKey: 'sky', description: '窗口期保持浅水至轻落干' },
  W1: { name: 'W1 中度控水', type: '水分处理', colorKey: 'teal', description: '依据土壤张力触发复水' },
  W2: { name: 'W2 强化落干', type: '水分处理', colorKey: 'amber', description: '关键节点执行延迟复水' },
};

const varietyMeta = {
  G1: { name: 'G1 南粳9108', description: '常规粳稻对照品种' },
  G2: { name: 'G2 甬优1540', description: '再生力较强品种' },
};

const areaTypes = ['原位观测区', '产量评估区', '破坏性取样区'];
const windowNodes = ['T-10', 'T-7', 'T-3', 'T0', 'T+1', 'T+3', 'T+7', 'T+15', 'E1', 'E2'];

function json(value) {
  return JSON.stringify(value ?? {});
}

function rowToExperiment(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    code: row.code,
    name: row.name,
    projectName: row.project_name,
    cropName: row.crop_name,
    year: row.year,
    seasonName: row.season_name,
    stationName: row.station_name,
    designType: row.design_type,
    treatmentCount: row.treatment_count,
    plotCount: row.plot_count,
    currentStageKey: row.current_stage_key,
    currentStageLabel: row.current_stage_label,
    currentWindowLabel: row.current_window_label,
    status: row.status,
    startedOn: row.started_on,
    harvestOn: row.harvest_on,
    metadata: parseJson(row.metadata_json, {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToTreatment(row) {
  return {
    id: row.id,
    experimentId: row.experiment_id,
    code: row.code,
    name: row.name,
    treatmentType: row.treatment_type,
    description: row.description,
    colorKey: row.color_key,
    metadata: parseJson(row.metadata_json, {}),
  };
}

function rowToPlot(row) {
  return {
    id: row.id,
    experimentId: row.experiment_id,
    plotCode: row.plot_code,
    treatment: row.treatment_code,
    variety: row.variety_code,
    repeat: row.repeat_no,
    areaType: row.area_type,
    status: row.status,
    phase: row.phase_label,
    windowLabel: row.window_label,
    online: Boolean(row.online),
    waterLevel: row.water_level_cm,
    tension: row.soil_tension_kpa,
    battery: row.battery_v,
    lora: row.lora_rssi,
    alertCount: row.alert_count,
    lastReportedAt: row.last_reported_at,
    metadata: parseJson(row.metadata_json, {}),
    title: `${row.plot_code} · ${row.treatment_code}/${row.variety_code}/R${row.repeat_no}`,
  };
}

function rowToGateway(row) {
  return {
    id: row.id,
    gatewayCode: row.gateway_code,
    name: row.name,
    location: row.location,
    networkType: row.network_type,
    status: row.status,
    battery: row.battery_v,
    rssi: row.rssi,
    uploadSuccessRate: row.upload_success_rate,
    cacheCount: row.cache_count,
    firmwareVersion: row.firmware_version,
    lastHeartbeatAt: row.last_heartbeat_at,
    metadata: parseJson(row.metadata_json, {}),
  };
}

function rowToNode(row) {
  return {
    id: row.id,
    nodeCode: row.node_code,
    plotId: row.plot_id,
    plotCode: row.plot_code,
    gatewayId: row.gateway_id,
    gatewayCode: row.gateway_code,
    name: row.name,
    nodeType: row.node_type,
    status: row.status,
    battery: row.battery_v,
    lora: row.lora_rssi,
    uploadSuccessRate: row.upload_success_rate,
    cacheCount: row.cache_count,
    firmwareVersion: row.firmware_version,
    lastHeartbeatAt: row.last_heartbeat_at,
    sensorHealth: parseJson(row.sensor_health_json, {}),
    metadata: parseJson(row.metadata_json, {}),
  };
}

function rowToReading(row) {
  return {
    id: row.id,
    plotId: row.plot_id,
    nodeId: row.node_id,
    recordedAt: row.recorded_at,
    waterLevelCm: row.water_level_cm,
    soilTensionKpa: row.soil_tension_kpa,
    airTemperatureC: row.air_temperature_c,
    airHumidityPercent: row.air_humidity_percent,
    co2Ppm: row.co2_ppm,
    parUmolM2S: row.par_umol_m2_s,
    lightKlx: row.light_klx,
    windSpeedMps: row.wind_speed_mps,
    rainfallMm: row.rainfall_mm,
    canopyTemperatureC: row.canopy_temperature_c,
    waterTemperatureC: row.water_temperature_c,
    soilTemperatureC: row.soil_temperature_c,
    soilEcMsCm: row.soil_ec_ms_cm,
    soilPh: row.soil_ph,
    uvA: row.uv_a,
    uvB: row.uv_b,
    uvC: row.uv_c,
    latitude: row.latitude,
    longitude: row.longitude,
    altitudeM: row.altitude_m,
    batteryV: row.battery_v,
    loraRssi: row.lora_rssi,
    valveOpenCount: row.valve_open_count,
    valveTotalCount: row.valve_total_count,
    raw: parseJson(row.raw_json, {}),
    createdAt: row.created_at,
  };
}

function rowToAlert(row) {
  return {
    id: row.id,
    experimentId: row.experiment_id,
    plotId: row.plot_id,
    plotCode: row.plot_code,
    treatment: row.treatment_code,
    variety: row.variety_code,
    repeat: row.repeat_no,
    alertCode: row.alert_code,
    category: row.category,
    type: row.alert_type,
    level: row.level,
    message: row.message,
    currentValue: row.current_value,
    thresholdValue: row.threshold_value,
    durationMinutes: row.duration_minutes,
    recommendedAction: row.recommended_action,
    status: row.status,
    occurredAt: row.occurred_at,
    handledAt: row.handled_at,
    handlingNote: row.handling_note,
    metadata: parseJson(row.metadata_json, {}),
  };
}

function rowToTask(row) {
  return {
    id: row.id,
    experimentId: row.experiment_id,
    taskCode: row.task_code,
    taskType: row.task_type,
    title: row.title,
    plotScope: row.plot_scope,
    scheduledAt: row.scheduled_at,
    completedAt: row.completed_at,
    status: row.status,
    ownerUserId: row.owner_user_id,
    note: row.note,
    metadata: parseJson(row.metadata_json, {}),
  };
}

function rowToSample(row) {
  return {
    id: row.id,
    experimentId: row.experiment_id,
    plotId: row.plot_id,
    plotCode: row.plot_code,
    sampleCode: row.sample_code,
    sampleType: row.sample_type,
    eventLabel: row.event_label,
    collectedAt: row.collected_at,
    analysisStatus: row.analysis_status,
    labFillStatus: row.lab_fill_status,
    result: parseJson(row.result_json, {}),
    note: row.note,
  };
}

function rowToRule(row) {
  return {
    id: row.id,
    code: row.code,
    category: row.category,
    name: row.name,
    description: row.description,
    metricKey: row.metric_key,
    comparisonOperator: row.comparison_operator,
    thresholdValue: row.threshold_value,
    thresholdText: row.threshold_text,
    unit: row.unit,
    durationMinutes: row.duration_minutes,
    actionMode: row.action_mode,
    enabled: Boolean(row.enabled),
    updatedByUserId: row.updated_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToStageEvent(row) {
  return {
    id: row.id,
    experimentId: row.experiment_id,
    key: row.event_key,
    type: row.event_type,
    label: row.label,
    date: row.event_date,
    durationToNextDays: row.duration_to_next_days,
    status: row.status,
    note: row.note,
    sortOrder: row.sort_order,
    metadata: parseJson(row.metadata_json, {}),
  };
}

function insertSyncEvent(db, { entityType, entityId, action, payload = {}, source = 'api', actorUserId = null }) {
  db.prepare(`
    INSERT INTO field_sync_events (entity_type, entity_id, action, payload_json, source, actor_user_id, occurred_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(entityType, String(entityId), action, json(payload), source, actorUserId, nowIso());
}

function seededPlot(index, treatment, variety, repeat) {
  const plotCode = `P${String(index + 1).padStart(2, '0')}`;
  const isOffline = index === 5 || index === 18;
  const alertCount = isOffline ? 2 : index % 5 === 0 ? 2 : index % 3 === 0 ? 1 : 0;
  const status = isOffline
    ? '离线'
    : treatment === 'W2' && repeat >= 3
      ? '落干中'
      : treatment === 'W1' && repeat === 2
        ? '关键窗口中'
        : treatment === 'W0' && repeat === 4
          ? '复水后'
          : alertCount > 0
            ? '预警'
            : '正常';

  return {
    plotCode,
    treatment,
    variety,
    repeat,
    areaType: areaTypes[(index + Math.floor(index / 8)) % areaTypes.length],
    status,
    online: !isOffline,
    waterLevel: Number((1.8 - Math.floor(index / 8) * 1.2 - (repeat - 1) * 0.3).toFixed(1)),
    tension: Number((-12 - Math.floor(index / 8) * 11 - (repeat - 1) * 2.5).toFixed(1)),
    alertCount,
    battery: Number((4.08 - index * 0.02).toFixed(2)),
    lora: isOffline ? -121 : -84 - (repeat - 1) * 5 - Math.floor(index / 8) * 3,
    phase: index % 4 === 0 ? '主季收割前' : index % 4 === 1 ? '主—再关键期' : index % 4 === 2 ? '复水后' : '再生季启动',
    windowLabel: windowNodes[(index + 2) % windowNodes.length],
    lastReportedAt: isOffline ? '2026-04-17T10:26:00+08:00' : DEFAULT_RECORDED_AT,
  };
}

function seedReadingsForPlot(plot, plotId, nodeId) {
  return Array.from({ length: 8 }, (_, pointIndex) => {
    const recordedAt = new Date(Date.parse('2026-04-17T02:42:00+08:00') + pointIndex * 60 * 60 * 1000).toISOString();
    const treatmentOffset = plot.treatment === 'W2' ? -1.4 : plot.treatment === 'W1' ? -0.7 : 0;
    const repeatOffset = (plot.repeat - 1) * 0.08;

    return {
      plotId,
      nodeId,
      recordedAt,
      waterLevelCm: Number((plot.waterLevel + 0.7 - pointIndex * 0.12 + repeatOffset).toFixed(2)),
      soilTensionKpa: Number((plot.tension + 4 - pointIndex * 0.85 + treatmentOffset).toFixed(2)),
      airTemperatureC: Number((24.6 + pointIndex * 0.72 + (pointIndex % 2 ? -0.15 : 0.2)).toFixed(2)),
      airHumidityPercent: Number((83 - pointIndex * 1.1 + (pointIndex % 2 ? 0.3 : -0.2)).toFixed(2)),
      co2Ppm: Number((480 + pointIndex * 5 + (pointIndex % 2 ? -2 : 3)).toFixed(2)),
      parUmolM2S: Number((880 + pointIndex * 46 + (pointIndex % 2 ? -18 : 22)).toFixed(2)),
      lightKlx: Number((52 + pointIndex * 2.8).toFixed(2)),
      windSpeedMps: Number((1.1 + pointIndex * 0.05).toFixed(2)),
      rainfallMm: pointIndex < 2 ? Number((0.2 + pointIndex * 0.2).toFixed(2)) : 0,
      canopyTemperatureC: Number((26.8 + pointIndex * 0.55).toFixed(2)),
      waterTemperatureC: Number((24.2 + pointIndex * 0.24).toFixed(2)),
      soilTemperatureC: Number((25.6 + pointIndex * 0.18).toFixed(2)),
      soilEcMsCm: Number((1.52 - pointIndex * 0.02).toFixed(2)),
      soilPh: Number((6.42 + pointIndex * 0.01).toFixed(2)),
      uvA: Number((0.8 + pointIndex * 0.03).toFixed(2)),
      uvB: Number((0.18 + pointIndex * 0.01).toFixed(2)),
      uvC: 0,
      latitude: 31.2987,
      longitude: 120.5853,
      altitudeM: 5.8,
      batteryV: plot.battery,
      loraRssi: plot.lora,
      valveOpenCount: plot.treatment === 'W2' ? 1 : 0,
      valveTotalCount: 1,
    };
  });
}

function pickNumber(source, keys) {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null && source[key] !== '') {
      const value = Number(source[key]);
      if (Number.isFinite(value)) {
        return value;
      }
    }
  }

  return null;
}

function pickText(source, keys, fallback = null) {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null && source[key] !== '') {
      return String(source[key]);
    }
  }

  return fallback;
}

function normalizeReadingPayload(payload) {
  const metrics = {
    ...(payload.readings ?? {}),
    ...(payload.metrics ?? {}),
    ...payload,
  };

  return {
    plotCode: pickText(payload, ['plotCode', 'plot_code', 'plotId', 'plot_id']),
    nodeCode: pickText(payload, ['nodeCode', 'node_code', 'deviceId', 'device_id', 'nodeId', 'node_id'], 'ESP32-S3-UNASSIGNED'),
    recordedAt: pickText(payload, ['recordedAt', 'recorded_at', 'timestamp', 'time'], nowIso()),
    waterLevelCm: pickNumber(metrics, ['waterLevelCm', 'water_level_cm', 'waterLevel', 'water_level']),
    soilTensionKpa: pickNumber(metrics, ['soilTensionKpa', 'soil_tension_kpa', 'tension', 'soilTension']),
    airTemperatureC: pickNumber(metrics, ['airTemperatureC', 'air_temperature_c', 'temperature', 'temp']),
    airHumidityPercent: pickNumber(metrics, ['airHumidityPercent', 'air_humidity_percent', 'humidity', 'hum']),
    co2Ppm: pickNumber(metrics, ['co2Ppm', 'co2_ppm', 'co2']),
    parUmolM2S: pickNumber(metrics, ['parUmolM2S', 'par_umol_m2_s', 'par']),
    lightKlx: pickNumber(metrics, ['lightKlx', 'light_klx', 'light', 'lux']),
    windSpeedMps: pickNumber(metrics, ['windSpeedMps', 'wind_speed_mps', 'windSpeed']),
    rainfallMm: pickNumber(metrics, ['rainfallMm', 'rainfall_mm', 'rainfall', 'rain']),
    canopyTemperatureC: pickNumber(metrics, ['canopyTemperatureC', 'canopy_temperature_c', 'canopyTemp']),
    waterTemperatureC: pickNumber(metrics, ['waterTemperatureC', 'water_temperature_c', 'waterTemp']),
    soilTemperatureC: pickNumber(metrics, ['soilTemperatureC', 'soil_temperature_c', 'soilTemp', 'groundTemp']),
    soilEcMsCm: pickNumber(metrics, ['soilEcMsCm', 'soil_ec_ms_cm', 'ec']),
    soilPh: pickNumber(metrics, ['soilPh', 'soil_ph', 'ph', 'pH']),
    uvA: pickNumber(metrics, ['uvA', 'uva', 'UVA']),
    uvB: pickNumber(metrics, ['uvB', 'uvb', 'UVB']),
    uvC: pickNumber(metrics, ['uvC', 'uvc', 'UVC']),
    latitude: pickNumber(metrics, ['latitude', 'lat']),
    longitude: pickNumber(metrics, ['longitude', 'lng', 'lon']),
    altitudeM: pickNumber(metrics, ['altitudeM', 'altitude_m', 'altitude', 'alt']),
    batteryV: pickNumber(metrics, ['batteryV', 'battery_v', 'batteryVoltage', 'batt']),
    loraRssi: pickNumber(metrics, ['loraRssi', 'lora_rssi', 'rssi']),
    valveOpenCount: pickNumber(metrics, ['valveOpenCount', 'valve_open_count', 'valvesOpen']),
    valveTotalCount: pickNumber(metrics, ['valveTotalCount', 'valve_total_count', 'valvesTotal']),
    raw: payload,
  };
}

function assertKnownPlot(db, plotCode) {
  const plot = db.prepare('SELECT * FROM field_plots WHERE plot_code = ?').get(plotCode);
  if (!plot) {
    throw new Error(`field plot not found: ${plotCode}`);
  }

  return plot;
}

function ensureNodeForReading(db, reading, plotId) {
  let node = db.prepare('SELECT * FROM field_nodes WHERE node_code = ?').get(reading.nodeCode);
  if (node) {
    return node;
  }

  db.prepare(`
    INSERT INTO field_nodes (
      node_code, plot_id, gateway_id, name, node_type, status, battery_v, lora_rssi,
      upload_success_rate, cache_count, firmware_version, last_heartbeat_at,
      sensor_health_json, metadata_json, created_at, updated_at
    )
    VALUES (?, ?, NULL, ?, 'ESP32-S3', 'online', ?, ?, 1, 0, 'unregistered', ?, '{}', '{}', ?, ?)
  `).run(reading.nodeCode, plotId, `${reading.nodeCode} 田间节点`, reading.batteryV, reading.loraRssi, reading.recordedAt, nowIso(), nowIso());

  node = db.prepare('SELECT * FROM field_nodes WHERE node_code = ?').get(reading.nodeCode);
  return node;
}

export function ensurePlatformSeeded(db = getDb()) {
  const existing = db.prepare('SELECT COUNT(*) AS value FROM field_experiments').get().value;
  if (existing > 0) {
    return { seeded: false, reason: 'field_experiments already populated' };
  }

  const seed = db.transaction(() => {
    const createdAt = nowIso();

    db.prepare(`
      INSERT INTO field_experiments (
        id, code, name, project_name, crop_name, year, season_name, station_name,
        design_type, treatment_count, plot_count, current_stage_key,
        current_stage_label, current_window_label, status, started_on, harvest_on,
        metadata_json, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      EXPERIMENT_ID,
      EXPERIMENT_CODE,
      '主—再关键期水分调控与再生响应试验',
      '田智枢 AgriNexus 全生育期田间试验监测与决策平台',
      '再生稻',
      2026,
      '早季',
      '低桩机收稻田试验站',
      '裂区设计',
      6,
      24,
      'filling',
      '灌浆成熟',
      'T-3',
      'running',
      '2026-02-22',
      '2026-04-22',
      json({ waterTreatments: 3, varieties: 2, replicates: 4, platform: 'AgriNexus' }),
      createdAt,
      createdAt,
    );

    Object.entries(treatmentMeta).forEach(([code, meta]) => {
      db.prepare(`
        INSERT INTO field_treatments (
          experiment_id, code, name, treatment_type, description, color_key, metadata_json, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, '{}', ?, ?)
      `).run(EXPERIMENT_ID, code, meta.name, meta.type, meta.description, meta.colorKey, createdAt, createdAt);
    });

    Object.entries(varietyMeta).forEach(([code, meta]) => {
      db.prepare(`
        INSERT INTO field_varieties (experiment_id, code, name, description, metadata_json, created_at, updated_at)
        VALUES (?, ?, ?, ?, '{}', ?, ?)
      `).run(EXPERIMENT_ID, code, meta.name, meta.description, createdAt, createdAt);
    });

    [
      ['GW-NORTH', '北区 LoRa 网关', '北区田埂', 'LoRa + 4G', 'online', 4.12, -74, 0.992, 0, '1.8.2'],
      ['GW-SOUTH', '南区 LoRa 网关', '南区泵房', 'LoRa + 4G', 'warning', 4.05, -86, 0.965, 12, '1.8.2'],
      ['GW-LAB', '样品区边缘网关', '实验样品暂存点', 'LoRa + Ethernet', 'online', 4.18, -69, 0.998, 0, '1.8.1'],
    ].forEach((gateway) => {
      db.prepare(`
        INSERT INTO field_gateways (
          gateway_code, name, location, network_type, status, battery_v, rssi,
          upload_success_rate, cache_count, firmware_version, last_heartbeat_at,
          metadata_json, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '{}', ?, ?)
      `).run(...gateway, DEFAULT_RECORDED_AT, createdAt, createdAt);
    });

    const insertPlot = db.prepare(`
      INSERT INTO field_plots (
        experiment_id, plot_code, treatment_code, variety_code, repeat_no, area_type,
        status, phase_label, window_label, online, water_level_cm, soil_tension_kpa,
        battery_v, lora_rssi, alert_count, last_reported_at, metadata_json, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertNode = db.prepare(`
      INSERT INTO field_nodes (
        node_code, plot_id, gateway_id, name, node_type, status, battery_v,
        lora_rssi, upload_success_rate, cache_count, firmware_version,
        last_heartbeat_at, sensor_health_json, metadata_json, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertReading = db.prepare(`
      INSERT INTO field_readings (
        plot_id, node_id, recorded_at, water_level_cm, soil_tension_kpa,
        air_temperature_c, air_humidity_percent, co2_ppm, par_umol_m2_s,
        light_klx, wind_speed_mps, rainfall_mm, canopy_temperature_c,
        water_temperature_c, soil_temperature_c, soil_ec_ms_cm, soil_ph,
        uv_a, uv_b, uv_c, latitude, longitude, altitude_m, battery_v,
        lora_rssi, valve_open_count, valve_total_count, raw_json, created_at
      )
      VALUES (
        @plotId, @nodeId, @recordedAt, @waterLevelCm, @soilTensionKpa,
        @airTemperatureC, @airHumidityPercent, @co2Ppm, @parUmolM2S,
        @lightKlx, @windSpeedMps, @rainfallMm, @canopyTemperatureC,
        @waterTemperatureC, @soilTemperatureC, @soilEcMsCm, @soilPh,
        @uvA, @uvB, @uvC, @latitude, @longitude, @altitudeM, @batteryV,
        @loraRssi, @valveOpenCount, @valveTotalCount, @rawJson, @createdAt
      )
    `);

    let plotIndex = 0;
    Object.keys(treatmentMeta).forEach((treatment) => {
      Object.keys(varietyMeta).forEach((variety) => {
        for (let repeat = 1; repeat <= 4; repeat += 1) {
          const plot = seededPlot(plotIndex, treatment, variety, repeat);
          insertPlot.run(
            EXPERIMENT_ID,
            plot.plotCode,
            plot.treatment,
            plot.variety,
            plot.repeat,
            plot.areaType,
            plot.status,
            plot.phase,
            plot.windowLabel,
            toFlag(plot.online),
            plot.waterLevel,
            plot.tension,
            plot.battery,
            plot.lora,
            plot.alertCount,
            plot.lastReportedAt,
            json({ source: 'seed', title: `${plot.plotCode} · ${plot.treatment}/${plot.variety}/R${plot.repeat}` }),
            createdAt,
            createdAt,
          );

          const plotId = db.prepare('SELECT id FROM field_plots WHERE plot_code = ?').get(plot.plotCode).id;
          const gatewayId = (plotIndex % 3) + 1;
          const nodeCode = `NODE-${plot.plotCode}`;

          insertNode.run(
            nodeCode,
            plotId,
            gatewayId,
            `${plot.plotCode} 田间监测节点`,
            'ESP32-S3 + LoRa',
            plot.online ? (plot.alertCount > 0 ? 'warning' : 'online') : 'offline',
            plot.battery,
            plot.lora,
            plot.online ? 0.97 : 0.61,
            plot.online ? 0 : 18,
            '0.9.0-demo',
            plot.lastReportedAt,
            json({ waterLevel: true, soilTension: true, env: true, uv: true, gps: true }),
            json({ plotCode: plot.plotCode }),
            createdAt,
            createdAt,
          );

          const nodeId = db.prepare('SELECT id FROM field_nodes WHERE node_code = ?').get(nodeCode).id;
          seedReadingsForPlot(plot, plotId, nodeId).forEach((reading) => {
            insertReading.run({ ...reading, rawJson: json({ source: 'seed' }), createdAt });
          });

          plotIndex += 1;
        }
      });
    });

    const alerts = [
      ['A-17', 'P19', '水分控制类', '复水延迟', '高', 'W2/G1/R3 复水延迟 6.5 h，张力降至 -51 kPa', '-51 kPa', '-45 kPa', 390, '建议立即启动复水并核查阀门状态。'],
      ['A-12', 'P06', '设备通讯类', 'LoRa 弱信号', '中', 'P06 RSSI 降至 -121 dBm，存在缓存堆积风险', '-121 dBm', '-110 dBm', 42, '建议检查节点天线朝向与供电。'],
      ['A-09', 'P08', '水分控制类', '张力超阈', '中', 'W0/G2/R4 土壤张力连续 3 h 高于预设上限', '-38 kPa', '-35 kPa', 180, '建议核查张力计与小区边界渗漏。'],
      ['A-03', 'P14', '试验执行类', '样品未回填', '低', 'E1 根际土 DOC 数据尚未录入实验室结果', '缺失', '应回填', 1440, '建议补录离线分析结果。'],
    ];

    alerts.forEach((alert) => {
      const plotId = db.prepare('SELECT id FROM field_plots WHERE plot_code = ?').get(alert[1]).id;
      db.prepare(`
        INSERT INTO field_alerts (
          experiment_id, plot_id, alert_code, category, alert_type, level, message,
          current_value, threshold_value, duration_minutes, recommended_action,
          status, occurred_at, metadata_json, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '未处理', ?, '{}', ?, ?)
      `).run(EXPERIMENT_ID, plotId, alert[0], alert[2], alert[3], alert[4], alert[5], alert[6], alert[7], alert[8], alert[9], DEFAULT_RECORDED_AT, createdAt, createdAt);
    });

    [
      ['TASK-REWATER-W2', '灌排执行', 'W2 组复水执行确认', 'W2 组 3 个小区', '2026-04-18T08:30:00+08:00', null, '待执行', '根据张力阈值偏离程度与当前天气预报，建议在 40 分钟内完成复水。'],
      ['TASK-TENSION-P08', '设备核查', 'P08 张力计现场核查', 'P08', '2026-04-17T15:00:00+08:00', null, '进行中', '张力曲线与水位曲线联动关系异常，疑似传感器漂移。'],
      ['TASK-SAMPLE-E1', '样品回填', 'E1 / E2 事件样本回填', 'E1 / E2 事件样本', '2026-04-18T18:00:00+08:00', null, '待执行', '3 份留桩高度记录缺失，会影响专题页的芽启动比较。'],
    ].forEach((task) => {
      db.prepare(`
        INSERT INTO field_tasks (
          experiment_id, task_code, task_type, title, plot_scope, scheduled_at,
          completed_at, status, note, metadata_json, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '{}', ?, ?)
      `).run(EXPERIMENT_ID, task[0], task[1], task[2], task[3], task[4], task[5], task[6], task[7], createdAt, createdAt);
    });

    [
      ['S-P14-E1-RS-001', 'P14', '根际土样', 'E1', '2026-04-17T09:30:00+08:00', '检测中', '部分回填', { DOC: null, NH4N: 8.4 }],
      ['S-P14-E1-GAS-001', 'P14', '气体样', 'E1', '2026-04-17T09:45:00+08:00', '已回填', '已回填', { CH4Flux: 12.8, N2OFlux: 0.32 }],
      ['S-P19-T0-C13-001', 'P19', '13C样', 'T0', null, '待采集', '待回填', {}],
      ['S-P08-E2-PLANT-001', 'P08', '植物样', 'E2', null, '待采集', '待回填', {}],
    ].forEach((sample) => {
      const plotId = db.prepare('SELECT id FROM field_plots WHERE plot_code = ?').get(sample[1]).id;
      db.prepare(`
        INSERT INTO field_samples (
          experiment_id, plot_id, sample_code, sample_type, event_label,
          collected_at, analysis_status, lab_fill_status, result_json, note,
          created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)
      `).run(EXPERIMENT_ID, plotId, sample[0], sample[2], sample[3], sample[4], sample[5], sample[6], json(sample[7]), createdAt, createdAt);
    });

    [
      ['sowing', 'full_season', '播种', '2026-02-22', 10, 'done', '育秧与返青起始阶段', 1],
      ['tillering', 'full_season', '分蘖', '2026-03-04', 15, 'done', '群体建成已完成', 2],
      ['jointing', 'full_season', '孕穗', '2026-03-19', 11, 'done', '拔节孕穗阶段已完成', 3],
      ['heading', 'full_season', '抽穗', '2026-03-30', 14, 'done', '抽穗扬花阶段已完成', 4],
      ['filling', 'full_season', '灌浆', '2026-04-13', 9, 'current', '当前生育阶段', 5],
      ['harvest', 'full_season', '主季收割', '2026-04-22', 1, 'upcoming', '距当前还有 3 天', 6],
      ['ratoon-grow', 'full_season', '再生季生长', '2026-04-23', 47, 'future', '复水后进入再生季', 7],
      ['ratoon-harvest', 'full_season', '再生季收获', '2026-06-09', null, 'future', '后续收获窗口', 8],
      ['t-10', 'key_window', 'T-10', '2026-04-12', 3, 'done', '收割前基线监测', 1],
      ['t-7', 'key_window', 'T-7', '2026-04-15', 4, 'done', '控水响应启动', 2],
      ['t-3', 'key_window', 'T-3', '2026-04-19', 3, 'current', '当前窗口', 3],
      ['t0', 'key_window', 'T0', '2026-04-22', 1, 'upcoming', '主季收割', 4],
      ['t1', 'key_window', 'T+1', '2026-04-23', 2, 'future', '割后脉冲观察', 5],
      ['t3', 'key_window', 'T+3', '2026-04-25', 4, 'future', '复湿脉冲观察', 6],
      ['t7', 'key_window', 'T+7', '2026-04-29', 8, 'future', '再生芽调查', 7],
      ['t15', 'key_window', 'T+15', '2026-05-07', 3, 'future', '根际采样', 8],
      ['e1', 'key_window', 'E1', '2026-05-10', 8, 'future', '事件对齐采样 1', 9],
      ['e2', 'key_window', 'E2', '2026-05-18', null, 'future', '事件对齐采样 2', 10],
    ].forEach((event) => {
      db.prepare(`
        INSERT INTO field_stage_events (
          experiment_id, event_key, event_type, label, event_date, duration_to_next_days,
          status, note, sort_order, metadata_json, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '{}', ?, ?)
      `).run(EXPERIMENT_ID, ...event, createdAt, createdAt);
    });

    [
      ['RULE-WATER-LEVEL-LOW', '水分控制规则', '田面水位过低', '田面水位低于处理阈值时触发复水建议', 'water_level_cm', '<', -2.5, null, 'cm', 60, 'recommend'],
      ['RULE-TENSION-W2', '水分控制规则', 'W2 土壤张力下限', 'W2 小区土壤张力接近 -45 kPa 时触发预警', 'soil_tension_kpa', '<=', -45, null, 'kPa', 120, 'alarm'],
      ['RULE-LORA-RSSI', '设备通讯规则', 'LoRa 弱信号', '节点 RSSI 持续低于 -110 dBm 时触发通讯预警', 'lora_rssi', '<=', -110, null, 'dBm', 30, 'alarm'],
      ['RULE-SAMPLE-FILL', '试验执行规则', '样品回填超期', '关键事件样品超过计划时间未回填时提醒', 'sample_fill_status', '=', null, '待回填', '', 1440, 'task'],
    ].forEach((rule) => {
      db.prepare(`
        INSERT INTO field_rules (
          code, category, name, description, metric_key, comparison_operator,
          threshold_value, threshold_text, unit, duration_minutes, action_mode,
          enabled, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `).run(...rule, createdAt, createdAt);
    });

    insertSyncEvent(db, {
      entityType: 'experiment',
      entityId: EXPERIMENT_CODE,
      action: 'create',
      source: 'seed',
      payload: { message: 'AgriNexus field-trial demo data initialized' },
    });
  });

  seed();
  return { seeded: true, experimentCode: EXPERIMENT_CODE };
}

export function getCurrentExperiment(db = getDb()) {
  ensurePlatformSeeded(db);
  return rowToExperiment(db.prepare('SELECT * FROM field_experiments ORDER BY id LIMIT 1').get());
}

export function listTreatments(db = getDb()) {
  ensurePlatformSeeded(db);
  return db.prepare('SELECT * FROM field_treatments ORDER BY code').all().map(rowToTreatment);
}

export function listPlots(filters = {}, db = getDb()) {
  ensurePlatformSeeded(db);

  const clauses = ['1 = 1'];
  const params = {};

  if (filters.treatment) {
    clauses.push('treatment_code = @treatment');
    params.treatment = filters.treatment;
  }

  if (filters.variety) {
    clauses.push('variety_code = @variety');
    params.variety = filters.variety;
  }

  if (filters.status) {
    clauses.push('status = @status');
    params.status = filters.status;
  }

  return db
    .prepare(`SELECT * FROM field_plots WHERE ${clauses.join(' AND ')} ORDER BY treatment_code, variety_code, repeat_no`)
    .all(params)
    .map(rowToPlot);
}

export function getPlotDetail(plotCode, db = getDb()) {
  ensurePlatformSeeded(db);
  const plot = db.prepare('SELECT * FROM field_plots WHERE plot_code = ?').get(plotCode);
  if (!plot) {
    throw new Error(`field plot not found: ${plotCode}`);
  }

  const readings = db
    .prepare('SELECT * FROM field_readings WHERE plot_id = ? ORDER BY recorded_at DESC LIMIT 48')
    .all(plot.id)
    .map(rowToReading);

  const node = db
    .prepare(`
      SELECT n.*, p.plot_code, g.gateway_code
      FROM field_nodes n
      LEFT JOIN field_plots p ON p.id = n.plot_id
      LEFT JOIN field_gateways g ON g.id = n.gateway_id
      WHERE n.plot_id = ?
      ORDER BY n.id
      LIMIT 1
    `)
    .get(plot.id);

  const alerts = db
    .prepare(`
      SELECT a.*, p.plot_code, p.treatment_code, p.variety_code, p.repeat_no
      FROM field_alerts a
      LEFT JOIN field_plots p ON p.id = a.plot_id
      WHERE a.plot_id = ?
      ORDER BY a.occurred_at DESC
    `)
    .all(plot.id)
    .map(rowToAlert);

  const samples = db
    .prepare(`
      SELECT s.*, p.plot_code
      FROM field_samples s
      LEFT JOIN field_plots p ON p.id = s.plot_id
      WHERE s.plot_id = ?
      ORDER BY s.sample_code
    `)
    .all(plot.id)
    .map(rowToSample);

  return {
    plot: rowToPlot(plot),
    node: node ? rowToNode(node) : null,
    readings,
    alerts,
    samples,
  };
}

export function updatePlot(plotCode, patch, actorUserId = null, db = getDb()) {
  ensurePlatformSeeded(db);
  const plot = assertKnownPlot(db, plotCode);
  const fieldMap = {
    status: 'status',
    phase: 'phase_label',
    phaseLabel: 'phase_label',
    windowLabel: 'window_label',
    online: 'online',
    waterLevel: 'water_level_cm',
    waterLevelCm: 'water_level_cm',
    tension: 'soil_tension_kpa',
    soilTensionKpa: 'soil_tension_kpa',
    battery: 'battery_v',
    batteryV: 'battery_v',
    lora: 'lora_rssi',
    loraRssi: 'lora_rssi',
    alertCount: 'alert_count',
    areaType: 'area_type',
    lastReportedAt: 'last_reported_at',
    metadata: 'metadata_json',
  };

  const updates = [];
  const params = { plotCode };

  Object.entries(fieldMap).forEach(([inputKey, column]) => {
    if (Object.prototype.hasOwnProperty.call(patch, inputKey)) {
      const paramKey = inputKey.replace(/[^a-zA-Z0-9]/g, '');
      updates.push(`${column} = @${paramKey}`);
      params[paramKey] = column === 'online' ? toFlag(patch[inputKey]) : column === 'metadata_json' ? json(patch[inputKey]) : patch[inputKey];
    }
  });

  if (updates.length === 0) {
    return rowToPlot(plot);
  }

  updates.push('updated_at = @updatedAt');
  params.updatedAt = nowIso();

  db.prepare(`UPDATE field_plots SET ${updates.join(', ')} WHERE plot_code = @plotCode`).run(params);
  insertSyncEvent(db, { entityType: 'plot', entityId: plotCode, action: 'update', payload: patch, actorUserId });

  return rowToPlot(db.prepare('SELECT * FROM field_plots WHERE plot_code = ?').get(plotCode));
}

export function listReadings({ plotCode, limit = 96 } = {}, db = getDb()) {
  ensurePlatformSeeded(db);

  if (plotCode) {
    const plot = assertKnownPlot(db, plotCode);
    return db
      .prepare('SELECT * FROM field_readings WHERE plot_id = ? ORDER BY recorded_at DESC LIMIT ?')
      .all(plot.id, Number(limit))
      .map(rowToReading);
  }

  return db
    .prepare('SELECT * FROM field_readings ORDER BY recorded_at DESC LIMIT ?')
    .all(Number(limit))
    .map(rowToReading);
}

export function createReading(payload, source = 'api', db = getDb()) {
  ensurePlatformSeeded(db);
  const reading = normalizeReadingPayload(payload);

  const transaction = db.transaction(() => {
    let plot = reading.plotCode ? db.prepare('SELECT * FROM field_plots WHERE plot_code = ?').get(reading.plotCode) : null;
    let node = db.prepare('SELECT * FROM field_nodes WHERE node_code = ?').get(reading.nodeCode);

    if (!plot && node?.plot_id) {
      plot = db.prepare('SELECT * FROM field_plots WHERE id = ?').get(node.plot_id);
    }

    if (!plot) {
      throw new Error('plotCode is required for a new IoT reading');
    }

    if (!node) {
      node = ensureNodeForReading(db, reading, plot.id);
    }

    db.prepare(`
      INSERT INTO field_readings (
        plot_id, node_id, recorded_at, water_level_cm, soil_tension_kpa,
        air_temperature_c, air_humidity_percent, co2_ppm, par_umol_m2_s,
        light_klx, wind_speed_mps, rainfall_mm, canopy_temperature_c,
        water_temperature_c, soil_temperature_c, soil_ec_ms_cm, soil_ph,
        uv_a, uv_b, uv_c, latitude, longitude, altitude_m, battery_v,
        lora_rssi, valve_open_count, valve_total_count, raw_json, created_at
      )
      VALUES (
        @plotId, @nodeId, @recordedAt, @waterLevelCm, @soilTensionKpa,
        @airTemperatureC, @airHumidityPercent, @co2Ppm, @parUmolM2S,
        @lightKlx, @windSpeedMps, @rainfallMm, @canopyTemperatureC,
        @waterTemperatureC, @soilTemperatureC, @soilEcMsCm, @soilPh,
        @uvA, @uvB, @uvC, @latitude, @longitude, @altitudeM, @batteryV,
        @loraRssi, @valveOpenCount, @valveTotalCount, @rawJson, @createdAt
      )
      ON CONFLICT(plot_id, recorded_at) DO UPDATE SET
        node_id = excluded.node_id,
        water_level_cm = COALESCE(excluded.water_level_cm, field_readings.water_level_cm),
        soil_tension_kpa = COALESCE(excluded.soil_tension_kpa, field_readings.soil_tension_kpa),
        air_temperature_c = COALESCE(excluded.air_temperature_c, field_readings.air_temperature_c),
        air_humidity_percent = COALESCE(excluded.air_humidity_percent, field_readings.air_humidity_percent),
        co2_ppm = COALESCE(excluded.co2_ppm, field_readings.co2_ppm),
        par_umol_m2_s = COALESCE(excluded.par_umol_m2_s, field_readings.par_umol_m2_s),
        light_klx = COALESCE(excluded.light_klx, field_readings.light_klx),
        wind_speed_mps = COALESCE(excluded.wind_speed_mps, field_readings.wind_speed_mps),
        rainfall_mm = COALESCE(excluded.rainfall_mm, field_readings.rainfall_mm),
        canopy_temperature_c = COALESCE(excluded.canopy_temperature_c, field_readings.canopy_temperature_c),
        water_temperature_c = COALESCE(excluded.water_temperature_c, field_readings.water_temperature_c),
        soil_temperature_c = COALESCE(excluded.soil_temperature_c, field_readings.soil_temperature_c),
        soil_ec_ms_cm = COALESCE(excluded.soil_ec_ms_cm, field_readings.soil_ec_ms_cm),
        soil_ph = COALESCE(excluded.soil_ph, field_readings.soil_ph),
        uv_a = COALESCE(excluded.uv_a, field_readings.uv_a),
        uv_b = COALESCE(excluded.uv_b, field_readings.uv_b),
        uv_c = COALESCE(excluded.uv_c, field_readings.uv_c),
        latitude = COALESCE(excluded.latitude, field_readings.latitude),
        longitude = COALESCE(excluded.longitude, field_readings.longitude),
        altitude_m = COALESCE(excluded.altitude_m, field_readings.altitude_m),
        battery_v = COALESCE(excluded.battery_v, field_readings.battery_v),
        lora_rssi = COALESCE(excluded.lora_rssi, field_readings.lora_rssi),
        valve_open_count = COALESCE(excluded.valve_open_count, field_readings.valve_open_count),
        valve_total_count = COALESCE(excluded.valve_total_count, field_readings.valve_total_count),
        raw_json = excluded.raw_json
    `).run({
      ...reading,
      plotId: plot.id,
      nodeId: node.id,
      rawJson: json(reading.raw),
      createdAt: nowIso(),
    });

    db.prepare(`
      UPDATE field_plots
      SET
        online = 1,
        water_level_cm = COALESCE(@waterLevelCm, water_level_cm),
        soil_tension_kpa = COALESCE(@soilTensionKpa, soil_tension_kpa),
        battery_v = COALESCE(@batteryV, battery_v),
        lora_rssi = COALESCE(@loraRssi, lora_rssi),
        last_reported_at = @recordedAt,
        updated_at = @updatedAt
      WHERE id = @plotId
    `).run({ ...reading, plotId: plot.id, updatedAt: nowIso() });

    db.prepare(`
      UPDATE field_nodes
      SET
        status = 'online',
        battery_v = COALESCE(@batteryV, battery_v),
        lora_rssi = COALESCE(@loraRssi, lora_rssi),
        last_heartbeat_at = @recordedAt,
        updated_at = @updatedAt
      WHERE id = @nodeId
    `).run({ ...reading, nodeId: node.id, updatedAt: nowIso() });

    const stored = db
      .prepare('SELECT * FROM field_readings WHERE plot_id = ? AND recorded_at = ?')
      .get(plot.id, reading.recordedAt);

    insertSyncEvent(db, {
      entityType: 'reading',
      entityId: `${plot.plot_code}:${reading.recordedAt}`,
      action: 'ingest',
      payload: { plotCode: plot.plot_code, nodeCode: reading.nodeCode },
      source,
    });

    return rowToReading(stored);
  });

  return transaction();
}

export function listFieldAlerts(filters = {}, db = getDb()) {
  ensurePlatformSeeded(db);
  const clauses = ['1 = 1'];
  const params = {};

  if (filters.status) {
    clauses.push('a.status = @status');
    params.status = filters.status;
  }

  if (filters.category) {
    clauses.push('a.category = @category');
    params.category = filters.category;
  }

  return db
    .prepare(`
      SELECT a.*, p.plot_code, p.treatment_code, p.variety_code, p.repeat_no
      FROM field_alerts a
      LEFT JOIN field_plots p ON p.id = a.plot_id
      WHERE ${clauses.join(' AND ')}
      ORDER BY a.occurred_at DESC
    `)
    .all(params)
    .map(rowToAlert);
}

export function updateFieldAlertStatus(alertCode, { status, actorUserId = null, note = null }, db = getDb()) {
  ensurePlatformSeeded(db);
  const alert = db.prepare('SELECT * FROM field_alerts WHERE alert_code = ? OR id = ?').get(alertCode, Number(alertCode) || -1);
  if (!alert) {
    throw new Error(`field alert not found: ${alertCode}`);
  }

  db.prepare(`
    UPDATE field_alerts
    SET status = ?, handled_at = ?, handled_by_user_id = ?, handling_note = ?, updated_at = ?
    WHERE id = ?
  `).run(status, nowIso(), actorUserId, note, nowIso(), alert.id);

  insertSyncEvent(db, {
    entityType: 'alert',
    entityId: alert.alert_code,
    action: 'update',
    payload: { status, note },
    actorUserId,
  });

  return listFieldAlerts({}, db).find((item) => item.id === alert.id);
}

export function listGateways(db = getDb()) {
  ensurePlatformSeeded(db);
  return db.prepare('SELECT * FROM field_gateways ORDER BY gateway_code').all().map(rowToGateway);
}

export function listNodes(db = getDb()) {
  ensurePlatformSeeded(db);
  return db
    .prepare(`
      SELECT n.*, p.plot_code, g.gateway_code
      FROM field_nodes n
      LEFT JOIN field_plots p ON p.id = n.plot_id
      LEFT JOIN field_gateways g ON g.id = n.gateway_id
      ORDER BY n.node_code
    `)
    .all()
    .map(rowToNode);
}

export function listTasks(db = getDb()) {
  ensurePlatformSeeded(db);
  return db.prepare('SELECT * FROM field_tasks ORDER BY scheduled_at DESC').all().map(rowToTask);
}

export function listSamples(db = getDb()) {
  ensurePlatformSeeded(db);
  return db
    .prepare(`
      SELECT s.*, p.plot_code
      FROM field_samples s
      LEFT JOIN field_plots p ON p.id = s.plot_id
      ORDER BY s.sample_code
    `)
    .all()
    .map(rowToSample);
}

export function upsertSample(payload, actorUserId = null, db = getDb()) {
  ensurePlatformSeeded(db);
  const plot = payload.plotCode ? assertKnownPlot(db, payload.plotCode) : null;
  const sampleCode = payload.sampleCode ?? payload.sample_code;
  if (!sampleCode) {
    throw new Error('sampleCode is required');
  }

  db.prepare(`
    INSERT INTO field_samples (
      experiment_id, plot_id, sample_code, sample_type, event_label, collected_at,
      analysis_status, lab_fill_status, result_json, note, created_at, updated_at
    )
    VALUES (
      @experimentId, @plotId, @sampleCode, @sampleType, @eventLabel, @collectedAt,
      @analysisStatus, @labFillStatus, @resultJson, @note, @createdAt, @updatedAt
    )
    ON CONFLICT(sample_code) DO UPDATE SET
      plot_id = excluded.plot_id,
      sample_type = excluded.sample_type,
      event_label = excluded.event_label,
      collected_at = excluded.collected_at,
      analysis_status = excluded.analysis_status,
      lab_fill_status = excluded.lab_fill_status,
      result_json = excluded.result_json,
      note = excluded.note,
      updated_at = excluded.updated_at
  `).run({
    experimentId: EXPERIMENT_ID,
    plotId: plot?.id ?? null,
    sampleCode,
    sampleType: payload.sampleType ?? payload.sample_type ?? '未分类样品',
    eventLabel: payload.eventLabel ?? payload.event_label ?? null,
    collectedAt: payload.collectedAt ?? payload.collected_at ?? null,
    analysisStatus: payload.analysisStatus ?? payload.analysis_status ?? '待采集',
    labFillStatus: payload.labFillStatus ?? payload.lab_fill_status ?? '待回填',
    resultJson: json(payload.result ?? payload.result_json ?? {}),
    note: payload.note ?? null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });

  insertSyncEvent(db, { entityType: 'sample', entityId: sampleCode, action: 'update', payload, actorUserId });
  return listSamples(db).find((sample) => sample.sampleCode === sampleCode);
}

export function listStageEvents(eventType = null, db = getDb()) {
  ensurePlatformSeeded(db);
  const rows = eventType
    ? db.prepare('SELECT * FROM field_stage_events WHERE event_type = ? ORDER BY sort_order').all(eventType)
    : db.prepare('SELECT * FROM field_stage_events ORDER BY event_type, sort_order').all();

  return rows.map(rowToStageEvent);
}

export function listRules(db = getDb()) {
  ensurePlatformSeeded(db);
  return db.prepare('SELECT * FROM field_rules ORDER BY category, code').all().map(rowToRule);
}

export function updateRule(code, patch, actorUserId = null, db = getDb()) {
  ensurePlatformSeeded(db);
  const rule = db.prepare('SELECT * FROM field_rules WHERE code = ?').get(code);
  if (!rule) {
    throw new Error(`field rule not found: ${code}`);
  }

  const fieldMap = {
    category: 'category',
    name: 'name',
    description: 'description',
    metricKey: 'metric_key',
    comparisonOperator: 'comparison_operator',
    thresholdValue: 'threshold_value',
    thresholdText: 'threshold_text',
    unit: 'unit',
    durationMinutes: 'duration_minutes',
    actionMode: 'action_mode',
    enabled: 'enabled',
  };

  const updates = [];
  const params = { code, actorUserId, updatedAt: nowIso() };

  Object.entries(fieldMap).forEach(([inputKey, column]) => {
    if (Object.prototype.hasOwnProperty.call(patch, inputKey)) {
      updates.push(`${column} = @${inputKey}`);
      params[inputKey] = column === 'enabled' ? toFlag(patch[inputKey]) : patch[inputKey];
    }
  });

  if (updates.length > 0) {
    updates.push('updated_by_user_id = @actorUserId');
    updates.push('updated_at = @updatedAt');
    db.prepare(`UPDATE field_rules SET ${updates.join(', ')} WHERE code = @code`).run(params);
    insertSyncEvent(db, { entityType: 'rule', entityId: code, action: 'update', payload: patch, actorUserId });
  }

  return rowToRule(db.prepare('SELECT * FROM field_rules WHERE code = ?').get(code));
}

export function getSyncChanges(since = null, db = getDb()) {
  ensurePlatformSeeded(db);
  const rows = since
    ? db.prepare('SELECT * FROM field_sync_events WHERE occurred_at > ? ORDER BY occurred_at ASC').all(since)
    : db.prepare('SELECT * FROM field_sync_events ORDER BY occurred_at DESC LIMIT 100').all();

  return rows.map((row) => ({
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    action: row.action,
    payload: parseJson(row.payload_json, {}),
    source: row.source,
    actorUserId: row.actor_user_id,
    occurredAt: row.occurred_at,
  }));
}

export function applySyncBatch(operations = [], actorUserId = null, db = getDb()) {
  ensurePlatformSeeded(db);

  const transaction = db.transaction(() =>
    operations.map((operation) => {
      const entityType = operation.entityType ?? operation.entity_type;
      const payload = operation.payload ?? {};
      const key = operation.key ?? operation.entityId ?? operation.entity_id;

      if (entityType === 'plot') {
        return { entityType, item: updatePlot(key ?? payload.plotCode, payload, actorUserId, db) };
      }

      if (entityType === 'alert') {
        return { entityType, item: updateFieldAlertStatus(key ?? payload.alertCode, payload, actorUserId, db) };
      }

      if (entityType === 'sample') {
        return { entityType, item: upsertSample(payload, actorUserId, db) };
      }

      if (entityType === 'rule') {
        return { entityType, item: updateRule(key ?? payload.code, payload, actorUserId, db) };
      }

      if (entityType === 'reading') {
        return { entityType, item: createReading(payload, 'sync', db) };
      }

      throw new Error(`unsupported sync entity type: ${entityType}`);
    }),
  );

  return transaction();
}

function buildTreatmentGroups(treatments, plots) {
  return treatments.map((treatment) => ({
    code: treatment.code,
    label: treatment.name,
    description: treatment.description,
    tone: treatment.colorKey,
    plots: plots.filter((plot) => plot.treatment === treatment.code),
  }));
}

function buildLiveMetrics() {
  return [
    { label: '田面水位', metricKey: 'water_level_cm', value: '-1.8', unit: 'cm', status: '正常' },
    { label: '土壤张力', metricKey: 'soil_tension_kpa', value: '-32', unit: 'kPa', status: '预警' },
    { label: '空气温度', metricKey: 'air_temperature_c', value: '29.6', unit: '°C', status: '正常' },
    { label: '空气湿度', metricKey: 'air_humidity_percent', value: '78', unit: '%', status: '正常' },
    { label: 'CO₂', metricKey: 'co2_ppm', value: '512', unit: 'ppm', status: '正常' },
    { label: 'PAR', metricKey: 'par_umol_m2_s', value: '1368', unit: 'μmol·m⁻²·s⁻¹', status: '正常' },
    { label: '光照', metricKey: 'light_klx', value: '74.2', unit: 'klx', status: '正常' },
    { label: '风速', metricKey: 'wind_speed_mps', value: '1.8', unit: 'm/s', status: '正常' },
    { label: '降雨', metricKey: 'rainfall_mm', value: '3.2', unit: 'mm', status: '正常' },
    { label: '冠层温度', metricKey: 'canopy_temperature_c', value: '31.3', unit: '°C', status: '预警' },
    { label: '水温', metricKey: 'water_temperature_c', value: '26.1', unit: '°C', status: '正常' },
    { label: '地温', metricKey: 'soil_temperature_c', value: '27.4', unit: '°C', status: '正常' },
    { label: '土壤 EC', metricKey: 'soil_ec_ms_cm', value: '1.42', unit: 'mS/cm', status: '正常' },
    { label: '土壤 pH', metricKey: 'soil_ph', value: '6.48', unit: '', status: '正常' },
    { label: '电池电压', metricKey: 'battery_v', value: '4.06', unit: 'V', status: '正常' },
    { label: 'LoRa 信号', metricKey: 'lora_rssi', value: '-91', unit: 'dBm', status: '预警' },
    { label: '电磁阀状态', metricKey: 'valve_state', value: '5 / 8 开启', unit: '', status: '正常' },
  ];
}

export function getPlatformDashboard(db = getDb()) {
  ensurePlatformSeeded(db);

  const experiment = getCurrentExperiment(db);
  const treatments = listTreatments(db);
  const plots = listPlots({}, db);
  const alerts = listFieldAlerts({ status: '未处理' }, db);
  const tasks = listTasks(db);
  const gateways = listGateways(db);
  const nodes = listNodes(db);
  const fullSeasonTimeline = listStageEvents('full_season', db);
  const keyWindowTimeline = listStageEvents('key_window', db);

  const onlinePlots = plots.filter((plot) => plot.online).length;
  const onlineNodes = nodes.filter((node) => node.status !== 'offline').length;
  const highRiskPlots = new Set(alerts.filter((alert) => ['高', '严重'].includes(alert.level)).map((alert) => alert.plotCode)).size;

  return {
    experiment,
    kpis: [
      { key: 'plots', label: '当前在线小区数', value: `${onlinePlots} / ${plots.length}`, detail: `${plots.length - onlinePlots} 个小区待恢复链路` },
      { key: 'devices', label: '在线设备数', value: onlineNodes, detail: `LoRa 节点 ${nodes.length} / 网关 ${gateways.length}` },
      { key: 'reports', label: '今日有效上报次数', value: db.prepare('SELECT COUNT(*) AS value FROM field_readings').get().value, detail: '来自 AgriNexus 读数表' },
      { key: 'alerts', label: '当前未处理报警数', value: alerts.length, detail: '科研报警与设备报警合并统计' },
      { key: 'risks', label: '当前高风险小区数', value: highRiskPlots, detail: '按高等级未处理报警聚合' },
      { key: 'phase', label: '当前生育阶段', value: experiment.currentStageLabel, detail: experiment.currentWindowLabel ?? '未进入关键窗口' },
    ],
    liveMetrics: buildLiveMetrics(),
    treatmentGroups: buildTreatmentGroups(treatments, plots),
    alerts,
    decisions: tasks.map((task) => ({
      id: task.taskCode,
      title: task.title,
      plotScope: task.plotScope,
      status: task.status,
      summary: task.note,
    })),
    fullSeasonTimeline,
    keyWindowTimeline,
  };
}
