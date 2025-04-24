const express = require('express');
const connection = require('./connection')
const addNewUserModel = require('./modals/addusermodel');  // Make sure your path is 
const rolesModel = require('./modals/rolesmodel')
const appointmentModel=require('./modals/appointmentmodel')
const medCardModel=require('./modals/medcardmodel')
const statesModel=require("./modals/statesmodel")
const authenticateToken = require('./middleware/auth')
const upload = require('./middleware/multer')
const transporter = require('./mailer/mailer')
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const app = express();
const cors=require('cors');


// middlewares ***********************************

app.use(cors());
dotenv.config();
app.use(express.json());
// app.use(express.urlencoded({ extended: true })); 
//***********************************************


//apis function **************************************************************************


// Create a transporter object using Gmail's SMTP server
// Temporary in-memory store for reset codes (Replace with DB in production)
let resetCodes = {};
 

 
// Function to generate a random code
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000);  // Generates a 6-digit code
}
 

// Function to store reset code temporarily (this should be stored in DB for production)
function storeResetCode(email, code) {
  resetCodes[email] = {
    code: code,
    timestamp: Date.now(),
  };
}




 
// Endpoint to handle forgot password (generate and send code)****************************
app.post('/forgot-password', async (req, res) => {
  const email = req.body.email;
  if (!email) {
    return res.status(400).json({success:false,message:'Email is required'});
  }
  const user = await addNewUserModel.find({'email':email});
  if(!user){
    return res.status(400).json({success:false,message:'User dose not exist'});
  }
  let resetCode = generateCode();  // Generate the reset code
 
  // Store the code temporarily
  storeResetCode(email, resetCode);
 
  // Email content to send to the user
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Forgot Password',
    html: `<p>Your password reset code is: <strong>${resetCode}</strong></p>
           <p>Please use this code to reset your password , expire in 5 minutes.</p>`,
  };
 
  // Send the email with the generated code
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email: ', error);
      return res.status(500).json({success:false,message:'Error sending email: ' + error.message});
    } else {
      console.log('Email sent: ' + info.response);
      return res.status(200).json({success:false,message:'Password reset code sent successfully'});
    }
  });
}); 



 
// Endpoint to verify reset code *******************************************************
app.post('/verify-code', (req, res) => {
  const { email, otp }= req.body;
  if (!email || !otp) {
    return res.status(400).json({success:false,message:'Email and code are required'});
  }
  const storedCodeInfo = resetCodes[email];
  if (!storedCodeInfo) {
    return res.status(400).json({success:false,message:'No reset code sent to this email '+email});
  }
  const timeLimit = 5 * 60 * 1000; // 5 minutes in milliseconds
  const timePassed = Date.now() - storedCodeInfo.timestamp;
 
  if (timePassed > timeLimit) {
    return res.status(400).json({success:false,message:'The reset code has expired'});
  }
 
  if (parseInt(otp) !== storedCodeInfo.code) {
    return res.status(400).json({success:false,message:'Invalid reset code'});
  }
  return res.status(200).json({success:true,message:'Code verified successfully. Proceed with password reset.'});
});
 


// create user api *********************************************************************
app.post('/create-user', async function (req, res) {
  try {
    const existingUser = await addNewUserModel.findOne({ email: req.body.data.email });
 
    if (existingUser) {
      return res.status(400).json({success:false,message:'Duplicate email'});
    } else {
      const newUser = new addNewUserModel({
        last_name: req.body.data.last_name,
        email: req.body.data.email,
        password: req.body.data.password,
        phone: req.body.data.phone,
        DOB: req.body.data.dob,
        role_id:"67d2749d77991c523ae81682",
        postal_code:req.body.data.postal_code,
        State:req.body.data.State,
        Country:req.body.data.Country,
        first_name:req.body.data.first_name,
        name:req.body.data.name,
      });
          await newUser.save();
           // Log the user in immediately after registration (generate JWT token)
    const token = jwt.sign({ email: newUser.email, id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.status(201).json({
      success: true,
      message: 'User registered and logged in successfully',
      token: token,
      data: newUser
    });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({success:false,message:'Internal server error'});
  }
});

 
 //get login user  api ****************************************************************
app.post('/login-user',async function (req,res){
 
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({success:false, message: 'Please provide both username and password' });
  }
  try {
    const user = await addNewUserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({success:false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
 
    if (isMatch) {
      const token = jwt.sign({ email: user.email,id:user._id },process.env.JWT_SECRET, {
        expiresIn: '1d', 
      });
    
      res.status(200).json({success:true, message: 'Login successful',
        token:token,data:user,
       });
    } else {
      res.status(400).json({success:false, message: 'Incorrect password' });
    }
    
  } catch (err) {
    res.status(500).json({success:false, message: 'Error during login', error: err.message });
  }
});


app.post('/update-user', async (req, res) => {
  const { email, last_name, first_name, phone, DOB, role_id, postal_code, State, Country } = req.body;

  try {
    // Find the user by email
    const user = await addNewUserModel.findOne({ email: email });
    
    // Check if user exists
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    // Update user details
    user.last_name = last_name;
    user.first_name = first_name;
    user.phone = phone;
    user.DOB = DOB;
    user.role_id = role_id;
    user.postal_code = postal_code;
    user.State = State;
    user.Country = Country;

    // Save updated user
    const updatedUser = await user.save();

    // Send response with success message
    return res.status(200).json({ success: true, message: 'User updated successfully',data: updatedUser });
  } catch (error) {
    console.error('Error updating user: ', error);
    return res.status(500).json({ success: false, message: 'Error updating user' });
  }
});



// Reset Password Route ******************************************************************
app.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email and new password are required' });
  }
  try {
    const user = await addNewUserModel.findOne({'email': email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }
    user.password = newPassword;
    await user.save();
    return res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password: ', error);
    return res.status(500).json({ success: false, message: 'Error resetting password' });
  }
}); 
 

// appointmet api ********************************************************************************
app.post('/appointment',upload.single('file'),async function (req,res) {

  
  if (!req.body.email) {
    return res.json({ success: false, message: "*Email is required" });
  }

  const newUser= new appointmentModel({
    email:req.body.email,
    appointment:req.body.appointment,
    intake_form:req.body.intake_form,
    file_name :req.file.filename,
    ageVarified:req.body.ageVarified,
    guardianDetails:req.body.guardianDetails
  })
 const saveData= await newUser.save()
 return res.json({success:true,message:"Appointment successfully created",
  data:"form completed",savedata:saveData
 })
})
  



// med card api ********************************************************************

app.post('/med-card',authenticateToken,async function (req,res) {
  
  const find = await medCardModel.findOne({email:req.body.email});
  if(find){
      const exitingUser = await medCardModel.updateOne({
        $push:{med_card:{
          title:req.body.title,
          description:req.body.description,
          duration:req.body.duration,
          price:req.body.price
        },
       
      }
      })  
     return res.send(exitingUser)
  }else{
    const newUser= new medCardModel({
      email:req.body.email,
      med_card:{
        title:req.body.title,
          description:req.body.description,
          duration:req.body.duration,
          price:req.body.price
      },
      
    })
   const saveData= await newUser.save()
   return res.send(saveData)
  }

})

app.get('/states',async function (res,res) {
  const data = await statesModel.find();
  res.json({data:data});
}) 

app.get('/get-roles',authenticateToken,async function (req,res){
  const existingUser = await rolesModel.find();
  return res.json({success:true,data:existingUser})
})
 
// Change the route to POST so that we can accept a body
app.post('/get-users', async function (req, res) {
  const email = req.body.email; // Get email from request body

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    const existingUser = await addNewUserModel.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, data: existingUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


// Appoinment details
app.get('/appointment-details', async function (req, res) {
  try {
    const users = await appointmentModel.find(); // Fetch all documents

    if (!users.length) {
      return res.json({ success: false, message: "No appointments found." });
    }

    return res.json({
      success: true,
      message: "All appointments retrieved successfully.",
      data: users
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


// running on port *******************************
app.listen(7000,'0.0.0.0', () => {
  console.log('Server is running on port 7000');
});