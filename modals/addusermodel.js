 const mongoose = require('mongoose');
 const bcrypt = require('bcryptjs');

 const insertUserDataSchema = mongoose.Schema({
  name:{
    type:String
  },
  availableDates:{
    type:Array
   },
    first_name:{
        type:String,
    },
    last_name:{
      type:String,
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
    DOB:{
        type:Date,
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
    postal_code:{
      type:String,
    },

    doctor_id:{
      type:String,
    },

    ageVarified: {
    type: String, // 'yes' or 'no'
  },
  guardianDetails: {
    type:Object,
  }
    

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

 insertUserDataSchema.pre('updateOne', async function (next) {
  const update = this.getUpdate();

  if (update?.$set?.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(update.$set.password, salt);
      update.$set.password = hashed;
      this.setUpdate(update);
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});
 // Method to compare plain text password with hashed password
insertUserDataSchema.methods.comparePassword = async function (candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      throw new Error(error);
    }
  };
const addNewUserModel = mongoose.model('Users', insertUserDataSchema);

module.exports = addNewUserModel;

