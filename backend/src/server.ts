import "dotenv/config";
import cors from "cors";
import express from "express";
import productRoutes from "./routes/productRoutes.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());
app.use("/api/products", productRoutes);

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Nomi API listening on port ${port}`);
});
