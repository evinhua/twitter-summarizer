const axios = require('axios');
require('dotenv').config();

// Serper API key
const SERPER_API_KEY = process.env.SERPER_API_KEY || "efad9c66159909eff3ce534f8da47d4ba33671d9";

// Create Serper API client with correct URL
const serperClient = axios.create({
  baseURL: 'https://serpapi.com/search',
  headers: {
    'X-API-KEY': SERPER_API_KEY,
    'Content-Type': 'application/json'
  }
});

/**
 * Search for a topic using Google via Serper API
 * @param {string} topic - The topic to search for
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Array} - Array of search results formatted as tweet-like objects
 */
async function searchTopicOnGoogle(topic, maxResults = 20) {
  try {
    console.log(`Searching Google for "${topic}" via Serper API`);
    
    const response = await serperClient.post('', {
      q: topic,
      num: Math.min(maxResults, 40) // Limit to 40 results max
    });
    
    // Extract organic search results
    const organicResults = response.data.organic || [];
    
    // Format search results as tweet-like objects
    const formattedResults = organicResults.slice(0, maxResults).map((result, index) => {
      return {
        id: `search-${index + 1}`,
        text: `${result.title}. ${result.snippet || ''}`,
        source: result.link,
        title: result.title
      };
    });
    
    console.log(`Retrieved ${formattedResults.length} search results for "${topic}"`);
    return formattedResults;
  } catch (error) {
    console.error('Error searching Google via Serper API:', error.message);
    throw new Error('Failed to search Google');
  }
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
      `According to ${new URL(result.source).hostname}: ${result.text.substring(0, 100)}...`,
      `Worth reading about ${result.title}: ${result.text.substring(0, 100)}...`,
      `New information about ${result.title}: ${result.text.substring(0, 100)}...`
    ];
    
    // Select a random format
    const format = tweetFormats[index % tweetFormats.length];
    
    return {
      id: `generated-${index + 1}`,
      text: format,
      source: result.source
    };
  });
  
  console.log(`Generated ${generatedTweets.length} tweets from search results`);
  return generatedTweets;
}

module.exports = {
  searchTopicOnGoogle,
  generateTweetsFromSearchResults
};
