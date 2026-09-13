import { Router } from "express";
import { createProduct, deleteProduct, listAdminProducts, listProducts, updateProduct } from "../controllers/productController.js";
import { requireAdmin, requireRestaurantMembership } from "../middleware/requireAdmin.js";

const productRoutes = Router();

productRoutes.get("/", listProducts);
productRoutes.get("/admin", requireAdmin, requireRestaurantMembership, listAdminProducts);
productRoutes.get("/:slug", listProducts);
productRoutes.post("/", requireAdmin, requireRestaurantMembership, createProduct);
productRoutes.patch("/:id", requireAdmin, requireRestaurantMembership, updateProduct);
productRoutes.delete("/:id", requireAdmin, requireRestaurantMembership, deleteProduct);

export default productRoutes;
