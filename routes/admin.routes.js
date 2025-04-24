const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const addNewUserModel = require('../modals/addusermodel')
const appointmentModel = require('../modals/appointmentmodel');
const addNewAdminModel=require('../modals/addAdminmodel');
const fs = require('fs');
const path = require('path');
 
 
//*************************************""***************************************************************/
router.post('/doctor',async function (req,res){
  console.log(req.body)
    try {
        const existingUser = await addNewUserModel.findOne({ email: req.body.email });
      console.log(existingUser);
        if (existingUser) {
          return res.status(400).json({ success: false, message: 'Duplicate email' });
        }
    
        const newUser = new addNewUserModel({ ...req.body, role_id: "67d274af77991c523ae81683" });
        await newUser.save();
    
    
        res.status(201).json({ success: true, message: 'doctor created', data: newUser });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Internal error' });
      }
})
 
 
//*****************************************************/
router.get('/get-single-user/:id', async (req, res) => {
 
const arr = req.params.id.split(",");
  try {
    const data = await addNewUserModel.findById(arr[0]);
    const appointments = await appointmentModel.findById(arr[1]);  
 
    if (!data) {
      return res.status(404).json({ message: 'User not found' });
    }
    const imageUrl = appointments.file_name
      ? `${appointments.file_name}`
      : null;
 
    res.json({
     
      data:data,
      appointments,
      imageUrl
    });  
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
 
 
//#############################################Doctor Listing##########################################
 
router.get('/doctor-list', async function (req, res) {
  try {
    const data = await addNewUserModel.find({role_id:'67d274af77991c523ae81683'});
 
    if (data) {
      res.json({ success: true,data: data });
    } else {
      res.json({ success: false, message: 'No doctors found.' });
    }
  } catch (error) {
    console.error('Error fetching doctor list:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});
//############################## Get Single doctor ##################################//
router.get('/get-single-doctor/:id', async (req, res) => {
  try {
    const { id } = req.params;
 
    const doctor = await addNewUserModel.findById(id);
 
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
 
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
//#################################update doctor details ################################//
router.post('/update-doctor/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    // console.log(req.body)
    const updatedDoctor = await addNewUserModel.updateOne(
      { _id: id}, // Filter by username
      { $set: updateData }, // Update the email
      { upsert: true } // Perform upsert
    );
 
    if (!updatedDoctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
 
    res.status(200).json({ success: true, message: 'Doctor updated successfully', data: updatedDoctor });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ success: false, message: 'Server error while updating doctor' ,error:error});
  }
});
//############################### Delete Doctor #####################################//
router.post('/delete-doctor/:id', async (req, res) => {
  try {
    const { id } = req.params;
 
    const deletedDoctor = await addNewUserModel.findByIdAndDelete(id);
 
    if (!deletedDoctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
 
    res.status(200).json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting doctor' });
  }
});
 
 
//########################Staff List###################################################//
 
router.get('/staff-list', async function (req, res) {
  try {
    const data = await addNewUserModel.find({role_id:'67d274cb77991c523ae81684'});
 
    if (data) {
      res.json({ success: true,data: data });
    } else {
      res.json({ success: false, message: 'No staff found.' });
    }
  } catch (error) {
    console.error('Error fetching staff list:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});
//############################## Get Single Staff ##################################//
router.get('/get-single-staff/:id', async (req, res) => {
  try {
    const { id } = req.params;
 
    const Staff = await addNewUserModel.findById(id);
 
    if (!Staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
 
    res.status(200).json({ success: true, data: Staff });
  } catch (error) {
    console.error('Error fetching Staff:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
//#################################update doctor details ################################//
router.post('/update-staff/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
 
    const updatedStaff =  await addNewUserModel.updateOne(
      { _id: id}, // Filter by username
      { $set: updateData }, // Update the email
      { upsert: true } // Perform upsert
    );
    if (!updatedStaff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
 
    res.status(200).json({ success: true, message: 'Staff updated successfully', data: updatedStaff });
  } catch (error) {
    console.error('Error updating Staff:', error);
    res.status(500).json({ success: false, message: 'Server error while updating Staff' });
  }
});
//############################### Delete Staff #####################################//
router.post('/delete-staff/:id', async (req, res) => {
  try {
    const { id } = req.params;
 
    const deletedStaff = await addNewUserModel.findByIdAndDelete(id);
 
    if (!deletedStaff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
 
    res.status(200).json({ success: true, message: 'Staff deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting staff' });
  }
});
 
//###########################Staff CReate###########################################################//
 
router.post('/staff',async function (req,res){
  console.log(req.body)
    try {
        const existingUser = await addNewUserModel.findOne({ email: req.body.email });
      console.log(existingUser);
        if (existingUser) {
          return res.status(400).json({ success: false, message: 'Duplicate email' });
        }
    
        const newUser = new addNewUserModel({ ...req.body, role_id: "67d274cb77991c523ae81684" });
        await newUser.save();
    
    
        res.status(201).json({ success: true, message: 'Staff created', data: newUser });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Internal error' });
      }
});
 
//#############################################Patient Listing##########################################
 
router.get('/user-list', async function (req, res) {
  try {
    const data = await addNewUserModel.find({role_id:'67d2749d77991c523ae81682'});
 
    if (data) {
      res.json({ success: true,data: data });
    } else {
      res.json({ success: false, message: 'No patient found.' });
    }
  } catch (error) {
    console.error('Error fetching patient list:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});
 
//#################################### Edit Patient Infomation#######################################//
router.get('/get-single-patient/:id', async (req, res) => {
  try {
    const { id } = req.params;
 
    const Patient = await addNewUserModel.findById(id);
 
    if (!Patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
 
    res.status(200).json({ success: true, data: Patient });
  } catch (error) {
    console.error('Error fetching Staff:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
 
//#################################update Patient details ################################//
router.post('/update-patient/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
 
    const updatedPatient =  await addNewUserModel.updateOne(
      { _id: id}, // Filter by username
      { $set: updateData }, // Update the email
      { upsert: true } // Perform upsert
    );
 
    if (!updatedPatient) {
      return res.status(404).json({ success: false, message: 'Patent not found' });
    }
 
    res.status(200).json({ success: true, message: 'Patient Details updated successfully', data: updatedPatient });
  } catch (error) {
    console.error('Error updating Staff:', error);
    res.status(500).json({ success: false, message: 'Server error while updating Patient' });
  }
});
 
 
 
//############################### Delete Patient #####################################//
router.post('/delete-patient/:id', async (req, res) => {
  try {
    const { id } = req.params;
 
    const deletedPatient = await addNewUserModel.findByIdAndDelete(id);
 
    if (!deletedPatient) {
      return res.status(404).json({ success: false, message: 'patient not found' });
    }
 
    res.status(200).json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting patient' });
  }
});
 
 
module.exports=router;