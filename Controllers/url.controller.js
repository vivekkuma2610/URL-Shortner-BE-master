const express = require("express");
const { userModel } = require("../Models/user.model");
const { urlModel } = require("../Models/url.model");

// Creating Short URL
exports.createShortUrl = async (req, res) => {
  try {
    function generateUrl() {
      var result = "";
      var characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      var charactersLength = characters.length;

      for (var i = 0; i < 5; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }
      return result;
    }
    const user = await userModel.findOne({ _id: req.params.id });
    const unique = await urlModel.findOne({
      longUrl: req.body.longUrl,
      userId: req.params.id,
    });
    if (user && !unique) {
      const data = {
        title: req.body.title,
        userId: req.params.id,
        longUrl: req.body.longUrl,
        shortUrl: generateUrl(),
        userId: req.params.id,
        clickCount: 0,
      };
      const url = await urlModel.create(data);
      const newData = [...user.urlId, url._id];

      user.urlId = newData;
      await user.save();
      res.status(200).json({
        success: true,
        message: "Short URL Created Successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "URL Already shortened",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

// Updating Short URL Click Count
exports.updateCount = async (req, res) => {
  try {
    const url = await urlModel.findOne({ shortUrl: req.params.shortUrl });
    if (url) {
      url.clickCount = Number(url.clickCount) + 1;
      await url.save();
      res.status(200).json({
        success: true,
        message: "Short URL Click Count Updated Successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid URL",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

// Delete Short URL
exports.deleteURL = async (req, res) => {
  try {
    const url = await urlModel.deleteOne({ _id: req.params.id });
    res.status(200).json({
      success: true,
      message: "Short URL Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

// Change Long URL Destination
exports.updateUrl = async (req, res) => {
  try {
    const url = await urlModel.findOne({ _id: req.params.id });
    if (url) {
      url.title = req.body.title;
      url.longUrl = req.body.longUrl;
      await url.save();
      res.status(200).json({
        success: true,
        message: "URL Updated Successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "URL Not Found ",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

// Get List Of Short URL By User Id
exports.getDataById = async (req, res) => {
  try {
    const url = await urlModel.find({ userId: req.params.id });
    if (url) {
      res.status(200).json({
        success: true,
        message: "Data Fetched Successfully",
        data: url,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "URL Not Found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

// Get All URL
exports.getData = async (req, res) => {
  try {
    const url = await urlModel.find();
    res.status(200).json({
      success: true,
      message: "Data Fetched Successfully",
      data: url,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};
