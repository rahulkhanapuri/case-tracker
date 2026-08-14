import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { Document } from "../types";
import { getFileUrl } from "../services/api";

interface DocumentViewerModalProps {
  open: boolean;
  onClose: () => void;
  document: Document | null;
}

export default function DocumentViewerModal({ open, onClose, document }: DocumentViewerModalProps) {
  if (!document) return null;

  const fileUrl = getFileUrl(document.path, document.fileName);
  const isImage = document.mimeType?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/i.test(document.originalName);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth slotProps={{ paper: { style: { borderRadius: 16, backgroundColor: "#ffffff" } } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1, borderBottom: "1px solid #e2e8f0" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
          {document.originalName}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "#64748b" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ textAlign: "center", py: 3 }}>
        {document.description && (
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2, fontStyle: "italic" }}>
            Note: "{document.description}"
          </Typography>
        )}

        {isImage ? (
          <Box
            component="img"
            src={fileUrl}
            alt={document.originalName}
            sx={{
              maxWidth: "100%",
              maxHeight: "500px",
              borderRadius: 2,
              objectFit: "contain",
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.1)",
            }}
          />
        ) : (
          <Box
            sx={{
              p: 5,
              borderRadius: 3,
              backgroundColor: "#f8fafc",
              border: "1px dashed #cbd5e1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <InsertDriveFileIcon sx={{ fontSize: 64, color: "#4f46e5" }} />
            <Typography variant="body1" sx={{ color: "#0f172a" }}>
              Preview not available for this file type ({document.mimeType || "Binary Document"})
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: "space-between", borderTop: "1px solid #e2e8f0" }}>
        <Typography variant="caption" sx={{ color: "#64748b" }}>
          Uploaded on {new Date(document.createdAt).toLocaleString()}
        </Typography>
        <Button
          variant="contained"
          component="a"
          href={fileUrl}
          target="_blank"
          download={document.originalName}
          startIcon={<DownloadIcon />}
          sx={{ background: "linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)" }}
        >
          Download Document
        </Button>
      </DialogActions>
    </Dialog>
  );
}
