const mongoose = require("mongoose")
const validator = require('validator')

const userSchema = new mongoose.Schema({
    firstName:{type:String,require:true},
    lastName:{type:String,require:true},
    email:{type:String,require:true, validate:(value)=> validator.isEmail(value)},
    password:{type:String,require:true},
    account:{type:String,default:"inactive",require:false},
    token:{type:String,default:"",require:false},
    urlId:{type:Array,default:[],required:false},
    createdAt:{type:Date,default:new Date().toString()},
})

const userModel = mongoose.model('user',userSchema)

module.exports={userModel}