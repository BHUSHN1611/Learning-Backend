import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudnary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req,res)=>{
    res.status(200).json({
        message:'ok hi postman'
    })
    
    // get user details frm frontend
    // validation
    // check if user is already exists :username and email
    // check  for images and avator
    // upload on couldinary,avator check [url],avator check
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation 
    // return res

    // destructing 
    const {fullName,email,username,password} = req.body;
    console.log(`fullname-${fullname} email-${email} username-${username} password-${password}`)

    // if (fullName === "" && email === "" && username === "" && password === ""){
    //     throw new ApiError(400,"Fullname is required")
    // }

    if (
        [fullName,email,username,password].some((field)=> field.trim() ===""))
    {
        throw new ApiError(400,"Fullname is required")
    }

    const existedUser = User.findOne({
        $or:[ { username },{ email}]
    })

    if(existedUser){
        throw new ApiError(409,"user with email or username is already existed ")
    }

    const avaterLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avaterLocalPath){
        throw new ApiError(400,"Avatar files is required")
    }
    // if(!coverImageLocalPath){
    //     throw new ApiError(400,"Cover-Image is required")
    // }
    const avatar =  uploadOnCloudinary(avaterLocalPath);
    const coverImage = uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"Avatar files is required")
    }
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase(),
    })

    const createdUser =  User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered Successfully")
    )

})

export {registerUser}