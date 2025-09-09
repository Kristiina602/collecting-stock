import React, { useState } from 'react';
import { stockApi } from '../services/api';
import { User, StockItem } from '../types';

interface StockFormProps {
  selectedUser: User | null;
  onStockItemCreated: (stockItem: StockItem) => void;
}

export const StockForm: React.FC<StockFormProps> = ({ 
  selectedUser, 
  onStockItemCreated 
}) => {
  const [type, setType] = useState<'berry' | 'mushroom'>('berry');
  const [species, setSpecies] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<'kg' | 'g' | 'pieces'>('kg');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) {
      setError('Please select a user first');
      return;
    }

    if (!species.trim() || !quantity || !location.trim()) {
      setError('Species, quantity, and location are required');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError('Quantity must be a positive number');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const stockItem = await stockApi.create({
        userId: selectedUser.id,
        type,
        species: species.trim(),
        quantity: quantityNum,
        unit,
        location: location.trim(),
        notes: notes.trim() || undefined,
      });

      setSuccess(`Successfully added ${quantityNum} ${unit} of ${species}!`);
      
      // Reset form
      setSpecies('');
      setQuantity('');
      setLocation('');
      setNotes('');
      
      onStockItemCreated(stockItem);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create stock item');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedUser) {
    return (
      <div className="card">
        <h2>🍓🍄 Add Stock Item</h2>
        <div className="empty-state">
          <h3>No User Selected</h3>
          <p>Please create or select a user account first to start tracking your collections.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>🍓🍄 Add Stock Item</h2>
      <p style={{ marginBottom: '20px', color: '#718096' }}>
        Adding items for: <span className="current-user">{selectedUser.name}</span>
      </p>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="type">Type</label>
          <select
            id="type"
            className="form-control"
            value={type}
            onChange={(e) => setType(e.target.value as 'berry' | 'mushroom')}
            disabled={loading}
          >
            <option value="berry">🍓 Berry</option>
            <option value="mushroom">🍄 Mushroom</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="species">Species/Variety *</label>
          <input
            type="text"
            id="species"
            className="form-control"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            placeholder={type === 'berry' ? 'e.g., Blueberry, Strawberry' : 'e.g., Chanterelle, Porcini'}
            disabled={loading}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label htmlFor="quantity">Quantity *</label>
            <input
              type="number"
              id="quantity"
              className="form-control"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              step="0.1"
              min="0"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="unit">Unit</label>
            <select
              id="unit"
              className="form-control"
              value={unit}
              onChange={(e) => setUnit(e.target.value as 'kg' | 'g' | 'pieces')}
              disabled={loading}
            >
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="pieces">pieces</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location">Collection Location *</label>
          <input
            type="text"
            id="location"
            className="form-control"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Pine Forest, Backyard, Meadow"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes (Optional)</label>
          <textarea
            id="notes"
            className="form-control"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes about the collection..."
            rows={3}
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn" 
          disabled={loading || !species.trim() || !quantity || !location.trim()}
        >
          {loading ? 'Adding...' : `Add ${type === 'berry' ? '🍓' : '🍄'} Stock`}
        </button>
      </form>
    </div>
  );
};
