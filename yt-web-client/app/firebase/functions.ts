import {httpsCallable} from "firebase/functions";
import {functions} from "./firebase";

type GenerateUploadUrlRequest = {
  fileExtension?: string;
  contentType: string;
};

type GenerateUploadUrlResponse = {
  url: string;
};

const generateUploadUrl = httpsCallable<
  GenerateUploadUrlRequest,
  GenerateUploadUrlResponse
>(functions, "generateUploadUrl");

const getVideosFunction = httpsCallable(functions, "getVideos");

export interface Video {
  id?: string;
  uid?: string;
  filename?: string;
  status?: "processing" | "processed";
  title?: string;
  description?: string;
}

export async function uploadVideo(file: File) {
  const response = await generateUploadUrl({
    fileExtension: file.name.split(".").pop(),
    contentType: file.type,
  });

  // Upload the file to the signed URL
  const uploadResponse = await fetch(response?.data?.url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed with status ${uploadResponse.status}`);
  }
}

export async function getVideos() {
  const response = await getVideosFunction();
  return response.data as Video[];
}