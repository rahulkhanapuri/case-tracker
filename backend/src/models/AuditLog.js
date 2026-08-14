import mongoose from "mongoose";
import { CASE_STATUSES } from "../config/constants.js";

const auditLogSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
      index: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromStatus: {
      type: String,
      enum: Object.values(CASE_STATUSES),
      required: true,
    },
    toStatus: {
      type: String,
      enum: Object.values(CASE_STATUSES),
      required: true,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
