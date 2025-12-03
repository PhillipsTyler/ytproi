import express from "express";
import { Innertube } from "youtubei";
import cors from "cors";

const app = express();
app.use(cors());

let yt;

// Initialize once
(async () => {
  yt = await Innertube.create();
  console.log("YouTube Proxy Ready");
})();

// SEARCH ENDPOINT
app.get("/search", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json({ error: "Missing query" });

    const results = await yt.search(q, { type: "video" });

    res.json(results.videos.map(v => ({
      id: v.id,
      title: v.title.text,
      thumb: v.thumbnails[0].url
    })));

  } catch (err) {
    console.error(err);
    res.json({ error: "search_failed" });
  }
});

// STREAM ENDPOINT
app.get("/stream", async (req, res) => {
  try {
    const id = req.query.v;
    if (!id) return res.status(400).send("Missing video id");

    const info = await yt.getInfo(id);
    const stream = await info.getStreamingData();

    if (!stream || !stream.formats.length)
      return res.send("No stream formats found");

    const best = stream.formats.find(f => f.mime_type.includes("mp4"));

    if (!best) return res.send("No mp4 stream available");

    const videoStream = await yt.download(id, {
      format: "mp4",
      quality: "360p"
    });

    res.setHeader("Content-Type", "video/mp4");
    videoStream.pipe(res);

  } catch (err) {
    console.error(err);
    res.send("stream_failed");
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("YT Proxy running on port", PORT));
