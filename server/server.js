const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Twitter API service
const twitterService = require('./services/twitterService');
// Ollama service for LLM processing
const ollamaService = require('./services/ollamaService');

// Main endpoint to get topic summary and sentiment
app.post('/api/analyze-topic', async (req, res) => {
  try {
    const { topic, tweetCount = 20 } = req.body;
    
    // Fetch tweets about the topic
    const tweets = await twitterService.fetchTweetsByTopic(topic, tweetCount);
    
    // Combine tweets into a single text for processing
    const tweetText = tweets.map(tweet => tweet.text).join('\n\n');
    
    // Get summary from Ollama
    const summary = await ollamaService.getSummary(topic, tweetText);
    
    // Get sentiment analysis from Ollama
    const sentiment = await ollamaService.getSentiment(tweetText);
    
    res.json({ summary, sentiment, tweetCount: tweets.length });
  } catch (error) {
    console.error('Error analyzing topic:', error);
    res.status(500).json({ error: 'Failed to analyze topic' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
