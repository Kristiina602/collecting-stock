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
      createdAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  getUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getAllUsers(): User[] {
    return [...this.users];
  }

  // Stock item operations
  createStockItem(stockItemData: Omit<StockItem, 'id' | 'collectedAt'>): StockItem {
    const stockItem: StockItem = {
      id: uuidv4(),
      ...stockItemData,
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

  updateStockItem(id: string, updates: Partial<Omit<StockItem, 'id' | 'userId' | 'collectedAt'>>): StockItem | null {
    const index = this.stockItems.findIndex(item => item.id === id);
    if (index === -1) return null;

    this.stockItems[index] = { ...this.stockItems[index], ...updates };
    return this.stockItems[index];
  }

  deleteStockItem(id: string): boolean {
    const index = this.stockItems.findIndex(item => item.id === id);
    if (index === -1) return false;

    this.stockItems.splice(index, 1);
    return true;
  }
}

export const dataStore = new DataStore();
