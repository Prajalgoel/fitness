import { useState, useEffect } from 'react';
import { summaryAPI } from '../services/api';

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await summaryAPI.getToday();
      setSummary(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load summary. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">📊 Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h2>📊 Today's Summary</h2>
      
      <div className="summary-cards">
        <div className="summary-card">
          <h3>🍽️ Calories Consumed</h3>
          <p className="summary-value">{summary.consumed}</p>
          <small>{summary.foodCount} food log(s)</small>
        </div>
        
        <div className="summary-card">
          <h3>🔥 Calories Burned</h3>
          <p className="summary-value">{summary.burned}</p>
          <small>{summary.workoutCount} workout(s)</small>
        </div>
        
        <div className="summary-card">
          <h3>⚖️ Net Calories</h3>
          <p className={`summary-value ${summary.net > 0 ? 'positive' : 'negative'}`}>
            {summary.net > 0 ? '+' : ''}{summary.net}
          </p>
          <small>Goal: {summary.goal === 'loss' ? '🎯 Weight Loss' : summary.goal === 'gain' ? '💪 Muscle Gain' : '⚖️ Maintain Weight'}</small>
        </div>
      </div>

      <div className="advice-section">
        <h3>💡 Personalized Advice</h3>
        <ul className="advice-list">
          {summary.advice.map((advice, index) => (
            <li key={index}>✨ {advice}</li>
          ))}
        </ul>
      </div>

      <button onClick={fetchSummary} className="btn btn-secondary">
        🔄 Refresh Summary
      </button>
    </div>
  );
}

export default Dashboard;
