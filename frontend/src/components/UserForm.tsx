import React, { useState } from 'react';
import { userApi } from '../services/api';
import { User } from '../types';

interface UserFormProps {
  onUserCreated: (user: User) => void;
}

export const UserForm: React.FC<UserFormProps> = ({ onUserCreated }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const user = await userApi.create({ name: name.trim() });
      setSuccess(`Welcome, ${user.name}! You can now start tracking your collections.`);
      setName('');
      onUserCreated(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>👤 Create User Account</h2>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="userName">Your Name</label>
          <input
            type="text"
            id="userName"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn" 
          disabled={loading || !name.trim()}
        >
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
};
