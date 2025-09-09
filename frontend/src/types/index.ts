export interface User {
  id: string;
  name: string;
  createdAt: string;
}

export interface StockItem {
  id: string;
  userId: string;
  type: 'berry' | 'mushroom';
  species: string;
  quantity: number;
  unit: 'kg' | 'g' | 'pieces';
  location: string;
  collectedAt: string;
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
  unit: 'kg' | 'g' | 'pieces';
  location: string;
  notes?: string;
}
