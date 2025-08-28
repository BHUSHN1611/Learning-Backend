// require ('dotenv').config({path:'./env'}) idl method , make code inconsistent;

import connectDB from "./db/index.js";
import dotenv from "dotenv"
import {app} from './app.js';

dotenv.config({
    path:'./env'
})

const port = process.env.PORT;

connectDB().then(()=>{
    app.get("/",(req,res)=>{
        res.send("Server is ready")
    })
    app.on('error',(error)=>{
            console.log("Err",error);
            throw error
        });
    app.listen(port|| 8000,()=>{
        console.log(`Server is listening  at http://localhost:${port}`)
    })
})
.catch((error)=>{
    console.log("Mongo DB connection failed !!",error)
})



/*
import mongoose from "mongoose";
import { DB_NAME } from "./constant";

import express from "express";
const app = express()
;( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on('error',(error)=>{
            console.log("Err",error);
            throw error
        });
        app.listen(process.env.PORT,()=>{
            console.log(`App is listening  at http://localhost:${process.env.PORT}`)
        });
    } catch (error) {
        console.error("ERROR :",error);
        throw error
        
    }
} )()
    */