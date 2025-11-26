import express from "express";
import { exec } from "child_process";

const app = express();

app.get("/video", (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).send("Missing ID");

  // Run yt-dlp to fetch the REAL video URL
  exec(`yt-dlp -g "https://www.youtube.com/watch?v=${id}"`, (err, stdout) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error getting stream URL");
    }

    const videoUrl = stdout.split("\n")[0].trim();

    // Now proxy it
    fetch(videoUrl)
      .then((ytRes) => {
        res.set({
          "Content-Type": ytRes.headers.get("content-type"),
          "Access-Control-Allow-Origin": "*",
        });
        ytRes.body.pipe(res);
      })
      .catch((e) => res.status(500).send("Proxy error"));
  });
});

app.listen(3000, () => console.log("Proxy running on port 3000"));
