import mongoose from "mongoose"; // Importing mongoose for error checking

import logger from "../logger/winston.logger.js"; // Importing custom logger
import { ApiError } from "../utils/ApiError.js"; // Importing custom ApiError class
import { asyncHandler } from "../utils/asyncHandler.js"; // Importing asyncHandler utility
import { removeUnusedMulterImageFilesOnError } from "../utils/helpers.js"; // Importing helper function to remove unused image files

/**
 *
 * @param {Error | ApiError} err - The error object
 * @param {import("express").Request} req - The request object
 * @param {import("express").Response} res - The response object
 * @param {import("express").NextFunction} next - The next middleware function
 *
 * @description This middleware is responsible to catch the errors from any request handler wrapped inside the {@link asyncHandler}
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Check if the error is an instance of ApiError class which extends native Error class
  if (!(error instanceof ApiError)) {
    // If not, create a new ApiError instance to keep the consistency

    // Assign an appropriate status code
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? 400 : 500;

    // Set a message from native Error instance or a custom one
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Now we are sure that the `error` variable will be an instance of ApiError class
  const response = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}), // Error stack traces should be visible in development for debugging
  };

  // Log the error message
  logger.error(`${error.message}`);

  // Remove any unused image files uploaded by multer
  removeUnusedMulterImageFilesOnError(req);

  // Send error response
  return res.status(error.statusCode).json(response);
};

export { errorHandler }; // Export the errorHandler function
