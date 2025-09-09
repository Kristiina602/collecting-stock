import React, { useState, useEffect } from 'react';
import { stockApi } from '../services/api';
import { User, StockItem } from '../types';

interface StockListProps {
  selectedUser: User | null;
  refreshTrigger: number; // Used to trigger refresh when new items are added
}

export const StockList: React.FC<StockListProps> = ({ 
  selectedUser, 
  refreshTrigger 
}) => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedUser) {
      loadStockItems();
    } else {
      setStockItems([]);
    }
  }, [selectedUser, refreshTrigger]);

  const loadStockItems = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      setError(null);
      const items = await stockApi.getAll(selectedUser.id);
      setStockItems(items.sort((a, b) => 
        new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime()
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stock items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this stock item?')) {
      return;
    }

    try {
      await stockApi.delete(id);
      setStockItems(items => items.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete stock item');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!selectedUser) {
    return (
      <div className="card">
        <h2>📦 Your Collections</h2>
        <div className="empty-state">
          <h3>No User Selected</h3>
          <p>Select a user to view their collection history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>📦 Your Collections</h2>
      <p style={{ marginBottom: '20px', color: '#718096' }}>
        Showing collections for: <span className="current-user">{selectedUser.name}</span>
      </p>
      
      {error && <div className="error">{error}</div>}
      
      {loading ? (
        <div className="empty-state">
          <p>Loading collections...</p>
        </div>
      ) : stockItems.length === 0 ? (
        <div className="empty-state">
          <h3>No Collections Yet</h3>
          <p>Start adding your berry and mushroom collections!</p>
        </div>
      ) : (
        <div className="stock-list">
          {stockItems.map(item => (
            <div 
              key={item.id} 
              className={`stock-item ${item.type}`}
            >
              <div className="stock-item-info">
                <h4>
                  {item.type === 'berry' ? '🍓' : '🍄'} {item.species}
                </h4>
                <p><strong>Quantity:</strong> {item.quantity} {item.unit}</p>
                <p><strong>Location:</strong> {item.location}</p>
                <p><strong>Collected:</strong> {formatDate(item.collectedAt)}</p>
                {item.notes && <p><strong>Notes:</strong> {item.notes}</p>}
              </div>
              
              <div className="stock-item-actions">
                <button 
                  className="btn btn-small btn-danger"
                  onClick={() => handleDelete(item.id)}
                  title="Delete this item"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {stockItems.length > 0 && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button 
            className="btn btn-secondary btn-small" 
            onClick={loadStockItems}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      )}
    </div>
  );
};
