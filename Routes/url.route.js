const express = require('express')
const router = express.Router()
const urlController = require("../Controllers/url.controller")
const jwt = require("jsonwebtoken");

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

router.post('/create/:id',urlController.createShortUrl)

router.put('/update/clickcount/:shortUrl',urlController.updateCount)

router.delete('/delete/:id',urlController.deleteURL)

router.put('/update/:id',urlController.updateUrl)

router.get('/data/:id',validate,urlController.getDataById)

router.get('/data',urlController.getData)

module.exports = router