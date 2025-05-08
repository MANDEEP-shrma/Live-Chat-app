import { User } from "../Models/users.model.js";
import { Message } from "../Models/messages.model.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/apiError.js";
import { ApiResponse } from "../Utils/apiResponse.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";
import { emitMessageToUser } from "../Utils/socket.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const refreshToken = await user.generateRefreshToken();
    const accessToken = await user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something Went wrong While generating Access and Refresh Token"
    );
  }
};

const register = asyncHandler(async (req, res) => {
  const { email, name, phoneNo, password } = req.body;
  if (
    [email, phoneNo, name, password].some((eachField) => {
      return eachField?.trim() === "";
    })
  ) {
    throw new ApiError(400, "All Fields are compulsory");
  }

  const userExistInDb = await User.findOne({
    $or: [{ email, phoneNo }],
  });

  if (userExistInDb) {
    throw new ApiError(
      409,
      "The email or PhoneNo is already registered with us"
    );
  }

  //taking avatar localpath
  const avatarLocalPath = req.file?.path;
  console.log("Local path of the file : " + avatarLocalPath);
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is Required");
  }

  //Saving the avatar in Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar Save failed,Please re-insert the image");
  }

  //Creation
  const user = await User.create({
    email,
    name,
    phoneNo,
    avatar: avatar.url,
    password,
  });

  const userCreationCheck = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!userCreationCheck) {
    throw new ApiError(500, "Something went wrong while creating the user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(200, userCreationCheck, "User Registered SuccessFully")
    );
});

const signIn = asyncHandler(async (req, res) => {
  const { emailorPhone, password } = req.body;
  console.log(req.body);
  let user;
  if (emailorPhone.includes("@")) {
    user = await User.findOne({ email: emailorPhone });
  } else {
    user = await User.findOne({ phoneNo: emailorPhone });
  }
  if (!user) {
    throw new ApiError(404, "Signup first");
  }

  const isPasswordValid = user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password is Invalid");
  }

  const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User loggedIn Successfully"
      )
    );
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-refreshToken -password"
  );
  return res.status(200).json({ user: user });
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    //we are able to access id here because of auth.middleware.js there
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User LoggedOut Successfully"));
});

//on this route user can edit itself.
//form-data in postman work after putting multer config in route
const editUser = asyncHandler(async (req, res) => {
  //User from auth middleware
  const userId = req.user._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized Access Denied");
  }
  //Fields he/she wants to edit
  let { newName, newBio } = req.body;
  if (!newName) {
    newName = req.user.name;
  }
  if (!newBio) {
    newBio = req.user.bio;
  }

  const avatarLocalPath = req.file?.path;
  let avatar;
  if (!avatarLocalPath) {
    avatar = req.user.avatar;
  } else {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
      throw new ApiError(400, "Avatar Save failed,Please re-insert the image");
    }
  }

  const userToUpdate = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        name: newName,
        bio: newBio,
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  if (!userToUpdate) {
    throw new ApiError(
      500,
      "Server is not able to save your data, Try again later"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userToUpdate, "Data Updated successfully"));
});

const deleteMe = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized Access Denied");
  }

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

//on this route user can edit it's password
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword) {
    throw new ApiError(
      401,
      "Please Enter your old password inorder to update with new one"
    );
  }

  const user = await User.findById(req.user?._id);
  //checking the oldpassword
  const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isOldPasswordCorrect) {
    throw new ApiError(401, "Your Old password doesn't match");
  }

  //if oldpassword is okay then we will save our new password
  if (!newPassword) {
    throw new ApiError(400, "Please enter a new password");
  }

  user.password = newPassword;
  await user.save(); // <== this triggers the hashing

  const updatedUser = user.toObject();
  delete updatedUser.password;

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "The Password is Updated SuccessFully")
    );
});

const viewProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).select(
    "-refreshToken -password"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Fetched SuccessFully"));
});

//returns all users but not return the users which are blocked by current user.
const bulkUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).select("blockedUser");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const allUsers = await User.find({
    _id: { $nin: user.blockedUser },
  }).select("-password -refreshToken -email");

  return res
    .status(200)
    .json(new ApiResponse(200, allUsers, "All Users Fetched Successfully"));
});

//there will be a button of "+ or add " which trigger this
const addFriend = asyncHandler(async (req, res) => {
  //Friend comes from body (in future params)
  const { friendId } = req.body;
  console.log(friendId);
  //FriendId required
  if (!friendId) {
    throw new ApiError(400, "Friend ID is required");
  }

  //Extracting our user
  const user = await User.findById(req.user?._id).select("friends");

  //User exists
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  //if Friend already exists
  if (user.friends.includes(friendId)) {
    throw new ApiError(400, "User is already in your friends list");
  }

  //finding friend in db
  const friend = await User.findById(friendId);
  //friend not found
  if (!friend) {
    throw new ApiError(404, "Friend not found");
  }

  // Add current user to friend's friends list
  await User.updateOne(
    { _id: friendId },
    { $addToSet: { friends: req.user?._id } }
  );

  // Add friend to current user's friends list
  await User.updateOne(
    { _id: req.user?._id },
    { $addToSet: { friends: friendId } }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { user: friend }, "Friend added successfully"));
});

//There will be a button like "- or block" to trigger this
const addToBlockList = asyncHandler(async (req, res) => {
  const blockUserId = req.query.blockUserId;

  if (!blockUserId) {
    throw new ApiError(400, "Block User Id is required");
  }

  const user = await User.findById(req.user?._id).select("blockedUser friends");

  //User exists
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.blockedUser.includes(blockUserId)) {
    throw new ApiError(400, "User is already in your Block list");
  }

  //finding blockUser in db
  const blockUser = await User.findById(blockUserId);
  //Block not found
  if (!blockUser) {
    throw new ApiError(404, "User not found");
  }

  // Add to blocked list
  user.blockedUser.push(blockUserId);

  // Remove from friends list if present
  user.friends = user.friends.filter(
    (friendId) => friendId.toString() !== blockUserId
  );

  await user.save();

  // Delete messages between the current user and the blocked user
  await Message.deleteMany({
    $or: [
      { sender: req.user._id, receiver: blockUserId },
      { sender: blockUserId, receiver: req.user._id },
    ],
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "User Blocked successfully and messages deleted")
    );
});
const removeFriend = asyncHandler(async (req, res) => {
  const { friendId } = req.body;

  if (!friendId) {
    throw new ApiError(400, "Friend ID is required");
  }

  const user = await User.findById(req.user?._id).select("friends");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.friends.includes(friendId)) {
    throw new ApiError(400, "User is not in your friends list");
  }

  // Remove friend from current user's friends list
  user.friends = user.friends.filter((id) => id.toString() !== friendId);
  await user.save();

  // Remove current user from friend's friends list
  await User.updateOne(
    { _id: friendId },
    { $pull: { friends: req.user?._id } }
  );

  // Delete messages between the current user and the removed friend
  await Message.deleteMany({
    $or: [
      { sender: req.user._id, receiver: friendId },
      { sender: friendId, receiver: req.user._id },
    ],
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Friend removed successfully and chats deleted")
    );
});

const allFriends = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).select("friends");

  if (!user || !user.friends || user.friends.length === 0) {
    throw new ApiError(404, "No friends found");
  }

  const allKnowns = await User.find({ _id: { $in: user.friends } }).select(
    "-password -refreshToken -email"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, allKnowns, "Friends fetched successfully"));
});

const unBlockUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const currentUser = await User.findById(req.user._id).select("blockedUser");

  if (!currentUser) {
    throw new ApiError(404, "Current user not found");
  }

  if (!currentUser.blockedUser.includes(userId)) {
    throw new ApiError(400, "User is not in your blocked list");
  }

  // Remove the user from the blocked list
  currentUser.blockedUser = currentUser.blockedUser.filter(
    (blockedId) => blockedId.toString() !== userId
  );

  await currentUser.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User unblocked successfully"));
});

const allBlockedUsers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).select("blockedUser");

  if (!user || !user.blockedUser || user.blockedUser.length === 0) {
    throw new ApiError(404, "No blocked users found");
  }

  const blockedUsers = await User.find({
    _id: { $in: user.blockedUser },
  }).select("-password -refreshToken -email");

  return res
    .status(200)
    .json(
      new ApiResponse(200, blockedUsers, "Blocked users fetched successfully")
    );
});

const viewOtherProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params; // Get userId from URL parameter

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  // Find user by userId
  const user = await User.findById(userId).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile fetched successfully"));
});

const searchContacts = asyncHandler(async (req, res) => {
  const emailorPhone = req.query.emailorPhone;
  if (!emailorPhone) {
    throw new ApiError(400, "Please provide a valid email or phone number");
  }

  let user;
  if (emailorPhone.includes("@")) {
    user = await User.findOne({ email: emailorPhone }).select(
      "-password -refreshToken"
    );
  } else {
    user = await User.findOne({ phoneNo: emailorPhone }).select(
      "-password -refreshToken"
    );
  }

  if (!user) {
    throw new ApiError(
      404,
      "No user found with the provided email or phone number"
    );
  }

  const currentUser = await User.findById(req.user._id).select(
    "friends blockedUser"
  );

  if (currentUser.blockedUser.includes(user._id.toString())) {
    throw new ApiError(403, "This user is in your block list");
  }

  if (currentUser.friends.includes(user._id.toString())) {
    throw new ApiError(400, "User is already in your friends list");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User found successfully"));
});

//Send Message and GetALlmessage b/w two users

const sendMessage = asyncHandler(async (req, res) => {
  //When user click the send button
  const { receiverId, content } = req.body;
  const senderId = req.user._id;

  if (!content || !content.trim()) {
    throw new ApiError(400, "Message Content Required");
  }

  const receiver = await User.findById(receiverId);
  if (!receiver) {
    throw new ApiError(404, "Receiver Not found");
  }

  //checking for blocklist :- If the sender is blocked
  if (receiver.blockedUser && receiver.blockedUser.includes(senderId)) {
    throw new ApiError(403, "Cannot Send message to this User");
  }

  //First create the message
  const message = await Message.create({
    sender: senderId,
    receiver: receiverId,
    message: content,
  });

  //Now we can send the message as response but we send populated response
  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "name avatar")
    .populate("receiver", "name avatar");

  //if user online show him message instantly
  //this "new-message" is event name that we give on our own now from frontend if any emit come with this event that would catch by this.
  const isDelivered = emitMessageToUser(
    receiverId.toString(),
    "new-message",
    populatedMessage
  );

  if (isDelivered) {
    // Update the isDelivered field in the database
    await Message.findByIdAndUpdate(
      message._id,
      { $set: { isDelivered: true } },
      { new: true }
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { message: populatedMessage, isDelivered },
        "Message Sent successfully"
      )
    );
});
const getAllMessages = asyncHandler(async (req, res) => {
  // Extract current user from the auth middleware and get the requested chat user from the URL parameter.
  const myCurrentUser = await User.findById(req.user._id);
  const requestedUserId = req.query.friendId; // Extract requested user ID from params
  console.log(requestedUserId);
  const requestedUser = await User.findById(requestedUserId);

  if (!myCurrentUser) {
    throw new ApiError(
      404,
      "Unauthorized Request! Please verify yourself first"
    );
  }

  if (!requestedUser) {
    throw new ApiError(404, "Please Enter a Requested User");
  }

  /*We have to extract all the chats b/w them like where our CurrentUser is sender or Requested user is sender because we need both of their messages to show it.*/

  /*Also this .sort() because we want chat from oldest -> newest in mongodb 1 refers to old -> new and -1 refer to new->old that's why we used this*/

  /*.populate(given_field) -> this method is use to replace the given_field id to it's whole document means our senderId will become whole sender data in the response
   We get this type of response
  {
  sender: { _id: ..., name: "Mandeep", avatar: "..." },
  receiver: { _id: ..., name: "Rahul", avatar: "..." },
  content: "Hey bro"
}*/

  const chatOfBothUsers = await Message.find({
    $or: [
      {
        sender: myCurrentUser._id.toString(),
        receiver: requestedUser._id.toString(),
      },
      {
        sender: requestedUser._id.toString(),
        receiver: myCurrentUser._id.toString(),
      },
    ],
  })
    .sort({ createdAt: 1 })
    .populate("sender")
    .populate("receiver");

  //So this chatofbothUser should be an array.like there are many chats between them so we will pass this array in frontend
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        chatOfBothUsers,
        "All chats are fetched Successfully"
      )
    );
});

export {
  register,
  signIn,
  logout,
  editUser,
  deleteMe,
  changePassword,
  viewProfile,
  allBlockedUsers,
  bulkUser,
  addFriend,
  addToBlockList,
  removeFriend,
  allFriends,
  unBlockUser,
  viewOtherProfile,
  searchContacts,
  getAllMessages,
  sendMessage,
  me,
};
