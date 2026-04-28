import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add CORS header for API
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Serve the logos API
  app.get("/api/logos", async (req, res) => {
    try {
      const dataPath = path.join(__dirname, "src/data/clubs.json");
      const data = await fs.readFile(dataPath, "utf-8");
      
      const parsed = JSON.parse(data);
      res.json(parsed);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to load logos." });
    }
  });

  // Serve the raw data file if needed
  app.get("/api/clubs.json", async (req, res) => {
    try {
      const dataPath = path.join(__dirname, "src/data/clubs.json");
      const data = await fs.readFile(dataPath, "utf-8");
      
      res.setHeader("Content-Type", "application/json");
      res.send(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to load clubs.json" });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
