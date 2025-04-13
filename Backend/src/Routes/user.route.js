import { Router } from "express";
import {
  register,
  signIn,
  logout,
  editUser,
  changePassword,
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

router.route("/change-password").patch(verifyJWT, changePassword);
export default router;
