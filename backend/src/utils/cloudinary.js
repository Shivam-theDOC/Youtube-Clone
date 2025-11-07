import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async function (localFilePath) {
  // Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  // Upload an image
  if (!localFilePath) return null;

  const uploadResult = await cloudinary.uploader
    .upload(localFilePath, { resource_type: "auto" })
    .catch((error) => {
      console.log(error);
      fs.unlinkSync(localFilePath); // used to remove file locally if the uploading failed
      return null;
    });

  console.log("File has been uploaded successfully", uploadResult.url);

  // Optimize delivery by resizing and applying auto-format and auto-quality
  const optimizeUrl = cloudinary.url("shoes", {
    fetch_format: "auto",
    quality: "auto",
  });

  console.log(optimizeUrl);

  // Transform the image: auto-crop to square aspect_ratio
  const autoCropUrl = cloudinary.url("shoes", {
    crop: "auto",
    gravity: "auto",
    width: 500,
    height: 500,
  });

  console.log(autoCropUrl);

  return uploadResult;
};

export { uploadOnCloudinary };
