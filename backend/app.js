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
