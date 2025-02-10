const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const mongoose = require("mongoose");
const User = require("./modals/User"); // Import User model

const app = express();
const port = 3000;

// MongoDB connection
mongoose.connect(
  "mongodb+srv://7md8wasim6:Wasim123@cluster0.k6igu.mongodb.net/",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Multer setup for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// API to upload and process Excel file
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    // Read Excel file from buffer
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0]; // Get first sheet
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet data to JSON
    const data = xlsx.utils.sheet_to_json(sheet);

    // Extract name and phone number
    const users = data.map((row) => ({
      name: row["CHAIRPERSON / RESERVE"], // Column name should match Excel header
      phone: row["MOBILE NUM"], // Column name should match Excel header
    }));

    // Save to MongoDB
    await User.insertMany(users);

    res.status(200).json({ message: "Data uploaded successfully", users });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing file.");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
