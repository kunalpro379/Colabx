
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
 //import {
//     AvailableSocialLogins,
//     AvailableUserRoles,
//     USER_TEMPORARY_TOKEN_EXPIRY,
//     UserLoginType,
  //   UserRolesEnum,
  // } from "../../../constants.js";


const userSchema = mongoose.Schema({
    avatar: {
        type: {
          url: String,
          localPath: String,
        },
        default: {
          url: `https://via.placeholder.com/200x200.png`,
          localPath: "",
        },
      },
    name: { type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true, },
    email: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: (value) => {
                const re =
                    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                return value.match(re);
            },
            message: "Please enter a valid email address",
        },
    },
    role: {
        type: String,
      //  enum: AvailableUserRoles,
      },
      password: {
        type: String,
        required: [true, "Password is required"],
      },
      loginType: {
        type: String,
        //enum: AvailableSocialLogins,
      //  default: UserLoginType.EMAIL_PASSWORD,
      },
      isEmailVerified: {
        type: Boolean,
        default: false,
      },
      refreshToken: {
        type: String,
      },
      forgotPasswordToken: {
        type: String,
      },
      forgotPasswordExpiry: {
        type: Date,
      },
      emailVerificationToken: {
        type: String,
      },
      emailVerificationExpiry: {
        type: Date,
      },
    bio: { type: String },
    repassword: {
        type: String,
        //required: [true, "Password is required"],
      }, 
         address: { type: String, default: "" },
    type: { type: String, default: "user", admin: false },
    isDrawingAllowed: { type: Boolean, default: false },
    isCodingAllowed: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    activeRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }] // Rooms where user is currently active
});

// userSchema.methods.isPasswordCorrect = async function (password) {
//     return await bcrypt.compare(password, this.password);
//   };
  
// userSchema.methods.generateAccessToken = function () {
//     return jwt.sign(
//       {
//         _id: this._id,
//         email: this.email,
//         username: this.username,
//         role: this.role,
//       },
//       process.env.ACCESS_TOKEN_SECRET,
//       { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
//     );
//   };
  
//   userSchema.methods.generateRefreshToken = function () {
//     return jwt.sign(
//       {
//         _id: this._id,
//       },
//       process.env.REFRESH_TOKEN_SECRET,
//       { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
//     );
//   };
// /**
//  * @description Method responsible for generating tokens for email verification, password reset etc.
//  */
// userSchema.methods.generateTemporaryToken = function () {
//     // This token should be client facing
//     // for example: for email verification unHashedToken should go into the user's mail
//     const unHashedToken = crypto.randomBytes(20).toString("hex");
  
//     // This should stay in the DB to compare at the time of verification
//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(unHashedToken)
//       .digest("hex");
//     // This is the expiry time for the token (20 minutes)
//     const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;
  
//     return { unHashedToken, hashedToken, tokenExpiry };
//   };

const User = mongoose.model("User", userSchema);
module.exports = User;
