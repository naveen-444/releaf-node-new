const mongoose = require('mongoose');
const roleSchema = mongoose.Schema({})
const rolesModel = mongoose.model('roles',roleSchema);
 module.exports =rolesModel;