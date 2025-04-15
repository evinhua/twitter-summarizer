const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

/**
 * Search for a topic using Google via web scraping approach
 * @param {string} topic - The topic to search for
 * @param {number} exactResults - Exact number of results to return
 * @returns {Array} - Array of search results formatted as tweet-like objects
 */
async function searchTopicOnGoogle(topic, exactResults = 20) {
  try {
    console.log(`Searching for "${topic}" via web scraping - need exactly ${exactResults} results`);
    
    // Request more results than needed to ensure we can get the exact number after filtering
    const bufferMultiplier = 2;
    const requestResults = exactResults * bufferMultiplier;
    
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
      if (index >= requestResults) return false;
      
      const titleElement = $(element).find('.result__title');
      const title = titleElement.text().trim();
      const link = $(element).find('.result__url').attr('href') || 
                  $(element).find('.result__title a').attr('href');
      const snippet = $(element).find('.result__snippet').text().trim();
      
      // Only add results with meaningful content
      if (title && snippet && link) {
        searchResults.push({
          id: `search-${index + 1}`,
          text: `${title}. ${snippet}`,
          source: link,
          title: title
        });
      }
    });
    
    console.log(`Retrieved ${searchResults.length} raw search results for "${topic}"`);
    
    if (searchResults.length === 0) {
      throw new Error('No search results found');
    }
    
    // If we don't have enough results, try to get more from Bing
    if (searchResults.length < exactResults) {
      try {
        console.log(`Not enough results (${searchResults.length}/${exactResults}), trying Bing search to supplement...`);
        const bingResults = await searchBing(topic, exactResults - searchResults.length);
        
        // Combine results
        const combinedResults = [...searchResults, ...bingResults];
        console.log(`Combined results: ${combinedResults.length} (DuckDuckGo: ${searchResults.length}, Bing: ${bingResults.length})`);
        
        // Return exactly the number requested or all available if less
        return combinedResults.slice(0, exactResults);
      } catch (bingError) {
        console.error('Error supplementing with Bing search:', bingError.message);
        // Continue with just the DuckDuckGo results
      }
    }
    
    // Return exactly the number requested or all available if less
    return searchResults.slice(0, exactResults);
  } catch (error) {
    console.error('Error searching via DuckDuckGo:', error.message);
    
    // Try Bing as a second fallback
    try {
      console.log('Trying Bing search as primary fallback...');
      return await searchBing(topic, exactResults);
    } catch (bingError) {
      console.error('Error searching via Bing:', bingError.message);
      throw new Error('Failed to search for content');
    }
  }
}

/**
 * Search for a topic using Bing
 * @param {string} topic - The topic to search for
 * @param {number} exactResults - Exact number of results to return
 * @returns {Array} - Array of search results formatted as tweet-like objects
 */
async function searchBing(topic, exactResults = 20) {
  try {
    console.log(`Searching Bing for "${topic}" - need exactly ${exactResults} results`);
    
    // Request more results than needed to ensure we can get the exact number after filtering
    const bufferMultiplier = 2;
    const requestResults = exactResults * bufferMultiplier;
    
    const response = await axios.get(`https://www.bing.com/search?q=${encodeURIComponent(topic)}&count=${requestResults}`, {
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
      if (index >= requestResults) return false;
      
      const titleElement = $(element).find('h2');
      const title = titleElement.text().trim();
      const link = titleElement.find('a').attr('href');
      const snippet = $(element).find('.b_caption p').text().trim();
      
      // Only add results with meaningful content
      if (title && snippet && link) {
        searchResults.push({
          id: `search-${index + 1}`,
          text: `${title}. ${snippet}`,
          source: link,
          title: title
        });
      }
    });
    
    console.log(`Retrieved ${searchResults.length} search results from Bing for "${topic}"`);
    
    if (searchResults.length === 0) {
      throw new Error('No search results found on Bing');
    }
    
    // Return exactly the number requested or all available if less
    return searchResults.slice(0, exactResults);
  } catch (error) {
    console.error('Error in Bing search:', error.message);
    throw error;
  }
}

/**
 * Generate tweet-like content based on search results
 * @param {Array} searchResults - Array of search results
 * @param {number} count - Number of tweets to generate (should match searchResults.length)
 * @returns {Array} - Array of generated tweets
 */
function generateTweetsFromSearchResults(searchResults, count) {
  // We should have exactly the right number of search results
  const availableResults = searchResults.length;
  
  console.log(`Generating ${availableResults} tweets from ${availableResults} search results`);
  
  // Create tweets based on search results - one tweet per search result
  const generatedTweets = searchResults.map((result, index) => {
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
