import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutAPI, nutritionAPI } from '../services/api';

function LogWorkout() {
  const [formData, setFormData] = useState({
    type: '',
    duration: '',
    caloriesBurned: '',
  });
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCalculateCalories = async () => {
    if (!formData.type || !formData.duration) {
      setError('Please enter workout type and duration first');
      return;
    }

    setCalculating(true);
    setError('');

    try {
      const response = await nutritionAPI.calculateWorkout(formData.type, Number(formData.duration));
      setFormData({
        ...formData,
        caloriesBurned: response.data.caloriesBurned.toString(),
      });
    } catch (err) {
      setError('Failed to calculate calories. Please enter manually.');
    } finally {
      setCalculating(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await workoutAPI.create({
        ...formData,
        duration: Number(formData.duration),
        caloriesBurned: Number(formData.caloriesBurned),
      });
      
      setSuccess(true);
      // Reset form
      setFormData({
        type: '',
        duration: '',
        caloriesBurned: '',
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2>💪 Log Workout</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">✅ Workout logged successfully! Redirecting...</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="type">🏃 Workout Type</label>
            <input
              type="text"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              placeholder="e.g., Running, Cycling, Weight Training"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="duration">⏱️ Duration (minutes)</label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="caloriesBurned">🔥 Calories Burned</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="number"
                id="caloriesBurned"
                name="caloriesBurned"
                value={formData.caloriesBurned}
                onChange={handleChange}
                min="0"
                step="0.1"
                required
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCalculateCalories}
                disabled={calculating || !formData.type || !formData.duration}
                style={{ whiteSpace: 'nowrap' }}
              >
                {calculating ? '⏳ Calculating...' : '🤖 Auto Calculate'}
              </button>
            </div>
            <small style={{ color: '#888', display: 'block', marginTop: '0.5rem' }}>
              💡 Enter duration and type, then click "Auto Calculate" or enter manually
            </small>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? '⏳ Logging...' : '✅ Log Workout'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LogWorkout;
