import { User, StockItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

class DataStore {
  private users: User[] = [];
  private stockItems: StockItem[] = [];

  // User operations
  createUser(name: string): User {
    const user: User = {
      id: uuidv4(),
      name,
      createdAt: new Date(),
      revenue: 0
    };
    this.users.push(user);
    return user;
  }

  getUserById(id: string): User | undefined {
    const user = this.users.find(user => user.id === id);
    if (!user) return undefined;
    
    // Calculate current revenue from stock items
    const userRevenue = this.stockItems
      .filter(item => item.userId === id)
      .reduce((total, item) => total + item.totalPrice, 0);
    
    return { ...user, revenue: userRevenue };
  }

  getAllUsers(): User[] {
    return this.users.map(user => {
      // Calculate current revenue from stock items
      const userRevenue = this.stockItems
        .filter(item => item.userId === user.id)
        .reduce((total, item) => total + item.totalPrice, 0);
      
      return { ...user, revenue: userRevenue };
    });
  }

  // Stock item operations
  createStockItem(stockItemData: Omit<StockItem, 'id' | 'collectedAt' | 'totalPrice'>): StockItem {
    // Calculate totalPrice from quantity and unitPrice
    const totalPrice = (stockItemData.quantity * stockItemData.unitPrice)/1000;
    
    const stockItem: StockItem = {
      id: uuidv4(),
      ...stockItemData,
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

  updateStockItem(id: string, updates: Partial<Omit<StockItem, 'id' | 'userId' | 'collectedAt' | 'totalPrice'>>): StockItem | null {
    const index = this.stockItems.findIndex(item => item.id === id);
    if (index === -1) return null;

    const updatedItem = { ...this.stockItems[index], ...updates };
    
    // Recalculate totalPrice if quantity or unitPrice changed
    if ('quantity' in updates || 'unitPrice' in updates) {
      updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
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
}

export const dataStore = new DataStore();
