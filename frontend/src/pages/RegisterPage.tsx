import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { useAuth } from "../contexts/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "agent" as "manager" | "agent",
  });
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    try {
      await register(formData.name, formData.email, formData.password, formData.role);
      navigate("/cases");
    } catch (err: any) {
      setLocalError(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ display: "flex", justifyContent: "center", minHeight: "calc(100vh - 80px)", alignItems: "center" }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            width: "100%",
            borderRadius: 4,
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 30px -5px rgba(15, 23, 42, 0.08)",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: 3,
                background: "linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1.5,
                boxShadow: "0 4px 14px rgba(79, 70, 229, 0.25)",
              }}
            >
              <AssignmentTurnedInIcon sx={{ color: "#ffffff", fontSize: 32 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
              Create Account
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              Register as Manager or Agent in Case Tracker
            </Typography>
          </Box>

          {(error || localError) && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {error || localError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Full Name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isLoading}
              required
              fullWidth
            />
            <TextField
              label="Email Address"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isLoading}
              required
              fullWidth
            />
            <TextField
              label="Password (min 6 chars)"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isLoading}
              required
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel>Account Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as "manager" | "agent" })}
                label="Account Role"
                disabled={isLoading}
              >
                <MenuItem value="agent">Verification Agent (Field/Analyst)</MenuItem>
                <MenuItem value="manager">Case Manager (Supervisor/Reviewer)</MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              size="large"
              sx={{
                mt: 1,
                py: 1.4,
                background: "linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)",
                fontSize: "1rem",
              }}
            >
              {isLoading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Create Account"}
            </Button>

            <Typography variant="body2" sx={{ textAlign: "center", mt: 2, color: "#64748b" }}>
              Already registered?{" "}
              <Link to="/login" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 600 }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
