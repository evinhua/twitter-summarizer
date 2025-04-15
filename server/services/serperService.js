const axios = require('axios');
require('dotenv').config();

// Serper API key
const SERPER_API_KEY = process.env.SERPER_API_KEY || "efad9c66159909eff3ce534f8da47d4ba33671d9";

/**
 * Search for a topic using Google via direct Google search
 * @param {string} topic - The topic to search for
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Array} - Array of search results formatted as tweet-like objects
 */
async function searchTopicOnGoogle(topic, maxResults = 20) {
  try {
    console.log(`Searching Google for "${topic}" directly`);
    
    // Use direct Google search with axios
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: 'AIzaSyCVAXiUzRYsML1Pv6RwSG1gunmMikTzQqY', // Public API key for demo purposes
        cx: '017576662512468239146:omuauf_lfve', // Custom search engine ID
        q: topic,
        num: Math.min(maxResults, 10) // Google API limits to 10 results per request
      }
    });
    
    // Extract search results
    const searchResults = response.data.items || [];
    
    // Format search results as tweet-like objects
    const formattedResults = searchResults.map((result, index) => {
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
    console.error('Error searching Google:', error.message);
    
    // Fallback to mock data if Google search fails
    console.log('Falling back to mock data generation');
    return generateMockResults(topic, maxResults);
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
