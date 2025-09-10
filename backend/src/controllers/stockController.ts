import { Request, Response } from 'express';
import { dataStore } from '../models/DataStore';
import { ApiResponse, CreateStockItemRequest } from '../types';

export const createStockItem = (req: Request<{}, ApiResponse<any>, CreateStockItemRequest>, res: Response<ApiResponse<any>>) => {
  try {
    const { userId, type, species, quantity, unitPrice, location, notes } = req.body;

    // Validation
    if (!userId || !type || !species || !quantity || unitPrice === undefined || !location) {
      return res.status(400).json({
        success: false,
        error: 'All required fields must be provided: userId, type, species, quantity, unitPrice, location'
      });
    }

    if (!['berry', 'mushroom'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be either "berry" or "mushroom"'
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be greater than 0'
      });
    }

    if (unitPrice < 0) {
      return res.status(400).json({
        success: false,
        error: 'Unit price must be greater than or equal to 0'
      });
    }

    // Check if user exists
    const user = dataStore.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const stockItem = dataStore.createStockItem({
      userId,
      type,
      species: species.trim(),
      quantity,
      unitPrice,
      location: location.trim(),
      notes: notes?.trim()
    });
    
    res.status(201).json({
      success: true,
      data: stockItem,
      message: 'Stock item created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getStockItems = (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { userId } = req.query;
    
    let stockItems;
    if (userId && typeof userId === 'string') {
      stockItems = dataStore.getStockItemsByUser(userId);
    } else {
      stockItems = dataStore.getAllStockItems();
    }
    
    res.json({
      success: true,
      data: stockItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getStockItemById = (req: Request<{ id: string }>, res: Response<ApiResponse<any>>) => {
  try {
    const { id } = req.params;
    const stockItem = dataStore.getStockItemById(id);

    if (!stockItem) {
      return res.status(404).json({
        success: false,
        error: 'Stock item not found'
      });
    }

    res.json({
      success: true,
      data: stockItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updateStockItem = (req: Request<{ id: string }>, res: Response<ApiResponse<any>>) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const stockItem = dataStore.updateStockItem(id, updates);

    if (!stockItem) {
      return res.status(404).json({
        success: false,
        error: 'Stock item not found'
      });
    }

    res.json({
      success: true,
      data: stockItem,
      message: 'Stock item updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const deleteStockItem = (req: Request<{ id: string }>, res: Response<ApiResponse<any>>) => {
  try {
    const { id } = req.params;
    const deleted = dataStore.deleteStockItem(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Stock item not found'
      });
    }

    res.json({
      success: true,
      message: 'Stock item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
