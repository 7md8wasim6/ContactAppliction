// require("dotenv").config();
// const express = require("express");
// const multer = require("multer");
// const xlsx = require("xlsx");
// const cors = require("cors");
// const twilio = require("twilio");
// const mongoose = require("mongoose");
// const User = require("./models/User");
// app.use(express.json());
// app.use(cors());

// const client = new twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// const app = express();
// const port = process.env.PORT || 3000;

// // MongoDB connection
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// // Multer setup for file upload
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// app.post("/send-sms", async (req, res) => {
//   const { phoneNumbers, message } = req.body;

//   if (!phoneNumbers || phoneNumbers.length === 0) {
//     return res.status(400).json({ error: "Phone numbers are required" });
//   }

//   try {
//     const smsPromises = phoneNumbers.map((number) =>
//       client.messages.create({
//         body: message,
//         from: process.env.TWILIO_PHONE_NUMBER,
//         to: number,
//       })
//     );

//     await Promise.all(smsPromises);

//     res.status(200).json({ success: true, message: "SMS sent successfully!" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.post("/upload", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded." });
//     }

//     const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
//     let users = [];

//     // Loop through all sheets
//     workbook.SheetNames.forEach((sheetName) => {
//       const sheet = workbook.Sheets[sheetName];
//       if (!sheet) return;

//       // Convert sheet to JSON with raw values
//       const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

//       if (data.length < 2) return; // Ensure at least 2 rows (headers + data)

//       const headers = data[0]; // First row (actual headers)
//       console.log(`Processing sheet: ${sheetName}, Headers:`, headers);

//       const nameIndex = 0; // Always take column 2 as name
//       const phoneIndex = headers.findIndex(
//         (h) => h && h.toString().trim().toLowerCase() === "mobile num"
//       );

//       if (phoneIndex === -1) {
//         console.warn(
//           `Skipping sheet ${sheetName}: "MOBILE NUM" column not found.`
//         );
//         return;
//       }

//       // Extract user data starting from row 2
//       const sheetUsers = data
//         .slice(1)
//         .map((row, i) => {
//           const name = row[nameIndex] ? row[nameIndex].toString().trim() : null;
//           const phone = row[phoneIndex]
//             ? row[phoneIndex].toString().trim()
//             : null;

//           if (!phone) {
//             console.warn(
//               `Skipping row ${i + 2} in ${sheetName}: No phone number found.`
//             );
//             return null;
//           }

//           return { name: name || "Unknown", phone };
//         })
//         .filter(Boolean);

//       users = users.concat(sheetUsers);
//     });

//     if (users.length === 0) {
//       return res
//         .status(400)
//         .json({ error: "No valid data found in the file." });
//     }

//     // Save to MongoDB
//     await User.insertMany(users);

//     res.status(200).json({ message: "Data uploaded successfully", users });
//   } catch (error) {
//     console.error("Error processing file:", error);
//     res.status(500).json({ error: "Error processing file." });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("./config/db");
const smsRoutes = require("./routes/smsRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/send-sms", smsRoutes);
app.use("/upload", uploadRoutes);
app.use("/users", userRoutes);

// Start Server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
