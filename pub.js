const amqplib = require("amqplib");

var amqp_url = process.env.CLOUDAMQP_URL || "amqp://localhost:5672";

async function produce() {
  console.log("Publishing");
  var conn = await amqplib.connect(amqp_url, "heartbeat=60");
  var ch = await conn.createChannel();
  var exch = "test_exchange";
  var q = "q";
  var rkey = "test_route";
  var msg = "Hello World!";
  await ch
    .assertExchange(exch, "direct", { durable: true })
    .catch(console.error);
  await ch.assertQueue(q, { durable: true });
  await ch.bindQueue(q, exch, rkey);
  for (let index = 0; index < 10; index++) {
    await ch.publish(exch, rkey, Buffer.from(msg));
  }

  setTimeout(function () {
    ch.close();
    conn.close();
  }, 500);
}
produce();
