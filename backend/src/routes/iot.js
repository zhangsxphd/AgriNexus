import { createReading } from '../repositories/platformRepository.js';
import { handleRepositoryError } from './route-utils.js';

export async function iotRoutes(app) {
  app.post('/ingest', async (request, reply) => {
    try {
      const item = createReading(request.body ?? {}, 'iot');
      return {
        accepted: true,
        item,
      };
    } catch (error) {
      if (error.message.includes('plotCode is required')) {
        reply.code(400).send({ message: error.message });
        return;
      }

      if (!handleRepositoryError(reply, error)) {
        throw error;
      }
    }
  });

  app.post('/heartbeat', async (request, reply) => {
    try {
      const item = createReading(
        {
          ...request.body,
          metrics: {
            batteryV: request.body?.batteryV ?? request.body?.battery_v,
            loraRssi: request.body?.loraRssi ?? request.body?.lora_rssi,
          },
        },
        'iot-heartbeat',
      );

      return {
        accepted: true,
        item,
      };
    } catch (error) {
      if (error.message.includes('plotCode is required')) {
        reply.code(400).send({ message: error.message });
        return;
      }

      if (!handleRepositoryError(reply, error)) {
        throw error;
      }
    }
  });
}
