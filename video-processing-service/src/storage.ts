import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

const storage = new Storage();

const rawVideoBucketName = 'dn-raw-videos';
const processedVideoBucketName = 'dn-processed-videos';

const localRawVideoPath = './raw_videos';
const localProcessedVideoPath = './processed_videos';

/**
 *  Creates the local directories for raw and processed videos.
 */
export function setUpDirectories() {
  ensureDirectoryExistence(localRawVideoPath);
  ensureDirectoryExistence(localProcessedVideoPath);
}

/**
 * @param rawVideoPath - The local path to the raw video file
 * @param processedVideoPath - The local path where the processed video file will be saved.
 * @returns A promise that resolves when the video conversion is complete.
 */
export function convertVideo(rawVideoPath: string, processedVideoPath: string) {
    const outputPath = `${localProcessedVideoPath}/${processedVideoPath}`;
    ensureDirectoryExistence(path.dirname(outputPath));

    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoPath}`)
            .outputOptions('-vf', 'scale=-1:360') // Example: scale video to 360p
            .on('end', function() {
                console.log('Processing finished successfully');
                resolve();
            })
            .on('error', function(err: any) {
                console.error('Error processing video: ' + err.message);
                reject(err);
            })
            .save(outputPath);
    });
}

/**
 * @param fileName - The name of the file to download
 * from the {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} directory.
 * @returns A promise that resolves when the download is complete.
 */
export async function downloadRawVideo(fileName: string) {
    const destination = `${localRawVideoPath}/${fileName}`;
    ensureDirectoryExistence(path.dirname(destination));

    await storage.bucket(rawVideoBucketName).file(fileName).download({ destination })

    console.log(`gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}.`);
}

/**
 * @param fileName - The name of the file to upload
 * from the {@link localProcessedVideoPath} directory into the {@link processedVideoBucketName} bucket.
 * @returns A promise that resolves when the upload is complete.
 */
export async function uploadProcessedVideo(fileName: string) {
    const bucket = storage.bucket(processedVideoBucketName);

    await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
        destination: fileName,
    });

    console.log(`${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}.`);

    await bucket.file(fileName).makePublic();
}

/**
 * @param fileName - The name of the file to delete from the
 * {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 * 
 */
export function deleteRawVideo(fileName: string) {
  return deleteFile(`${localRawVideoPath}/${fileName}`);
}

/**
* @param fileName - The name of the file to delete from the
* {@link localProcessedVideoPath} folder.
* @returns A promise that resolves when the file has been deleted.
* 
*/
export function deleteProcessedVideo(fileName: string) {
  return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

/**
 * @param filePath - The local path to the file to be deleted.
 * @returns A promise that resolves when the file is deleted.
 */
function deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Error deleting file: ${filePath} - ${err.message}`);
                    reject(err);
                } else {
                    console.log(`File deleted: ${filePath}`);
                    resolve();
                }
            });
        } else {
            console.log(`File not found: ${filePath}`);
            resolve();
        }
    });
}

/**
 * Ensures a directory exists, creating it if necessary.
 * @param {string} dirPath - The directory path to check.
 */
function ensureDirectoryExistence(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true }); // recursive: true enables creating nested directories
    console.log(`Directory created at ${dirPath}`);
  }
}
