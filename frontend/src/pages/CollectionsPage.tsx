import React, { useState } from 'react';
import { StockForm } from '../components/StockForm';
import { StockList } from '../components/StockList';
import { UserSelector } from '../components/UserSelector';
import { User } from '../types';

export const CollectionsPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleStockItemCreated = () => {
    // Trigger a refresh of the stock list to show the new item
    setRefreshTrigger(prev => prev + 1);
  };

  const handleUsersRefreshed = () => {
    // This can be used for future refresh functionality if needed
  };

  return (
    <div className="collections-page">
      <div className="user-selector-container">
        <UserSelector 
          selectedUser={selectedUser}
          onUserSelected={setSelectedUser}
          onUsersRefreshed={handleUsersRefreshed}
        />
      </div>
      
      <div className="main-content">
        <div>
          <StockForm 
            selectedUser={selectedUser}
            onStockItemCreated={handleStockItemCreated}
          />
        </div>
        
        <div>
          <StockList 
            selectedUser={selectedUser}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>
    </div>
  );
};
