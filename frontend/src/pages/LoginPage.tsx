import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container, Box, TextField, Button, Typography, Paper, Alert, CircularProgress, InputAdornment,
  IconButton,
} from "@mui/material";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { useAuth } from "../contexts/AuthContext";
import { Visibility, VisibilityOff } from "@mui/icons-material";


export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    try {
      await login(formData.email, formData.password);
      navigate("/cases");
    } catch (err: any) {
      setLocalError(err.response?.data?.message || "Login failed. Please verify credentials.");
    }
  };

  const handleFillDemo = (email: string) => {
    setFormData({ email, password: "password123" });
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
              Case Tracker
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              Sign in to manage background verification cases
            </Typography>
          </Box>

          {(error || localError) && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {error || localError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              disabled={isLoading}
              required
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        disabled={isLoading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
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
              {isLoading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Sign In"}
            </Button>
          </Box>
          <Typography variant="body2" sx={{ textAlign: "center", mt: 3, color: "#64748b" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 600 }}>
              Create Account
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
