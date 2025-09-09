import React, { useState } from 'react';
import { UserForm } from './components/UserForm';
import { UserSelector } from './components/UserSelector';
import { StockForm } from './components/StockForm';
import { StockList } from './components/StockList';
import { User, StockItem } from './types';
import './App.css';

function App() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUserCreated = (user: User) => {
    setSelectedUser(user);
    // Trigger a refresh of the user selector to show the new user
    setRefreshTrigger(prev => prev + 1);
  };

  const handleStockItemCreated = (stockItem: StockItem) => {
    // Trigger a refresh of the stock list to show the new item
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🍓🍄 Collecting Stock</h1>
        <p>Track your berry and mushroom collections with ease</p>
      </header>

      <UserSelector 
        selectedUser={selectedUser}
        onUserSelected={setSelectedUser}
      />

      <div className="main-content">
        <div>
          <UserForm onUserCreated={handleUserCreated} />
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
}

export default App;
