import {
  applySyncBatch,
  getCurrentExperiment,
  getPlatformDashboard,
  getPlotDetail,
  getSyncChanges,
  listFieldAlerts,
  listGateways,
  listNodes,
  listPlots,
  listReadings,
  listRules,
  listSamples,
  listStageEvents,
  listTasks,
  listTreatments,
  updateFieldAlertStatus,
  updatePlot,
  updateRule,
  upsertSample,
} from '../repositories/platformRepository.js';
import { asNumber, handleRepositoryError } from './route-utils.js';

function getActorUserId(request) {
  return asNumber(request.body?.actorUserId ?? request.headers['x-actor-user-id']);
}

export async function platformRoutes(app) {
  app.get('/dashboard', async () => getPlatformDashboard());

  app.get('/experiment', async () => ({ item: getCurrentExperiment() }));

  app.get('/treatments', async () => ({ items: listTreatments() }));

  app.get('/plots', async (request) => ({
    items: listPlots({
      treatment: request.query?.treatment,
      variety: request.query?.variety,
      status: request.query?.status,
    }),
  }));

  app.get('/plots/:plotCode', async (request, reply) => {
    try {
      return getPlotDetail(request.params.plotCode);
    } catch (error) {
      if (!handleRepositoryError(reply, error)) {
        throw error;
      }
    }
  });

  app.patch('/plots/:plotCode', async (request, reply) => {
    try {
      return { item: updatePlot(request.params.plotCode, request.body ?? {}, getActorUserId(request)) };
    } catch (error) {
      if (!handleRepositoryError(reply, error)) {
        throw error;
      }
    }
  });

  app.get('/readings', async (request) => ({
    items: listReadings({
      plotCode: request.query?.plotCode,
      limit: asNumber(request.query?.limit) ?? 96,
    }),
  }));

  app.get('/alerts', async (request) => ({
    items: listFieldAlerts({
      status: request.query?.status,
      category: request.query?.category,
    }),
  }));

  app.patch('/alerts/:alertCode', async (request, reply) => {
    const status = request.body?.status;
    if (!['未处理', '已处理', '已忽略'].includes(status)) {
      reply.code(400).send({ message: 'status must be one of 未处理, 已处理, 已忽略' });
      return;
    }

    try {
      return {
        item: updateFieldAlertStatus(request.params.alertCode, {
          status,
          actorUserId: getActorUserId(request),
          note: request.body?.note ?? null,
        }),
      };
    } catch (error) {
      if (!handleRepositoryError(reply, error)) {
        throw error;
      }
    }
  });

  app.get('/devices/gateways', async () => ({ items: listGateways() }));

  app.get('/devices/nodes', async () => ({ items: listNodes() }));

  app.get('/tasks', async () => ({ items: listTasks() }));

  app.get('/samples', async () => ({ items: listSamples() }));

  app.post('/samples', async (request, reply) => {
    try {
      return { item: upsertSample(request.body ?? {}, getActorUserId(request)) };
    } catch (error) {
      if (!handleRepositoryError(reply, error)) {
        throw error;
      }
    }
  });

  app.get('/timeline', async (request) => ({
    items: listStageEvents(request.query?.type ?? null),
  }));

  app.get('/rules', async () => ({ items: listRules() }));

  app.patch('/rules/:code', async (request, reply) => {
    try {
      return { item: updateRule(request.params.code, request.body ?? {}, getActorUserId(request)) };
    } catch (error) {
      if (!handleRepositoryError(reply, error)) {
        throw error;
      }
    }
  });

  app.get('/sync/changes', async (request) => ({
    items: getSyncChanges(request.query?.since ?? null),
  }));

  app.post('/sync/batch', async (request, reply) => {
    const operations = request.body?.operations;
    if (!Array.isArray(operations)) {
      reply.code(400).send({ message: 'operations must be an array' });
      return;
    }

    try {
      return { items: applySyncBatch(operations, getActorUserId(request)) };
    } catch (error) {
      if (!handleRepositoryError(reply, error)) {
        throw error;
      }
    }
  });
}
