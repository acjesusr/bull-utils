require('dotenv').config();
const BullQueue = require('bull');
const fs = require('fs');

const queue = new BullQueue('Osf', {
  redis: process.env.REDIS_URL,
});

const orderSet = new Set([
  '3edf407a-7409-44ec-a03d-e005bab2b669',
  'b22ec22a-cf96-4106-8422-3378813e62b0',
]);

const jobSet = new Set([
  // 'SaveOrder',
  'SaveGisAddress',
  'SaveResidentialQuotation',
  'SaveCommercialQuotation',
  'SaveClient',
  'SaveDocument',
  'SaveEvidence',
  'ReceiveGisAddressResponse'
]);

const DATA_KEY = '_id';

const jobStatus = ['failed'];

async function promiseAllInBatches(task, items, batchSize) {
  let position = 0;
  let results = [];
  while (position < items.length) {
    const itemsForBatch = items.slice(position, position + batchSize);
    results = [
      ...results,
      ...(await Promise.all(itemsForBatch.map(item => task(item)))),
    ];
    position += batchSize;
  }
  return results;
}

async function bootstrap() {
  console.log('starting search');
  let hasNext = true;
  let index = 0;
  let removedJobs = 0;

  process.stdout.write('\n');
  process.stdout.cursorTo(0, process.stdout.rows - 2);
  while (hasNext) {
    process.stdout.cursorTo(0);
    const jobs = await queue.getJobs(jobStatus, index, index + 5000);
    const removals =  (await Promise.all(
      jobs.filter(j => j && jobSet.has(j.name)).map(j => j.remove())
    )).length;

    index += jobs.length - removals;
    removedJobs += removals;
    hasNext = removals !== 0;
    process.stdout.write(`removals: ${removedJobs}; hasNext: ${hasNext}`);
  }

  // console.log('orders', orderSet.size);
  console.log('jobs removed', removedJobs);
  console.log('total jobs', index + removedJobs);
  process.exit();
}
bootstrap();
