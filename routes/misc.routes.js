const express = require('express');
const router = express.Router();
const rolesModel = require('../modals/rolesmodel');
const statesModel = require('../modals/statesmodel');
const authenticateToken = require('../middleware/auth');
const addNewUserModel = require('../modals/addusermodel');

router.get('/roles', async (req, res) => {
  try {
    const roles = await rolesModel.find();
    console.log(roles)
    res.status(200).json({ success: true, data: roles });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching roles' });
  }
});

router.get('/states', async (req, res) => {
  try {
    const states = await statesModel.find();
    res.status(200).json({ success: true, data: states });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching states' });
  }
});
router.get('/get-users',async function (req,res) {
    const existingUser = await addNewUserModel.find()
    if(existingUser){
      return res.json({message:"user data",data:existingUser,success:true}) ;
    }
    else{
      return res.json({message:"server error",success:false}) ;
    }
  })
 
module.exports = router;
    