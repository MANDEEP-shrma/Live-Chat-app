import { Router } from "express";
import {
  register,
  signIn,
  logout,
  editUser,
} from "../Controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(upload.single("avatar"), register);
router.route("/signin").post(signIn);
router.route("/logout").get(verifyJWT, logout);
router
  .route("/edit-profile")
  .patch(verifyJWT, upload.single("avatar"), editUser);
export default router;
