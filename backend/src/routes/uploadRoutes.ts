import { mkdirSync } from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { requireAdmin } from "../middleware/requireAdmin.js";

const uploadDirectory = path.resolve("uploads");
mkdirSync(uploadDirectory, { recursive: true });

const upload = multer({
  dest: uploadDirectory,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    callback(null, file.mimetype.startsWith("image/"));
  },
});

const uploadRoutes = Router();

uploadRoutes.post("/", requireAdmin, upload.single("image"), (request, response) => {
  if (!request.file) {
    response.status(400).json({ message: "An image file is required" });
    return;
  }

  const publicApiUrl = process.env.API_PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 4000}`;
  response.status(201).json({ imageUrl: `${publicApiUrl}/uploads/${request.file.filename}` });
});

export default uploadRoutes;
