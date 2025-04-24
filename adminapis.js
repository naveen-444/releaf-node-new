const addNewUserModel = require("./modals/addusermodel")

// get user data api **************************************************



  // get appointments *******************************************************
  app.get('/get-appointment',async function (req,res) {
  
    const existingUser=await addNewUserModel.find()
    return res.json(existingUser)

  })