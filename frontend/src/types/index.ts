export interface User {
  _id: string;
  name: string;
  email: string;
  role: "manager" | "agent";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Case {
  _id: string;
  clientName: string;
  subjectName: string;
  caseType: string;
  dueDate: string;
  status: "New" | "Assigned" | "In Progress" | "Submitted" | "Cleared" | "Discrepant";
  assignedTo: User | string | null;
  createdBy: User | string;
  verdict: "Cleared" | "Discrepant" | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  caseId: string;
  author: User;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  _id: string;
  caseId: string;
  originalName: string;
  fileName: string;
  path: string;
  mimeType: string;
  size: number;
  uploadedBy: User;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  _id: string;
  caseId: string;
  changedBy: User;
  fromStatus: string;
  toStatus: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface CaseResponse {
  success: boolean;
  message: string;
  data: Case | Case[];
}

export interface CaseListResponse {
  success: boolean;
  data: {
    cases: Case[];
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
  };
}

export interface CaseDetailResponse {
  success: boolean;
  data: {
    case: Case;
    comments: Comment[];
    documents: Document[];
    auditLogs: AuditLog[];
  };
}
