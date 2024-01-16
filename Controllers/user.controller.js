const express = require("express");
const { userModel } = require("../Models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWTD = require("jwt-decode");
const nodemailer = require("nodemailer");

const secretKey = "a#pmd1s2%dea2#j$h3*dh@!";

// User Sign UP
exports.signUp = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      const { firstName, lastName, email, password } = req.body;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const secret = secretKey + req.body.email;
      const jwtToken = await jwt.sign({ email: email }, secret, {
        expiresIn: "15min",
      });

      const link = `http://localhost:3000/email/verification/${jwtToken}`;

      const data = {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      };
      const user = await userModel.create(data);

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "noreply.project.rsj@gmail.com",
          pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const message = {
        from: "norepay.tinify",
        to: user.email,
        subject: `Please verify your email address`,
        html: `
                                
                                 <h2>Hi ${firstName},</h2>

                                 <p>We just need to verify your email address before you can access Tinify portal.</p>

                                 <p>Verify your email address by clicking the link below</p>
                                 <a href=${link}> Verification Link</a>

                                 <p><b>Note:</b>The link expires 15 minutes from now</p>

                                 <p>Thanks!</p>                               
                                
                                `,
      };

      transporter.sendMail(message, (err, info) => {
        if (err) {
          res.status(400).json({
            success: false,
            message: "Something went wrong, Try again later",
            err,
          });
        } else {
          res.status(200).json({
            success: true,
            message: "Verification Link Send To Your Mail Successfully",
          });
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: "User Already Exist",
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

// User Forget Password
exports.forgetPassword = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (user) {
      const secret = secretKey + user._id;
      const token = await jwt.sign(
        { email: user.email, id: user._id },
        secret,
        { expiresIn: "15min" }
      );
      const link = `http://localhost:3000/resetPassword/${user._id}/${token}`;
      user.token = token;
      await user.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "noreply.project.rsj@gmail.com",
          pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const message = {
        from: "norepay.jayasuriya",
        to: user.email,
        subject: "Password reset request",
        html: `<h2>Hello ${user.name}</h2>
                <p>We've recieved a request to reset the password for your account associated with your email.
                You can reset your password by clicking the link below</p>
                <a href=${link}> Reset Password</a>
                <p><b>Note:</b>The link expires 15 minutes from now</p>
                `,
      };

      transporter.sendMail(message, (err, info) => {
        if (err) {
          res.status(400).json({
            success: false,
            message: "Something went wrong, Try again later",
            err,
          });
        } else {
          res.status(200).json({
            success: true,
            message: "Password Reset link sent to your mail",
          });
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: "User Does't Exist",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Password Reset
exports.resetPassword = async (req, res) => {
  const { id, token } = req.params;
  const user = await userModel.findOne({ _id: id });

  const decode = await JWTD(token);

  if (Math.round(new Date() / 1000) <= decode.exp) {
    try {
      if (user && user.token == token) {
        const secret = secretKey + user._id;
        const verify = jwt.verify(token, secret);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        user.password = hashedPassword;
        user.token = "";
        await user.save();
        res.status(200).json({
          success: true,
          message: "User Password Changed Successfully",
        });
      } else {
        res.status(200).json({
          success: false,
          message: "Invaild link",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error,
      });
    }
  } else {
    res.json({
      success: false,
      message: "Link expired",
    });
  }
};

// Email Verification
exports.emailVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const decode = await JWTD(id);
    const secret = secretKey + decode.email;
    jwt.verify(id, secret, function (err, decoded) {
      if (err) {
        res.status(400).json({
          success: false,
          message: "URL Expired",
          err,
        });
      }
      if (decoded) {
        const varify = async () => {
          const user = await userModel.findOne({ email: decode.email });
          user.account = "active";
          await user.save();

          res.status(200).json({
            success: true,
            message: "Email Varified SuccessFully",
            decoded,
          });
        };
        varify();
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (user) {
      if (user.account == "active") {
        const { email, password } = req.body;
        if (await bcrypt.compare(password, user.password)) {
          const token = await jwt.sign(
            {
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
            },
            secretKey,
            { expiresIn: "1d" }
          );
          res.status(200).json({
            success: true,
            message: "User SignIn Successfully",
            token,
            id: user._id,
          });
        } else {
          res.status(400).json({
            success: false,
            message: "Invalid Password",
          });
        }
      } else {
        const secret = secretKey + user.email;
        const jwtToken = await jwt.sign({ email: user.email }, secret, {
          expiresIn: "1d",
        });

        const link = `http://localhost:3000/email/verification/${jwtToken}`;
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "noreply.project.rsj@gmail.com",
            pass: process.env.EMAIL_PASSWORD,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        const message = {
          from: "norepay",
          to: user.email,
          subject: `Please verify your email address`,
          html: `
                            
                             <h2>Hi ${user.firstName},</h2>
                    
                             <p>We just need to verify your email address before you can access CRM portal.</p>
                    
                             <p>Verify your email address by clicking the link below</p>
                             <a href=${link}> Verification Link</a>
                    
                             <p><b>Note:</b>The link expires 15 minutes from now</p>
                    
                             <p>Thanks!</p>                               
                            
                            `,
        };

        transporter.sendMail(message, (err, info) => {
          if (err) {
            res.status(400).json({
              success: false,
              message: "Something went wrong, Try again later",
              err,
            });
          } else {
            res.status(400).json({
              success: false,
              message:
                "Please Verify The Email. Verification Link Send To Your Mail Successfully",
            });
          }
        });
      }
    } else
      res.status(400).json({
        success: false,
        message: "User Does't Exist",
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

// Getting User Data
exports.getUserData = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.params.id });
    if (user) {
      res.status(200).json({
        success: true,
        message: "Data Fetched Successfully",
        data: user,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "User Not Found",
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
