const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const addNewUserModel = require('../modals/addusermodel');
const transporter = require('../mailer/mailer');
const addNewDoctorModel = require('../modals/addDoctormodel');
const addNewStaffModel=require('../modals/addStaffmodel');
const addNewAdminModel=require('../modals/addAdminmodel');

let resetCodes = {};

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000);
}

function storeResetCode(email, code) {
  resetCodes[email] = {
    code: code,
    timestamp: Date.now(),
  };
}

// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await addNewUserModel.findOne({ email });
      const doctor = await addNewDoctorModel.findOne({email});
      const staff=await addNewStaffModel.findOne({email});
      const admin =await addNewAdminModel.findOne({email});
      
      
    // if(!user){
      
    // }
    console.log(doctor)
      if (!user && !doctor && !staff) return res.status(400).json({ success: false, message: 'User not found' });
  
 
  if(user){
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect password' });
      const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  
      res.status(200).json({ success: true, token, data: user });
  }else if(doctor){
    const isMatch = await doctor.comparePassword(password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect password' });
    const token = jwt.sign({ email: doctor.email, id: doctor._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ success: true, token, data: doctor });
  }
  else if(staff){
    const isMatch = await staff.comparePassword(password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect password' });
    const token = jwt.sign({ email: staff.email, id: staff._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ success: true, token, data: staff });
  }
  else{
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect password' });
    const token = jwt.sign({ email: admin.email, id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ success: true, token, data: admin });
  }
    } catch (err) {
      console.log(err)
      res.status(500).json({ success: false, message: 'Login error' });
    }
  });
  

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  const user = await addNewUserModel.find({ email });
  if (!user) return res.status(400).json({ success: false, message: 'User does not exist' });

  const resetCode = generateCode();
  storeResetCode(email, resetCode);

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Forgot Password',
    html: `<p>Your password reset code is: <strong>${resetCode}</strong></p><p>Code expires in 5 minutes.</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return res.status(500).json({ success: false, message: error.message });
    return res.status(200).json({ success: true, message: 'Reset code sent' });
  });
});

router.post('/verify-code', (req, res) => {
  const { email, otp } = req.body;
  const stored = resetCodes[email];
  if (!stored) return res.status(400).json({ success: false, message: 'No code sent' });

  if (Date.now() - stored.timestamp > 5 * 60000)
    return res.status(400).json({ success: false, message: 'Code expired' });

  if (parseInt(otp) !== stored.code)
    return res.status(400).json({ success: false, message: 'Invalid code' });

  return res.status(200).json({ success: true, message: 'Code verified' });
});

router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  const user = await addNewUserModel.findOne({ email });
  if (!user) return res.status(400).json({ success: false, message: 'User not found' });

  user.password = newPassword;
  await user.save();
  res.status(200).json({ success: true, message: 'Password reset' });
});

// Create new user
router.post('/create', async (req, res) => {
  console.log(req.body)
  try {
    const existingUser = await addNewUserModel.findOne({ email: req.body.data.email });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Duplicate email' });
    }
const data = req.body.data;
    const newUser = new addNewUserModel({ ...req.body.data, role_id: "67d2749d77991c523ae81682" });
    await newUser.save();

    const token = jwt.sign({ email: newUser.email, id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ success: true, message: 'User created', token, data: newUser });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: JSON.stringify(error) });
  }
});

module.exports = router;
