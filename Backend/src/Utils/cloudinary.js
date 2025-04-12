import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET, // Click 'View API Keys' above to copy your API secret
});

async function uploadOnCloudinary(localFilePath) {
  try {
    if (!localFilePath) {
      throw "There is no file Provided";
    }

    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    //Deleting the locally saved file
    fs.unlinkSync(localFilePath);
    return result;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    throw "Cloudinary Save error " + error;
    return null;
  }
}

export { uploadOnCloudinary };
