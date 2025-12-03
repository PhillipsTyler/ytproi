import express from "express";
import cors from "cors";
import { Innertube } from "youtubei.js";

const app = express();
app.use(cors());

let yt;

(async () => {
  yt = await Innertube.create();
  console.log("YouTube Proxy Ready");
})();

/* --------------------------- SEARCH PROXY ---------------------------- */
app.get("/search", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json({ items: [] });

    const result = await yt.search(q);

    const items = result.videos.map(v => ({
      videoId: v.id,
      title: v.title.text,
      thumbnail: v.thumbnails[0].url
    }));

    res.json({ items });
  } catch (err) {
    console.error(err);
    res.json({ error: "Search failed" });
  }
});

/* ---------------------------- VIDEO PROXY ---------------------------- */
app.get("/watch/:id", async (req, res) => {
  try {
    const videoId = req.params.id;

    const info = await yt.getInfo(videoId);
    const stream = await info.download();

    res.setHeader("Content-Type", "video/mp4");
    stream.pipe(res);

  } catch (err) {
    console.error(err);
    res.status(500).send("Video proxy error");
  }
});

/* ---------------------------- START SERVER --------------------------- */
app.listen(8080, () => console.log("YT Proxy running on port 8080"));
