import Fastify from 'fastify';
import cors from '@fastify/cors';
import { initializeDatabase } from './database/init.js';
import { alertRoutes } from './routes/alerts.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { decisionRoutes } from './routes/decisions.js';
import { greenhouseRoutes } from './routes/greenhouses.js';
import { settingsRoutes } from './routes/settings.js';
import { userRoutes } from './routes/users.js';

export async function buildApp() {
  const app = Fastify({
    logger: true,
    bodyLimit: 1_048_576, // 1 MB — 防止大 payload 攻击
  });

  initializeDatabase();

  // CORS：生产环境通过 CORS_ORIGIN 环境变量限制来源，开发环境允许本地访问
  const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
    : ['http://127.0.0.1:5173', 'http://localhost:5173', 'http://127.0.0.1:5174', 'http://localhost:5174'];

  await app.register(cors, {
    origin: corsOrigin,
  });

  // 统一错误处理 — 减少路由中的重复 try/catch
  app.setErrorHandler((error, request, reply) => {
    if (error.message.includes('not found')) {
      return reply.code(404).send({ message: error.message });
    }

    if (error.message.includes('UNIQUE constraint failed')) {
      return reply.code(409).send({ message: '记录已存在，请检查名称或编码是否重复' });
    }

    request.log.error(error);
    reply.code(500).send({ message: '服务内部错误，请稍后重试' });
  });

  // 安全响应头
  app.addHook('onSend', async (request, reply) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-XSS-Protection', '1; mode=block');
  });

  app.get('/health', async () => ({
    status: 'ok',
    service: 'smart-agri-backend',
  }));

  await app.register(dashboardRoutes, { prefix: '/api/dashboard' });
  await app.register(greenhouseRoutes, { prefix: '/api/greenhouses' });
  await app.register(alertRoutes, { prefix: '/api/alerts' });
  await app.register(decisionRoutes, { prefix: '/api/decisions' });
  await app.register(userRoutes, { prefix: '/api/users' });
  await app.register(settingsRoutes, { prefix: '/api/settings' });

  return app;
}
