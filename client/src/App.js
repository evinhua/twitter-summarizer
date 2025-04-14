import React, { useState } from 'react';
import './App.css';
import TopicForm from './components/TopicForm';
import SummaryDisplay from './components/SummaryDisplay';

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyzeTopic = async (topic, tweetCount) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/analyze-topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, tweetCount }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze topic');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Twitter Topic Summarizer</h1>
        <p>Enter a topic to get a summary and sentiment analysis from Twitter</p>
      </header>
      
      <main>
        <TopicForm onSubmit={analyzeTopic} disabled={loading} />
        
        {loading && <div className="loading">Analyzing topic... This may take a moment.</div>}
        
        {error && <div className="error">{error}</div>}
        
        {result && <SummaryDisplay 
          summary={result.summary} 
          sentiment={result.sentiment} 
          tweetCount={result.tweetCount} 
        />}
      </main>
      
      <footer>
        <p>Powered by Ollama and Gemma3 4B</p>
      </footer>
    </div>
  );
}

export default App;
