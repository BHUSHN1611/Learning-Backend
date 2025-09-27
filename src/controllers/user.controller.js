import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadCloundinary} from "../utils/cloudnary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateRefreshToken
        const refreshToken = user.generateAccessToken

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
        
    }}

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

// login user 
const loginUser = asyncHandler(async(req,res)=>{
    // req body -> data 
    // username or email
    // find the user
    // password check
    // access and refresh token 
    // send cookie

    const {username,email,password} =req.body
    if (!username || !email){
        throw new ApiError(400,"Username or email is required")
    }

    const user = await User.findOne({
        $or : [{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401,"Incorrect Password")
    }
     const {accessToken,refreshToken}  = await generateAccessAndRefereshTokens(user._id)

     const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
     
     const options = {
        httpOnly : true,
        secure: true,
     }

     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",refreshToken,options)
     .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,
                refreshToken
            },
            "user logged in successfully "
        )
     )

     
})
 
const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,{
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:True
        }
    )
    const options = {
        httpOnly : true,
        secure: true,
     }
     return res.status(200)
     .clearCookie("accessToken",options)
     .clearCookie("refereshToken",options)
     .json(new ApiResponse(200,{},"User Logout"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401 , "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401 , "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401 , "Invalid refresh token")
        }
    
        const option = {
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newrefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken)
        .cookie("refresToken",newrefreshToken)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:newrefreshToken},
                "Access token refreshed"
    
            )
        )
    } catch (error) {
        throw new ApiError(401 , error?.message || "Invalid refresh token")
        
    }


    

})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
    
}