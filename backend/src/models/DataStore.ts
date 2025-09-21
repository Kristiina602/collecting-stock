import { User, StockItem, Price } from '../types';
import { v4 as uuidv4 } from 'uuid';

class DataStore {
  private users: User[] = [];
  private stockItems: StockItem[] = [];
  private prices: Price[] = [];

  // User operations
  createUser(aliasName: string): User {
    const user: User = {
      id: uuidv4(),
      aliasName,
      createdAt: new Date(),
      revenue: 0
    };
    this.users.push(user);
    return user;
  }

  getUserById(id: string): User | undefined {
    const user = this.users.find(user => user.id === id);
    if (!user) return undefined;
    
    // Calculate current revenue from stock items (use totalRevenue for new items, totalPrice for backward compatibility)
    const userRevenue = this.stockItems
      .filter(item => item.userId === id)
      .reduce((total, item) => total + (item.totalRevenue || item.totalPrice || 0), 0);
    
    return { ...user, revenue: userRevenue };
  }

  getAllUsers(): User[] {
    return this.users.map(user => {
      // Calculate current revenue from stock items (use totalRevenue for new items, totalPrice for backward compatibility)
      const userRevenue = this.stockItems
        .filter(item => item.userId === user.id)
        .reduce((total, item) => total + (item.totalRevenue || item.totalPrice || 0), 0);
      
      return { ...user, revenue: userRevenue };
    });
  }

  // Stock item operations
  createStockItem(stockItemData: Omit<StockItem, 'id' | 'collectedAt' | 'totalPrice' | 'totalRevenue' | 'totalCost' | 'totalProfit'>): StockItem {
    // Handle backward compatibility: if unitPrice is provided but not sellPrice, use unitPrice as sellPrice
    let buyPrice = stockItemData.buyPrice || 0;
    let sellPrice = stockItemData.sellPrice || stockItemData.unitPrice || 0;
    let unitPrice = stockItemData.unitPrice || sellPrice; // Keep unitPrice for backward compatibility
    
    // Calculate all price-related fields (prices are in €/kg, quantity in grams)
    const totalRevenue = (stockItemData.quantity * sellPrice) / 1000;
    const totalCost = (stockItemData.quantity * buyPrice) / 1000;
    const totalProfit = totalRevenue - totalCost;
    const totalPrice = totalRevenue; // For backward compatibility
    
    const stockItem: StockItem = {
      id: uuidv4(),
      ...stockItemData,
      unitPrice,
      buyPrice,
      sellPrice,
      totalRevenue,
      totalCost,
      totalProfit,
      totalPrice,
      collectedAt: new Date()
    };
    this.stockItems.push(stockItem);
    return stockItem;
  }

  getStockItemsByUser(userId: string): StockItem[] {
    return this.stockItems.filter(item => item.userId === userId);
  }

  getAllStockItems(): StockItem[] {
    return [...this.stockItems];
  }

  getStockItemById(id: string): StockItem | undefined {
    return this.stockItems.find(item => item.id === id);
  }

  updateStockItem(id: string, updates: Partial<Omit<StockItem, 'id' | 'userId' | 'collectedAt' | 'totalPrice' | 'totalRevenue' | 'totalCost' | 'totalProfit'>>): StockItem | null {
    const index = this.stockItems.findIndex(item => item.id === id);
    if (index === -1) return null;

    const updatedItem = { ...this.stockItems[index], ...updates };
    
    // Recalculate all price-related fields if relevant fields changed
    if ('quantity' in updates || 'unitPrice' in updates || 'buyPrice' in updates || 'sellPrice' in updates) {
      const buyPrice = updatedItem.buyPrice || 0;
      const sellPrice = updatedItem.sellPrice || updatedItem.unitPrice || 0;
      
      updatedItem.totalRevenue = (updatedItem.quantity * sellPrice) / 1000;
      updatedItem.totalCost = (updatedItem.quantity * buyPrice) / 1000;
      updatedItem.totalProfit = updatedItem.totalRevenue - updatedItem.totalCost;
      updatedItem.totalPrice = updatedItem.totalRevenue; // For backward compatibility
      updatedItem.unitPrice = sellPrice; // Keep unitPrice synced
    }
    
    this.stockItems[index] = updatedItem;
    return updatedItem;
  }

  deleteStockItem(id: string): boolean {
    const index = this.stockItems.findIndex(item => item.id === id);
    if (index === -1) return false;

    this.stockItems.splice(index, 1);
    return true;
  }

  // New methods for profit tracking and yearly analysis
  getUserProfitByYear(userId: string): Record<number, { revenue: number; cost: number; profit: number; itemCount: number }> {
    const userItems = this.stockItems.filter(item => item.userId === userId);
    const yearlyData: Record<number, { revenue: number; cost: number; profit: number; itemCount: number }> = {};
    
    userItems.forEach(item => {
      const year = item.collectedAt.getFullYear();
      if (!yearlyData[year]) {
        yearlyData[year] = { revenue: 0, cost: 0, profit: 0, itemCount: 0 };
      }
      
      yearlyData[year].revenue += item.totalRevenue || item.totalPrice || 0;
      yearlyData[year].cost += item.totalCost || 0;
      yearlyData[year].profit += item.totalProfit || (item.totalRevenue || item.totalPrice || 0);
      yearlyData[year].itemCount += 1;
    });
    
    return yearlyData;
  }

  getStockItemsByUserAndYear(userId: string, year?: number): StockItem[] {
    let items = this.stockItems.filter(item => item.userId === userId);
    
    if (year) {
      items = items.filter(item => item.collectedAt.getFullYear() === year);
    }
    
    return items;
  }

  getAllYears(): number[] {
    const years = new Set<number>();
    this.stockItems.forEach(item => {
      years.add(item.collectedAt.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a); // Most recent first
  }

  // Price monitoring operations
  createPrice(priceData: Omit<Price, 'id' | 'updatedAt'>): Price {
    const price: Price = {
      id: uuidv4(),
      ...priceData,
      updatedAt: new Date()
    };
    
    // Check if price already exists for this type, species, and year
    const existingIndex = this.prices.findIndex(
      p => p.type === price.type && p.species === price.species && p.year === price.year
    );
    
    if (existingIndex >= 0) {
      // Update existing price
      this.prices[existingIndex] = { ...this.prices[existingIndex], ...priceData, updatedAt: new Date() };
      return this.prices[existingIndex];
    } else {
      // Add new price
      this.prices.push(price);
      return price;
    }
  }

  getAllPrices(): Price[] {
    return [...this.prices];
  }

  getPricesByYear(year: number): Price[] {
    return this.prices.filter(price => price.year === year);
  }

  getPricesByTypeAndSpecies(type: 'berry' | 'mushroom', species: string, year?: number): Price[] {
    let filtered = this.prices.filter(price => price.type === type && price.species === species);
    if (year) {
      filtered = filtered.filter(price => price.year === year);
    }
    return filtered;
  }

  getPriceById(id: string): Price | undefined {
    return this.prices.find(price => price.id === id);
  }

  updatePrice(id: string, updates: Partial<Omit<Price, 'id' | 'type' | 'species' | 'year'>>): Price | null {
    const index = this.prices.findIndex(price => price.id === id);
    if (index === -1) return null;

    this.prices[index] = { 
      ...this.prices[index], 
      ...updates,
      updatedAt: new Date()
    };
    return this.prices[index];
  }

  deletePrice(id: string): boolean {
    const index = this.prices.findIndex(price => price.id === id);
    if (index === -1) return false;

    this.prices.splice(index, 1);
    return true;
  }

  // Get current price for a specific type and species (most recent year)
  getCurrentPrice(type: 'berry' | 'mushroom', species: string): Price | undefined {
    const currentYear = new Date().getFullYear();
    
    // Try current year first
    let price = this.prices.find(p => 
      p.type === type && p.species === species && p.year === currentYear
    );
    
    // If not found, get the most recent year available
    if (!price) {
      const pricesForSpecies = this.prices
        .filter(p => p.type === type && p.species === species)
        .sort((a, b) => b.year - a.year); // Sort by year descending
      
      price = pricesForSpecies[0];
    }
    
    return price;
  }

  // Get all available years for pricing
  getPriceYears(): number[] {
    const years = new Set<number>();
    this.prices.forEach(price => {
      years.add(price.year);
    });
    return Array.from(years).sort((a, b) => b - a); // Most recent first
  }
}

export const dataStore = new DataStore();
