import React, { useState, useEffect } from 'react';
import './ModelSelector.css';

function ModelSelector({ selectedModel, onModelChange, disabled }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/ollama-models');
        
        if (!response.ok) {
          throw new Error('Failed to fetch Ollama models');
        }
        
        const data = await response.json();
        setModels(data.models);
      } catch (err) {
        console.error('Error fetching models:', err);
        setError('Failed to load Ollama models. Please ensure Ollama is running.');
        // Set a default model list in case of error
        setModels([{ name: 'gemma3:4b' }]);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  return (
    <div className="model-selector">
      <label htmlFor="model-select">Ollama Model:</label>
      {loading ? (
        <div className="loading-models">Loading models...</div>
      ) : error ? (
        <div className="model-error">
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            disabled={disabled}
          >
            <option value="gemma3:4b">gemma3:4b (default)</option>
          </select>
          <div className="error-message">{error}</div>
        </div>
      ) : (
        <select
          id="model-select"
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          disabled={disabled}
        >
          {models.map((model) => (
            <option key={model.name} value={model.name}>
              {model.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default ModelSelector;
