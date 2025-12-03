const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Home page with search interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>YouTube Proxy</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          background: #0f0f0f;
          color: #fff;
          padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { margin-bottom: 20px; color: #ff0000; }
        .search-box {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
        }
        input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #303030;
          border-radius: 24px;
          background: #121212;
          color: #fff;
          font-size: 16px;
          outline: none;
        }
        input:focus { border-color: #065fd4; }
        button {
          padding: 12px 24px;
          border: none;
          border-radius: 24px;
          background: #ff0000;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        button:hover { background: #cc0000; }
        .video-input {
          margin-bottom: 30px;
          padding: 20px;
          background: #212121;
          border-radius: 12px;
        }
        .video-input h3 { margin-bottom: 10px; color: #aaa; font-size: 14px; }
        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .video-card {
          background: #212121;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .video-card:hover { transform: scale(1.02); }
        .thumbnail {
          width: 100%;
          aspect-ratio: 16/9;
          background: #000;
          position: relative;
        }
        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .video-info {
          padding: 12px;
        }
        .video-title {
          font-weight: 600;
          margin-bottom: 8px;
          line-height: 1.4;
        }
        #player {
          width: 100%;
          max-width: 900px;
          aspect-ratio: 16/9;
          margin: 0 auto 30px;
          border-radius: 12px;
          overflow: hidden;
          display: none;
        }
        #player iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        .back-btn {
          margin-bottom: 20px;
          background: #303030;
        }
        .back-btn:hover { background: #404040; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎥 YouTube Proxy</h1>
        
        <div class="video-input">
          <h3>DIRECT VIDEO ID</h3>
          <div class="search-box">
            <input type="text" id="videoId" placeholder="Enter YouTube video ID (e.g., dQw4w9WgXcQ)">
            <button onclick="loadVideo()">Load Video</button>
          </div>
        </div>

        <div id="player"></div>
        <button id="backBtn" class="back-btn" onclick="hidePlayer()" style="display: none;">← Back</button>

        <div id="content"></div>
      </div>

      <script>
        function loadVideo() {
          const videoId = document.getElementById('videoId').value.trim();
          if (!videoId) return;
          
          const player = document.getElementById('player');
          const backBtn = document.getElementById('backBtn');
          
          player.innerHTML = '<iframe src="/embed/' + videoId + '" allowfullscreen></iframe>';
          player.style.display = 'block';
          backBtn.style.display = 'block';
          
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function hidePlayer() {
          document.getElementById('player').style.display = 'none';
          document.getElementById('backBtn').style.display = 'none';
          document.getElementById('player').innerHTML = '';
        }

        function extractVideoId(url) {
          const patterns = [
            /(?:youtube\\.com\\/watch\\?v=|youtu\\.be\\/)([^&\\s]+)/,
            /^([a-zA-Z0-9_-]{11})$/
          ];
          
          for (let pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
          }
          return null;
        }

        document.getElementById('videoId').addEventListener('keypress', (e) => {
          if (e.key === 'Enter') loadVideo();
        });
      </script>
    </body>
    </html>
  `);
});

// YouTube API proxy endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    const response = await axios.get('https://www.youtube.com/results', {
      params: { search_query: q },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    res.send(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// Video embed proxy
app.get('/api/video/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`https://www.youtube.com/watch?v=${id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    res.send(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Video fetch failed' });
  }
});

// Proxy for YouTube embeds
app.get('/embed/:id', (req, res) => {
  const { id } = req.params;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Video Player</title>
      <style>
        body { margin: 0; padding: 0; background: #000; }
        iframe { width: 100vw; height: 100vh; border: none; }
      </style>
    </head>
    <body>
      <iframe 
        src="https://www.youtube.com/embed/${id}?autoplay=1" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>
    </body>
    </html>
  `;
  res.send(html);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`YouTube Proxy running on port ${PORT}`);
});
