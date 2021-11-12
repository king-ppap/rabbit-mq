var amqp = require('amqplib/callback_api');

connectMQ();

function connectMQ() {
  amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
      console.warn(`${new Date().toISOString()}: retry connect in 3 sec`);
      setTimeout(connectMQ, 3000);
      return error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      var queue = 'rpc_queue';

      channel.assertQueue(queue, {
        durable: false
      });
      channel.prefetch(1);
      console.log(' [x] Awaiting RPC requests');
      channel.consume(queue, function reply(msg) {
        var n = parseInt(msg.content.toString());

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
    });
  });
}

function fibonacci(n) {
  if (n == 0 || n == 1)
    return n;
  else
    return fibonacci(n - 1) + fibonacci(n - 2);
}
