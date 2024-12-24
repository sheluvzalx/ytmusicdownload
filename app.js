const express = require("express");
const youtubedl = require("youtube-dl-exec");
const path = require("path");
const fs = require("fs");


const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));

const musicDir = path.join(__dirname, '');
if (!fs.existsSync(musicDir)) {
  fs.mkdirSync(musicDir);
}

app.get("/download", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send("Please provide a valid YouTube URL.");
  }

  try {
    const options = {
      output: path.join(musicDir, "%(title)s.%(ext)s"),
      extractAudio: true,
      audioFormat: "mp3",
      audioQuality: 0,
    };

    const result = await youtubedl(url, options);

    const downloadedFile = fs
      .readdirSync(musicDir)
      .find((file) => file.endsWith(".webm"));

    if (!downloadedFile) {
      return res.status(500).send("Downloaded file not found.");
    }

    const filePath = path.join(musicDir, downloadedFile);

    res.download(filePath, downloadedFile, (err) => {
      if (err) {
        console.error("Error sending the file:", err);
        return res.status(500).send("Error sending the file.");
      }

      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing the request.");
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🔥 Server running at: http://localhost:${PORT}`);
  console.log(`🔥 Use: http://localhost:${PORT}/download?url=VIDEO_URL`);
});
