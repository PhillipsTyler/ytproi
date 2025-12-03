import express from "express";
import YouTube from "youtube-sr";

const app = express();
const PORT = process.env.PORT || 8080;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json({ error: "Missing query" });

  try {
    const results = await YouTube.search(query, { type: "video", limit: 10 });
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

app.get("/video", (req, res) => {
  const videoId = req.query.v;
  if (!videoId) return res.json({ error: "Missing video ID" });

  // Send YouTube embed link
  res.json({ embed: `https://www.youtube.com/embed/${videoId}` });
});

app.listen(PORT, () => console.log(`YT Proxy running on port ${PORT}`));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("YT Proxy running on port", PORT));
