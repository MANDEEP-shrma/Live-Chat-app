import { User } from "../Models/users.model.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/apiError.js";
import { ApiResponse } from "../Utils/apiResponse.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";

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
  const { email, phoneNo, password } = req.body;

  if (!(phoneNo || email)) {
    throw new ApiError(400, "PhoneNo or Email is required");
  }

  const user = await User.findOne({
    $or: [{ phoneNo }, { email }],
  });

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
  } else {
    friend.friends.push(req.user?._id);
    await friend.save();
  }

  //if found
  //Pushing to myUser friend list
  user.friends.push(friendId);
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { user: friend }, "Friend added successfully"));
});

//There will be a button like "- or block" to trigger this
const addToBlockList = asyncHandler(async (req, res) => {
  const { blockUserId } = req.body;

  if (!blockUserId) {
    throw new ApiError(400, "Block User Id is required");
  }

  const user = await User.findById(req.user?._id).select("blockedUser");

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

  user.blockedUser.push(blockUserId);
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User Blocked successfully"));
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
  const { phoneNo } = req.body;

  if (!phoneNo) {
    throw new ApiError(400, "Phone number is required for searching");
  }

  // Search for users with the given phone number (or email)
  const users = await User.find({
    phoneNo: { $regex: phoneNo, $options: "i" }, // Case-insensitive search
  }).select("-password -refreshToken");

  if (users.length === 0) {
    throw new ApiError(404, "No users found with the given phone number");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users found successfully"));
});

export {
  register,
  signIn,
  logout,
  editUser,
  changePassword,
  viewProfile,
  bulkUser,
  addFriend,
  addToBlockList,
  allFriends,
  viewOtherProfile,
  searchContacts,
};
