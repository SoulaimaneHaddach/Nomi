import { Router } from "express";
import { listLanguages, listMenuLanguages } from "../controllers/languageController.js";

const languageRoutes = Router();

languageRoutes.get("/", listLanguages);
languageRoutes.get("/menu", listMenuLanguages);
languageRoutes.get("/menu/:slug", listMenuLanguages);

export default languageRoutes;