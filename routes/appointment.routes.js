const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const appointmentModel = require('../modals/appointmentmodel');
const addNewUserModel = require('../modals/addusermodel')
const addNewDoctorAppointmentModel=require('../modals/addDoctorappointment')
const fs = require('fs');
const { put } = require('@vercel/blob');

// POST route to handle file upload and appointment data
router.post('/', upload.single('file'), async (req, res) => {
  console.log(req.body)
  try {
    const appointData = JSON.parse(req.body.appointment);  // Parse appointment data from the request
    const filePath = req.file.path;  // Path to the temporary file stored in /tmp

    // Upload the file to Vercel Blob Storage
    const fileStream = fs.createReadStream(filePath);  // Read the file as a stream
    const { url } = await put(`appointments/${req.file.filename}`, fileStream, {
      access: 'public',  // Make the file publicly accessible
      contentType: req.file.mimetype,  // Set the correct MIME type
    });

    // Clean up the temporary file after upload
    fs.unlinkSync(filePath);

    // Create and save the appointment document in MongoDB
    const newAppointment = new appointmentModel({
      email: req.body.email,
      user_id: req.body.user_id,
      appointment: req.body.appointment,
      intake_form: req.body.intake_form,
      file_name: url,  // Store the file name
       // Store the public URL of the uploaded file
      ageVarified: req.body.ageVarified,
      guardianDetails: req.body.guardianDetails,
    });

    const saved = await newAppointment.save();  // Save appointment to DB

    // Find the doctor based on the state from the appointment data
    const find_doc = await addNewUserModel.findOne({
      role_id: '67d274af77991c523ae81683',  // Example role_id (doctor)
      State: appointData.state,
    });

    if (find_doc) {
      // Convert ObjectId to string
      const stringId = find_doc._id.toString();

      // Create and save the doctor appointment
      const addAppointment = new addNewDoctorAppointmentModel({
        doctor_id: stringId,
        user_id: req.body.user_id,
        appointment_id: saved._id,
        date: appointData.date,
        time: appointData.time,
      });

      const appointmentsave = await addAppointment.save();  // Save doctor appointment

      // Update appointment status to 'scheduled'
      if (appointmentsave) {
        await appointmentModel.updateOne(
          { _id: saved._id },  // Find the created appointment
          { $set: { status: 'scheduled' } }  // Update status
        );
      }
    }

    // Respond with success message
    res.status(201).json({ success: true, message: 'Appointment created', data: saved });
  } catch (err) {
    console.error('Error saving appointment:', err);
    res.status(500).json({ success: false, message: 'Error saving appointment', error: err.message });
  }
});

router.get('/all', async (req, res) => {
  try {
    const all = await appointmentModel.find();
    res.status(200).json({ success: true, data: all });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching appointments' });
  }
});

module.exports = router;
