import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile, getCurrentUser } from '../services/api';

function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    goal: 'maintain',
  });

  useEffect(() => {
    // Load current user data
    const loadUserData = async () => {
      try {
        setLoadingData(true);
        const response = await getCurrentUser();
        const user = response.data;
        setFormData({
          name: user.name || '',
          age: user.age || '',
          weight: user.weight || '',
          height: user.height || '',
          goal: user.goal || 'maintain',
        });
        setError('');
      } catch (err) {
        setError('Failed to load profile data: ' + (err.response?.data?.message || err.message));
        console.error('Profile load error:', err);
      } finally {
        setLoadingData(false);
      }
    };
    loadUserData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await updateProfile({
        name: formData.name,
        age: Number(formData.age),
        weight: Number(formData.weight),
        height: Number(formData.height),
        goal: formData.goal,
      });
      
      // Update localStorage with new user data
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="form-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-card">
        <h2>Edit Profile</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="1"
                max="120"
                placeholder="25"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="weight">Weight (kg)</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                min="1"
                step="0.1"
                placeholder="70"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="height">Height (cm)</label>
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleChange}
                min="1"
                step="0.1"
                placeholder="175"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="goal">Fitness Goal</label>
            <select
              id="goal"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              required
            >
              <option value="loss">Weight Loss</option>
              <option value="gain">Muscle Gain</option>
              <option value="maintain">Maintain Weight</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary btn-block" 
            onClick={() => navigate('/dashboard')}
            style={{ marginTop: '0.5rem' }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
