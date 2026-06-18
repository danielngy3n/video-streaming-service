import express from 'express';
import { convertVideo, deleteProcessedVideo, deleteRawVideo, downloadRawVideo, setUpDirectories, uploadProcessedVideo } from './storage';
import { isVideoNew, setVideo } from './firestore';

setUpDirectories();

const app = express();
app.use(express.json());

app.post('/process-video', async (req, res) => {
  // Get the bucket and filename from the Cloud Pub/Sub message
  let data;
  try {
    const message = Buffer.from(req.body.message.data, 'base64').toString(`utf-8`);
    data = JSON.parse(message);
    if (!data.name) {
      throw new Error('Missing "name" field in Pub/Sub message');
    }
  } catch (error) {
    console.error('Error parsing Pub/Sub message:', error);
    return res.status(400).send('Invalid Pub/Sub message');
  }

  const inputFileName = data.name; // Format: <UID>/<timestamp>.<extension>
  const outputFileName = `processed-${inputFileName}`;
  const [uid, rawFileName = inputFileName] = inputFileName.split('/');
  const rawVideoId = rawFileName.split('.')[0];
  const videoId = uid ? `${uid}-${rawVideoId}` : rawVideoId;

  if (!(await isVideoNew(videoId))) {
    return res.status(400).send('Video has already been processed');
  }

  await setVideo(videoId, {
    id: videoId,
    uid,
    status: 'processing',
  });

  // Download the raw video
  await downloadRawVideo(inputFileName)

  // Convert the video
  try {
    await convertVideo(inputFileName, outputFileName)
  } catch (err){
    await Promise.all([
      deleteRawVideo(inputFileName),
      deleteProcessedVideo(outputFileName)
    ]);
    console.error('Error converting video:', err);
    return res.status(500).send('Error processing video');
  }

  // Upload the processed video
  await uploadProcessedVideo(outputFileName);

  await setVideo(videoId, {
    status: 'processed',
    filename: outputFileName
  });

  await Promise.all([
    deleteRawVideo(inputFileName),
    deleteProcessedVideo(outputFileName)
  ]);

  return res.status(200).send('Video processed successfully');

});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
