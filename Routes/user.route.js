const express = require('express')
const router = express.Router()
const {userModel} = require('../Models/user.model')
const jwt = require('jsonwebtoken')
const userController = require("../Controllers/user.controller")

const validate = async(req,res,next)=>{
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1];
        const data = await jwt.decode(token);
        if (Math.round(new Date() / 1000) < data.exp) {
          next();
        } else {
          res.status(400).json({
            message: "Token Experied",
          });
        }
      } else {
        res.status(400).json({
          message: "Token Not Found",
        });
      }
}

router.post('/signup',userController.signUp)

router.post('/email/verification/:id',userController.emailVerification)

router.post('/login',userController.login)

router.get('/profile/:id',validate,userController.getUserData)

router.post("/forget-password",userController.forgetPassword );

router.post("/reset-password/:id/:token", userController.resetPassword);

module.exports = router