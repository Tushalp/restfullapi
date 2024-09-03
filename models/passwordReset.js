const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({

    user_id:{
        type: String,
        required: true,
        ref: 'User'


        // type: String,
        // required: true,
        // ref:'user',
    },
    token:{
        type: String,
        required: true 
    }

});

module.exports = mongoose.model("passwordReset",passwordResetSchema);