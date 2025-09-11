import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { stockApi } from '../services/api';
import { User } from '../types';

interface StockFormProps {
  selectedUser: User | null;
  onStockItemCreated: () => void;
}

export const StockForm: React.FC<StockFormProps> = ({ 
  selectedUser, 
  onStockItemCreated 
}) => {
  const { t } = useTranslation();
  const [type, setType] = useState<'berry' | 'mushroom'>('berry');
  const [species, setSpecies] = useState('');
  const [customSpecies, setCustomSpecies] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get species options based on type
  const getSpeciesOptions = () => {
    const speciesKey = type === 'berry' ? 'berries' : 'mushrooms';
    return Object.entries(t(`species.${speciesKey}`, { returnObjects: true }) as Record<string, string>);
  };

  // Get the final species value to use
  const getFinalSpeciesValue = () => {
    if (species === 'other') {
      return customSpecies.trim();
    }
    return species ? t(`species.${type === 'berry' ? 'berries' : 'mushrooms'}.${species}`) : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) {
      setError(t('messages.selectUserFirst'));
      return;
    }

    const finalSpecies = getFinalSpeciesValue();
    if (!finalSpecies || !quantity || !unitPrice || !location.trim()) {
      setError(t('messages.allFieldsRequired'));
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError(t('messages.quantityPositive'));
      return;
    }

    const unitPriceNum = parseFloat(unitPrice);
    if (isNaN(unitPriceNum) || unitPriceNum < 0) {
      setError(t('messages.unitPriceNonNegative'));
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await stockApi.create({
        userId: selectedUser.id,
        type,
        species: finalSpecies,
        quantity: quantityNum,
        unitPrice: unitPriceNum,
        location: location.trim(),
        notes: notes.trim() || undefined,
      });

      setSuccess(t('messages.stockItemCreated'));
      
      // Reset form
      setSpecies('');
      setCustomSpecies('');
      setQuantity('');
      setUnitPrice('');
      setLocation('');
      setNotes('');
      
      onStockItemCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('messages.errorCreatingStock'));
    } finally {
      setLoading(false);
    }
  };

  if (!selectedUser) {
    return (
      <div className="card">
        <h2>
          {t('stock.addItem')}
        </h2>
        <div className="empty-state">
          <h3>{t('user.selectUser')}</h3>
          <p>{t('messages.selectUserFirst')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>
        {t('stock.addItem')}
      </h2>
      <p style={{ marginBottom: '20px', color: '#718096' }}>
        {t('user.addingItemsFor')}: <span className="current-user">{selectedUser.aliasName}</span>
      </p>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="type">{t('stock.type')}</label>
          <select
            id="type"
            className="form-control"
            value={type}
            onChange={(e) => {
              setType(e.target.value as 'berry' | 'mushroom');
              setSpecies(''); // Reset species when type changes
              setCustomSpecies(''); // Reset custom species too
            }}
            disabled={loading}
          >
            <option value="berry">{t('stock.berry')}</option>
            <option value="mushroom">{t('stock.mushroom')}</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="species">{t('stock.speciesRequired')}</label>
          <select
            id="species"
            className="form-control"
            value={species}
            onChange={(e) => {
              setSpecies(e.target.value);
              if (e.target.value !== 'other') {
                setCustomSpecies(''); // Clear custom species when not "other"
              }
            }}
            disabled={loading}
          >
            <option value="">{type === 'berry' ? t('placeholders.berrySpecies') : t('placeholders.mushroomSpecies')}</option>
            {getSpeciesOptions().map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
          {species === 'other' && (
            <input
              type="text"
              className="form-control"
              style={{ marginTop: '10px' }}
              value={customSpecies}
              onChange={(e) => setCustomSpecies(e.target.value)}
              placeholder={t('placeholders.customSpecies')}
              disabled={loading}
            />
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label htmlFor="quantity">{t('stock.quantityRequired')}</label>
            <input
              type="number"
              id="quantity"
              className="form-control"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={t('placeholders.quantity')}
              step="0.1"
              min="0"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="unitPrice">{t('stock.unitPriceRequired')}</label>
            <input
              type="number"
              id="unitPrice"
              className="form-control"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder={t('placeholders.unitPrice')}
              step="0.01"
              min="0"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location">{t('stock.locationRequired')}</label>
          <input
            type="text"
            id="location"
            className="form-control"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t('placeholders.location')}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">{t('stock.notesOptional')}</label>
          <textarea
            id="notes"
            className="form-control"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('placeholders.notes')}
            rows={3}
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn icon-with-text" 
          disabled={loading || !getFinalSpeciesValue() || !quantity || !unitPrice || !location.trim()}
        >
          {loading ? (
            t('messages.loading')
          ) : (
            t('stock.addStockButton')
          )}
        </button>
      </form>
    </div>
  );
};
