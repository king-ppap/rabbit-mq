# RabbitMQ RPC
Remote procedure call (RPC)
[(Read more)](https://www.rabbitmq.com/tutorials/tutorial-six-javascript.html)
![RPC protocal](https://www.rabbitmq.com/img/tutorials/python-six.png)
Server calculate Fibonacci number at (N)

## Setup
1. Install package `yarn`

## Run
1. Run RabbitMQ server `docker run -d --hostname my-rabbit --name rabbit13 -p 8080:15672 -p 5672:5672 -p 25676:25676 rabbitmq:3-management`
2. Run Server `node rpc_server.js` you can run mutiple servers.
3. Run Client send queue to RabbitMQ with `node rpc_client.js 10`