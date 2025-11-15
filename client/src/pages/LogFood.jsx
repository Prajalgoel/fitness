import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { foodAPI, nutritionAPI } from '../services/api';

function LogFood() {
  const [searchQuery, setSearchQuery] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [searching, setSearching] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError('');

    try {
      const response = await nutritionAPI.searchFood(searchQuery, Number(quantity));
      setFormData({
        name: response.data.name,
        calories: response.data.calories.toString(),
        protein: response.data.protein.toString(),
        carbs: response.data.carbs.toString(),
        fat: response.data.fat.toString(),
      });
      setShowManualEntry(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Food not found. Please enter nutrition values manually.');
      setShowManualEntry(true);
      setFormData({
        ...formData,
        name: searchQuery,
      });
    } finally {
      setSearching(false);
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
      await foodAPI.create({
        ...formData,
        calories: Number(formData.calories),
        protein: Number(formData.protein),
        carbs: Number(formData.carbs),
        fat: Number(formData.fat),
        servings: 1,
      });
      
      setSuccess(true);
      // Reset form
      setFormData({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        servings: '1',
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log food. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2>🍽️ Log Food</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">✅ Food logged successfully! Redirecting...</div>}
        
        {!showManualEntry ? (
          <div className="search-section">
            <form onSubmit={handleSearch} className="search-form">
              <div className="form-group" style={{ flex: 2 }}>
                <label htmlFor="searchQuery">🔍 Search Food</label>
                <input
                  type="text"
                  id="searchQuery"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., Apple, Chicken Breast, Rice"
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="quantity">⚖️ Quantity (grams)</label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="100"
                  min="1"
                  required
                />
              </div>
            </form>
            <button type="submit" onClick={handleSearch} className="btn btn-primary btn-block" disabled={searching}>
              {searching ? '⏳ Searching...' : '🔍 Search Nutrition Info'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary btn-block" 
              onClick={() => setShowManualEntry(true)}
              style={{ marginTop: '0.5rem' }}
            >
              ✏️ Enter Manually Instead
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">🍴 Food Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Grilled Chicken"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="calories">🔥 Calories</label>
            <input
              type="number"
              id="calories"
              name="calories"
              value={formData.calories}
              onChange={handleChange}
              min="0"
              step="0.1"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="protein">💪 Protein (g)</label>
              <input
                type="number"
                id="protein"
                name="protein"
                value={formData.protein}
                onChange={handleChange}
                min="0"
                step="0.1"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="carbs">🌾 Carbs (g)</label>
              <input
                type="number"
                id="carbs"
                name="carbs"
                value={formData.carbs}
                onChange={handleChange}
                min="0"
                step="0.1"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="fat">🥑 Fat (g)</label>
              <input
                type="number"
                id="fat"
                name="fat"
                value={formData.fat}
                onChange={handleChange}
                min="0"
                step="0.1"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? '⏳ Logging...' : '✅ Log Food'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary btn-block" 
            onClick={() => {
              setShowManualEntry(false);
              setSearchQuery('');
              setQuantity('100');
              setFormData({
                name: '',
                calories: '',
                protein: '',
                carbs: '',
                fat: '',
              });
            }}
            style={{ marginTop: '0.5rem' }}
          >
            🔙 Search Again
          </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default LogFood;
