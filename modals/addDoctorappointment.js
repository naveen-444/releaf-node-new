const mongoose = require('mongoose');
const { Schema } = mongoose; // Make sure to import Schema
const addNewDoctorModel = require('../modals/addDoctormodel');
const addNewUserModel = require('../modals/addusermodel');
const appointmentModel = require('../modals/appointmentmodel');
// Define the schema for doctor appointments
const insertUserDataSchema = new Schema({
    doctor_id: {
        type:String
    },
    user_id: {
        type:Schema.Types.ObjectId, // This ensures doctor_id is an ObjectId
        ref:addNewUserModel
       
    },
    appointment_id: {
        type:Schema.Types.ObjectId, // This ensures doctor_id is an ObjectId
        ref:appointmentModel
    },
    date: {
        type: Date, // Using Date type for date, as it ensures proper date handling
        
    },
    time: {
        type: String, // Time can be a string (e.g., '10:45 AM')
       
    }
});

// Create the model for doctor appointments
const addNewDoctorAppointmentModel = mongoose.model('doctors_appointments', insertUserDataSchema);

module.exports = addNewDoctorAppointmentModel;
