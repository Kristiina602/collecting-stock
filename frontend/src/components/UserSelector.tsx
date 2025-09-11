import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { userApi } from '../services/api';
import { User } from '../types';

interface UserSelectorProps {
  selectedUser: User | null;
  onUserSelected: (user: User | null) => void;
  onUsersRefreshed?: () => void;
}

export const UserSelector: React.FC<UserSelectorProps> = ({ 
  selectedUser, 
  onUserSelected,
  onUsersRefreshed 
}) => {
  const { t } = useTranslation();
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
      
      // If a user is currently selected, update it with fresh data
      if (selectedUser) {
        const updatedUser = fetchedUsers.find(u => u.id === selectedUser.id);
        if (updatedUser) {
          onUserSelected(updatedUser);
        }
      }
      
      // Call the refresh callback if provided
      onUsersRefreshed?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('messages.errorLoadingUsers'));
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
    return (
      <div className="card">
        <h2>{t('user.selectActiveUser')}</h2>
        {t('messages.loadingUsers')}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2>{t('user.selectActiveUser')}</h2>
        <div className="error">{error}</div>
        <button className="btn btn-small" onClick={refreshUsers}>
          {t('messages.tryAgain')}
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>{t('user.selectActiveUser')}</h2>
      <select
        id="userSelect"
        className="form-control"
        value={selectedUser?.id || ''}
        onChange={handleUserChange}
      >
        <option value="">{t('user.selectUserPlaceholder')}</option>
        {users.map(user => (
          <option key={user.id} value={user.id}>
            {user.aliasName}
          </option>
        ))}
      </select>
      
      {selectedUser && (
        <div style={{ marginTop: '10px' }}>
          <p>
            {t('user.currentlyTracking')} <span className="current-user">{selectedUser.aliasName}</span>
          </p>
          <p style={{ color: '#065f46', fontWeight: 'bold' }}>
            {t('stock.totalRevenue')}: {t('units.currency')}{selectedUser.revenue.toFixed(2)}
          </p>
        </div>
      )}
      
      <button 
        className="btn btn-small btn-secondary" 
        onClick={refreshUsers}
        style={{ marginTop: '10px' }}
      >
        {t('user.refreshUsers')}
      </button>
    </div>
  );
};
