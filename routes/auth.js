const express = require("express");
const authRouter = express.Router();
const authController = require("../controllers/authControllers.js");
const auth = require("../middlewares/auth.js");
// SIGN UP
authRouter.post("/api/signup", authController.signup);

// SIGN IN
authRouter.post("/api/signin", authController.signin);

// TOKEN VALIDATION
authRouter.post("/tokenIsValid", authController.tokenIsValid);

// GET USER DATA
authRouter.get("/user", auth, authController.getUserData);
//authRouter.get("/user", authController.getUserData);


module.exports = authRouter;
