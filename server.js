const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files from the 'public' folder
app.use(express.static('public'));

// Route to handle search queries
app.get('/search', async (req, res) => {
  const query = req.query.query;
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' site:youtube.com')}`;

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const $ = cheerio.load(data);
    const results = [];

    $('a.result__a').each((i, el) => {
      const title = $(el).text();
      let link = $(el).attr('href');

      // Convert relative link to full URL
      if (link && !link.startsWith('http')) {
        link = 'https://duckduckgo.com' + link;
      }

      // Extract real YouTube link from `uddg` param
      const urlMatch = link.match(/uddg=([^&]+)/);
      if (title && urlMatch) {
        const realLink = decodeURIComponent(urlMatch[1]);
        if (realLink.includes('youtube.com')) {
          results.push({ title, link: realLink });
        }
      }
    });

    res.json({ results });
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// Fallback to serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server (this must be last)
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
