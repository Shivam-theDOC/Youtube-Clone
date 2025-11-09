import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

//set options for cookies

const options = {
  httpOnly: true,
  secure: true,
};

//* Generate tokens

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateToken();
    const refreshToken = await user.refreshToken();

    user.refreshTokenValue = refreshToken;
    user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(error);
  }
};

//* Register Controller

export const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend

  const { username, email, fullName, avatar, coverImage, password } = req.body;

  // check for validation- fields not empty

  if (
    [username, email, fullName, avatar, coverImage, password].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check if user already exists - username and email

  const userExists = await User.findOne({ $or: [{ email }, { username }] });

  if (userExists) {
    throw new ApiError(409, "User already exists");
  }

  // check for images , avatar
  // upload them to local storage - server storage

  const localAvatarPath = req.files?.avatar[0]?.path;
  let localCoverPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    localCoverPath = req.files.coverImage[0].path;
  }

  console.log(req.files);

  if (!localAvatarPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // upload them to cloudinary

  const uploadedAvatar = await uploadOnCloudinary(localAvatarPath);
  const uploadedCoverImage = await uploadOnCloudinary(localCoverPath);

  if (!uploadedAvatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  // create the user object and save in db

  const user = await User.create({
    username: username.toLowerCase(),
    email: email,
    fullName: fullName,
    avatar: uploadedAvatar.url,
    coverImage: uploadedCoverImage?.url || "",
    password: password,
  });

  // check for entry created in db
  // refreshToken and pass from response

  const createdUser = await User.findById(user._id).select(
    "-password -refreshTokenValue"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating the user");
  }

  //return response

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "Successfully Registered"));
});

//* Login Controller

export const loginUser = asyncHandler(async (req, res) => {
  // get the login cred from the frontend

  const { username, email, password } = req.body;

  // check for validation- empty fields

  if ([username, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields required");
  }

  // check if the user exists in db

  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new ApiError(400, "Check Credentials");
  }

  // compare the password

  const isUserValid = await user.comparePassword(password);

  if (!isUserValid) {
    throw new ApiError(401, "Incorrect Username or Password");
  }

  //generate refresh and access token

  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshTokenValue"
  );

  // send the response

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

//* Logout Controller

export const logoutUser = async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { refreshTokenValue: undefined },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
};

//* Refreshing the access token

export const refreshAccessToken = asyncHandler(async (req, res) => {
  // get the referesh token that will be used to refresh the access token

  const receivedRefreshToken = req.cookies?.refreshToken || req.body;

  // check for validation

  if (!receivedRefreshToken) {
    throw new ApiError(401, "Unauthorized Access");
  }

  // verify the refresh token

  try {
    const decodedToken = jwt.verify(
      receivedRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // fetch the user based on refresh token

    const user = await User.findById(decodedToken._id).select("-password");

    // check if the token is valid or not

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // check if the received refresh token is same as saved refresh token
    // if not return error

    if (receivedRefreshToken !== user?.refreshTokenValue) {
      throw new ApiError(401, "Refresh token expired or consumed");
    }

    // generate new tokens

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    // return the res and the new tokens in cookies

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, {}, "Tokens refreshed successfully"));
  } catch (error) {
    throw new ApiError(error?.message || "Invalid refresh token");
  }
});
//* only for check

export const getCheck = async (req, res) => {
  res.send("req,res workingcd ");
};
