// require("dotenv").config();
// const express = require("express");
// const multer = require("multer");
// const xlsx = require("xlsx");
// const mongoose = require("mongoose");
// const User = require("./models/User");

// const app = express();
// const port = process.env.PORT || 3000;

// // MongoDB connection
// mongoose
//   .connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error("MongoDB connection error:", err));

// // Multer setup for file upload
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // API to upload and process Excel file
// app.post("/upload", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded." });
//     }

//     // Read Excel file from buffer
//     const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     const data = xlsx.utils.sheet_to_json(sheet);

//     if (data.length === 0) {
//       return res
//         .status(400)
//         .json({ error: "No valid data found in the file." });
//     }

//     // Extract name and phone number
//     // const users = data
//     //   .map((row) => ({
//     //     name: row["INTERNAL / EXTERNAL MEMBERS"],
//     //     phone: row["MOBILE NUM"],
//     //   }))
//     //   .filter((user) => user.name && user.phone); // Remove empty entries

//     // if (users.length === 0) {
//     //   return res
//     //     .status(400)
//     //     .json({ error: "No valid name and phone number found." });
//     // }

//     const users = data
//       .map((row, index) => {
//         const name = row["INTERNAL / EXTERNAL MEMBERS"]?.toString().trim();
//         const phone = row["MOBILE NUM"]?.toString().trim();

//         if (!name || !phone) {
//           console.log(`Skipping row ${index + 1}: Missing name or phone`);
//           return null;
//         }

//         return { name, phone };
//       })
//       .filter(Boolean);

//     // Save to MongoDB
//     await User.insertMany(users);
//     res.status(200).json({ message: "Data uploaded successfully", users });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error processing file." });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });
require("dotenv").config();
const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const mongoose = require("mongoose");
const User = require("./models/User");

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Multer setup for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    let users = [];

    // Loop through all sheets
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) return;

      // Convert sheet to JSON with raw values
      const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

      if (data.length < 2) return; // Ensure at least 2 rows (headers + data)

      const headers = data[0]; // First row (actual headers)
      console.log(`Processing sheet: ${sheetName}, Headers:`, headers);

      const nameIndex = 0; // Always take column 2 as name
      const phoneIndex = headers.findIndex(
        (h) => h && h.toString().trim().toLowerCase() === "mobile num"
      );

      if (phoneIndex === -1) {
        console.warn(
          `Skipping sheet ${sheetName}: "MOBILE NUM" column not found.`
        );
        return;
      }

      // Extract user data starting from row 2
      const sheetUsers = data
        .slice(1)
        .map((row, i) => {
          const name = row[nameIndex] ? row[nameIndex].toString().trim() : null;
          const phone = row[phoneIndex]
            ? row[phoneIndex].toString().trim()
            : null;

          if (!phone) {
            console.warn(
              `Skipping row ${i + 2} in ${sheetName}: No phone number found.`
            );
            return null;
          }

          return { name: name || "Unknown", phone };
        })
        .filter(Boolean);

      users = users.concat(sheetUsers);
    });

    if (users.length === 0) {
      return res
        .status(400)
        .json({ error: "No valid data found in the file." });
    }

    // Save to MongoDB
    await User.insertMany(users);

    res.status(200).json({ message: "Data uploaded successfully", users });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Error processing file." });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
