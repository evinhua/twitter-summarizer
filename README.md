# Twitter Topic Summarizer

A web application that summarizes and analyzes sentiment for specific topics on Twitter/X using React for the frontend and Ollama for processing. When Twitter API access fails, it falls back to Google search results via Serper API.

## Features

- Search for any topic on Twitter
- Adjust the number of tweets to analyze (5-50)
- Get a concise summary of the topic discussion
- Get sentiment analysis of the tweets
- Uses local Ollama instance for privacy and control
- **NEW: Select from any locally installed Ollama model** for analysis
- **NEW: Google search fallback** when Twitter API is unavailable

## Tech Stack

- **Frontend**: React
- **Backend**: Node.js with Express
- **LLM**: Ollama with any locally installed model (default: Gemma3 4B)
- **APIs**: 
  - Twitter API v2 (primary source)
  - Google Search via Serper API (fallback)

## Prerequisites

- Node.js and npm
- Ollama installed with at least one model (Gemma3 4B recommended)
- Twitter API bearer token
- Serper API key (included by default)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/evinhua/twitter-summarizer.git
cd twitter-summarizer
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Configure environment variables

Create a `.env` file in the server directory with your Twitter API token:

```
PORT=5000
TWITTER_BEARER_TOKEN=your_twitter_api_bearer_token
SERPER_API_KEY=your_serper_api_key
```

### 4. Install frontend dependencies

```bash
cd ../client
npm install
```

### 5. Make sure Ollama is running with at least one model

```bash
# Pull a recommended model if you don't have any
ollama pull gemma3:4b

# Start Ollama server
ollama serve
```

## Running the Application

1. Start the backend server:

```bash
cd server
npm start
```

2. In a new terminal, start the frontend:

```bash
cd client
npm start
```

3. Open your browser and navigate to http://localhost:3000

## Usage

1. Enter a topic in the search field
2. Use the slider to select how many tweets to analyze (5-50)
3. Select an Ollama model from the dropdown menu
4. Click "Analyze Topic"
5. View the summary and sentiment analysis results

## Model Selection

The application automatically detects all locally installed Ollama models and displays them in a dropdown menu. You can choose different models based on your needs:

- Smaller models (like Phi-2, Gemma 2B) for faster results
- Larger models (like Llama3 70B, Mixtral) for more detailed analysis
- Specialized models for specific types of analysis

If Ollama is not running or no models are found, the application will default to using Gemma3 4B.

## How It Works

1. The application first attempts to fetch tweets from the Twitter API
2. If Twitter API access fails, it falls back to Google search via Serper API
3. Search results are transformed into tweet-like format for analysis
4. If both Twitter and Google search fail, mock tweets are used
5. The selected Ollama model processes the collected data to generate summaries and sentiment analysis

## License

MIT
