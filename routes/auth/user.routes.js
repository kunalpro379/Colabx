import { router } from "express";
import passport from "passport";
import { UserRolesEnum } from "../../constants/app_const.js";
import {
    verifyJWT,
    verifyPermission,
  } from "../../middlewares/auth.middlewares.js";

  import { validate } from "../../../validators/validate.js";
import { upload } from "../../../middlewares/multer.middlewares.js";


router.route("/logout").post(verifyJWT, logoutUser);
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router
  .route("/resend-email-verification")
  .post(verifyJWT, resendEmailVerification);

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/verify-email/:verificationToken").get(verifyEmail);
