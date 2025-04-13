import { ApiError } from "../Utils/apiError.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { User } from "../Models/users.model.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized Request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    //if user exist then we add that user in req object
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "Something went wrong in auth middleware"
    );
  }
});

export { verifyJWT };
