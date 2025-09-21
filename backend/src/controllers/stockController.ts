import { Request, Response } from 'express';
import { dataStore } from '../models/DataStore';
import { ApiResponse, CreateStockItemRequest } from '../types';

export const createStockItem = (req: Request<{}, ApiResponse<any>, CreateStockItemRequest>, res: Response<ApiResponse<any>>) => {
  try {
    const { userId, type, species, quantity, unitPrice, buyPrice, sellPrice, location, notes } = req.body;

    // Validation - support both old API (unitPrice) and new API (buyPrice + sellPrice)
    if (!userId || !type || !species || !quantity || !location) {
      return res.status(400).json({
        success: false,
        error: 'All required fields must be provided: userId, type, species, quantity, location'
      });
    }

    // Price validation - need either unitPrice (old API) or sellPrice (new API)
    if (unitPrice === undefined && sellPrice === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Either unitPrice (legacy) or sellPrice must be provided'
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

    // Validate prices
    if (unitPrice !== undefined && unitPrice < 0) {
      return res.status(400).json({
        success: false,
        error: 'Unit price must be greater than or equal to 0'
      });
    }

    if (buyPrice !== undefined && buyPrice < 0) {
      return res.status(400).json({
        success: false,
        error: 'Buy price must be greater than or equal to 0'
      });
    }

    if (sellPrice !== undefined && sellPrice < 0) {
      return res.status(400).json({
        success: false,
        error: 'Sell price must be greater than or equal to 0'
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

    // Handle backward compatibility and defaults
    const finalBuyPrice = buyPrice || 0;
    const finalSellPrice = sellPrice || unitPrice || 0;
    const finalUnitPrice = unitPrice || finalSellPrice;

    const stockItem = dataStore.createStockItem({
      userId,
      type,
      species: species.trim(),
      quantity,
      unitPrice: finalUnitPrice,
      buyPrice: finalBuyPrice,
      sellPrice: finalSellPrice,
      location: location.trim(),
      notes: notes?.trim()
    });
    
    res.status(201).json({
      success: true,
      data: stockItem,
      message: 'Collecting item created successfully'
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
    const { userId, year } = req.query;
    
    let stockItems;
    if (userId && typeof userId === 'string') {
      const yearNum = year && typeof year === 'string' ? parseInt(year, 10) : undefined;
      stockItems = dataStore.getStockItemsByUserAndYear(userId, yearNum);
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
        error: 'Collecting item not found'
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
        error: 'Collecting item not found'
      });
    }

    res.json({
      success: true,
      data: stockItem,
      message: 'Collecting item updated successfully'
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
        error: 'Collecting item not found'
      });
    }

    res.json({
      success: true,
      message: 'Collecting item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// New endpoints for profit tracking
export const getUserProfitByYear = (req: Request<{ userId: string }>, res: Response<ApiResponse<any>>) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = dataStore.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const yearlyData = dataStore.getUserProfitByYear(userId);
    
    res.json({
      success: true,
      data: yearlyData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getAllYears = (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const years = dataStore.getAllYears();
    
    res.json({
      success: true,
      data: years
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
