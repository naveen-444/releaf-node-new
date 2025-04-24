const mongoose = require('mongoose');
const addNewUserModel = require('../modals/addusermodel');
const { Schema } = mongoose;

const appointmentSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  user_id: { // <-- this is the correct way
    type: Schema.Types.ObjectId,
    ref:addNewUserModel,
    required: true,
  },
  appointment: {
    type: Array,
  },
  intake_form: {
    type: Array,
  },
  file_name: {
    type: String,
  },
  ageVarified: {
    type: String,
  },
  guardianDetails: {
    type: mongoose.Schema.Types.Mixed,
  default: {}
  },
  status:{
    type:String,
    default:'pending'
  }
});

const appointmentModel = mongoose.model('Appointments', appointmentSchema);
module.exports = appointmentModel;
