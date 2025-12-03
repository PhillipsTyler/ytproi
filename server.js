import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import { Innertube } from "youtubei.js";

const app = express();
app.use(cors());

// INIT YouTube client
let yt;
(async () => {
  yt = await Innertube.create({
    client_type: "ANDROID",
  });
})();

// Root route
app.get("/", (req, res) => {
  res.send("YouTube Proxy Running");
});

// Search route
app.get("/search", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json({ error: "missing ?q=" });

  const results = await yt.search(q);
  res.json(results);
});

// Video info (for streaming)
app.get("/getinfo", async (req, res) => {
  const id = req.query.v;
  if (!id) return res.json({ error: "missing ?v=" });

  const info = await yt.getInfo(id);
  res.json(info);
});

// Stream video
app.get("/watch", async (req, res) => {
  const id = req.query.v;
  if (!id) return res.status(400).send("Missing video id");

  const info = await yt.getInfo(id);
  const format = info.streaming_data.formats[0];

  const videoStream = await fetch(format.deciphered_url);
  res.set("Content-Type", "video/mp4");

  videoStream.body.pipe(res);
});

// PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("YT Proxy running on port " + PORT));
