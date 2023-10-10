require('dotenv').config();
const BullQueue = require('bull');

const queue = new BullQueue('PeriodicJobs', {
  redis: process.env.REDIS_URL,
});

const JOB_SET = new Set([
  'SaveOrder',
]);

const DATA_KEY = 'orderId';

const JOB_STATUS = ['failed'];

async function bootstrap() {
  console.log('starting search');
  const jobs = await queue.getRepeatableJobs();

  const job = jobs.find(j => j.name === 'CheckMongoDocuments');
  console.log(job);

  await queue.removeRepeatable(job.name, {cron: job.cron});

  process.exit();
}
bootstrap();
