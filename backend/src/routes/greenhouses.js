import {
  createGreenhouse,
  getGreenhouseDetail,
  listGreenhouses,
  updateGreenhouseControl,
} from '../repositories/operationsRepository.js';
import { asNumber, handleRepositoryError } from './route-utils.js';

export async function greenhouseRoutes(app) {
  app.get('/', async () => ({ items: listGreenhouses() }));

  app.get('/:greenhouseId', async (request, reply) => {
    const greenhouseId = asNumber(request.params.greenhouseId);

    if (!greenhouseId) {
      reply.code(400).send({ message: 'greenhouseId is required' });
      return;
    }

    try {
      return { item: getGreenhouseDetail(greenhouseId) };
    } catch (error) {
      if (!handleRepositoryError(reply, error)) {
        throw error;
      }
    }
  });

  app.post('/', async (request, reply) => {
    const actorUserId = asNumber(request.body?.actorUserId);

    if (!actorUserId) {
      reply.code(400).send({ message: 'actorUserId is required' });
      return;
    }

    // 只提取允许的字段，防止注入任意属性
    const { name, crop, area, location } = request.body ?? {};
    const sanitizedBody = {
      actorUserId,
      name: typeof name === 'string' ? name.trim().slice(0, 100) : undefined,
      crop: typeof crop === 'string' ? crop.trim().slice(0, 50) : undefined,
      area: typeof area === 'string' ? area.trim().slice(0, 50) : area,
      location: typeof location === 'string' ? location.trim().slice(0, 200) : undefined,
    };

    try {
      return { item: createGreenhouse(actorUserId, sanitizedBody) };
    } catch (error) {
      if (!handleRepositoryError(reply, error)) {
        throw error;
      }
    }
  });

  app.put('/:greenhouseId/control', async (request, reply) => {
    const greenhouseId = asNumber(request.params.greenhouseId);
    const actorUserId = asNumber(request.body?.actorUserId);
    const controlSettings = request.body?.controlSettings;

    if (!greenhouseId || !actorUserId || !controlSettings) {
      reply.code(400).send({ message: 'greenhouseId, actorUserId and controlSettings are required' });
      return;
    }

    try {
      return { item: updateGreenhouseControl(actorUserId, greenhouseId, controlSettings) };
    } catch (error) {
      if (!handleRepositoryError(reply, error)) {
        throw error;
      }
    }
  });
}
