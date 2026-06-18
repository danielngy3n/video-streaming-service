import * as functions from "firebase-functions/v1";
import {initializeApp} from "firebase-admin/app";
import {Firestore} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import {Storage} from "@google-cloud/storage";
import {HttpsError, onCall} from "firebase-functions/v2/https";

initializeApp();

const firestore = new Firestore();
const storage = new Storage();
const rawVideoBucketName = "dn-raw-videos";

const videoCollectionId = "videos";

export interface Video {
  id?: string,
  uid?: string,
  filename?: string,
  status?: "processing" | "processed",
  title?: string,
  description?: string
}

export const createUser = functions.auth.user().onCreate((user) => {
  const userInfo = {
    uid: user.uid,
    email: user.email,
    photoURL: user.photoURL,
    displayName: user.displayName,
  };

  firestore.collection("users").doc(user.uid).set(userInfo);
  logger.info("User created:", `${JSON.stringify(userInfo)}`);
  return;
});

export const generateUploadUrl = onCall({maxInstances: 1}, async (request) => {
  // Check if the user is authenticated
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "User must be authenticated to generate an upload URL.",
    );
  }
  const auth = request.auth;
  const data = request.data;

  if (!data?.fileExtension || !data?.contentType) {
    throw new HttpsError(
      "invalid-argument",
      "A file extension and content type are required.",
    );
  }

  const bucket = storage.bucket(rawVideoBucketName);

  // Generate a unique file name for the uploaded video
  const fileName = `${auth.uid}/${Date.now()}.${data.fileExtension}`;

  // Generate a signed URL for uploading a file
  const [url] = await bucket.file(fileName).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType: data.contentType,
  });
  return {url};
});

export const getVideos = onCall({maxInstances: 1}, async () => {
  const snapshot =
    await firestore.collection(videoCollectionId).limit(10).get();
  return snapshot.docs.map((doc) => doc.data());
});
