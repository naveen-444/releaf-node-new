const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Create a transporter object using Gmail's SMTP server
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,  // Gmail address from environment variables
      pass: process.env.GMAIL_PASS,  // App-specific password from environment variables
    },
  });

module.exports=transporter;