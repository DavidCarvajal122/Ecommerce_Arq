const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
const EXCHANGE = "orders";
const QUEUE = "users.order_created";
const ROUTING_KEY = "order.created";

async function startConsumer() {
    const conn = await amqp.connect(RABBITMQ_URL);
    const ch = await conn.createChannel();

    await ch.assertExchange(EXCHANGE, "topic", { durable: true });
    await ch.assertQueue(QUEUE, { durable: true });
    await ch.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);

    console.log(`[users-service] waiting events on ${QUEUE}`);

    ch.consume(QUEUE, (msg) => {
        if (!msg) return;
        console.log("[users-service] event received:", msg.content.toString());
        ch.ack(msg);
    });
}

module.exports = { startConsumer };
