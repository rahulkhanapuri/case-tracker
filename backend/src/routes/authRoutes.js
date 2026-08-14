import express from "express";
import { body } from "express-validator";
import { loginUser, registerUser, getCurrentUser, getAgents } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validation.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters."),
    body("email").isEmail().withMessage("Please provide a valid email."),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
    body("role").optional().isIn(["manager", "agent"]).withMessage("Role must be manager or agent."),
    validateRequest,
  ],
  registerUser
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email."),
    body("password").notEmpty().withMessage("Password is required."),
    validateRequest,
  ],
  loginUser
);

router.get("/me", authenticate, getCurrentUser);
router.get("/agents", authenticate, getAgents);

export default router;
