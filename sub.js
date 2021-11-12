var q = "q";
function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
// Consumer
function consumer(conn) {
  var ok = conn.createChannel(on_open);
  function on_open(err, ch) {
    if (err != null) bail(err);
    ch.assertQueue(q);
    ch.consume(q, async function (msg) {
      if (msg !== null) {
        await timeout(3000);
        console.log(msg.content.toString());
        ch.ack(msg);
      }
    });
  }
}

require("amqplib/callback_api").connect(
  "amqp://localhost:5672",
  function (err, conn) {
    if (err != null) bail(err);
    consumer(conn);
  }
);
