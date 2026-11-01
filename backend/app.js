const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const newsRoutes = require("./routes/newsRoutes");

const app = express();

// Render sits behind a proxy; needed for secure cookies to work.
app.set("trust proxy", 1);

const defaultOrigins = [
  "https://evotimes.xyz",
  "https://www.evotimes.xyz",
  "http://localhost:3000", // Next.js dev
  "http://localhost:5173", // Vite dev (optional, remove if unused)
];

// Supports one or many URLs: CLIENT_URL=https://a.com,https://b.com
const envOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header, such as server-to-server calls.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked origin:", origin);
      console.log("Allowed origins:", allowedOrigins);

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EvoTimes API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Internal server error",
  });
});

module.exports = app;
