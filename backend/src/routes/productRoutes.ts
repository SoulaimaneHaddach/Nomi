import { Router } from "express";
import { listProducts } from "../controllers/productController.js";

const productRoutes = Router();

productRoutes.get("/", listProducts);

export default productRoutes;
