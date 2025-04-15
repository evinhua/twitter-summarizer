const axios = require('axios');
require('dotenv').config();

// Serper API key
const SERPER_API_KEY = process.env.SERPER_API_KEY || "efad9c66159909eff3ce534f8da47d4ba33671d9";

// Create Google Search client using mock data
async function searchTopicOnGoogle(topic, maxResults = 20) {
  try {
    console.log(`Searching Google for "${topic}" via mock data`);
    
    // Generate mock search results based on the topic
    const mockResults = generateMockResults(topic, maxResults);
    
    console.log(`Generated ${mockResults.length} mock search results for "${topic}"`);
    return mockResults;
  } catch (error) {
    console.error('Error generating mock search results:', error.message);
    throw new Error('Failed to search Google');
  }
}

/**
 * Generate mock search results for a topic
 * @param {string} topic - The topic to generate results for
 * @param {number} count - Number of results to generate
 * @returns {Array} - Array of mock search results
 */
function generateMockResults(topic, count = 20) {
  // Ensure count is within the allowed range
  const resultCount = Math.min(Math.max(5, count), 50);
  
  // Create mock search results
  const results = [];
  
  for (let i = 0; i < resultCount; i++) {
    results.push({
      id: `mock-${i + 1}`,
      text: `This is a mock search result about ${topic}. It contains information that might be relevant to your query.`,
      source: `https://example.com/result-${i + 1}`,
      title: `${topic} - Information Source ${i + 1}`
    });
  }
  
  return results;
}

/**
 * Generate tweet-like content based on search results
 * @param {Array} searchResults - Array of search results
 * @param {number} count - Number of tweets to generate
 * @returns {Array} - Array of generated tweets
 */
function generateTweetsFromSearchResults(searchResults, count = 20) {
  console.log(`Generating ${count} tweets from ${searchResults.length} search results`);
  
  // Ensure count is within the allowed range
  const tweetCount = Math.min(Math.max(5, count), 50);
  
  // Create tweets based on search results
  const generatedTweets = searchResults.slice(0, tweetCount).map((result, index) => {
    // Create different tweet formats to add variety
    const tweetFormats = [
      `Just read this about ${result.title}: ${result.text.substring(0, 100)}...`,
      `Interesting perspective on ${result.title}! ${result.text.substring(0, 100)}...`,
      `According to a reliable source: ${result.text.substring(0, 100)}...`,
      `Worth reading about ${result.title}: ${result.text.substring(0, 100)}...`,
      `New information about ${result.title}: ${result.text.substring(0, 100)}...`
    ];
    
    // Select a random format
    const format = tweetFormats[index % tweetFormats.length];
    
    return {
      id: `generated-${index + 1}`,
      text: format,
      source: result.source || "https://example.com"
    };
  });
  
  console.log(`Generated ${generatedTweets.length} tweets from search results`);
  return generatedTweets;
}

module.exports = {
  searchTopicOnGoogle,
  generateTweetsFromSearchResults
};
