import { Box, Typography, Paper } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CancelIcon from "@mui/icons-material/Cancel";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import SendIcon from "@mui/icons-material/Send";
import AddTaskIcon from "@mui/icons-material/AddTask";

interface StatusStepperProps {
  currentStatus: string;
  verdict?: "Cleared" | "Discrepant" | null;
}

export default function StatusStepper({ currentStatus }: StatusStepperProps) {
  const steps = [
    { label: "New", icon: <AddTaskIcon fontSize="small" /> },
    { label: "Assigned", icon: <AssignmentIndIcon fontSize="small" /> },
    { label: "In Progress", icon: <PlayCircleFilledWhiteIcon fontSize="small" /> },
    { label: "Submitted", icon: <SendIcon fontSize="small" /> },
    {
      label: currentStatus === "Discrepant" ? "Discrepant" : "Cleared",
      icon: currentStatus === "Discrepant" ? <CancelIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />,
    },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case "New":
        return 0;
      case "Assigned":
        return 1;
      case "In Progress":
        return 2;
      case "Submitted":
        return 3;
      case "Cleared":
      case "Discrepant":
        return 4;
      default:
        return 0;
    }
  };

  const activeIndex = getStepIndex(currentStatus);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 4,
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
        mb: 3,
      }}
    >
      <Typography variant="overline" sx={{ color: "#64748b", letterSpacing: 1.2, fontWeight: 700, mb: 1.5, display: "block" }}>
        Case Progress Lifecycle
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justify: "space-between",
          position: "relative",
          gap: 1,
          overflowX: "auto",
          py: 1,
        }}
      >
        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;

          let activeBg = "#4f46e5";

          if (isActive) {
            if (currentStatus === "Cleared") activeBg = "#16a34a";
            else if (currentStatus === "Discrepant") activeBg = "#dc2626";
            else if (currentStatus === "Submitted") activeBg = "#9333ea";
            else if (currentStatus === "In Progress") activeBg = "#d97706";
            else if (currentStatus === "Assigned") activeBg = "#0284c7";
            else activeBg = "#4f46e5";
          }

          return (
            <Box
              key={step.label}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
                minWidth: 90,
                zIndex: 2,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isActive ? activeBg : isCompleted ? "#f0fdf4" : "#f1f5f9",
                  color: isActive ? "#ffffff" : isCompleted ? "#16a34a" : "#94a3b8",
                  border: `2px solid ${isActive ? activeBg : isCompleted ? "#86efac" : "#cbd5e1"}`,
                  boxShadow: isActive ? `0 4px 14px ${activeBg}40` : "none",
                  transition: "all 0.3s ease",
                  mb: 1,
                }}
              >
                {isActive ? (
                  currentStatus === "Submitted" ? (
                    <HourglassEmptyIcon fontSize="small" />
                  ) : (
                    step.icon
                  )
                ) : isCompleted ? (
                  <CheckCircleIcon fontSize="small" />
                ) : (
                  step.icon
                )}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#0f172a" : isCompleted ? "#16a34a" : "#94a3b8",
                  textAlign: "center",
                  fontSize: "0.75rem",
                }}
              >
                {step.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
