# Twitter Topic Summarizer

A web application that summarizes and analyzes sentiment for specific topics on Twitter/X using React for the frontend and Ollama with the Gemma3 4B model for processing.

## Features

- Search for any topic on Twitter
- Adjust the number of tweets to analyze (5-50)
- Get a concise summary of the topic discussion
- Get sentiment analysis of the tweets
- Uses local Ollama instance for privacy and control

## Tech Stack

- **Frontend**: React
- **Backend**: Node.js with Express
- **LLM**: Ollama with Gemma3 4B model
- **API**: Twitter API v2

## Prerequisites

- Node.js and npm
- Ollama installed with the Gemma3 4B model
- Twitter API bearer token

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
```

### 4. Install frontend dependencies

```bash
cd ../client
npm install
```

### 5. Make sure Ollama is running with the Gemma3 4B model

```bash
ollama pull gemma3:4b
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
3. Click "Analyze Topic"
4. View the summary and sentiment analysis results

## License

MIT
