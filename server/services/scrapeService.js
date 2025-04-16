/**
 * Scrape Service - Additional web scraping functionality for the Twitter Summarizer
 * This service provides additional scraping methods to get content when other methods fail
 */

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape news sites for content related to a topic
 * @param {string} topic - The topic to search for
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Array} - Array of search results formatted as tweet-like objects
 */
async function scrapeNewsSites(topic, maxResults = 10) {
  try {
    console.log(`Scraping news sites for "${topic}" - need ${maxResults} results`);
    
    // List of news sites to scrape
    const newsSites = [
      { url: `https://news.google.com/search?q=${encodeURIComponent(topic)}&hl=en-US`, selector: 'article' },
      { url: `https://www.reuters.com/search/news?blob=${encodeURIComponent(topic)}`, selector: '.search-result-content' },
      { url: `https://www.bbc.com/search?q=${encodeURIComponent(topic)}`, selector: '.ssrcss-1f3bvyz-Stack' }
    ];
    
    const allResults = [];
    
    // Try each news site until we have enough results
    for (const site of newsSites) {
      if (allResults.length >= maxResults) break;
      
      try {
        console.log(`Scraping ${site.url}`);
        
        const response = await axios.get(site.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
          },
          timeout: 10000 // 10 second timeout
        });
        
        const $ = cheerio.load(response.data);
        const existingUrls = new Set(allResults.map(r => r.source));
        
        $(site.selector).each((index, element) => {
          if (allResults.length >= maxResults) return false;
          
          // Extract content based on the site structure
          let title, link, snippet;
          
          if (site.url.includes('news.google.com')) {
            title = $(element).find('h3').text().trim();
            link = $(element).find('a').attr('href');
            snippet = $(element).find('p').text().trim();
            
            // Google News has relative URLs
            if (link && link.startsWith('./')) {
              link = 'https://news.google.com' + link.substring(1);
            }
          } else if (site.url.includes('reuters.com')) {
            title = $(element).find('h3').text().trim();
            link = $(element).find('a').attr('href');
            snippet = $(element).find('p').text().trim();
            
            // Reuters has relative URLs
            if (link && !link.startsWith('http')) {
              link = 'https://www.reuters.com' + link;
            }
          } else if (site.url.includes('bbc.com')) {
            title = $(element).find('h2').text().trim();
            link = $(element).find('a').attr('href');
            snippet = $(element).find('p').text().trim();
            
            // BBC has relative URLs
            if (link && !link.startsWith('http')) {
              link = 'https://www.bbc.com' + link;
            }
          }
          
          // Only add unique results with meaningful content
          if (title && snippet && link && !existingUrls.has(link)) {
            allResults.push({
              id: `news-${allResults.length + 1}`,
              text: `${title}. ${snippet}`,
              source: link,
              title: title
            });
            existingUrls.add(link);
          }
        });
        
        console.log(`Found ${allResults.length}/${maxResults} results from news sites`);
      } catch (error) {
        console.error(`Error scraping ${site.url}:`, error.message);
      }
    }
    
    return allResults.slice(0, maxResults);
  } catch (error) {
    console.error('Error in news site scraping:', error.message);
    return [];
  }
}

/**
 * Scrape Reddit for content related to a topic
 * @param {string} topic - The topic to search for
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Array} - Array of search results formatted as tweet-like objects
 */
async function scrapeReddit(topic, maxResults = 10) {
  try {
    console.log(`Scraping Reddit for "${topic}" - need ${maxResults} results`);
    
    // Use old.reddit.com as it's easier to scrape
    const url = `https://old.reddit.com/search/?q=${encodeURIComponent(topic)}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 10000 // 10 second timeout
    });
    
    const $ = cheerio.load(response.data);
    const searchResults = [];
    
    // Extract search results from Reddit HTML
    $('.search-result').each((index, element) => {
      if (searchResults.length >= maxResults) return false;
      
      const titleElement = $(element).find('.search-title');
      const title = titleElement.text().trim();
      const link = titleElement.attr('href');
      const snippet = $(element).find('.search-result-body').text().trim();
      
      // Only add results with meaningful content
      if (title && snippet && link) {
        searchResults.push({
          id: `reddit-${searchResults.length + 1}`,
          text: `${title}. ${snippet}`,
          source: link.startsWith('http') ? link : `https://www.reddit.com${link}`,
          title: title
        });
      }
    });
    
    console.log(`Retrieved ${searchResults.length} search results from Reddit for "${topic}"`);
    return searchResults.slice(0, maxResults);
  } catch (error) {
    console.error('Error in Reddit scraping:', error.message);
    return [];
  }
}

module.exports = {
  scrapeNewsSites,
  scrapeReddit
};
