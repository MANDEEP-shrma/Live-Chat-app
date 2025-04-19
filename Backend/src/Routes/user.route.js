import { Router } from "express";
import {
  register,
  signIn,
  logout,
  editUser,
  changePassword,
  bulkUser,
  viewProfile,
  allFriends,
  addFriend,
  addToBlockList,
  viewOtherProfile,
  searchContacts,
  getAllMessages,
  sendMessage,
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
router.route("/getAllUsers").get(verifyJWT, bulkUser);
router.route("/view-profile").get(verifyJWT, viewProfile);
router.route("/get-all-friends").get(verifyJWT, allFriends);
router.route("/add-friend").post(verifyJWT, addFriend);
router.route("/block-friend").post(verifyJWT, addToBlockList);
// Route to view a specific user's profile
router.get("/view-profile/:userId", verifyJWT, viewOtherProfile);

// Route for searching new contacts
router.post("/search-contacts", verifyJWT, searchContacts);
router.post("/open-chat/:receiverId", verifyJWT, sendMessage);
router.get("/get-all-messages/:requestedUserId", verifyJWT, getAllMessages);
export default router;
