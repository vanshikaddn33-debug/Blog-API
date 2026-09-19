const mongoose = require("mongoose");

const userschema = new mongoose.Schema({
     username:{
        type: String,
        required: true,
        trim: true,
     },
     email:{
        type:  String,
        required: true,
        unique: true,
        trim: true,
     },
     password:{
        type: String,
        required: true,
     },
   },
    {
        timestamps: true,
    }
);

const user = mongoose.model("user", userschema);
module.exports = user;