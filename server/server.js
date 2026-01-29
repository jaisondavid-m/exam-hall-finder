import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const seating_22HS002 = JSON.parse(readFileSync("./data/22HS002.json", "utf-8"));
const seating_22GE001 = JSON.parse(readFileSync("./data/22GE001.json", "utf-8"));
const viva_22HS002 = JSON.parse(readFileSync("./data/22HS002VV.json", "utf-8"));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "https://exam-hall-finder.vercel.app", // React dev server
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());
const getNum = (r) => Number(r?.match(/\d+$/)?.[0]);
const getPrefix = (r) => r?.replace(/\d+$/, "");
function isInRange(reg, start, end) {
  return (
    getPrefix(reg) === getPrefix(start) &&
    getNum(reg) >= getNum(start) &&
    getNum(reg) <= getNum(end)
  );
}

// Check if register matches a group
function matchRegister(regno, group) {
  return (
    (group.register_start &&
      isInRange(regno, group.register_start, group.register_end)) ||
    (group.register_numbers && group.register_numbers.includes(regno))
  );
}

/* ---------------- API ---------------- */

// Main endpoint to find student details
app.post("/api/find", (req, res) => {
  const { regno, course_code } = req.body;

  if (!regno || !course_code) {
    return res.status(400).json({ error: "regno and course_code required" });
  }

  /* ---------------- 22GE001 - FOC EXAM ---------------- */
  if (course_code === "22GE001") {
    for (const [hall, groups] of Object.entries(seating_22GE001.halls)) {
      for (const g of groups) {
        if (matchRegister(regno, g)) {
          return res.json({
            course_code,
            type: "exam",
            exam_hall: hall,
            degree_branch: g.degree_branch,
            exam_info: seating_22GE001.exam_info,
          });
        }
      }
    }
  }

  /* ---------------- 22HS002 - WRITTEN EXAM ---------------- */
  if (course_code === "22HS002") {
    for (const [hall, groups] of Object.entries(seating_22HS002.halls)) {
      for (const g of groups) {
        if (matchRegister(regno, g)) {
          return res.json({
            course_code,
            type: "exam",
            exam_hall: hall,
            degree_branch: g.degree_branch,
            exam_info: seating_22HS002.exam_info,
          });
        }
      }
    }
  }

  /* ---------------- 22HS002VV - VIVA VOCE ---------------- */
  if (course_code === "22HS002VV") {
    for (const [panel, p] of Object.entries(viva_22HS002.panels)) {
      if (matchRegister(regno, p)) {
        return res.json({
          course_code,
          type: "viva",
          panel,
          venue: p.venue,
          department: p.department,
          strength: p.strength,
          exam_info: viva_22HS002.exam_info,
        });
      }
    }
  }

  // Student not found in any dataset
  res.status(404).json({ 
    error: "Student not found for the given course code",
    regno,
    course_code
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📚 Supported courses: 22GE001, 22HS002, 22HS002VV`);
});

export default app;