import React, { useState } from 'react';
import './TopicForm.css';
import ModelSelector from './ModelSelector';

function TopicForm({ onSubmit, disabled }) {
  const [topic, setTopic] = useState('');
  const [tweetCount, setTweetCount] = useState(20);
  const [selectedModel, setSelectedModel] = useState('gemma3:4b');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic.trim(), tweetCount, selectedModel);
    }
  };

  return (
    <div className="topic-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="topic">Topic:</label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic (e.g., climate change, AI technology)"
            disabled={disabled}
            required
          />
        </div>
        
        <div className="form-group slider-group">
          <label htmlFor="tweetCount">
            Number of tweets to analyze: <span className="tweet-count">{tweetCount}</span>
          </label>
          <div className="slider-container">
            <span className="slider-label">5</span>
            <input
              type="range"
              id="tweetCount"
              min="5"
              max="50"
              step="5"
              value={tweetCount}
              onChange={(e) => setTweetCount(parseInt(e.target.value))}
              disabled={disabled}
            />
            <span className="slider-label">50</span>
          </div>
        </div>
        
        <ModelSelector 
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          disabled={disabled}
        />
        
        <button type="submit" disabled={disabled || !topic.trim()}>
          {disabled ? 'Analyzing...' : 'Analyze Topic'}
        </button>
      </form>
    </div>
  );
}

export default TopicForm;
