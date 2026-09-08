import { Router } from "express";
import { loginAdmin } from "../controllers/authController.js";

const authRoutes = Router();

authRoutes.post("/login", loginAdmin);

export default authRoutes;
