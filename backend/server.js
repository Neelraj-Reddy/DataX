const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const transformRoutes = require("./routes/transform");
const loadRoutes = require("./routes/load");
const editorRoutes = require("./routes/editor");
const lineageRoutes = require("./routes/lineage");
const db = require("./db");


// Serve static frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Routes
app.use("/api/transform", transformRoutes);
app.use("/api/load", loadRoutes);
app.use("/api/editor", editorRoutes);
app.use("/api/lineage", lineageRoutes);

// Example user profile API (Home Page)
app.get("/api/user", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users LIMIT 1");
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: "No user found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
