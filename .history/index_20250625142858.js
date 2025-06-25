const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// Middleware to log incoming requests (optional, but useful)
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

app.get("/")

// POST /log route
app.post("/log", (req, res) => {
  console.log("Received POST /log");

  const logEntry = req.body;

  if (!logEntry || Object.keys(logEntry).length === 0) {
    console.error("Received empty or invalid JSON.");
    return res.status(400).send("Bad Request: Missing or invalid body.");
  }

  const pid = logEntry.pid || "unknownPID";

  // Sanitize pid for filename safety
  const safePid = pid.replace(/[^a-zA-Z0-9_-]/g, "");
  const timestamp = Date.now();
  const filename = `log_PID-${safePid}_${timestamp}.json`;
  const filePath = path.join(logsDir, filename);

  fs.writeFile(filePath, JSON.stringify(logEntry, null, 2), "utf8", (err) => {
    if (err) {
      console.error("File write error:", err);
      return res.status(500).send("Server Error: Could not save log.");
    }

    console.log(`Log saved to ${filename}`);
    res.send("Log received and stored.");
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
