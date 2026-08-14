import express from "express";
import cors from "cors";
import morgan from "morgan";
import multer from "multer";
import apiRoutes from "./src/routes/index.js";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "https://verifacts.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without Origin (Postman, curl, server-to-server, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Allow any localhost or 127.0.0.1 origin
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin) || (process.env.CLIENT_URL && origin === process.env.CLIENT_URL)) {
        return callback(null, true);
      }

      console.log("CORS blocked origin:", origin);
      return callback(null, false);
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: " API is healthy.",
  });
});

app.use("/api", apiRoutes);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Something went wrong.",
    });
  }

  next();
});

export default app;