import { Router } from "express";
import { createProduct, deleteProduct, listProducts, updateProduct } from "../controllers/productController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const productRoutes = Router();

productRoutes.get("/", listProducts);
productRoutes.post("/", requireAdmin, createProduct);
productRoutes.patch("/:id", requireAdmin, updateProduct);
productRoutes.delete("/:id", requireAdmin, deleteProduct);

export default productRoutes;
