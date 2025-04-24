
const express = require('express');
const router = express.Router();
  
const addNewDoctorAppointmentModel=require('../modals/addDoctorappointment')
const addNewUserModel = require('../modals/addusermodel');
const appointmentModel = require('../modals/appointmentmodel');

//############################## Doctor Availability ##################################################//
router.post('/doctor-appointment', async function (req, res) {
  
    try {
       
      const  doctorId=req.body.id;

        const myAppointment = await addNewDoctorAppointmentModel.find({doctor_id:doctorId}).populate([
            { path: 'user_id', select: 'first_name last_name email State DOB phone country' },{path:'appointment_id'}        // only specific fields
            
           
        ])
       
        return res.json({appointment:myAppointment})  

    } catch (error) {
        console.error('Error updating doctor availability:', error);
        res.status(500).json({ message: 'Internal server error' });  
    }
});
 




module.exports = router;

