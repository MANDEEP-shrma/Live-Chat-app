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

export { register, signIn, logout, editUser };
