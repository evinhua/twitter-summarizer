const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

/**
 * Search for a topic using Google via web scraping approach
 * @param {string} topic - The topic to search for
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Array} - Array of search results formatted as tweet-like objects
 */
async function searchTopicOnGoogle(topic, maxResults = 20) {
  try {
    console.log(`Searching Google for "${topic}" via web scraping`);
    
    // Use DuckDuckGo instead of Google to avoid CAPTCHAs and blocks
    const response = await axios.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(topic)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://duckduckgo.com/',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      },
      timeout: 10000 // 10 second timeout
    });
    
    // Parse HTML response
    const $ = cheerio.load(response.data);
    const searchResults = [];
    
    // Extract search results from DuckDuckGo HTML
    $('.result').each((index, element) => {
      if (index >= maxResults) return false;
      
      const titleElement = $(element).find('.result__title');
      const title = titleElement.text().trim();
      const link = $(element).find('.result__url').attr('href') || 
                  $(element).find('.result__title a').attr('href');
      const snippet = $(element).find('.result__snippet').text().trim();
      
      searchResults.push({
        id: `search-${index + 1}`,
        text: `${title}. ${snippet}`,
        source: link,
        title: title
      });
    });
    
    console.log(`Retrieved ${searchResults.length} search results for "${topic}"`);
    
    if (searchResults.length === 0) {
      throw new Error('No search results found');
    }
    
    return searchResults;
  } catch (error) {
    console.error('Error searching via DuckDuckGo:', error.message);
    
    // Try Bing as a second fallback
    try {
      console.log('Trying Bing search as fallback...');
      return await searchBing(topic, maxResults);
    } catch (bingError) {
      console.error('Error searching via Bing:', bingError.message);
      throw new Error('Failed to search for content');
    }
  }
}

/**
 * Search for a topic using Bing
 * @param {string} topic - The topic to search for
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Array} - Array of search results formatted as tweet-like objects
 */
async function searchBing(topic, maxResults = 20) {
  try {
    const response = await axios.get(`https://www.bing.com/search?q=${encodeURIComponent(topic)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 10000 // 10 second timeout
    });
    
    // Parse HTML response
    const $ = cheerio.load(response.data);
    const searchResults = [];
    
    // Extract search results from Bing HTML
    $('.b_algo').each((index, element) => {
      if (index >= maxResults) return false;
      
      const titleElement = $(element).find('h2');
      const title = titleElement.text().trim();
      const link = titleElement.find('a').attr('href');
      const snippet = $(element).find('.b_caption p').text().trim();
      
      searchResults.push({
        id: `search-${index + 1}`,
        text: `${title}. ${snippet}`,
        source: link,
        title: title
      });
    });
    
    console.log(`Retrieved ${searchResults.length} search results from Bing for "${topic}"`);
    
    if (searchResults.length === 0) {
      throw new Error('No search results found on Bing');
    }
    
    return searchResults;
  } catch (error) {
    console.error('Error in Bing search:', error.message);
    throw error;
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
