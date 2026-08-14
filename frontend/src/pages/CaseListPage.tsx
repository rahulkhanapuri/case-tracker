import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { caseService, authService } from "../services/api";
import { Case, User } from "../types";
import { useAuth } from "../contexts/AuthContext";
import CaseStatsHeader from "../components/CaseStatsHeader";

export default function CaseListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [agentFilter, setAgentFilter] = useState("");

  // Create Case Dialog state
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newCaseData, setNewCaseData] = useState({
    clientName: "",
    subjectName: "",
    caseType: "",
    dueDate: "",
    assignedTo: "",
  });

  // Quick Assign Dialog state
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedCaseForAssign, setSelectedCaseForAssign] = useState<Case | null>(null);
  const [assignAgentId, setAssignAgentId] = useState("");

  const isManager = user?.role === "manager";

  useEffect(() => {
    fetchCases();
  }, [page, statusFilter, agentFilter, search]);

  useEffect(() => {
    if (isManager) {
      fetchAgents();
    }
  }, [isManager]);

  const fetchCases = async () => {
    try {
      setIsLoading(true);
      const response = await caseService.listCases(
        page,
        limit,
        statusFilter || undefined,
        agentFilter || undefined,
        search || undefined
      );
      setCases(response.data.data.cases);
      setTotalPages(response.data.data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch cases:", error);
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

  const handleCreateCase = async () => {
    if (!newCaseData.clientName || !newCaseData.subjectName || !newCaseData.caseType || !newCaseData.dueDate) {
      alert("Please fill in all required fields.");
      return;
    }
    try {
      await caseService.createCase(
        newCaseData.clientName,
        newCaseData.subjectName,
        newCaseData.caseType,
        newCaseData.dueDate,
        newCaseData.assignedTo || undefined
      );
      setOpenCreateDialog(false);
      setNewCaseData({ clientName: "", subjectName: "", caseType: "", dueDate: "", assignedTo: "" });
      fetchCases();
    } catch (error) {
      console.error("Failed to create case:", error);
    }
  };

  const handleAssignCase = async () => {
    if (!selectedCaseForAssign || !assignAgentId) return;
    try {
      await caseService.assignCase(selectedCaseForAssign._id, assignAgentId);
      setOpenAssignDialog(false);
      setSelectedCaseForAssign(null);
      setAssignAgentId("");
      fetchCases();
    } catch (error) {
      console.error("Failed to assign case:", error);
    }
  };

  const getStatusChip = (status: string, verdict?: string | null) => {
    const config: { [key: string]: { bg: string; color: string; label: string } } = {
      New: { bg: "#f1f5f9", color: "#475569", label: "New" },
      Assigned: { bg: "#eff6ff", color: "#2563eb", label: "Assigned" },
      "In Progress": { bg: "#fffbeb", color: "#d97706", label: "In Progress" },
      Submitted: { bg: "#faf5ff", color: "#9333ea", label: "Submitted" },
      Cleared: { bg: "#f0fdf4", color: "#16a34a", label: "Cleared" },
      Discrepant: { bg: "#fef2f2", color: "#dc2626", label: "Discrepant" },
    };

    const style = config[status] || config["New"];

    return (
      <Chip
        label={verdict ? `${status} (${verdict})` : style.label}
        size="small"
        sx={{
          backgroundColor: style.bg,
          color: style.color,
          border: `1px solid ${style.color}30`,
          fontWeight: 700,
          px: 0.5,
        }}
      />
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Banner */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
            {isManager ? "Case Tracker Dashboard" : "My Assigned Cases"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            {isManager
              ? "Track, assign, and review background verification requests across all agents."
              : "Review your assigned verification tasks, upload evidence, and submit reports."}
          </Typography>
        </Box>

        {isManager && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
            sx={{
              background: "linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)",
              py: 1.2,
              px: 3,
              fontSize: "0.95rem",
              boxShadow: "0 4px 14px rgba(79, 70, 229, 0.25)",
            }}
          >
            Create New Case
          </Button>
        )}
      </Box>

      {/* KPI Stats Overview */}
      <CaseStatsHeader cases={cases} role={isManager ? "manager" : "agent"} />

      {/* Filters Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
          boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
        }}
      >
        <TextField
          placeholder="Search by client, subject, or type..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          size="small"
          sx={{ flex: { xs: "100%", sm: 1 }, minWidth: 240 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#94a3b8" }} />
                </InputAdornment>
              ),
            },
          }}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel sx={{ color: "#64748b" }}>Status Filter</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            label="Status Filter"
            startAdornment={
              <InputAdornment position="start">
                <FilterListIcon sx={{ color: "#94a3b8", fontSize: 18 }} />
              </InputAdornment>
            }
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="New">New</MenuItem>
            <MenuItem value="Assigned">Assigned</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Submitted">Submitted</MenuItem>
            <MenuItem value="Cleared">Cleared</MenuItem>
            <MenuItem value="Discrepant">Discrepant</MenuItem>
          </Select>
        </FormControl>

        {isManager && (
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel sx={{ color: "#64748b" }}>Agent Filter</InputLabel>
            <Select
              value={agentFilter}
              onChange={(e) => {
                setAgentFilter(e.target.value);
                setPage(1);
              }}
              label="Agent Filter"
            >
              <MenuItem value="">All Agents</MenuItem>
              {agents.map((ag) => (
                <MenuItem key={ag._id} value={ag._id}>
                  {ag.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Paper>

      {/* Case List Table */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={48} sx={{ color: "#4f46e5" }} />
        </Box>
      ) : cases.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 4,
            backgroundColor: "#ffffff",
            border: "1px dashed #cbd5e1",
          }}
        >
          <Typography variant="h6" sx={{ color: "#64748b", mb: 1 }}>
            No Verification Cases Found
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
            {isManager
              ? "Try adjusting your filters or click 'Create New Case' to add a request."
              : "You currently have no assigned cases matching your search criteria."}
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 3,
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
              boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
            }}
          >
            <Table>
              <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ color: "#475569", fontWeight: 700 }}>Client Name</TableCell>
                  <TableCell sx={{ color: "#475569", fontWeight: 700 }}>Subject Name</TableCell>
                  <TableCell sx={{ color: "#475569", fontWeight: 700 }}>Case Type</TableCell>
                  <TableCell sx={{ color: "#475569", fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ color: "#475569", fontWeight: 700 }}>Assigned Agent</TableCell>
                  <TableCell sx={{ color: "#475569", fontWeight: 700 }}>Due Date</TableCell>
                  <TableCell align="right" sx={{ color: "#475569", fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cases.map((caseItem) => {
                  const assignedAgent = typeof caseItem.assignedTo === "object" ? caseItem.assignedTo : null;
                  const dueDateObj = new Date(caseItem.dueDate);
                  const isOverdue = dueDateObj < new Date() && !["Cleared", "Discrepant"].includes(caseItem.status);

                  return (
                    <TableRow
                      key={caseItem._id}
                      hover
                      sx={{
                        "&:hover": { backgroundColor: "#f8fafc" },
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      <TableCell sx={{ fontWeight: 700, color: "#0f172a" }}>{caseItem.clientName}</TableCell>
                      <TableCell sx={{ color: "#334155" }}>{caseItem.subjectName}</TableCell>
                      <TableCell sx={{ color: "#64748b" }}>
                        <Chip
                          label={caseItem.caseType}
                          size="small"
                          variant="outlined"
                          sx={{ borderColor: "#cbd5e1", color: "#475569", fontSize: "0.75rem", backgroundColor: "#f8fafc" }}
                        />
                      </TableCell>
                      <TableCell>{getStatusChip(caseItem.status, caseItem.verdict)}</TableCell>
                      <TableCell>
                        {assignedAgent ? (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: "0.75rem", backgroundColor: "#0284c7", color: "#ffffff" }}>
                              {assignedAgent.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" sx={{ color: "#334155" }}>
                              {assignedAgent.name}
                            </Typography>
                          </Box>
                        ) : (
                          <Chip
                            label="Unassigned"
                            size="small"
                            sx={{ backgroundColor: "#fef2f2", color: "#dc2626", fontSize: "0.7rem" }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, color: isOverdue ? "#dc2626" : "#64748b" }}>
                          <CalendarTodayIcon sx={{ fontSize: 14 }} />
                          <Typography variant="body2" sx={{ fontWeight: isOverdue ? 700 : 400 }}>
                            {dueDateObj.toLocaleDateString()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                          {isManager && (
                            <Tooltip title="Assign / Reassign Agent">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedCaseForAssign(caseItem);
                                  setAssignAgentId(assignedAgent?._id || "");
                                  setOpenAssignDialog(true);
                                }}
                                sx={{ color: "#0284c7", border: "1px solid #bae6fd", backgroundColor: "#f0f9ff" }}
                              >
                                <PersonAddIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => navigate(`/cases/${caseItem._id}`)}
                            sx={{
                              borderColor: "#c7d2fe",
                              color: "#4f46e5",
                              backgroundColor: "#eff6ff",
                              "&:hover": {
                                borderColor: "#4f46e5",
                                backgroundColor: "#e0e7ff",
                              },
                            }}
                          >
                            View
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </>
      )}

      {/* Create Case Modal Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { style: { borderRadius: 16, backgroundColor: "#ffffff" } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#0f172a", borderBottom: "1px solid #e2e8f0" }}>
          Create Background Verification Case
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 3 }}>
          <TextField
            label="Client Name"
            placeholder="e.g. Acme Financial Corp"
            value={newCaseData.clientName}
            onChange={(e) => setNewCaseData({ ...newCaseData, clientName: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label="Subject Name (Individual)"
            placeholder="e.g. John Doe"
            value={newCaseData.subjectName}
            onChange={(e) => setNewCaseData({ ...newCaseData, subjectName: e.target.value })}
            fullWidth
            required
          />
          <FormControl fullWidth required>
            <InputLabel>Case Type</InputLabel>
            <Select
              value={newCaseData.caseType}
              onChange={(e) => setNewCaseData({ ...newCaseData, caseType: e.target.value })}
              label="Case Type"
            >
              <MenuItem value="Employment Verification">Employment Verification</MenuItem>
              <MenuItem value="Criminal Background Check">Criminal Background Check</MenuItem>
              <MenuItem value="Address Verification">Address Verification</MenuItem>
              <MenuItem value="Education Verification">Education Verification</MenuItem>
              <MenuItem value="Identity Check">Identity Check</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Due Date"
            type="date"
            value={newCaseData.dueDate}
            onChange={(e) => setNewCaseData({ ...newCaseData, dueDate: e.target.value })}
            fullWidth
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <FormControl fullWidth>
            <InputLabel>Assign to Agent (Optional)</InputLabel>
            <Select
              value={newCaseData.assignedTo}
              onChange={(e) => setNewCaseData({ ...newCaseData, assignedTo: e.target.value })}
              label="Assign to Agent (Optional)"
            >
              <MenuItem value="">Unassigned (New)</MenuItem>
              {agents.map((ag) => (
                <MenuItem key={ag._id} value={ag._id}>
                  {ag.name} ({ag.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: "1px solid #e2e8f0" }}>
          <Button onClick={() => setOpenCreateDialog(false)} sx={{ color: "#64748b" }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateCase}
            variant="contained"
            sx={{ background: "linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)", px: 3 }}
          >
            Create Case
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quick Assign Dialog */}
      <Dialog
        open={openAssignDialog}
        onClose={() => setOpenAssignDialog(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { style: { borderRadius: 16, backgroundColor: "#ffffff" } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#0f172a", borderBottom: "1px solid #e2e8f0" }}>Assign Case to Agent</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
            Assigning case for subject: <strong>{selectedCaseForAssign?.subjectName}</strong> ({selectedCaseForAssign?.clientName})
          </Typography>
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
            onClick={handleAssignCase}
            variant="contained"
            disabled={!assignAgentId}
            sx={{ background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)" }}
          >
            Confirm Assignment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
