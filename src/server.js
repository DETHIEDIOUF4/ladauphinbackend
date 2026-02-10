import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import orderRoutes from "./routes/order.routes.js";
import eventRoutes from "./routes/event.routes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://ledauphingaparou.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Autoriser les requêtes sans header Origin (ex: Postman, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

connectDB().then(() => {
  if (process.env.SEED_ON_START === "1") {
    import("./seed.js").then(({ runSeed }) => {
      runSeed().catch((err) => console.error("Seed error:", err));
    });
  }
});

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/events", eventRoutes);

app.get("/", (req, res) => {
  res.send("API Le Dauphin en ligne");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

