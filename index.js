// index.js
const express = require('express');
const mongoose = require('mongoose');
async function startServer() {
const { nanoid } = await import("nanoid");
 

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://HarshitKedia:AAbb@cluster0.mbfz0pr.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define URL schema
const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: String,
});

const Url = mongoose.model('Url', urlSchema);

// API endpoint for shortening URLs
app.post('/shorten', async (req, res) => {
  const { originalUrl } = req.body;

  // Validate URL - you can use a more robust URL validation library here
  if (!isValidUrl(originalUrl)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const existingUrl = await Url.findOne({ originalUrl });

    if (existingUrl) {
      return res.json(existingUrl);
    } else {
      const shortUrl = nanoid(10); // Generate a unique 7-character short URL
      console.log('shortened url is: ',shortUrl)
      const newUrl = new Url({
        originalUrl,
        shortUrl,
      });

      await newUrl.save();

      return res.json(newUrl);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// API endpoint for redirecting short URLs to original URLs
app.get('/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;

  try {
    const url = await Url.findOne({ shortUrl });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    return res.redirect(url.originalUrl);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
});

// Function to validate URLs (you can use a more sophisticated URL validation library)
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}
