const twilio = require("twilio");

const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (phoneNumbers, message) => {
  try {
    if (!phoneNumbers || phoneNumbers.length === 0) {
      throw new Error("Phone numbers are required");
    }

    const smsPromises = phoneNumbers.map((number) =>
      client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: number,
      })
    );

    await Promise.all(smsPromises);
    return { success: true, message: "SMS sent successfully!" };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = { sendSMS };
