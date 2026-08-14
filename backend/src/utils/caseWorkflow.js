import { CASE_STATUSES, CASE_STATUS_FLOW } from "../config/constants.js";

export const canTransition = (fromStatus, toStatus) => {
  const allowedNextStatuses = CASE_STATUS_FLOW[fromStatus] || [];
  return allowedNextStatuses.includes(toStatus);
};

export const updateCaseStatus = async ({ caseDoc, toStatus, changedBy, note, AuditLog, session }) => {
  const fromStatus = caseDoc.status;

  if (fromStatus === toStatus) {
    return caseDoc;
  }

  if (!canTransition(fromStatus, toStatus)) {
    throw new Error(`Invalid status transition from ${fromStatus} to ${toStatus}.`);
  }

  caseDoc.status = toStatus;

  if (toStatus === CASE_STATUSES.CLEARED || toStatus === CASE_STATUSES.DISCREPANT) {
    caseDoc.verdict = toStatus;
  }

  await caseDoc.save({ session });

  await AuditLog.create(
    [
      {
        caseId: caseDoc._id,
        changedBy,
        fromStatus,
        toStatus,
        note: note || "",
      },
    ],
    { session }
  );

  return caseDoc;
};
