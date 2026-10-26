import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessandRefreshTokens = async (userID) => {
  try {
    const user = await User.findById(userID);
    const accessToken = user.generateAccessTokens();
    const refreshToken = user.generateRefreshTokens()
    await user.save({validateBeforeSave : false})
    return {accessToken,refreshToken}
  } 
  catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    //validation - not empty
    throw new ApiError(400, "All fields are required"); //good to know - .some() and .trim()
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "username or email already exists");
  }

  //optionally chain req.file()

  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  //since coverImage is optional
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400,"Avatar upload failed. Check Cloudinary credentials.");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering a user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));
});

const loginUser = asyncHandler( async (req, res) => {
    const {username, email, password} = req.body;
    if(!username && !email){
        throw new ApiError(400, "username or email required"
        )
    }

    const user = await User.findOne({
        $or : [{ username : username?.toLowerCase() }, { email }]
    })

    if(!user){
        throw new ApiError(400, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentails")
    }

    const {accessToken, refreshToken} = await generateAccessandRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
      httpOnly : true,
      secure : true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user : loggedInUser, accessToken, refreshToken
        },
        "User is logged in successfully"
      )
    )  
})

const logoutUser = asyncHandler( async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1
      }
    }
  );

/* These options control how the browser handles your authentication cookies.
httpOnly: true — prevents client-side JavaScript from reading the cookie through document.cookie. This helps reduce token theft through certain XSS attacks.
secure: true — tells the browser to send the cookie only over HTTPS.
For local development over plain HTTP, secure: true may prevent cookies from being set or sent as expected.*/
  const options = {
    httpOnly : true,
    secure : true
  }

  return res
  .status(200)
  .clearCookie("accessToken", accessToken, options)
  .clearCookie("refreshToken", refreshToken, options)
  .json(new ApiResponse(200, {}, "User Logged Out"))

})

export { registerUser, loginUser, logoutUser };
