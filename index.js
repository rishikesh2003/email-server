const nodemailer = require("nodemailer");
const express = require("express");
const recipients = require("./config");
const cors = require("cors");
require("dotenv").config();

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

const app = express();
app.use(express.json());
app.use(cors());

app.get("/status", (req, res) => {
  res.send("Email server is up and running");
});

app.post("/send-email", (req, res) => {
  const to = req.query.email;

  if (!to) {
    return res.send("Invalid email");
  }

  const requestData = req.body;
  let mailBody = "";
  // this structures the data as example
  // name: test
  // email: test@gmail.com
  for (const key in requestData) {
    if (requestData.hasOwnProperty(key)) {
      const value = requestData[key];
      mailBody += `${key}: ${value}\n`;
    }
  }

  const recipient = recipients.find((client) => client.to === to);

  if (!recipient) {
    return res.send("Invalid email");
  }

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: to, // Recipient address
    subject: recipient.website + " Form Submission!",
    text: mailBody,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error(error);
    }
    res.send("Email sent!");
  });
});

module.exports = app;
