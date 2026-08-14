import { Grid, Paper, Typography, Box } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import RateReviewIcon from "@mui/icons-material/RateReview";
import VerifiedIcon from "@mui/icons-material/Verified";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Case } from "../types";

interface CaseStatsHeaderProps {
  cases: Case[];
  role: "manager" | "agent";
}

export default function CaseStatsHeader({ cases, role }: CaseStatsHeaderProps) {
  const total = cases.length;
  const newCount = cases.filter((c) => c.status === "New").length;
  const assignedCount = cases.filter((c) => c.status === "Assigned").length;
  const inProgressCount = cases.filter((c) => c.status === "In Progress").length;
  const submittedCount = cases.filter((c) => c.status === "Submitted").length;
  const clearedCount = cases.filter((c) => c.status === "Cleared").length;
  const discrepantCount = cases.filter((c) => c.status === "Discrepant").length;

  const stats = [
    {
      title: role === "manager" ? "Total Cases" : "My Assigned Cases",
      value: total,
      icon: <FolderIcon sx={{ color: "#4f46e5" }} />,
      bg: "#eff6ff",
      border: "#bfdbfe",
    },
    {
      title: role === "manager" ? "Unassigned (New)" : "Pending Start",
      value: role === "manager" ? newCount : assignedCount,
      icon: <PendingActionsIcon sx={{ color: "#0284c7" }} />,
      bg: "#f0f9ff",
      border: "#bae6fd",
    },
    {
      title: "In Progress",
      value: inProgressCount,
      icon: <AutorenewIcon sx={{ color: "#d97706" }} />,
      bg: "#fffbeb",
      border: "#fde68a",
    },
    {
      title: role === "manager" ? "Review Pending" : "Submitted",
      value: submittedCount,
      icon: <RateReviewIcon sx={{ color: "#9333ea" }} />,
      bg: "#faf5ff",
      border: "#e9d5ff",
    },
    {
      title: "Cleared",
      value: clearedCount,
      icon: <VerifiedIcon sx={{ color: "#16a34a" }} />,
      bg: "#f0fdf4",
      border: "#bbf7d0",
    },
    {
      title: "Discrepant",
      value: discrepantCount,
      icon: <WarningAmberIcon sx={{ color: "#dc2626" }} />,
      bg: "#fef2f2",
      border: "#fecaca",
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {stats.map((stat, idx) => (
        <Grid key={idx} size={{ xs: 6, sm: 4, md: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: stat.bg,
              border: `1px solid ${stat.border}`,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px -4px rgba(15, 23, 42, 0.08)",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                {stat.title}
              </Typography>
              {stat.icon}
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
              {stat.value}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
