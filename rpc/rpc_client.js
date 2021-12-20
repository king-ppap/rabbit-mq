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
    console.warn(`${new Date().toISOString()}: retry connect in 3 sec`);
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

  // Generate new queue name like "amqp.gen-Xa2…"
  channel.assertQueue('', { exclusive: true })
    .then((q) => {
      const correlationId = generateUuid();
      const num = parseInt(args[0]);

      console.log(' [x] Requesting fib(%d)', num);

      channel.consume(q.queue, function (msg) {
        if (msg.properties.correlationId == correlationId) {
          console.log(' [.] Got %s', msg.content.toString());
          setTimeout(function () {
            connection.close();
            process.exit(0)
          }, 500);
        }
      }, {
        noAck: true
      });

      channel.sendToQueue('rpc_queue',
        Buffer.from(num.toString()), {
        correlationId: correlationId,
        replyTo: q.queue
      });
    });
}

function generateUuid() {
  return Math.random().toString() +
    Math.random().toString() +
    Math.random().toString();
}
