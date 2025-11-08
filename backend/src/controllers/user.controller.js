import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating the user");
  }

  //return response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "Successfully Registered"));
});

export const loginUser = asyncHandler(async (req, res) => {
  // get the login cred from the frontend
  const { username, email, password } = req.body;
  // check for validation- empty fields

  if ([username, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields required");
  }
  // check if the user exists in db
  const user = await User.findOne({ $or: [{ username }, { email }] }).select(
    "-password -refreshToken"
  );

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

  // send the response
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: user, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});
