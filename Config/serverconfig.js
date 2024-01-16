const mongoose = require('mongoose')

module.exports = async()=>{
    try {
        const connect = await  mongoose.connect(process.env.MONGODB_CONNECTION_URL)
        console.log("MongoDB connected Successfully")
     } catch (error) {
         console.log(error)
     }
}

// 