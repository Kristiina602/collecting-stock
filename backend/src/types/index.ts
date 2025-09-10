export interface User {
  id: string;
  name: string;
  createdAt: Date;
  revenue: number;
}

export interface StockItem {
  id: string;
  userId: string;
  type: 'berry' | 'mushroom';
  species: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  location: string;
  collectedAt: Date;
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface CreateUserRequest {
  name: string;
}

export interface CreateStockItemRequest {
  userId: string;
  type: 'berry' | 'mushroom';
  species: string;
  quantity: number;
  unitPrice: number;
  location: string;
  notes?: string;
}
