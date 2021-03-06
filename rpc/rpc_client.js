const amqp = require('amqplib');

const args = process.argv.slice(2);

if (args.length == 0) {
  console.log("Usage: rpc_client.js num");
  process.exit(1);
}

connectMQ();

async function connectMQ() {
  let connection;
  let channel;
  try {
    connection = await amqp.connect('amqp://localhost')
  } catch (error) {
    console.warn(`${new Date().toISOString()}: Error: retry connect in 3 sec`);
    setTimeout(connectMQ, 3000);
    return error;
  }

  try {
    channel = await connection.createChannel();
  } catch (error) {
    console.warn(`${new Date().toISOString()}: Error: createChannel retry in 3 sec`);
    setTimeout(connectMQ, 3000);
    return error;
  }

  // Generate new queue name like "amq.gen-gWL..."
  // const q = await channel.assertQueue('', { exclusive: true });

  // const correlationId = generateUuid();
  const num = parseInt(args[0]);

  // console.log(` [x] Requesting fib(${num}) correlationId=[${correlationId.slice(0, 8)}...] reply_to=[${q.queue}]`);

  // await channel.consume(q.queue, function (msg) {
  //   if (msg.properties.correlationId == correlationId) {
  //     console.log(' [>] Got %s', msg.content.toString());
  //     setTimeout(function () {
  //       connection.close();
  //       process.exit(0)
  //     }, 500);
  //   }
  // }, {
  //   noAck: true
  // });

  for (let i = 0; i < 10; i++) {
    console.log(i);
    channel.sendToQueue('rpc_queue',
      Buffer.from(num.toString()), {
      expiration: 1000,
      // correlationId: correlationId,
      // replyTo: q.queue
    });
  }
  setTimeout(() => {
    connection.close();
    process.exit(0)
  }, 500);
}

function generateUuid() {
  return Math.random().toString() +
    Math.random().toString() +
    Math.random().toString();
}
