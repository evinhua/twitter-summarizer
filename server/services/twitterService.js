const axios = require('axios');
require('dotenv').config();

// Twitter API credentials from .env file
const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

// Log token status (without revealing the actual token)
console.log(`Twitter API token status: ${BEARER_TOKEN ? 'Present' : 'Missing'}`);

// Create Twitter API client with bearer token authentication
const twitterApiClient = axios.create({
  baseURL: 'https://api.twitter.com/2',
  headers: {
    Authorization: `Bearer ${BEARER_TOKEN}`
  }
});

async function fetchTweetsByTopic(topic, maxTweets = 20) {
  try {
    console.log(`Attempting to fetch ${maxTweets} tweets about "${topic}"`);
    
    // Ensure maxTweets is within the allowed range
    const tweetCount = Math.min(Math.max(5, maxTweets), 50);
    
    // Using Twitter API v2 search recent tweets endpoint
    const response = await twitterApiClient.get('/tweets/search/recent', {
      params: {
        query: topic,
        'max_results': tweetCount,
        'tweet.fields': 'created_at,public_metrics'
      }
    });
    
    if (response.data && response.data.data) {
      console.log(`Successfully fetched ${response.data.data.length} tweets`);
      return response.data.data;
    } else {
      console.log('No tweets found in the response, falling back to mock data');
      return getMockTweets(topic, maxTweets);
    }
  } catch (error) {
    console.error('Error fetching tweets:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data));
    }
    
    console.log('Falling back to mock tweets');
    // If Twitter API fails, return mock data for development
    return getMockTweets(topic, maxTweets);
  }
}

// Mock data for development or if Twitter API is unavailable
function getMockTweets(topic, count = 20) {
  console.log(`Generating ${count} mock tweets about "${topic}"`);
  
  // Ensure count is within the allowed range
  const tweetCount = Math.min(Math.max(5, count), 50);
  
  const mockTweetTemplates = [
    { id: '1', text: `Just read an interesting article about ${topic}. It's changing everything!` },
    { id: '2', text: `I don't understand why people are so excited about ${topic}. Seems overrated to me.` },
    { id: '3', text: `New research on ${topic} shows promising results. This could be revolutionary.` },
    { id: '4', text: `Anyone else following the developments in ${topic}? I'm really impressed so far.` },
    { id: '5', text: `The media coverage of ${topic} is so biased. We need more balanced reporting.` },
    { id: '6', text: `Just attended a conference on ${topic}. The experts are divided on its future impact.` },
    { id: '7', text: `${topic} is trending again today. This happens every few months but nothing changes.` },
    { id: '8', text: `I've been studying ${topic} for years and I'm excited about the recent breakthroughs.` },
    { id: '9', text: `Government regulation of ${topic} is desperately needed before it's too late.` },
    { id: '10', text: `The best thing about ${topic} is how it brings people together across different backgrounds.` },
    { id: '11', text: `${topic} might be the most important innovation of our generation. Can't wait to see where it goes.` },
    { id: '12', text: `I'm skeptical about ${topic}. Too much hype, not enough substance.` },
    { id: '13', text: `My company just invested heavily in ${topic} technology. Big things coming!` },
    { id: '14', text: `${topic} is changing how we think about sustainability and environmental impact.` },
    { id: '15', text: `The ethical implications of ${topic} aren't discussed enough. We need more oversight.` },
    { id: '16', text: `${topic} is creating new jobs but also eliminating others. Mixed feelings about this.` },
    { id: '17', text: `Just published my research paper on ${topic}. DM me if you want a copy!` },
    { id: '18', text: `${topic} is not accessible to everyone and that's a serious problem we need to address.` },
    { id: '19', text: `The international competition around ${topic} is heating up. Who will lead?` },
    { id: '20', text: `${topic} was the main discussion at yesterday's board meeting. Everyone's paying attention now.` },
    { id: '21', text: `I've been a ${topic} skeptic but recent developments have changed my mind completely.` },
    { id: '22', text: `${topic} needs more diversity of thought and background. Too homogeneous right now.` },
    { id: '23', text: `The cost of implementing ${topic} is dropping fast. Expect widespread adoption soon.` },
    { id: '24', text: `${topic} is creating a divide between generations. Younger people get it, older folks are resistant.` },
    { id: '25', text: `Just launched my startup focused on ${topic}. Exciting and terrifying at the same time!` },
    { id: '26', text: `${topic} is evolving so quickly it's hard to keep up with the latest developments.` },
    { id: '27', text: `The potential of ${topic} to solve global problems is underestimated by most people.` },
    { id: '28', text: `${topic} is being overhyped by investors looking for the next big thing. Be cautious.` },
    { id: '29', text: `Education about ${topic} should start early. Our kids need to understand this.` },
    { id: '30', text: `${topic} is creating new forms of inequality we haven't even begun to address.` },
    { id: '31', text: `The history of ${topic} is fascinating. It didn't just appear overnight!` },
    { id: '32', text: `${topic} is bringing people together across political divides. That's rare these days.` },
    { id: '33', text: `The unintended consequences of ${topic} could be serious. We need more caution.` },
    { id: '34', text: `${topic} is more complex than most media coverage suggests. Nuance matters.` },
    { id: '35', text: `Just experienced ${topic} firsthand and I'm completely blown away. Game changer!` },
    { id: '36', text: `${topic} is creating opportunities for communities that have been left behind.` },
    { id: '37', text: `The pace of innovation in ${topic} is unprecedented. What a time to be alive!` },
    { id: '38', text: `${topic} needs more public funding and support to reach its full potential.` },
    { id: '39', text: `The experts on ${topic} disagree on fundamental issues. That's concerning.` },
    { id: '40', text: `${topic} is transforming my industry in ways I never imagined possible.` },
    { id: '41', text: `The global implications of ${topic} aren't being taken seriously enough.` },
    { id: '42', text: `${topic} is creating a new digital divide. We need to ensure equal access.` },
    { id: '43', text: `Just finished a book about ${topic} that completely changed my perspective.` },
    { id: '44', text: `${topic} is advancing too quickly for regulations to keep up. That's dangerous.` },
    { id: '45', text: `The collaboration happening around ${topic} gives me hope for humanity.` },
    { id: '46', text: `${topic} is being implemented without proper testing or validation. Risky.` },
    { id: '47', text: `The economic impact of ${topic} will be felt for generations to come.` },
    { id: '48', text: `${topic} is creating strange new alliances between former competitors.` },
    { id: '49', text: `The cultural shift happening because of ${topic} is the most interesting part.` },
    { id: '50', text: `${topic} represents both our greatest hope and our greatest challenge.` }
  ];
  
  // Return the requested number of mock tweets
  const mockTweets = mockTweetTemplates.slice(0, tweetCount);
  console.log(`Generated ${mockTweets.length} mock tweets`);
  return mockTweets;
}

module.exports = {
  fetchTweetsByTopic
};
