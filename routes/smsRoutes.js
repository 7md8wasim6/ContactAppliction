const express = require("express");
const { sendSMS } = require("../services/smsService");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { phoneNumbers, message } = req.body;
    const response = await sendSMS(phoneNumbers, message);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
