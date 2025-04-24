const mongoose = require('mongoose');

const stateSchema=mongoose.Schema({
    country:{
        type:String,
        required:true,
        unique: true
    },
    states:{
        type:Array,
    },
   

})
const statesModel= mongoose.model('States',stateSchema);
module.exports=statesModel;