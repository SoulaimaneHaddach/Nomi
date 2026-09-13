import { Router } from "express";
import { listRestaurants, updateRestaurantStatus } from "../controllers/platformController.js";
import { requireAdmin, requirePlatformAdmin } from "../middleware/requireAdmin.js";

const platformRoutes = Router();
platformRoutes.use(requireAdmin, requirePlatformAdmin);
platformRoutes.get("/restaurants", listRestaurants);
platformRoutes.patch("/restaurants/:id/status", updateRestaurantStatus);

export default platformRoutes;