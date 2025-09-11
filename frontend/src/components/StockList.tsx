import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { stockApi } from '../services/api';
import { User, StockItem } from '../types';
import { Icon } from './Icon';

interface StockListProps {
  selectedUser: User | null;
  refreshTrigger: number; // Used to trigger refresh when new items are added
}

export const StockList: React.FC<StockListProps> = ({ 
  selectedUser, 
  refreshTrigger 
}) => {
  const { t } = useTranslation();
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
      setError(err instanceof Error ? err.message : t('messages.failedToLoadStock'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('stock.confirmDelete'))) {
      return;
    }

    try {
      await stockApi.delete(id);
      setStockItems(items => items.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('messages.failedToDeleteStock'));
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
        <h2>
          {t('stock.yourCollections')}
        </h2>
        <div className="empty-state">
          <h3>{t('stock.noUserSelected')}</h3>
          <p>{t('stock.selectUserToView')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>
        {t('stock.yourCollections')}
      </h2>
      <p style={{ marginBottom: '20px', color: '#718096' }}>
        {t('stock.showingCollectionsFor')} <span className="current-user">{selectedUser.aliasName}</span>
      </p>
      
      {error && <div className="error">{error}</div>}
      
      {loading ? (
        <div className="empty-state">
          <p>{t('stock.loadingCollections')}</p>
        </div>
      ) : stockItems.length === 0 ? (
        <div className="empty-state">
          <h3>{t('stock.noCollectionsYet')}</h3>
          <p>{t('stock.startAddingCollections')}</p>
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
                  {item.species}
                </h4>
                <p><strong>{t('stock.quantityLabel')}</strong> {item.quantity} {t('units.grams')}</p>
                <p><strong>{t('stock.unitPriceLabel')}</strong> €{item.unitPrice.toFixed(2)}</p>
                <p><strong>{t('stock.totalPriceLabel')}</strong> €{item.totalPrice.toFixed(2)}</p>
                <p><strong>{t('stock.locationLabel')}</strong> {item.location}</p>
                <p><strong>{t('stock.collectedLabel')}</strong> {formatDate(item.collectedAt)}</p>
                {item.notes && <p><strong>{t('stock.notesLabel')}</strong> {item.notes}</p>}
              </div>
              
              <div className="stock-item-actions">
                <button 
                  className="btn btn-small btn-danger icon-with-text"
                  onClick={() => handleDelete(item.id)}
                  title="Delete this item"
                >
                  <Icon name="trash" size={14} />
                  {t('common.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {stockItems.length > 0 && (
        <>
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            backgroundColor: '#f7fafc', 
            borderRadius: '6px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'center' }}>
              <div>
                <p style={{ margin: 0, color: '#4a5568', fontSize: '14px' }}>{t('stock.totalItems')}</p>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '18px', color: '#2d3748' }}>
                  {stockItems.length}
                </p>
              </div>
              <div>
                <p style={{ margin: 0, color: '#4a5568', fontSize: '14px' }}>{t('stock.totalRevenue')}</p>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '18px', color: '#065f46' }}>
                  €{stockItems.reduce((total, item) => total + item.totalPrice, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <button 
              className="btn btn-secondary btn-small icon-with-text" 
              onClick={loadStockItems}
              disabled={loading}
            >
              <Icon name="refresh" size={14} />
              {loading ? t('stock.refreshing') : t('stock.refresh')}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
