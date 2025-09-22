import { Router } from 'express';
import { 
  createStockItem, 
  getStockItems, 
  getStockItemById, 
  updateStockItem, 
  deleteStockItem,
  getUserProfitByYear,
  getAllYears,
  getAllUsersSalesByYear
} from '../controllers/stockController';

const router = Router();

router.post('/', createStockItem);
router.get('/', getStockItems);
router.get('/years', getAllYears);
router.get('/profit/:userId', getUserProfitByYear);
router.get('/sales-by-year', getAllUsersSalesByYear);
router.get('/:id', getStockItemById);
router.put('/:id', updateStockItem);
router.delete('/:id', deleteStockItem);

export default router;
