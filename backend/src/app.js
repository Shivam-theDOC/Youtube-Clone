import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

export const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// limit defines the size of json received , so that our backend doesnt crash
app.use(
  express.json({
    limit: "16kb",
  })
);

//urlencoded is used for the data coming from the url
app.use(express.urlencoded({ limit: "16kb", extended: true }));

app.use(express.static("public"));

app.use(cookieParser());

//router imports

import userRouter from "./routes/user.route.js";

app.use("/api/v1/users", userRouter);
