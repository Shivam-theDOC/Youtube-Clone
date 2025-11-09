import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    (await req.cookies?.accessToken) ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized Access");
  }

  const isTokenValid = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  req.user = await User.findById(isTokenValid._id).select(
    "-password -refreshTokenValue"
  );

  next();
});
