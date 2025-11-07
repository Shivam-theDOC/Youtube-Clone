import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const registerUser = asyncHandler(async (req, res) => {
  //

  const { username, email } = req.body;

  console.log(username, email);

  res.status(200).json(new ApiResponse(201, "received"));
});
