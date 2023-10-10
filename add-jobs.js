require('dotenv').config();
const BullQueue = require('bull');

const queue = new BullQueue('Mongo', {
  redis: process.env.REDIS_URL,
});

const orders = [
'4353a438-1ed9-4bc7-b444-0b6a95b66418',
'1610b1d4-7d44-4e61-9863-f942ceb12a61',
'a8584a25-5438-4de4-9f6f-ab73d036a0d0'


];

const JOB_NAME = 'SaveOlimpiaDocuments'

const DATA_KEY = 'orderId';

async function bootstrap() {
  console.log('starting process');
  const jobs = await queue.addBulk(
    orders.map(orderId => ({ name: JOB_NAME, data: { [DATA_KEY]:orderId }, opts: {removeOnComplete: true} }))
  );

  console.log('desired tasks:', orders.length);
  console.log('total added jobs:', jobs.length);
  console.log(
    'added jobs:',
    jobs.map(j => ({ id: j.id, orderId: j.data.orderId }))
  );
  process.exit();
}
bootstrap();
