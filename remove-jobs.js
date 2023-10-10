require('dotenv').config();
const BullQueue = require('bull');

const queue = new BullQueue('Mongo', {
  redis: process.env.REDIS_URL,
});

const ORDER_SET = new Set([
  '3edf407a-7409-44ec-a03d-e005bab2b669',
  'b22ec22a-cf96-4106-8422-3378813e62b0',
  'a6508a17-5adf-4733-9947-0810b9e07270',
  '14e09d4f-a425-4cbe-948a-e5d1a9e41a3c',
  'd30ff683-c5cd-4254-b231-fd8acf578258',
  'e3a88f8a-7ae3-4d60-a030-bd75367ad207',
]);

const JOB_SET = new Set([
  'SaveOrder',
  'SaveGisAddress',
  'SaveResidentialQuotation',
  'SaveCommercialQuotation',
  'SaveClient',
]);

const DATA_KEY = 'orderId';

const JOB_STATUS = ['failed'];

async function bootstrap() {
  console.log('starting search');
  const totalJobs = await queue.getJobCountByTypes(JOB_STATUS);

  const jobs = await queue.getJobs(JOB_STATUS);

  const removedJobs = await Promise.all(
    jobs
      // .filter(j => ORDER_SET.has(j.data[DATA_KEY]))
      .filter(j => j && JOB_SET.has(j.name))
      // .map(async j => ({
      //   orderId: j.data[DATA_KEY],
      //   task: j.name,
      //   status: await j.getState(),
      //   messages: await queue.getJobLogs(j.id),
      //   errors: j.stacktrace,
      // }))
    .map(j => j.remove())
  );

  // console.log('orders', ORDER_SET.size);
  console.log('jobs removed', removedJobs.length);
  console.log('total jobs', totalJobs);
  process.exit();
}
bootstrap();
