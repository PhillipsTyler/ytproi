import express from "express";
import { Innertube } from "youtubei.js";

const app = express();
const port = process.env.PORT || 8080;

let yt;

async function init() {
  yt = await Innertube.create();
  console.log("YouTube Proxy Ready");
}

app.get("/", (req, res) => {
  res.send("YouTube Full Proxy is running");
});

app.get("/video", async (req, res) => {
  try {
    const id = req.query.v;
    if (!id) return res.status(400).send("Missing video id ?v=");
    
    const info = await yt.getInfo(id);

    // Get a proper streaming URL
    const stream = info.streaming_data?.formats?.[0];

    if (!stream) {
      return res.status(500).send("No stream URL available");
    }

    res.redirect(stream.url);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error fetching video");
  }
});

app.listen(port, () =>
  console.log(`YT Proxy running on port ${port}`)
);

init();
