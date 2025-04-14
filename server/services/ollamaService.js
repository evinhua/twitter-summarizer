const axios = require('axios');

// Ollama is running locally by default on port 11434
const ollamaClient = axios.create({
  baseURL: 'http://localhost:11434/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

async function getSummary(topic, tweetText) {
  try {
    const prompt = `
      Below are several tweets about "${topic}". 
      Please provide a concise summary (about 3-5 sentences) of the main points, trends, and discussions happening around this topic.
      
      Tweets:
      ${tweetText}
      
      Summary:
    `;
    
    const response = await ollamaClient.post('/generate', {
      model: 'gemma3:4b',
      prompt: prompt,
      stream: false
    });
    
    return response.data.response;
  } catch (error) {
    console.error('Error getting summary from Ollama:', error);
    return 'Failed to generate summary. Please ensure Ollama is running with the gemma3:4b model.';
  }
}

async function getSentiment(tweetText) {
  try {
    const prompt = `
      Analyze the sentiment of the following tweets. Classify the overall sentiment as one of:
      - Very Positive
      - Positive
      - Neutral
      - Negative
      - Very Negative
      
      Also provide a brief explanation for your classification.
      
      Tweets:
      ${tweetText}
      
      Sentiment:
    `;
    
    const response = await ollamaClient.post('/generate', {
      model: 'gemma3:4b',
      prompt: prompt,
      stream: false
    });
    
    return response.data.response;
  } catch (error) {
    console.error('Error getting sentiment from Ollama:', error);
    return 'Failed to analyze sentiment. Please ensure Ollama is running with the gemma3:4b model.';
  }
}

module.exports = {
  getSummary,
  getSentiment
};
