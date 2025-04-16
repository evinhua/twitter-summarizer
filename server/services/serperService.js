const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();
const scrapeService = require('./scrapeService');

/**
 * Search for a topic using Google via web scraping approach
 * @param {string} topic - The topic to search for
 * @param {number} exactResults - Exact number of results to return
 * @returns {Array} - Array of search results formatted as tweet-like objects
 */
async function searchTopicOnGoogle(topic, exactResults = 20) {
  try {
    console.log(`Searching for "${topic}" via Serper API - need exactly ${exactResults} results`);
    
    // Use Serper API as the primary search method
    try {
      const serperResults = await searchSerper(topic, exactResults);
      console.log(`Retrieved ${serperResults.length} results from Serper API for "${topic}"`);
      
      // If we got enough results from Serper, return them
      if (serperResults.length >= exactResults) {
        return serperResults.slice(0, exactResults);
      }
      
      // If we didn't get enough results, try to get more with different search terms
      console.log(`Not enough results from Serper (${serperResults.length}/${exactResults}), trying with modified search terms...`);
      
      // Create variations of the search query to get more diverse results
      const variations = [
        `${topic} latest`,
        `${topic} news`,
        `${topic} information`,
        `${topic} facts`,
        `${topic} discussion`,
        `recent ${topic}`,
        `${topic} today`,
        `${topic} analysis`,
        `${topic} overview`,
        `${topic} explained`
      ];
      
      let allResults = [...serperResults];
      let variationIndex = 0;
      
      // Try each variation until we have enough results or run out of variations
      while (allResults.length < exactResults && variationIndex < variations.length) {
        const variation = variations[variationIndex];
        console.log(`Trying variation "${variation}" to get more results...`);
        
        try {
          // Get more results with the variation
          const additionalResults = await searchSerper(variation, exactResults - allResults.length);
          
          // Add unique results to our collection (avoid duplicates by checking URLs)
          const existingUrls = new Set(allResults.map(r => r.source));
          const uniqueNewResults = additionalResults.filter(r => !existingUrls.has(r.source));
          
          console.log(`Found ${uniqueNewResults.length} unique additional results with "${variation}"`);
          allResults = [...allResults, ...uniqueNewResults];
          
          // If we have enough results, break out of the loop
          if (allResults.length >= exactResults) {
            break;
          }
        } catch (error) {
          console.error(`Error with variation "${variation}":`, error.message);
        }
        
        variationIndex++;
      }
      
      console.log(`Total results after variations: ${allResults.length}/${exactResults}`);
      
      // If we still don't have enough results, try web scraping as fallback
      if (allResults.length < exactResults) {
        console.log(`Still not enough results, trying news site scraping...`);
        try {
          const newsResults = await scrapeService.scrapeNewsSites(topic, exactResults - allResults.length);
          
          // Add unique results
          const existingUrls = new Set(allResults.map(r => r.source));
          const uniqueNewsResults = newsResults.filter(r => !existingUrls.has(r.source));
          
          allResults = [...allResults, ...uniqueNewsResults];
          console.log(`Total results after news scraping: ${allResults.length}/${exactResults}`);
          
          // If still not enough, try Reddit
          if (allResults.length < exactResults) {
            console.log(`Still not enough results, trying Reddit scraping...`);
            const redditResults = await scrapeService.scrapeReddit(topic, exactResults - allResults.length);
            
            // Add unique results
            const existingRedditUrls = new Set(allResults.map(r => r.source));
            const uniqueRedditResults = redditResults.filter(r => !existingRedditUrls.has(r.source));
            
            allResults = [...allResults, ...uniqueRedditResults];
            console.log(`Total results after Reddit scraping: ${allResults.length}/${exactResults}`);
          }
        } catch (scrapeError) {
          console.error('Error with additional scraping:', scrapeError.message);
        }
      }
      
      // Return exactly the number requested or all available if less
      return allResults.slice(0, exactResults);
    } catch (serperError) {
      console.error('Error searching via Serper API:', serperError.message);
      
      // Fall back to web scraping
      console.log('Falling back to web scraping...');
      return await scrapeSearchResults(topic, exactResults);
    }
  } catch (error) {
    console.error('All search methods failed:', error.message);
    throw new Error('Failed to search for content using any available method');
  }
}

/**
 * Search using Serper API
 * @param {string} query - The search query
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Array} - Array of search results
 */
async function searchSerper(query, maxResults = 20) {
  try {
    console.log(`Searching Serper API for "${query}" (max ${maxResults} results)`);
    
    // Get API key from environment variables
    const serperApiKey = process.env.SERPER_API_KEY;
    if (!serperApiKey) {
      throw new Error('Serper API key not found in environment variables');
    }
    
    const headers = {
      'X-API-KEY': serperApiKey,
      'Content-Type': 'application/json'
    };
    
    const payload = {
      q: query,
      num: Math.min(maxResults * 2, 100) // Request more than needed, up to API limit
    };
    
    const response = await axios.post(
      'https://api.serper.dev/search',
      payload,
      { headers }
    );
    
    if (!response.data || !response.data.organic) {
      throw new Error('Invalid response from Serper API');
    }
    
    const results = response.data.organic.map((result, index) => ({
      id: `serper-${index + 1}`,
      text: `${result.title}. ${result.snippet || ''}`,
      source: result.link,
      title: result.title
    }));
    
    console.log(`Retrieved ${results.length} results from Serper API`);
    return results;
  } catch (error) {
    console.error('Error in Serper API search:', error.message);
    throw error;
  }
}

/**
 * Scrape search results from web search engines as a fallback
 * @param {string} topic - The topic to search for
 * @param {number} exactResults - Exact number of results to return
 * @returns {Array} - Array of search results
 */
async function scrapeSearchResults(topic, exactResults = 20) {
  try {
    console.log(`Scraping search results for "${topic}" - need ${exactResults} results`);
    
    // Request more results than needed to ensure we can get the exact number after filtering
    const bufferMultiplier = 2;
    const requestResults = exactResults * bufferMultiplier;
    
    // Use DuckDuckGo for web scraping
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
    
    console.log(`Retrieved ${searchResults.length} raw search results from web scraping`);
    
    if (searchResults.length === 0) {
      throw new Error('No search results found from web scraping');
    }
    
    // If we don't have enough results, try to get more from Bing
    if (searchResults.length < exactResults) {
      try {
        console.log(`Not enough results from scraping (${searchResults.length}/${exactResults}), trying Bing...`);
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
    console.error('Error in web scraping:', error.message);
    
    // Try Bing as a last resort
    try {
      console.log('Trying Bing search as last resort...');
      return await searchBing(topic, exactResults);
    } catch (bingError) {
      console.error('Error searching via Bing:', bingError.message);
      throw new Error('Failed to search for content via any method');
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
    
    // If we don't have enough results, try DuckDuckGo as a final fallback
    if (searchResults.length < exactResults) {
      try {
        console.log(`Not enough results from Bing (${searchResults.length}/${exactResults}), trying DuckDuckGo as final fallback...`);
        const duckDuckGoResults = await searchDuckDuckGo(topic, exactResults - searchResults.length);
        
        // Combine results
        const combinedResults = [...searchResults, ...duckDuckGoResults];
        console.log(`Combined results: ${combinedResults.length} (Bing: ${searchResults.length}, DuckDuckGo: ${duckDuckGoResults.length})`);
        
        // Return exactly the number requested or all available if less
        return combinedResults.slice(0, exactResults);
      } catch (duckDuckGoError) {
        console.error('Error supplementing with DuckDuckGo search:', duckDuckGoError.message);
        // Continue with just the Bing results
      }
    }
    
    // Return exactly the number requested or all available if less
    return searchResults.slice(0, exactResults);
  } catch (error) {
    console.error('Error in Bing search:', error.message);
    
    // Try DuckDuckGo as a final fallback
    try {
      console.log('Trying DuckDuckGo search as final fallback...');
      return await searchDuckDuckGo(topic, exactResults);
    } catch (duckDuckGoError) {
      console.error('Error searching via DuckDuckGo:', duckDuckGoError.message);
      throw new Error('Failed to search for content via any method');
    }
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
  generateTweetsFromSearchResults,
  searchSerper,
  searchBing,
  searchDuckDuckGo
};
/**
 * Search using DuckDuckGo
 * @param {string} topic - The topic to search for
 * @param {number} exactResults - Exact number of results to return
 * @returns {Array} - Array of search results formatted as tweet-like objects
 */
async function searchDuckDuckGo(topic, exactResults = 20) {
  try {
    console.log(`Searching DuckDuckGo for "${topic}" - need exactly ${exactResults} results`);
    
    // Request more results than needed to ensure we can get the exact number after filtering
    const bufferMultiplier = 2;
    const requestResults = exactResults * bufferMultiplier;
    
    // Use DuckDuckGo's HTML search page
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
          id: `duckduckgo-${index + 1}`,
          text: `${title}. ${snippet}`,
          source: link,
          title: title
        });
      }
    });
    
    console.log(`Retrieved ${searchResults.length} search results from DuckDuckGo for "${topic}"`);
    
    if (searchResults.length === 0) {
      throw new Error('No search results found on DuckDuckGo');
    }
    
    // Try different DuckDuckGo search variations if we don't have enough results
    if (searchResults.length < exactResults) {
      const variations = [
        `${topic} latest`,
        `${topic} news`,
        `${topic} information`,
        `recent ${topic}`
      ];
      
      for (const variation of variations) {
        if (searchResults.length >= exactResults) break;
        
        try {
          console.log(`Trying DuckDuckGo variation "${variation}" to get more results...`);
          
          const variationResponse = await axios.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(variation)}`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Referer': 'https://duckduckgo.com/',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1',
              'Cache-Control': 'max-age=0'
            },
            timeout: 10000
          });
          
          const $variation = cheerio.load(variationResponse.data);
          const existingUrls = new Set(searchResults.map(r => r.source));
          
          $variation('.result').each((index, element) => {
            if (searchResults.length >= exactResults) return false;
            
            const titleElement = $variation(element).find('.result__title');
            const title = titleElement.text().trim();
            const link = $variation(element).find('.result__url').attr('href') || 
                        $variation(element).find('.result__title a').attr('href');
            const snippet = $variation(element).find('.result__snippet').text().trim();
            
            // Only add unique results with meaningful content
            if (title && snippet && link && !existingUrls.has(link)) {
              searchResults.push({
                id: `duckduckgo-variation-${searchResults.length + 1}`,
                text: `${title}. ${snippet}`,
                source: link,
                title: title
              });
              existingUrls.add(link);
            }
          });
          
          console.log(`Now have ${searchResults.length}/${exactResults} results after variation "${variation}"`);
        } catch (error) {
          console.error(`Error with DuckDuckGo variation "${variation}":`, error.message);
        }
      }
    }
    
    // Return exactly the number requested or all available if less
    return searchResults.slice(0, exactResults);
  } catch (error) {
    console.error('Error in DuckDuckGo search:', error.message);
    throw error;
  }
}
