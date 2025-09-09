import React, { useState, useEffect } from 'react';
import { userApi } from '../services/api';
import { User } from '../types';

interface UserSelectorProps {
  selectedUser: User | null;
  onUserSelected: (user: User | null) => void;
}

export const UserSelector: React.FC<UserSelectorProps> = ({ 
  selectedUser, 
  onUserSelected 
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await userApi.getAll();
      setUsers(fetchedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    if (userId === '') {
      onUserSelected(null);
    } else {
      const user = users.find(u => u.id === userId);
      onUserSelected(user || null);
    }
  };

  // Refresh users list when a new user might have been created
  const refreshUsers = () => {
    loadUsers();
  };

  // Expose refresh function to parent component
  React.useEffect(() => {
    if (users.length === 0) {
      refreshUsers();
    }
  }, []);

  if (loading) {
    return <div className="user-select">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="user-select">
        <div className="error">{error}</div>
        <button className="btn btn-small" onClick={refreshUsers}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="user-select">
      <label htmlFor="userSelect">Select Active User:</label>
      <select
        id="userSelect"
        className="form-control"
        value={selectedUser?.id || ''}
        onChange={handleUserChange}
        style={{ marginTop: '8px' }}
      >
        <option value="">-- Select a user --</option>
        {users.map(user => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
      
      {selectedUser && (
        <p style={{ marginTop: '10px' }}>
          Currently tracking collections for: <span className="current-user">{selectedUser.name}</span>
        </p>
      )}
      
      <button 
        className="btn btn-small btn-secondary" 
        onClick={refreshUsers}
        style={{ marginTop: '10px' }}
      >
        Refresh Users
      </button>
    </div>
  );
};
