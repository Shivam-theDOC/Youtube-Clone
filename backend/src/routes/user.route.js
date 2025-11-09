import { Router } from "express";
import {
  getCheck,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/register")
  .get(getCheck)
  .post(
    upload.fields([
      { name: "avatar", maxCount: 1 },
      { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
  );

router.route("/login").get(getCheck).post(loginUser);

// secured routes
router.route("/logout").get(getCheck).post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

export default router;
