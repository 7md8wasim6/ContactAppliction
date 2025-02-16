const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const User = require("../models/User");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    let users = [];

    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) return;

      const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      if (data.length < 2) return;

      const headers = data[0];
      const phoneIndex = headers.findIndex(
        (h) => h && h.toString().trim().toLowerCase() === "mobile num"
      );

      if (phoneIndex === -1) return;

      const sheetUsers = data.slice(1).map((row) => ({
        name: row[0] ? row[0].toString().trim() : "Unknown",
        phone: row[phoneIndex] ? row[phoneIndex].toString().trim() : null,
      }));

      users = users.concat(sheetUsers.filter((user) => user.phone));
    });

    if (users.length === 0)
      return res.status(400).json({ error: "No valid data found in file." });

    await User.insertMany(users);
    res.status(200).json({ message: "Data uploaded successfully", users });
  } catch (error) {
    console.error("❌ Error processing file:", error);
    res.status(500).json({ error: "Error processing file." });
  }
});

module.exports = router;
