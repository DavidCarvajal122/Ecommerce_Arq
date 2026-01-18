const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
 
const PORT = process.env.PORT || 8081;
const MONGO_URL = process.env.MONGO_URL || "mongodb://mongo:27017/easyorders";
 
const app = express();
app.use(cors());
app.use(express.json());
 
// ---- Mongo Model ----
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // demo simple (sin hash)
  },
  { timestamps: true }
);
 
const User = mongoose.model("User", UserSchema);
 
// ---- Routes ----
app.get("/health", (req, res) => res.status(200).send("OK"));
 
app.post("/users/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password are required" });
    }
 
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "email already registered" });
 
    const user = await User.create({ name, email, password });
    return res.status(201).json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    return res.status(500).json({ message: "server error", error: String(err) });
  }
});
 
app.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }
 
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ message: "invalid credentials" });
 
    return res.status(200).json({ message: "login ok", userId: user._id });
  } catch (err) {
    return res.status(500).json({ message: "server error", error: String(err) });
  }
});
 
// ---- Start ----
async function start() {
  await mongoose.connect(MONGO_URL);
  console.log("Users DB connected");
  app.listen(PORT, () => console.log(`users-service running on ${PORT}`));
}
 
start().catch((e) => {
  console.error("Failed to start users-service:", e);
  process.exit(1);
});