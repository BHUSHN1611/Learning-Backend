import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

import { v2 as cloudinary } from 'cloudinary';

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });

const uploadCloundinary = async (localFilePath) =>{
    try {
        if(!localFilePath) return null
        // upload file path
        const response = await cloudinary.uploader.upload(localFilePath,{
        resource_type:'auto'
    })  
    // file uploaded
    console.log("File uploaded successfully Cloundinary",response.url);
    return response
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the file when the file is uploaded on cloudinary.
        return null;
    } 
}
export {uploadCloundinary}


    
   