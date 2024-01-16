const mongoose = require("mongoose")

const urlSchema = new mongoose.Schema({
    title:{type:String,required:true},
    longUrl:{type:String,require:true},
    shortUrl:{type:String,require:true},
    clickCount:{type:String,require:true},
    userId:{type:String,require:true},
    createdAt:{type:Date,default:new Date().toString()}
})

const urlModel = mongoose.model('url',urlSchema)

module.exports={urlModel}