import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String, //* i will use cloudinary url
      required: true,
    },
    coverImage: {
      type: String, //* i will use cloudinary url
    },
    watchHistory: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      index: true,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

//* if we are passingh next as a parameter then we need to use next() (old way)
//  we dont need to pass next , mongoose automatically understands cuz we are using asyn await ,
//  so it waits until the tasks is completed (new way)

//? it is best practice to use hashing and comparing in the model file cuz of cleaner , reusable code.

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = async function () {
  jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.refreshToken = async function () {
  jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = model("User", userSchema);
