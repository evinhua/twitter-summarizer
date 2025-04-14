# Twitter API Integration Guide

## Current Status

The application is currently using mock data instead of real Twitter API data due to authentication issues. The token provided appears to be a user access token (OAuth 1.0a), but the Twitter API v2 endpoints we're using require a bearer token (OAuth 2.0).

## How to Get a Valid Twitter API Bearer Token

1. Go to the [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Sign in with your Twitter account
3. Create a new Project and App
4. Navigate to the "Keys and Tokens" section
5. Generate a Bearer Token (not a user access token)

## Updating the Application to Use Your Bearer Token

1. Open the `.env` file in the server directory
2. Replace the current `TWITTER_BEARER_TOKEN` value with your new bearer token:

```
TWITTER_BEARER_TOKEN=your_new_bearer_token_here
```

3. Modify the `twitterService.js` file to use the Twitter API instead of mock data:

```javascript
// Uncomment and update this section in twitterService.js
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
    
    console.log(`Successfully fetched ${response.data.data?.length || 0} tweets`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching tweets:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    console.log('Falling back to mock tweets');
    // If Twitter API fails, return mock data for development
    return getMockTweets(topic, maxTweets);
  }
}
```

## Twitter API Rate Limits

Be aware that the Twitter API has rate limits:
- Standard tier: 500,000 tweets per month
- Essential tier: 10,000 tweets per month

Monitor your usage in the Twitter Developer Portal to avoid exceeding these limits.
