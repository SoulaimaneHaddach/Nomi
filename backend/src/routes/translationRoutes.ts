import { Router } from "express";
import { autoTranslateProduct } from "../controllers/translationController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const translationRoutes = Router();

translationRoutes.post("/auto", requireAdmin, autoTranslateProduct);

export default translationRoutes;