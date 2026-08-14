import { body, query } from "express-validator";
import mongoose from "mongoose";
import Case from "../models/Case.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import Document from "../models/Document.js";
import AuditLog from "../models/AuditLog.js";
import { CASE_STATUSES, USER_ROLES } from "../config/constants.js";
import { updateCaseStatus } from "../utils/caseWorkflow.js";

export const caseCreateValidation = [
  body("clientName").trim().isLength({ min: 2 }).withMessage("Client name is required."),
  body("subjectName").trim().isLength({ min: 2 }).withMessage("Subject name is required."),
  body("caseType").trim().isLength({ min: 2 }).withMessage("Case type is required."),
  body("dueDate").isISO8601().withMessage("Due date must be a valid date."),
  body("assignedTo").optional().isMongoId().withMessage("Assigned agent must be valid."),
];

export const caseUpdateValidation = [
  body("status").optional().isIn(Object.values(CASE_STATUSES)).withMessage("Invalid status."),
  body("note").optional().trim().isLength({ min: 1 }).withMessage("Note cannot be empty."),
  body("verdict").optional().isIn([CASE_STATUSES.CLEARED, CASE_STATUSES.DISCREPANT]).withMessage("Verdict must be Cleared or Discrepant."),
];

export const caseListValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer."),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100."),
  query("status").optional().isIn(Object.values(CASE_STATUSES)).withMessage("Invalid status filter."),
  query("agentId").optional().isMongoId().withMessage("Invalid agent id."),
  query("search").optional().isString(),
];

const populateCase = (query) =>
  query
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .populate("verdict");

export const createCase = async (req, res) => {
  try {
    const { clientName, subjectName, caseType, dueDate, assignedTo } = req.body;

    if (!req.user || req.user.role !== USER_ROLES.MANAGER) {
      return res.status(403).json({ success: false, message: "Only managers can create cases." });
    }

    if (assignedTo) {
      const agent = await User.findOne({ _id: assignedTo, role: USER_ROLES.AGENT });
      if (!agent) {
        return res.status(400).json({ success: false, message: "Assigned agent not found or is not an agent." });
      }
    }

    const newCase = await Case.create({
      clientName,
      subjectName,
      caseType,
      dueDate: new Date(dueDate),
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      status: assignedTo ? CASE_STATUSES.ASSIGNED : CASE_STATUSES.NEW,
    });

    if (newCase.assignedTo) {
      await AuditLog.create({
        caseId: newCase._id,
        changedBy: req.user._id,
        fromStatus: CASE_STATUSES.NEW,
        toStatus: CASE_STATUSES.ASSIGNED,
        note: "Case assigned to agent.",
      });
    }

    const populatedCase = await populateCase(Case.findById(newCase._id)).exec();

    return res.status(201).json({
      success: true,
      message: "Case created successfully.",
      data: populatedCase,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to create case.",
      error: error.message,
    });
  }
};

export const listCases = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search || "").trim();
    const status = req.query.status;
    const agentId = req.query.agentId;

    const filter = {};

    if (req.user.role === USER_ROLES.AGENT) {
      filter.assignedTo = req.user._id;
    }

    if (status) {
      filter.status = status;
    }

    if (agentId) {
      filter.assignedTo = agentId;
    }

    if (search) {
      filter.$or = [
        { clientName: { $regex: search, $options: "i" } },
        { subjectName: { $regex: search, $options: "i" } },
        { caseType: { $regex: search, $options: "i" } },
      ];
    }

    const [cases, totalCount] = await Promise.all([
      populateCase(Case.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)).exec(),
      Case.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        cases,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch cases.",
      error: error.message,
    });
  }
};

export const getCaseById = async (req, res) => {
  try {
    const { caseId } = req.params;

    if (!mongoose.isValidObjectId(caseId)) {
      return res.status(400).json({ success: false, message: "Invalid case id." });
    }

    const caseDoc = await populateCase(Case.findById(caseId)).exec();

    if (!caseDoc) {
      return res.status(404).json({ success: false, message: "Case not found." });
    }

    if (req.user.role === USER_ROLES.AGENT && caseDoc.assignedTo?._id?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You are not assigned to this case." });
    }

    const [comments, documents, auditLogs] = await Promise.all([
      Comment.find({ caseId: caseDoc._id }).populate("author", "name email role").sort({ createdAt: 1 }),
      Document.find({ caseId: caseDoc._id }).populate("uploadedBy", "name email role").sort({ createdAt: -1 }),
      AuditLog.find({ caseId: caseDoc._id }).populate("changedBy", "name email role").sort({ createdAt: 1 }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        case: caseDoc,
        comments,
        documents,
        auditLogs,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch case details.",
      error: error.message,
    });
  }
};

export const addCaseComment = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { message } = req.body;

    if (!mongoose.isValidObjectId(caseId)) {
      return res.status(400).json({ success: false, message: "Invalid case id." });
    }

    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return res.status(404).json({ success: false, message: "Case not found." });
    }

    if (req.user.role === USER_ROLES.AGENT && caseDoc.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You are not assigned to this case." });
    }

    const comment = await Comment.create({
      caseId: caseDoc._id,
      author: req.user._id,
      message,
    });

    await comment.populate("author", "name email role");

    return res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      data: comment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to add comment.",
      error: error.message,
    });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    const { caseId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return res.status(404).json({ success: false, message: "Case not found." });
    }

    if (req.user.role === USER_ROLES.AGENT && caseDoc.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You are not assigned to this case." });
    }

    const document = await Document.create({
      caseId: caseDoc._id,
      originalName: file.originalname,
      fileName: file.filename,
      path: file.path,
      mimeType: file.mimetype,
      size: file.size,
      uploadedBy: req.user._id,
      description: req.body.description || "",
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully.",
      data: document,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to upload document.",
      error: error.message,
    });
  }
};

export const updateCaseStatusByManager = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { status, note } = req.body;

    if (!req.user || req.user.role !== USER_ROLES.MANAGER) {
      return res.status(403).json({ success: false, message: "Only managers can review cases." });
    }

    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return res.status(404).json({ success: false, message: "Case not found." });
    }

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required." });
    }

    if (status !== CASE_STATUSES.CLEARED && status !== CASE_STATUSES.DISCREPANT) {
      return res.status(400).json({ success: false, message: "Managers can only approve or mark discrepant." });
    }

    const updatedCase = await updateCaseStatus({
      caseDoc,
      toStatus: status,
      changedBy: req.user._id,
      note,
      AuditLog,
    });

    return res.status(200).json({
      success: true,
      message: `Case marked ${status}.`,
      data: updatedCase,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const agentSubmitCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { note } = req.body;

    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return res.status(404).json({ success: false, message: "Case not found." });
    }

    if (req.user.role !== USER_ROLES.AGENT || caseDoc.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only the assigned agent can submit this case." });
    }

    const updatedCase = await updateCaseStatus({
      caseDoc,
      toStatus: CASE_STATUSES.SUBMITTED,
      changedBy: req.user._id,
      note,
      AuditLog,
    });

    return res.status(200).json({
      success: true,
      message: "Case submitted successfully.",
      data: updatedCase,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const assignCaseToAgent = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { assignedTo } = req.body;

    if (req.user.role !== USER_ROLES.MANAGER) {
      return res.status(403).json({ success: false, message: "Only managers can assign cases." });
    }

    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return res.status(404).json({ success: false, message: "Case not found." });
    }

    const agent = await User.findOne({ _id: assignedTo, role: USER_ROLES.AGENT });
    if (!agent) {
      return res.status(400).json({ success: false, message: "Assigned agent not found or is not an agent." });
    }

    const previousStatus = caseDoc.status;
    caseDoc.assignedTo = assignedTo;

    if (previousStatus === CASE_STATUSES.NEW) {
      caseDoc.status = CASE_STATUSES.ASSIGNED;
    }

    await caseDoc.save();

    if (caseDoc.status !== previousStatus) {
      await AuditLog.create({
        caseId: caseDoc._id,
        changedBy: req.user._id,
        fromStatus: previousStatus,
        toStatus: caseDoc.status,
        note: `Case assigned to ${agent.name}.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Case assigned successfully.",
      data: caseDoc,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to assign case.",
      error: error.message,
    });
  }
};

export const setCaseInProgress = async (req, res) => {
  try {
    const { caseId } = req.params;

    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return res.status(404).json({ success: false, message: "Case not found." });
    }

    if (req.user.role === USER_ROLES.AGENT && caseDoc.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You are not assigned to this case." });
    }

    const updatedCase = await updateCaseStatus({
      caseDoc,
      toStatus: CASE_STATUSES.IN_PROGRESS,
      changedBy: req.user._id,
      note: "Agent began working on the case.",
      AuditLog,
    });

    return res.status(200).json({
      success: true,
      message: "Case marked in progress.",
      data: updatedCase,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
