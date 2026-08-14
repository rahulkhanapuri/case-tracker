import { AppBar, Toolbar, Typography, Button, Box, Chip, Avatar, Menu, MenuItem, Divider } from "@mui/material";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate("/login");
  };

  const isManager = user?.role === "manager";

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e2e8f0",
        color: "#0f172a",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 4 } }}>
        <Box
          onClick={() => navigate("/cases")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            cursor: "pointer",
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              background: "linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
            }}
          >
            <AssignmentTurnedInIcon sx={{ color: "#ffffff", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: -0.5,
                color: "#0f172a",
                lineHeight: 1.2,
              }}
            >
              Case Tracker
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.68rem", display: "block" }}>
              Verification & Case Workflow Portal
            </Typography>
          </Box>
        </Box>

        {user && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              icon={isManager ? <SupervisorAccountIcon fontSize="small" /> : <SupportAgentIcon fontSize="small" />}
              label={isManager ? "Manager Portal" : "Agent Workspace"}
              size="small"
              sx={{
                backgroundColor: isManager ? "#eff6ff" : "#f0fdf4",
                color: isManager ? "#2563eb" : "#16a34a",
                border: `1px solid ${isManager ? "#bfdbfe" : "#bbf7d0"}`,
                fontWeight: 700,
                px: 0.5,
                display: { xs: "none", sm: "inline-flex" },
              }}
            />

            <Button
              onClick={handleMenuOpen}
              sx={{
                p: 0.5,
                borderRadius: 3,
                border: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
                "&:hover": {
                  backgroundColor: "#f1f5f9",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    backgroundColor: isManager ? "#4f46e5" : "#0284c7",
                    color: "#ffffff",
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ textAlign: "left", display: { xs: "none", md: "block" } }}>
                  <Typography variant="subtitle2" sx={{ color: "#0f172a", lineHeight: 1.1, fontSize: "0.85rem" }}>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                    {user.email}
                  </Typography>
                </Box>
              </Box>
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    overflow: "visible",
                    mt: 1.5,
                    borderRadius: 3,
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    minWidth: 200,
                    boxShadow: "0 10px 30px -5px rgba(15, 23, 42, 0.1)",
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                  {user.email}
                </Typography>
                <Chip
                  label={user.role.toUpperCase()}
                  size="small"
                  sx={{
                    mt: 1,
                    height: 20,
                    fontSize: "0.65rem",
                    backgroundColor: isManager ? "#eff6ff" : "#f0fdf4",
                    color: isManager ? "#2563eb" : "#16a34a",
                  }}
                />
              </Box>
              <Divider sx={{ borderColor: "#e2e8f0" }} />
              <MenuItem onClick={handleLogout} sx={{ color: "#dc2626", gap: 1, py: 1.2 }}>
                <LogoutIcon fontSize="small" />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
