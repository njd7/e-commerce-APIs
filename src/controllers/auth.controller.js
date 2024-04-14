import { User } from "../models/auth/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { generateAccessAndRefreshTokens } from "../utils/jwtHelper.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password, userType } = req.body;

  // validation for not empty

  if (
    [username, email, fullName, password, userType].some(
      (field) => !field || field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required!");
  }

  // Check for existing user

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existingUser) {
    throw new ApiError(
      400,
      "User already exists! [username/email already in use]"
    );
  }

  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    email,
    password,
    userType,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating user!");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created Successfully!"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if ((!username && !email) || !password) {
    // throw error when both username and email are not provided or when password is not provided
    throw new ApiError(400, "Provide both username/email and password");
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!existingUser) {
    throw new ApiError(404, "User does not exist");
  }

  const validPassword = await existingUser.isPasswordCorrect(password);
  if (!validPassword) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Generate refresh and access tokens

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    existingUser._id
  );

  const user = await User.findById(existingUser._id).select(
    "-password -refreshToken"
  );

  // prepare cookies

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
        { user: user, accessToken, refreshToken },
        "Login successful!"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
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
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const refreshTokenFE = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshTokenFE) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedRefreshTokenFE = jwt.verify(
      refreshTokenFE,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!decodedRefreshTokenFE) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const user = await User.findById(decodedRefreshTokenFE?._id).select(
      "-password"
    );
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (refreshTokenFE !== user?.refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", newAccessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token 4");
  }
});

// here in this implementation, upon updating password, user does NOT get logged out from previous session automatically
const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const isValidPassword = await user.isPasswordCorrect(oldPassword);

    if (!isValidPassword) {
      throw new ApiError(401, "Incorrect old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password updated"));
  } catch (error) {
    throw new ApiError(401, "Invalid credentials");
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updatePassword,
};
