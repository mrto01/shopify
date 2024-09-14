import cron from "node-cron"
import {Shipment} from './models/shipment.js';

export const cronTask = async () => {
  let tasks = cron.getTasks();

  for (let task of tasks) {
    task[1].stop();
    await global.scheduledTasks.delete(task[0]);
  }

  cron.schedule('0 */12 * * *', async () => {
    console.log('Running cron job');
    await Shipment.reTrackShipments(30)
  });
};
