import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { stockApi, priceApi } from '../services/api';
import { User, Price } from '../types';

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
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState<Price | null>(null);
  const [priceFromMonitoring, setPriceFromMonitoring] = useState(true);

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

  // Load current price when species changes
  const loadCurrentPrice = async (type: 'berry' | 'mushroom', species: string) => {
    if (!species) {
      setCurrentPrice(null);
      return;
    }

    try {
      const price = await priceApi.getCurrent(type, species);
      setCurrentPrice(price);
      
      if (price && priceFromMonitoring) {
        // Prices are already in €/kg
        setBuyPrice(price.buyPrice.toFixed(2));
        setSellPrice(price.sellPrice.toFixed(2));
      }
    } catch (err) {
      console.error('Failed to load current price:', err);
      setCurrentPrice(null);
    }
  };

  // Effect to load price when species changes
  useEffect(() => {
    const finalSpecies = getFinalSpeciesValue();
    if (finalSpecies) {
      loadCurrentPrice(type, finalSpecies);
    } else {
      setCurrentPrice(null);
      if (priceFromMonitoring) {
        setBuyPrice('');
        setSellPrice('');
      }
    }
  }, [type, species, customSpecies, priceFromMonitoring]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) {
      setError(t('messages.selectUserFirst'));
      return;
    }

    const finalSpecies = getFinalSpeciesValue();
    if (!finalSpecies || !quantity || (!unitPrice && !sellPrice)) {
      setError(t('messages.allFieldsRequired'));
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError(t('messages.quantityPositive'));
      return;
    }

    // Handle price validation - support both old (unitPrice) and new (buy/sell prices) API
    const unitPriceNum = unitPrice ? parseFloat(unitPrice) : undefined;
    const buyPriceNum = buyPrice ? parseFloat(buyPrice) : 0;
    const sellPriceNum = sellPrice ? parseFloat(sellPrice) : unitPriceNum;
    
    if (unitPriceNum !== undefined && (isNaN(unitPriceNum) || unitPriceNum < 0)) {
      setError(t('messages.unitPriceNonNegative'));
      return;
    }
    
    if (buyPriceNum !== undefined && (isNaN(buyPriceNum) || buyPriceNum < 0)) {
      setError(t('messages.buyPriceNonNegative'));
      return;
    }
    
    if (sellPriceNum !== undefined && (isNaN(sellPriceNum) || sellPriceNum < 0)) {
      setError(t('messages.sellPriceNonNegative'));
      return;
    }
    
    // Need either unitPrice or sellPrice
    if (!sellPriceNum && !unitPriceNum) {
      setError(t('messages.allFieldsRequired'));
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
        buyPrice: buyPriceNum,
        sellPrice: sellPriceNum || unitPriceNum || 0,
        notes: notes.trim() || undefined,
      });

      setSuccess(t('messages.stockItemCreated'));
      
      // Reset form
      setSpecies('');
      setCustomSpecies('');
      setQuantity('');
      setUnitPrice('');
      setBuyPrice('');
      setSellPrice('');
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
    <section className="card" aria-labelledby="stock-form-heading">
      <h2 id="stock-form-heading">
        {t('stock.addItem')}
      </h2>
      <p style={{ marginBottom: '20px', color: '#718096' }}>
        {t('user.addingItemsFor')}: <span className="current-user">{selectedUser.aliasName}</span>
      </p>
      
      {error && (
        <div className="error" role="alert" aria-live="assertive" aria-atomic="true">
          {error}
        </div>
      )}
      {success && (
        <div className="success" role="status" aria-live="polite" aria-atomic="true">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} noValidate>
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
            aria-describedby="type-description"
            required
          >
            <option value="berry">{t('stock.berry')}</option>
            <option value="mushroom">{t('stock.mushroom')}</option>
          </select>
          <div id="type-description" className="sr-only">
            {t('stock.typeDescription')}
          </div>
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
            aria-describedby="species-description"
            required
            aria-invalid={!getFinalSpeciesValue() ? 'true' : 'false'}
          >
            <option value="">{type === 'berry' ? t('placeholders.berrySpecies') : t('placeholders.mushroomSpecies')}</option>
            {getSpeciesOptions().map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
          <div id="species-description" className="sr-only">
            {t('stock.speciesDescription')}
          </div>
          {species === 'other' && (
            <input
              type="text"
              className="form-control"
              style={{ marginTop: '10px' }}
              value={customSpecies}
              onChange={(e) => setCustomSpecies(e.target.value)}
              placeholder={t('placeholders.customSpecies')}
              disabled={loading}
              aria-label={t('stock.customSpeciesLabel')}
              required
            />
          )}
        </div>

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
            required
            aria-describedby="quantity-description"
            aria-invalid={!quantity || parseFloat(quantity) <= 0 ? 'true' : 'false'}
          />
          <div id="quantity-description" className="sr-only">
            {t('stock.quantityDescription')}
          </div>
        </div>

        {/* Price source toggle */}
        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label>
            <input
              type="checkbox"
              checked={priceFromMonitoring}
              onChange={(e) => {
                setPriceFromMonitoring(e.target.checked);
                if (!e.target.checked) {
                  setBuyPrice('');
                  setSellPrice('');
                }
              }}
              style={{ marginRight: '8px' }}
            />
            {t('stock.usePriceMonitoring')}
          </label>
          {currentPrice && (
            <div style={{ marginTop: '5px', fontSize: '14px', color: '#718096' }}>
              {t('stock.currentPrices')}: {t('stock.buyPrice')} €{currentPrice.buyPrice.toFixed(2)}/kg, {t('stock.sellPrice')} €{currentPrice.sellPrice.toFixed(2)}/kg ({t('stock.priceYear')}: {currentPrice.year})
            </div>
          )}
          {!currentPrice && getFinalSpeciesValue() && priceFromMonitoring && (
            <div style={{ marginTop: '5px', fontSize: '14px', color: '#e53e3e' }}>
              {t('stock.noPriceFound', { species: getFinalSpeciesValue() })}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label htmlFor="buyPrice">{t('stock.buyPriceRequired')}</label>
            <input
              type="number"
              id="buyPrice"
              className="form-control"
              value={buyPrice}
              onChange={(e) => {
                setBuyPrice(e.target.value);
                if (priceFromMonitoring && e.target.value) {
                  setPriceFromMonitoring(false); // Switch to manual mode if user edits
                }
              }}
              placeholder={t('placeholders.buyPrice')}
              step="0.01"
              min="0"
              disabled={loading || (priceFromMonitoring && !currentPrice)}
              readOnly={priceFromMonitoring && !!currentPrice}
            />
          </div>

          <div className="form-group">
            <label htmlFor="sellPrice">{t('stock.sellPriceRequired')}</label>
            <input
              type="number"
              id="sellPrice"
              className="form-control"
              value={sellPrice}
              onChange={(e) => {
                setSellPrice(e.target.value);
                if (priceFromMonitoring && e.target.value) {
                  setPriceFromMonitoring(false); // Switch to manual mode if user edits
                }
              }}
              placeholder={t('placeholders.sellPrice')}
              step="0.01"
              min="0"
              disabled={loading || (priceFromMonitoring && !currentPrice)}
              readOnly={priceFromMonitoring && !!currentPrice}
            />
          </div>
        </div>

        {/* Keep unit price for backward compatibility, but make it optional */}
        <div className="form-group" style={{ opacity: 0.7 }}>
          <label htmlFor="unitPrice">{t('stock.unitPrice')} (legacy)</label>
          <input
            type="number"
            id="unitPrice"
            className="form-control"
            value={unitPrice}
            onChange={(e) => {
              setUnitPrice(e.target.value);
              if (!sellPrice) setSellPrice(e.target.value); // Auto-fill sell price if empty
            }}
            placeholder={t('placeholders.unitPrice')}
            step="0.01"
            min="0"
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
          disabled={loading || !getFinalSpeciesValue() || !quantity || (!unitPrice && !sellPrice)}
          aria-describedby="submit-button-description"
        >
          {loading ? (
            t('messages.loading')
          ) : (
            t('stock.addStockButton')
          )}
        </button>
        <div id="submit-button-description" className="sr-only">
          {t('stock.submitButtonDescription')}
        </div>
      </form>
    </section>
  );
};
