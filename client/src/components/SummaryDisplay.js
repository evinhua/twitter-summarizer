import React from 'react';
import './SummaryDisplay.css';

function SummaryDisplay({ summary, sentiment, tweetCount, model }) {
  return (
    <div className="summary-display">
      <div className="stats">
        <div className="stat-item">
          <span className="stat-label">Tweets Analyzed:</span>
          <span className="stat-value">{tweetCount}</span>
        </div>
        {model && (
          <div className="stat-item">
            <span className="stat-label">Model Used:</span>
            <span className="stat-value model-name">{model}</span>
          </div>
        )}
      </div>
      
      <div className="summary-section">
        <h2>Summary</h2>
        <div className="summary-content">
          {summary}
        </div>
      </div>
      
      <div className="sentiment-section">
        <h2>Sentiment Analysis</h2>
        <div className="sentiment-content">
          {sentiment}
        </div>
      </div>
    </div>
  );
}

export default SummaryDisplay;
