import axios from 'axios';
import { User, StockItem, ApiResponse, CreateUserRequest, CreateStockItemRequest } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API
export const userApi = {
  create: async (userData: CreateUserRequest): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/users', userData);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create user');
    }
    return response.data.data;
  },

  getAll: async (): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>('/users');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch users');
    }
    return response.data.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch user');
    }
    return response.data.data;
  },
};

// Stock API
export const stockApi = {
  create: async (stockData: CreateStockItemRequest): Promise<StockItem> => {
    const response = await api.post<ApiResponse<StockItem>>('/stock', stockData);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create collecting item');
    }
    return response.data.data;
  },

  getAll: async (userId?: string): Promise<StockItem[]> => {
    const params = userId ? { userId } : {};
    const response = await api.get<ApiResponse<StockItem[]>>('/stock', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch collecting items');
    }
    return response.data.data;
  },

  getById: async (id: string): Promise<StockItem> => {
    const response = await api.get<ApiResponse<StockItem>>(`/stock/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch collecting item');
    }
    return response.data.data;
  },

  update: async (id: string, updates: Partial<StockItem>): Promise<StockItem> => {
    const response = await api.put<ApiResponse<StockItem>>(`/stock/${id}`, updates);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update collecting item');
    }
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponse<void>>(`/stock/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete collecting item');
    }
  },
};
