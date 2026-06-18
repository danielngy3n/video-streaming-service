import express from 'express';
import { convertVideo, deleteProcessedVideo, deleteRawVideo, downloadRawVideo, setUpDirectories, uploadProcessedVideo } from './storage';

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

  const inputFileName = data.name;
  const outputFileName = `processed-${inputFileName}`;

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