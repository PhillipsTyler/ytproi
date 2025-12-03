import express from "express";
import cors from "cors";
import { YouTube } from "youtube-sr";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

app.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing query" });

  try {
    const videos = await YouTube.search(query, { limit: 10 });
    const results = videos.map(v => ({
      id: v.id,
      title: v.title,
      thumbnail: v.thumbnail.url
    }));
    res.json({ items: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to search YouTube" });
  }
});

app.listen(PORT, () => console.log(`YT Proxy running on port ${PORT}`));
