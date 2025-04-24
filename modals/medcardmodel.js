const mongoose = require('mongoose');

const medCardSchema=mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    med_card:{
        type:Array,
    },
    

})
const medCardModel= mongoose.model('mmj_cards',medCardSchema);
module.exports=medCardModel;