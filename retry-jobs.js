require('dotenv').config();
const fs = require('fs');
const BullQueue = require('bull');

const queue = new BullQueue('Osf', {
  redis: process.env.REDIS_URL,
});

const ORDER_SET = new Set(['6db3a04d-0e03-4292-9a85-fb45ca35698e',
  'a2c40460-3703-447c-bf01-636e19783aab',
  'f1d872fb-9f1c-40d7-a745-2d7cfd4a084c',
  'a3f58799-765c-4189-9db7-6450be3b9585',
  '868be582-ffbd-4c06-9e8e-6aa7c5f7f161',
  'df782132-a2ce-4321-8672-3d012546d2ce',
  '16a299ce-ee91-40db-8bb9-0894963ac4f0',
  'c1a7cea7-65f1-49fa-914d-2f2d22bbf6fb',
  'd9fa2904-134d-4491-a197-5fa43aeb5866',
  '569e364a-b12a-40b5-890f-52eafec2757e',
  '720d0da9-b387-4cc2-8a1f-a09ab8e70ac4',
  '48346a5e-710f-48c0-a1eb-772ca51637b4',
  '3c188a6f-aede-46a1-8e55-b77e726f05f0',
  '2b6008ad-47f6-4523-8298-6cafefdeb0cf',
  'ef41e055-42d2-45ec-a86e-99041df183de',
  '7aa635bc-11b3-42ba-961c-0bdcb06c69a8',
  '00861df8-64ab-42f6-9a00-6eabed8318e9',
  '08fa69cd-3d8e-4890-84a3-96abc8cab434',
  '2e132f93-3545-4a5a-a967-5725d1bf5190'
]);

const JOB_SET = new Set([
  'RequestGisAddress',

  'SendSaleDocuments',
  'SendClientDocuments',
  'SaveOlimpiaDocuments',

  'SaveOrder',
  'SaveGisAddress',
  'SaveResidentialQuotation',
  'SaveCommercialQuotation',
  'SaveClient',
]);

const DATA_KEY = '_id';

const JOB_STATUS = ['failed'];

async function bootstrap() {
  console.log('starting process');
  const totalJobs = await queue.getJobCountByTypes(JOB_STATUS);

  const jobs = await queue.getJobs(JOB_STATUS);

  const foundJobs = await Promise.all(
    jobs
      .filter(j => j && ORDER_SET.has(j.data[DATA_KEY]))
      .filter(j => j && JOB_SET.has(j.name))
      .map(async j => {
        await j.retry();

        return {
          id: j.id,
          orderId: j.data[DATA_KEY],
          task: j.name,
        };
      })
  );

  console.log('orders', ORDER_SET.size);
  console.log('jobs found', foundJobs.length);
  console.log('total jobs', totalJobs);
  console.log(foundJobs);
  console.log(foundJobs.map(j => j.id))

  process.exit();
}
bootstrap();
