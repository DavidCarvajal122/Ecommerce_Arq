const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { publish } = require("./rabbitmq");


const PORT = process.env.PORT || 8082;
const MONGO_URL = process.env.MONGO_URL || "mongodb://mongo:27017/easyorders";

const app = express();
app.use(cors());
app.use(express.json());

// ---- Mongo Model ----
const OrderSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        status: { type: String, default: "CREATED" },
        items: [
            {
                sku: String,
                name: String,
                quantity: Number,
                price: Number,
            },
        ],
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);

// ---- Routes ----
app.get("/health", (req, res) => res.status(200).send("OK"));

app.post("/orders", async (req, res) => {
    try {
        const { userId, items } = req.body || {};
        if (!userId || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "userId and items are required" });
        }

        const order = await Order.create({ userId, items, status: "CREATED" });

        await publish("order.created", {
            orderId: String(order._id),
            userId,
            status: order.status,
            createdAt: order.createdAt,
        });




        return res.status(201).json({ id: order._id, status: order.status });
    } catch (err) {
        return res.status(500).json({ message: "server error", error: String(err) });
    }
});

app.get("/", async (req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(100);
    res.json(
        orders.map((o) => ({
            id: o._id,
            userId: o.userId,
            status: o.status,
            createdAt: o.createdAt,
        }))
    );
});

app.get("/orders", async (req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(100);
    res.json(
        orders.map((o) => ({
            id: o._id,
            userId: o.userId,
            status: o.status,
            createdAt: o.createdAt,
        }))
    );
});

app.get("/orders/:id", async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "order not found" });

    res.json({
        id: order._id,
        userId: order.userId,
        status: order.status,
        items: order.items,
        createdAt: order.createdAt,
    });
});

// ---- Start ----
async function start() {
    await mongoose.connect(MONGO_URL);
    console.log("Orders DB connected");
    app.listen(PORT, () => console.log(`orders-service running on ${PORT}`));
}

start().catch((e) => {
    console.error("Failed to start orders-service:", e);
    process.exit(1);
});
