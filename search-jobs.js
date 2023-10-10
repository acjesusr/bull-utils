require('dotenv').config();
const fs = require('fs');
const BullQueue = require('bull');

const queue = new BullQueue('SmsQueueJob', {
  redis: process.env.REDIS_URL,
});

const ORDER_SET = new Set([
// 'f83325a0-e3f6-4d11-ae19-48ff32d7f613',
// 'cc4aab08-50c0-4a7f-a001-3c3e2d23b520',
  // '26bcc39d-bcaa-4472-92b5-54ec6a2e4abc',
'8c1e443d-c9a8-42e6-b90a-c108b374fc05',
'e4a76fe4-86a8-401d-b7d2-ca3697594886',
'86a14c55-8a23-4e27-a776-5e55a7ffcbd0',
'73121019-e307-4e02-8c06-63b8ff3c5f64',
'25f34a21-d5c7-4755-927b-bcd4d01c7cca',
'58ea5656-d9f2-41aa-b3b1-e678659afaf0',

]);

const JOB_SET = new Set([
  // 'RequestGisAddress',

  // 'SendSaleDocuments',
  // 'SendClientDocuments',
  // 'SaveOlimpiaDocuments',
  // 'SaveDocument',
  'SendSaleDocuments',

  // 'SaveOrder',
  // 'SaveGisAddress',
  // 'SaveResidentialQuotation',
  // 'SaveCommercialQuotation',
  // 'SaveClient',
]);

const DATA_KEY = 'orderId';

const JOB_STATUS = ['failed'];

async function bootstrap() {
  console.log('starting search');
  const totalJobs = await queue.getJobCountByTypes(JOB_STATUS);

  const jobs = await queue.getJobs(JOB_STATUS);

  const foundJobs = await Promise.all(
    jobs
      .filter(j => j && ORDER_SET.has(j.data[DATA_KEY]))
      .filter(j => j && JOB_SET.has(j.name))
      .map(async j => ({
        id: j.id,
        orderId: j.data[DATA_KEY],
        task: j.name,
        status: await j.getState(),
        messages: await queue.getJobLogs(j.id),
        error: j.stacktrace[j.stacktrace.length - 1],
      }))
    // .map(j => j.data[DATA_KEY])
  );

  console.log('orders', ORDER_SET.size);
  console.log('jobs found', foundJobs.length);
  console.log('total jobs', totalJobs);
  console.log(foundJobs);
  // fs.writeFileSync(
  //   'jobs_found.json',
  //   JSON.stringify(
  //     foundJobs
  //   )
  // );

  process.exit();
}
bootstrap();
