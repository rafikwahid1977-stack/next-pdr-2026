"use server";

import crypto from "crypto";

export async function generateCloudinarySignature(timestamp: number) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET_KEY;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Cloudinary credentials not configured");
    }

    // Create signature for unsigned upload
    const params = {
      timestamp,
      folder: "interventions_electro",
    };

    // Sort parameters and create string to sign
    const paramsString = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key as keyof typeof params]}`)
      .join("&");

    // Create SHA-1 signature
    const signature = crypto
      .createHash("sha1")
      .update(paramsString + apiSecret)
      .digest("hex");

    return {
      signature,
      timestamp,
      cloudName,
      apiKey,
    };
  } catch (error) {
    console.error("Error generating signature:", error);
    throw error;
  }
}
