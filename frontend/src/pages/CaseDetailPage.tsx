import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SendIcon from "@mui/icons-material/Send";
import RateReviewIcon from "@mui/icons-material/RateReview";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CommentIcon from "@mui/icons-material/Comment";
import HistoryIcon from "@mui/icons-material/History";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { caseService, authService, getFileUrl } from "../services/api";
import { Case, Comment, Document, AuditLog, User } from "../types";
import { useAuth } from "../contexts/AuthContext";
import StatusStepper from "../components/StatusStepper";
import DocumentViewerModal from "../components/DocumentViewerModal";

export default function CaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Interactive inputs
  const [newComment, setNewComment] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDescription, setFileDescription] = useState("");
  
  // Review Dialog
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [reviewVerdict, setReviewVerdict] = useState<"Cleared" | "Discrepant">("Cleared");
  const [reviewNote, setReviewNote] = useState("");

  // Submit Dialog (Agent)
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [submitNote, setSubmitNote] = useState("");

  // Assign Dialog (Manager)
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [assignAgentId, setAssignAgentId] = useState("");

  // Document Lightbox Preview
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);

  const isManager = user?.role === "manager";
  const assignedAgentId = caseData?.assignedTo
    ? typeof caseData.assignedTo === "object"
      ? caseData.assignedTo._id
      : caseData.assignedTo
    : null;
  const isAssignedAgent = user?.role === "agent" && assignedAgentId === user._id;

  useEffect(() => {
    if (caseId) {
      fetchCaseDetails();
    }
  }, [caseId]);

  useEffect(() => {
    if (isManager) {
      fetchAgents();
    }
  }, [isManager]);

  const fetchCaseDetails = async () => {
    try {
      setIsLoading(true);
      const response = await caseService.getCaseById(caseId!);
      setCaseData(response.data.data.case);
      setComments(response.data.data.comments || []);
      setDocuments(response.data.data.documents || []);
      setAuditLogs(response.data.data.auditLogs || []);
    } catch (error) {
      console.error("Failed to fetch case details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await authService.getAgents();
      setAgents(response.data.data);
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await caseService.addComment(caseId!, newComment);
      setNewComment("");
      fetchCaseDetails();
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) return;
    try {
      await caseService.uploadDocument(caseId!, selectedFile, fileDescription);
      setSelectedFile(null);
      setFileDescription("");
      fetchCaseDetails();
    } catch (error) {
      console.error("Failed to upload document:", error);
    }
  };

  const handleStartWork = async () => {
    try {
      await caseService.setCaseInProgress(caseId!);
      fetchCaseDetails();
    } catch (error) {
      console.error("Failed to start work:", error);
    }
  };

  const handleSubmitCase = async () => {
    try {
      await caseService.submitCase(caseId!, submitNote);
      setOpenSubmitDialog(false);
      setSubmitNote("");
      fetchCaseDetails();
    } catch (error) {
      console.error("Failed to submit case:", error);
    }
  };

  const handleReviewCase = async () => {
    try {
      await caseService.reviewCase(caseId!, reviewVerdict, reviewNote);
      setOpenReviewDialog(false);
      setReviewNote("");
      fetchCaseDetails();
    } catch (error) {
      console.error("Failed to review case:", error);
    }
  };

  const handleAssignAgent = async () => {
    if (!assignAgentId) return;
    try {
      await caseService.assignCase(caseId!, assignAgentId);
      setOpenAssignDialog(false);
      fetchCaseDetails();
    } catch (error) {
      console.error("Failed to assign agent:", error);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress size={48} sx={{ color: "#4f46e5" }} />
      </Box>
    );
  }

  if (!caseData) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error">Case record not found or access denied.</Alert>
      </Container>
    );
  }

  const assignedAgent = typeof caseData.assignedTo === "object" ? caseData.assignedTo : null;
  const createdByObj = typeof caseData.createdBy === "object" ? caseData.createdBy : null;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Navigation Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/cases")}
          sx={{ color: "#64748b", "&:hover": { color: "#0f172a" } }}
        >
          Back to Cases
        </Button>

        {/* Action Controls */}
        <Box sx={{ display: "flex", gap: 1.5 }}>
          {isManager && (
            <Button
              variant="outlined"
              startIcon={<PersonAddIcon />}
              onClick={() => {
                setAssignAgentId(assignedAgent?._id || "");
                setOpenAssignDialog(true);
              }}
              sx={{ borderColor: "#bae6fd", color: "#0284c7", backgroundColor: "#f0f9ff" }}
            >
              {assignedAgent ? "Re-assign Agent" : "Assign Agent"}
            </Button>
          )}

          {isAssignedAgent && caseData.status === "Assigned" && (
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={handleStartWork}
              sx={{ background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)", px: 3 }}
            >
              Start Work
            </Button>
          )}

          {isAssignedAgent && caseData.status === "In Progress" && (
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={() => setOpenSubmitDialog(true)}
              sx={{ background: "linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)", px: 3 }}
            >
              Submit Case for Review
            </Button>
          )}

          {isManager && caseData.status === "Submitted" && (
            <Button
              variant="contained"
              startIcon={<RateReviewIcon />}
              onClick={() => setOpenReviewDialog(true)}
              sx={{ background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)", px: 3 }}
            >
              Review Submission
            </Button>
          )}
        </Box>
      </Box>

      {/* Status Pipeline Stepper */}
      <StatusStepper currentStatus={caseData.status} verdict={caseData.verdict} />

      {/* Main Grid: Details & Attachments */}
      <Grid container spacing={3}>
        {/* Left Column: Metadata Card & Comments */}
        <Grid size={{ xs: 12, md: 7 }}>
          {/* Case Overview Card */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 4,
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <Box>
                <Chip
                  label={caseData.caseType}
                  size="small"
                  sx={{
                    mb: 1,
                    backgroundColor: "#eff6ff",
                    color: "#2563eb",
                    fontWeight: 700,
                  }}
                />
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a" }}>
                  {caseData.clientName}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: "#64748b", mt: 0.5 }}>
                  Subject: <strong>{caseData.subjectName}</strong>
                </Typography>
              </Box>

              <Box sx={{ textAlign: "right" }}>
                <Chip
                  label={`Status: ${caseData.status}`}
                  sx={{
                    fontWeight: 700,
                    px: 1,
                    py: 2,
                    fontSize: "0.85rem",
                    backgroundColor:
                      caseData.status === "Cleared"
                        ? "#f0fdf4"
                        : caseData.status === "Discrepant"
                        ? "#fef2f2"
                        : caseData.status === "Submitted"
                        ? "#faf5ff"
                        : "#eff6ff",
                    color:
                      caseData.status === "Cleared"
                        ? "#16a34a"
                        : caseData.status === "Discrepant"
                        ? "#dc2626"
                        : caseData.status === "Submitted"
                        ? "#9333ea"
                        : "#2563eb",
                    border: `1px solid ${
                      caseData.status === "Cleared"
                        ? "#bbf7d0"
                        : caseData.status === "Discrepant"
                        ? "#fecaca"
                        : caseData.status === "Submitted"
                        ? "#e9d5ff"
                        : "#bfdbfe"
                    }`,
                  }}
                />
                {caseData.verdict && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 1,
                      fontWeight: 700,
                      color: caseData.verdict === "Cleared" ? "#16a34a" : "#dc2626",
                    }}
                  >
                    Verdict: {caseData.verdict}
                  </Typography>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 2.5, borderColor: "#e2e8f0" }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" sx={{ color: "#64748b" }}>
                  Due Date
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                  {new Date(caseData.dueDate).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" sx={{ color: "#64748b" }}>
                  Created By
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155" }}>
                  {createdByObj ? createdByObj.name : "System"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" sx={{ color: "#64748b" }}>
                  Assigned Agent
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: assignedAgent ? "#0284c7" : "#dc2626" }}>
                  {assignedAgent ? assignedAgent.name : "Unassigned"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" sx={{ color: "#64748b" }}>
                  Created Date
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  {new Date(caseData.createdAt).toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Notes & Discussion Section */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <CommentIcon sx={{ color: "#4f46e5" }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
                Notes & Discussion Thread ({comments.length})
              </Typography>
            </Box>

            {/* Comment Input */}
            <Box sx={{ mb: 3 }}>
              <TextField
                placeholder="Add a case note or progress update..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                fullWidth
                multiline
                rows={3}
                sx={{ mb: 1.5 }}
              />
              <Button
                variant="contained"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                sx={{ background: "linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)", px: 3 }}
              >
                Post Comment
              </Button>
            </Box>

            {/* Comments List */}
            {comments.length === 0 ? (
              <Typography variant="body2" sx={{ color: "#64748b", fontStyle: "italic" }}>
                No notes or comments added yet.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {comments.map((comment) => {
                  const authorObj = typeof comment.author === "object" ? comment.author : null;
                  const isAuthorManager = authorObj?.role === "manager";

                  return (
                    <Paper
                      key={comment._id}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              fontSize: "0.75rem",
                              backgroundColor: isAuthorManager ? "#4f46e5" : "#0284c7",
                              color: "#ffffff",
                            }}
                          >
                            {authorObj?.name?.charAt(0).toUpperCase() || "U"}
                          </Avatar>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                            {authorObj?.name || "Unknown"}
                          </Typography>
                          <Chip
                            label={authorObj?.role ? authorObj.role.toUpperCase() : "USER"}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: "0.6rem",
                              backgroundColor: isAuthorManager ? "#eff6ff" : "#f0f9ff",
                              color: isAuthorManager ? "#2563eb" : "#0284c7",
                            }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                          {new Date(comment.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: "#334155", whiteSpace: "pre-wrap" }}>
                        {comment.message}
                      </Typography>
                    </Paper>
                  );
                })}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Column: Supporting Documents & Audit History */}
        <Grid size={{ xs: 12, md: 5 }}>
          {/* Supporting Documents & Photos */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 4,
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", mb: 2 }}>
              Supporting Evidence & Documents ({documents.length})
            </Typography>

            {/* Agent Upload Dropzone */}
            {isAssignedAgent && caseData.status !== "Cleared" && caseData.status !== "Discrepant" && (
              <Box sx={{ mb: 3 }}>
                <Box className="file-dropzone" sx={{ mb: 1.5 }}>
                  <input
                    type="file"
                    id="file-input"
                    style={{ display: "none" }}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="file-input" style={{ cursor: "pointer" }}>
                    <CloudUploadIcon sx={{ fontSize: 36, color: "#4f46e5", mb: 1 }} />
                    <Typography variant="body2" sx={{ color: "#0f172a", fontWeight: 600 }}>
                      {selectedFile ? selectedFile.name : "Click to select document or photo"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      Upload verification photos, PDFs, or ID proofs
                    </Typography>
                  </label>
                </Box>

                {selectedFile && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <TextField
                      placeholder="Add document description / note..."
                      size="small"
                      value={fileDescription}
                      onChange={(e) => setFileDescription(e.target.value)}
                    />
                    <Button
                      variant="contained"
                      onClick={handleUploadDocument}
                      sx={{ background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)" }}
                    >
                      Upload Evidence File
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {/* Documents List */}
            {documents.length === 0 ? (
              <Typography variant="body2" sx={{ color: "#64748b", fontStyle: "italic" }}>
                No supporting documents uploaded yet.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {documents.map((doc) => {
                  const isImage = doc.mimeType?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.originalName);
                  const fileUrl = getFileUrl(doc.path, doc.fileName);

                  return (
                    <Paper
                      key={doc._id}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, overflow: "hidden" }}>
                        {isImage ? (
                          <Box
                            component="img"
                            src={fileUrl}
                            alt={doc.originalName}
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 2,
                              objectFit: "cover",
                              border: "1px solid #e2e8f0",
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 2,
                              backgroundColor: "#eff6ff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <InsertDriveFileIcon sx={{ color: "#4f46e5" }} />
                          </Box>
                        )}

                        <Box sx={{ overflow: "hidden" }}>
                          <Typography
                            variant="subtitle2"
                            noWrap
                            sx={{ fontWeight: 700, color: "#0f172a", cursor: "pointer" }}
                            onClick={() => setViewingDoc(doc)}
                          >
                            {doc.originalName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                            {doc.description || `${(doc.size / 1024).toFixed(1)} KB`}
                          </Typography>
                        </Box>
                      </Box>

                      <Tooltip title="View Attachment">
                        <IconButton onClick={() => setViewingDoc(doc)} sx={{ color: "#0284c7" }}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </Paper>
                  );
                })}
              </Box>
            )}
          </Paper>

          {/* Audit History Log Timeline */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <HistoryIcon sx={{ color: "#0284c7" }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
                Status Audit Trail
              </Typography>
            </Box>

            {auditLogs.length === 0 ? (
              <Typography variant="body2" sx={{ color: "#64748b", fontStyle: "italic" }}>
                No status changes recorded yet.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {auditLogs.map((log) => {
                  const changedByObj = typeof log.changedBy === "object" ? log.changedBy : null;

                  return (
                    <Box
                      key={log._id}
                      sx={{
                        position: "relative",
                        pl: 2.5,
                        borderLeft: "2px solid #cbd5e1",
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                        {log.fromStatus} ➔ <span style={{ color: "#0284c7" }}>{log.toStatus}</span>
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                        By {changedByObj?.name || "User"} on {new Date(log.createdAt).toLocaleString()}
                      </Typography>
                      {log.note && (
                        <Typography variant="body2" sx={{ color: "#334155", mt: 0.5, fontStyle: "italic" }}>
                          "{log.note}"
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Manager Review Modal Dialog */}
      <Dialog
        open={openReviewDialog}
        onClose={() => setOpenReviewDialog(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { style: { borderRadius: 16, backgroundColor: "#ffffff" } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#0f172a", borderBottom: "1px solid #e2e8f0" }}>Review Submitted Case</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 3 }}>
          <FormControl fullWidth required>
            <InputLabel>Verification Verdict</InputLabel>
            <Select
              value={reviewVerdict}
              onChange={(e) => setReviewVerdict(e.target.value as "Cleared" | "Discrepant")}
              label="Verification Verdict"
            >
              <MenuItem value="Cleared" sx={{ color: "#16a34a", fontWeight: 700 }}>
                Cleared (Approved)
              </MenuItem>
              <MenuItem value="Discrepant" sx={{ color: "#dc2626", fontWeight: 700 }}>
                Discrepant (Issues Found)
              </MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Review Summary / Findings Note"
            placeholder="Add detailed findings or justification..."
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            fullWidth
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: "1px solid #e2e8f0" }}>
          <Button onClick={() => setOpenReviewDialog(false)} sx={{ color: "#64748b" }}>
            Cancel
          </Button>
          <Button
            onClick={handleReviewCase}
            variant="contained"
            sx={{
              background:
                reviewVerdict === "Cleared"
                  ? "linear-gradient(135deg, #16a34a 0%, #15803d 100%)"
                  : "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
              px: 3,
            }}
          >
            Submit Final Review
          </Button>
        </DialogActions>
      </Dialog>

      {/* Agent Submit Case Modal Dialog */}
      <Dialog
        open={openSubmitDialog}
        onClose={() => setOpenSubmitDialog(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { style: { borderRadius: 16, backgroundColor: "#ffffff" } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#0f172a", borderBottom: "1px solid #e2e8f0" }}>Submit Case for Manager Review</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 3 }}>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Ensure all necessary supporting documents and notes have been uploaded before submitting.
          </Typography>
          <TextField
            label="Completion Note (Optional)"
            placeholder="Summarize your findings for the manager..."
            value={submitNote}
            onChange={(e) => setSubmitNote(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: "1px solid #e2e8f0" }}>
          <Button onClick={() => setOpenSubmitDialog(false)} sx={{ color: "#64748b" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitCase}
            variant="contained"
            sx={{ background: "linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)", px: 3 }}
          >
            Confirm Submission
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manager Assign Agent Modal Dialog */}
      <Dialog
        open={openAssignDialog}
        onClose={() => setOpenAssignDialog(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { style: { borderRadius: 16, backgroundColor: "#ffffff" } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#0f172a", borderBottom: "1px solid #e2e8f0" }}>Assign / Change Agent</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <FormControl fullWidth required>
            <InputLabel>Select Agent</InputLabel>
            <Select
              value={assignAgentId}
              onChange={(e) => setAssignAgentId(e.target.value)}
              label="Select Agent"
            >
              {agents.map((ag) => (
                <MenuItem key={ag._id} value={ag._id}>
                  {ag.name} ({ag.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button onClick={() => setOpenAssignDialog(false)} sx={{ color: "#64748b" }}>
            Cancel
          </Button>
          <Button
            onClick={handleAssignAgent}
            variant="contained"
            disabled={!assignAgentId}
            sx={{ background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)" }}
          >
            Confirm Assignment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Lightbox Modal */}
      <DocumentViewerModal
        open={Boolean(viewingDoc)}
        onClose={() => setViewingDoc(null)}
        document={viewingDoc}
      />
    </Container>
  );
}
