const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
const EXCHANGE = "orders";

let ch;

async function getChannel() {
    if (ch) return ch;

    const conn = await amqp.connect(RABBITMQ_URL);
    const channel = await conn.createChannel();
    await channel.assertExchange(EXCHANGE, "topic", { durable: true });

    ch = channel;
    return ch;
}

async function publish(routingKey, payload) {
    const channel = await getChannel();
    const msg = Buffer.from(JSON.stringify(payload));
    channel.publish(EXCHANGE, routingKey, msg, { persistent: true });
}

module.exports = { publish };
