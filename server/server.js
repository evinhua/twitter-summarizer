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

// Endpoint to get available Ollama models
app.get('/api/ollama-models', async (req, res) => {
  try {
    const models = await ollamaService.getAvailableModels();
    res.json({ models });
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    res.status(500).json({ error: 'Failed to fetch Ollama models' });
  }
});

// Main endpoint to get topic summary and sentiment
app.post('/api/analyze-topic', async (req, res) => {
  try {
    const { topic, tweetCount = 20, model = ollamaService.DEFAULT_MODEL } = req.body;
    
    // Fetch tweets about the topic
    const tweets = await twitterService.fetchTweetsByTopic(topic, tweetCount);
    
    // Combine tweets into a single text for processing
    const tweetText = tweets.map(tweet => tweet.text).join('\n\n');
    
    // Get summary from Ollama using the selected model
    const summary = await ollamaService.getSummary(topic, tweetText, model);
    
    // Get sentiment analysis from Ollama using the selected model
    const sentiment = await ollamaService.getSentiment(tweetText, model);
    
    res.json({ 
      summary, 
      sentiment, 
      tweetCount: tweets.length,
      model
    });
  } catch (error) {
    console.error('Error analyzing topic:', error);
    res.status(500).json({ error: 'Failed to analyze topic' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
