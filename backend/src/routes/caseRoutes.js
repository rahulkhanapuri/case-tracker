import express from "express";
import { body } from "express-validator";
import {
  createCase,
  listCases,
  getCaseById,
  addCaseComment,
  uploadDocument,
  updateCaseStatusByManager,
  agentSubmitCase,
  assignCaseToAgent,
  setCaseInProgress,
  caseCreateValidation,
  caseUpdateValidation,
  caseListValidation,
} from "../controllers/caseController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validation.js";
import upload from "../config/multer.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

router.use(authenticate);

router.get("/", caseListValidation, validateRequest, listCases);

router.post(
  "/",
  authorizeRoles(USER_ROLES.MANAGER),
  caseCreateValidation,
  validateRequest,
  createCase
);

router.post(
  "/:caseId/assign",
  authorizeRoles(USER_ROLES.MANAGER),
  body("assignedTo").isMongoId().withMessage("Assigned agent must be valid."),
  validateRequest,
  assignCaseToAgent
);

router.get("/:caseId", getCaseById);
router.post(
  "/:caseId/comments",
  body("message").trim().isLength({ min: 1 }).withMessage("Comment message is required."),
  validateRequest,
  addCaseComment
);

router.post(
  "/:caseId/documents",
  upload.single("file"),
  body("description").optional().trim(),
  validateRequest,
  uploadDocument
);

router.patch(
  "/:caseId/review",
  authorizeRoles(USER_ROLES.MANAGER),
  caseUpdateValidation,
  validateRequest,
  updateCaseStatusByManager
);

router.patch(
  "/:caseId/in-progress",
  authorizeRoles(USER_ROLES.AGENT),
  setCaseInProgress
);

router.patch(
  "/:caseId/submit",
  authorizeRoles(USER_ROLES.AGENT),
  body("note").optional().trim(),
  validateRequest,
  agentSubmitCase
);

export default router;
