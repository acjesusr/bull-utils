require('dotenv').config();
const BullQueue = require('bull');
const fs = require('fs')

const queue = new BullQueue('Mongo', {
  redis: process.env.REDIS_URL,
});

const orderSet = new Set([
  // '717d5448-1e52-497a-a354-257f48fe4a95'
  
'332cf4c4-d4d8-499b-a1a2-597f3299593b',
]);

const jobSet = new Set([
  // 'SaveOrder',
  // 'SaveGisAddress',
  // 'SaveResidentialQuotation',
  // 'SaveCommercialQuotation',
  // 'SaveClient',
  // 'SaveDocument',
  // 'SaveEvidence',
'SaveOlimpiaDocuments'
]);

const DATA_KEY = 'orderId';

const jobStatus = ['failed'];

async function bootstrap() {
  console.log('starting search');
  const totalJobs = await queue.getJobCountByTypes(jobStatus);

  const pageSize = 5000;
  const totalPages = Math.ceil(totalJobs / pageSize);
  let pageNumber = 0;
  let index = -1;

  let foundJobs = [];
  process.stdout.write('\n');
  process.stdout.cursorTo(0, process.stdout.rows - 2);
  while (pageNumber <= totalPages) {
    process.stdout.cursorTo(0);
    const jobs = await queue.getJobs(
      jobStatus,
      pageNumber + 1,
      pageNumber + pageSize
    );

    foundJobs.push(
      ...jobs
        .filter(j => jobSet.has(j.name))
        .filter(j => orderSet.has(j.data[DATA_KEY]))
        .map(j => ({ orderId: j.data[DATA_KEY], task: j.name, id: j.id }))
    );

    process.stdout.write(`Page: ${pageNumber}; Index: ${index}`);
    index += pageSize;
    pageNumber++;
  }
  process.stdout.write(`\n`);

  // console.log('orders', orderSet.size);
  console.log('jobs found', foundJobs.length);
  console.log('total jobs', totalJobs);
  fs.writeFileSync('./jobs_found_batch.json', JSON.stringify(foundJobs));
  process.exit();
}
bootstrap();
