import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { stockApi } from '../services/api';
import { User } from '../types';

interface ProfitDashboardProps {
  selectedUser: User | null;
  refreshTrigger: number;
}

interface YearlyData {
  revenue: number;
  cost: number;
  profit: number;
  itemCount: number;
}

export const ProfitDashboard: React.FC<ProfitDashboardProps> = ({ 
  selectedUser, 
  refreshTrigger 
}) => {
  const { t } = useTranslation();
  const [yearlyData, setYearlyData] = useState<Record<number, YearlyData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedUser) {
      loadProfitData();
    } else {
      setYearlyData({});
    }
  }, [selectedUser, refreshTrigger]);

  const loadProfitData = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      setError(null);
      const data = await stockApi.getProfitByYear(selectedUser.id);
      setYearlyData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profit data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    return Object.values(yearlyData).reduce(
      (totals, yearData) => ({
        totalRevenue: totals.totalRevenue + yearData.revenue,
        totalCost: totals.totalCost + yearData.cost,
        totalProfit: totals.totalProfit + yearData.profit,
        totalItems: totals.totalItems + yearData.itemCount,
      }),
      { totalRevenue: 0, totalCost: 0, totalProfit: 0, totalItems: 0 }
    );
  };

  if (!selectedUser) {
    return (
      <div className="card">
        <h2>{t('stock.profitAnalysis')}</h2>
        <div className="empty-state">
          <h3>{t('stock.noUserSelected')}</h3>
          <p>{t('stock.selectUserToView')}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card">
        <h2>{t('stock.profitAnalysis')}</h2>
        <div className="empty-state">
          <p>{t('messages.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2>{t('stock.profitAnalysis')}</h2>
        <div className="error">{error}</div>
      </div>
    );
  }

  const years = Object.keys(yearlyData).map(Number).sort((a, b) => b - a);
  const totals = calculateTotals();

  if (years.length === 0) {
    return (
      <div className="card">
        <h2>{t('stock.profitAnalysis')}</h2>
        <div className="empty-state">
          <h3>{t('stock.noCollectionsYet')}</h3>
          <p>{t('stock.startAddingCollections')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>{t('stock.profitAnalysis')}</h2>
      <p style={{ marginBottom: '20px', color: '#718096' }}>
        {t('stock.showingCollectionsFor')} <span className="current-user">{selectedUser.aliasName}</span>
      </p>

      {/* Overall Totals */}
      <div style={{ 
        marginBottom: '30px', 
        padding: '20px', 
        backgroundColor: '#f7fafc', 
        borderRadius: '8px',
        border: '2px solid #e2e8f0'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#2d3748' }}>Overall Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px', textAlign: 'center' }}>
          <div>
            <p style={{ margin: 0, color: '#4a5568', fontSize: '14px', fontWeight: 'bold' }}>{t('stock.totalItems')}</p>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '20px', color: '#2d3748' }}>
              {totals.totalItems}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, color: '#4a5568', fontSize: '14px', fontWeight: 'bold' }}>{t('stock.totalRevenue')}</p>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '20px', color: '#065f46' }}>
              €{totals.totalRevenue.toFixed(2)}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, color: '#4a5568', fontSize: '14px', fontWeight: 'bold' }}>{t('stock.totalCost')}</p>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '20px', color: '#dc2626' }}>
              €{totals.totalCost.toFixed(2)}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, color: '#4a5568', fontSize: '14px', fontWeight: 'bold' }}>{t('stock.totalProfit')}</p>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '20px', color: totals.totalProfit >= 0 ? '#065f46' : '#dc2626' }}>
              €{totals.totalProfit.toFixed(2)}
            </p>
          </div>
          {totals.totalRevenue > 0 && (
            <div>
              <p style={{ margin: 0, color: '#4a5568', fontSize: '14px', fontWeight: 'bold' }}>{t('stock.profitMargin')}</p>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '20px', color: totals.totalProfit >= 0 ? '#065f46' : '#dc2626' }}>
                {((totals.totalProfit / totals.totalRevenue) * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Yearly Breakdown */}
      <h3 style={{ margin: '0 0 20px 0', color: '#2d3748' }}>{t('stock.yearlyProfits')}</h3>
      <div style={{ display: 'grid', gap: '15px' }}>
        {years.map(year => {
          const data = yearlyData[year];
          const profitMargin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
          
          return (
            <div 
              key={year}
              style={{ 
                padding: '15px', 
                backgroundColor: '#ffffff', 
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, color: '#2d3748', fontSize: '18px' }}>{year}</h4>
                <span style={{ 
                  color: '#718096', 
                  fontSize: '14px',
                  padding: '2px 8px',
                  backgroundColor: '#f7fafc',
                  borderRadius: '4px'
                }}>
                  {data.itemCount} {data.itemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px', textAlign: 'center' }}>
                <div>
                  <p style={{ margin: 0, color: '#4a5568', fontSize: '12px' }}>Revenue</p>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px', color: '#065f46' }}>
                    €{data.revenue.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, color: '#4a5568', fontSize: '12px' }}>Cost</p>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px', color: '#dc2626' }}>
                    €{data.cost.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, color: '#4a5568', fontSize: '12px' }}>Profit</p>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px', color: data.profit >= 0 ? '#065f46' : '#dc2626' }}>
                    €{data.profit.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, color: '#4a5568', fontSize: '12px' }}>Margin</p>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px', color: data.profit >= 0 ? '#065f46' : '#dc2626' }}>
                    {profitMargin.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
