import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import progressRoutes from "./routes/progress.routes";
import classRoutes from "./routes/class.routes";
import schoolRoutes from "./routes/school.routes";
import aiRoutes from "./routes/ai.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import systemRoutes from "./routes/system.routes";
import prisma from "./config/prisma";
import { authenticate } from "./middleware/auth";


const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  const startedAt = Date.now();
  const requestBody = ["POST", "PUT", "PATCH"].includes(req.method)
    ? req.body
    : undefined;

  console.log(
    `[${new Date().toISOString()}] -> ${req.method} ${req.originalUrl}`,
  );
  if (requestBody !== undefined) {
    console.log("Body:", requestBody);
  }

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    console.log(
      `[${new Date().toISOString()}] <- ${req.method} ${req.originalUrl} ${res.statusCode} (${durationMs}ms)`,
    );
  });

  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/users", userRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/system", systemRoutes);

// Direct test route
app.get("/api/ai-direct-test", authenticate, (req: any, res: any) => {
  res.json({ message: "Direct AI test route works!", userId: req.user?.id });
});

// Debug OpenRouter API test
app.post("/api/debug-openrouter", async (req: any, res: any) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseUrl =
    process.env.OPENROUTER_BASE_URL || "https://api.openrouter.ai/api/v1";

  console.log("[DEBUG] Testing OpenRouter API...");
  console.log("[DEBUG] API Key exists:", !!apiKey);
  console.log("[DEBUG] Base URL:", baseUrl);

  if (!apiKey) {
    return res.status(400).json({ error: "OPENROUTER_API_KEY not configured" });
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Online Education Platform",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Hello, how are you?" },
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    console.log(
      "[DEBUG] Response status:",
      response.status,
      response.statusText,
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[DEBUG] API Error:", errorText);
      return res
        .status(response.status)
        .json({ error: errorText, status: response.status });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "No response";
    console.log("[DEBUG] Success! Response:", aiResponse.substring(0, 100));

    return res.json({ success: true, response: aiResponse });
  } catch (error) {
    console.error("[DEBUG] Error:", error);
    return res
      .status(500)
      .json({ error: error instanceof Error ? error.message : String(error) });
  }
});

app.use("/api/classes", classRoutes);
app.use("/api/schools", schoolRoutes);
app.get("/users/uuid-by-email", async (req, res) => {
  const email =
    typeof req.query.email === "string" ? req.query.email.trim() : "";

  if (!email) {
    res.status(400).json({ error: "email is required" });
    return;
  }

  const student = await prisma.user.findFirst({
    where: { email, role: "STUDENT" },
    select: { id: true },
  });

  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  res.json({ id: student.id });
});

app.get("/api/users/uuid-by-email", async (req, res) => {
  const email =
    typeof req.query.email === "string" ? req.query.email.trim() : "";

  if (!email) {
    res.status(400).json({ error: "email is required" });
    return;
  }

  const student = await prisma.user.findFirst({
    where: { email, role: "STUDENT" },
    select: { id: true },
  });

  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  res.json({ id: student.id });
});

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

app.get("/api", (req, res) => {
  res.json({ message: "API is running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

app.use((req, res) => {
  res.status(404).json({
    message: "Fallback API response",
    method: req.method,
    path: req.originalUrl,
  });
});

const server = app.listen(port, () => {
  console.log("Server is running on port " + port);
});

export default app;
