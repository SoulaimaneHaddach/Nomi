import { Router } from "express";
import rateLimit from "express-rate-limit";
import { changeAdminCredentials, loginAdmin } from "../controllers/authController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const authRoutes = Router();
const authRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: "draft-8",
	legacyHeaders: false,
	message: { message: "Too many attempts. Try again in 15 minutes." },
});

authRoutes.post("/login", authRateLimit, loginAdmin);
authRoutes.patch("/credentials", authRateLimit, requireAdmin, changeAdminCredentials);

export default authRoutes;
