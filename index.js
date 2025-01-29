const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const recipients = require("./config");
require("dotenv").config();

// Configure the email transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.USER, // Email account username from environment variables
    pass: process.env.PASS, // Email account password (App Password recommended)
  },
});

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cors()); // Enable CORS for cross-origin requests

// Health check endpoint to verify server status
app.get("/status", (req, res) => {
  res.send("Email server is up and running");
});

// Endpoint to send an email
app.post("/send-email", (req, res) => {
  const to = req.query.email; // Retrieve recipient email from query parameter
  if (!to) return res.status(400).send("Invalid email");

  const recipient = recipients.find((client) => client.to === to); // Validate recipient
  if (!recipient) return res.status(404).send("Recipient not found");

  // Construct email body from request JSON
  const mailBody = Object.entries(req.body)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  // Define email options
  const mailOptions = {
    from: process.env.FROM_EMAIL, // Sender email
    to, // Recipient email
    subject: `${recipient.website} Form Submission!`, // Email subject
    text: mailBody, // Email content
  };

  // Send email using Nodemailer
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Error sending email"); // Return error response if email fails
    }
    res.send("Email sent successfully"); // Return success response
  });
});

module.exports = app;
