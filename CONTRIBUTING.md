# Contributing to Twitter Topic Summarizer

Thank you for your interest in contributing to the Twitter Topic Summarizer project! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/twitter-summarizer.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`

## Setting Up the Development Environment

1. Install dependencies:
   ```bash
   # Backend
   cd server
   npm install
   
   # Frontend
   cd ../client
   npm install
   ```

2. Create a `.env` file in the server directory:
   ```
   PORT=5000
   TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here
   ```

3. Make sure Ollama is running with the Gemma3 4B model:
   ```bash
   ollama pull gemma3:4b
   ollama serve
   ```

## Development Workflow

1. Make your changes
2. Test your changes locally
3. Commit your changes with a descriptive commit message
4. Push to your fork
5. Submit a pull request

## Code Style Guidelines

- Use consistent indentation (2 spaces)
- Follow the existing code style
- Write clear, descriptive comments
- Use meaningful variable and function names

## Testing

- Test your changes thoroughly before submitting a pull request
- Ensure the application works with both real Twitter API data and mock data
- Verify that the slider for tweet count works correctly

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Ensure your code follows the style guidelines
3. Make sure all tests pass
4. Your pull request will be reviewed by maintainers

## Feature Suggestions

Some ideas for future contributions:

1. Add user authentication
2. Implement caching for API responses
3. Add more visualization options for sentiment analysis
4. Create a history of past searches
5. Add support for other languages
6. Implement tweet filtering options

## Questions?

If you have any questions or need help, please open an issue in the repository.

Thank you for contributing!
