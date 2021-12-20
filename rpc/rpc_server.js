const amqp = require('amqplib');

connectMQ();

async function connectMQ() {
  let connection;
  let channel;
  try {
    // const options = {
    //   credentials: amqp.credentials.plain("rabbitMQtest", "rabbitMQTestRabbitMQ")
    // }
    connection = await amqp.connect(
      // 'amqps://b-3ff2d6ff-063c-4ae5-a6d9-1a1f26d2897e.mq.ap-southeast-1.amazonaws.com:5671',
      // options,
      'amqp://localhost',
    );
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

  // Queue name for RPC
  const queue = 'rpc_queue';

  channel.assertQueue(queue, {
    durable: false
  });
  channel.prefetch(1);
  console.log(' [x] Awaiting RPC requests');
  channel.consume(queue, function reply(msg) {
    let n = parseInt(msg.content.toString());

    console.log(" [.] fib(%d)", n);

    let r;
    try {
      r = fibonacci(n);
    } catch (error) {
      r = error
    }

    channel.sendToQueue(msg.properties.replyTo,
      Buffer.from(r.toString()), {
      correlationId: msg.properties.correlationId
    });

    console.log(` [>] fin(${n}) ack ${r} to ${msg.properties.replyTo}`);
    channel.ack(msg);
  });
}

function fibonacci(n) {
  if (n == 0 || n == 1)
    return n;
  else
    return fibonacci(n - 1) + fibonacci(n - 2);
}
