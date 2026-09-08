import "dotenv/config";
import path from "node:path";
import cors from "cors";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const allowedOrigins = new Set([
  process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

app.use(cors({ origin: (origin, callback) => {
  if (!origin || allowedOrigins.has(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error("Origin not allowed by CORS"));
} }));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/uploads", express.static(path.resolve("uploads")));
app.use("/api/uploads", uploadRoutes);

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Nomi API listening on port ${port}`);
});
