/**
 * 共享工具函数 — 供所有 Route 和 Repository 使用
 */

export function nowIso() {
  return new Date().toISOString();
}

export function todayDateString() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function parseJson(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function formatDateTime(value, fallback = '尚未记录') {
  if (!value) {
    return fallback;
  }

  return value.slice(0, 16).replace('T', ' ');
}

export function asNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toFlag(value) {
  return value ? 1 : 0;
}

export function handleRepositoryError(reply, error) {
  if (error.message.includes('not found')) {
    reply.code(404).send({ message: error.message });
    return true;
  }

  if (error.message.includes('UNIQUE constraint failed')) {
    reply.code(409).send({ message: '记录已存在，请检查名称或编码是否重复' });
    return true;
  }

  return false;
}

export function insertActivityLog(db, { userId = null, entityType, entityId = null, action, summary, details = {} }) {
  db.prepare(`
    INSERT INTO activity_logs (user_id, entity_type, entity_id, action, summary, details_json, archived, occurred_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?)
  `).run(userId, entityType, entityId, action, summary, JSON.stringify(details), nowIso());
}
