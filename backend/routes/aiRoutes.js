import express from "express";
import { getMedicalAdvice } from "../controllers/aiController.js";

const router = express.Router();

router.post("/chat", getMedicalAdvice);

export default router;