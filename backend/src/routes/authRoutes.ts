import { Router } from "express";
import rateLimit from "express-rate-limit";
import { changeAdminCredentials, changePin, getCurrentUser, getPinStatus, loginAdmin, loginOwner, recoverPin, registerOwner, requestPasswordReset, resetPassword, setupPin, verifyPin } from "../controllers/authController.js";
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
authRoutes.post("/owner-login", authRateLimit, loginOwner);
authRoutes.post("/register", authRateLimit, registerOwner);
authRoutes.post("/password/forgot", authRateLimit, requestPasswordReset);
authRoutes.post("/password/reset", authRateLimit, resetPassword);
authRoutes.get("/me", requireAdmin, getCurrentUser);
authRoutes.patch("/credentials", authRateLimit, requireAdmin, changeAdminCredentials);
authRoutes.get("/pin", requireAdmin, getPinStatus);
authRoutes.post("/pin", authRateLimit, requireAdmin, setupPin);
authRoutes.post("/pin/verify", authRateLimit, requireAdmin, verifyPin);
authRoutes.post("/pin/recover", authRateLimit, requireAdmin, recoverPin);
authRoutes.patch("/pin", authRateLimit, requireAdmin, changePin);

export default authRoutes;
