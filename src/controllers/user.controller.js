import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadCloundinary} from "../utils/cloudnary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req,res)=>{
    console.log(req.body)
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
    
    // checks and validate the inputs--->

    // if (fullName === "" && email === "" && username === "" && password === ""){
    //     throw new ApiError(400,"Fullname is required")
    // }

    if (
        [fullName,email,username,password].some((field)=> field.trim() === "" ))
    {
        throw new ApiError(400,"Fullname is required")
    }

    const existedUser = await User.findOne({
        $or:[ { username },{ email}]
    })

    if(existedUser){
        throw new ApiError(409,"user with email or username is already existed ")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }



    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar files is required")
    }
    // if(!coverImageLocalPath){
    //     throw new ApiError(400,"Cover-Image is required")
    // }
    const avatar =  await uploadCloundinary(avatarLocalPath);
    const coverImage = await uploadCloundinary(coverImageLocalPath);

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

    const createdUser =  await User.findById(user._id).select(
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