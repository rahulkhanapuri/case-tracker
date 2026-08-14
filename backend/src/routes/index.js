import express from "express";
import authRoutes from "./authRoutes.js";
import caseRoutes from "./caseRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/cases", caseRoutes);

export default router;
