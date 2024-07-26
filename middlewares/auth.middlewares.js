import { AvailableUserRoles } from "../constants/app_const.js";

import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
      }

      try {
        // Verify the token using the secret key
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
          );

          if (!user) {
            throw new ApiError(401, "Invalid access token");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});


export const getLoggedInUserOrIgnore = asyncHandler(async (req, res, next)=>{
  const token=req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ", "");

  try{
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );
    req.user = user;
    next();
  }catch(e){
    next();
  }
});

export const verifyPermission = (roles = []) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user?._id) {
      throw new ApiError(401, "Unauthorized request");
    }
    if (roles.includes(req.user?.role)) {
      next();
    } else {
      throw new ApiError(403, "You are not allowed to perform this action");
    }
  });

export const avoidInProduction = asyncHandler(async (req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    next();
  } else {
    throw new ApiError(
      403,
      "This service is only available in the local environment. For more details visit: https://github.com/hiteshchoudhary/apihub/#readme"
    );
  }
});
