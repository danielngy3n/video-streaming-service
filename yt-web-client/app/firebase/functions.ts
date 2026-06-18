import {getFunctions, httpsCallable} from "firebase/functions";

const functions = getFunctions();

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
