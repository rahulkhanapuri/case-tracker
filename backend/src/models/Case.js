import mongoose from "mongoose";
import { CASE_STATUSES } from "../config/constants.js";

const caseSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    subjectName: {
      type: String,
      required: true,
      trim: true,
    },
    caseType: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(CASE_STATUSES),
      default: CASE_STATUSES.NEW,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    verdict: {
      type: String,
      enum: [CASE_STATUSES.CLEARED, CASE_STATUSES.DISCREPANT, null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Case = mongoose.model("Case", caseSchema);

export default Case;
