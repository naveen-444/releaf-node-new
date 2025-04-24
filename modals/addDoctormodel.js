const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const insertUserDataSchema = mongoose.Schema({
 name:{
   type:String
 },
   
   availableDates:{
    type:String
   },
   
   email:{
       type:String,
       required:true,
       unique: true
   },
   password:{
       type:String,
   },
   phone:{
       type:Number,
   },
  
   role_id:{
       type:String,
   },
   Country:{
     type:String,
   },
   State:{
     type:String,
   },
 
   

   


})
// Pre-save middleware to hash the password before saving
insertUserDataSchema.pre('save', async function (next) {
   const user = this;
 
   // Only hash the password if it's new or if it's modified
   if (user.isModified('password')) {
     try {
       // Hash the password using bcrypt (with a salt round of 10)
       const salt = await bcrypt.genSalt(10);
       user.password = await bcrypt.hash(user.password, salt);
       next(); // Proceed with the save
     } catch (error) {
       next(error); // Handle error if any during hashing
     }
   } else {
     next(); // Proceed without hashing if password isn't modified
   }
 });
// Create a model based on the schema


// Method to compare plain text password with hashed password
insertUserDataSchema.methods.comparePassword = async function (candidatePassword) {
   try {
     return await bcrypt.compare(candidatePassword, this.password);
   } catch (error) {
     throw new Error(error);
   }
 };
const addNewDoctorModel = mongoose.model('Doctors', insertUserDataSchema);

module.exports = addNewDoctorModel;
