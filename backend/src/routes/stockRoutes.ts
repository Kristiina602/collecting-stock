import { Router } from 'express';
import { 
  createStockItem, 
  getStockItems, 
  getStockItemById, 
  updateStockItem, 
  deleteStockItem 
} from '../controllers/stockController';

const router = Router();

router.post('/', createStockItem);
router.get('/', getStockItems);
router.get('/:id', getStockItemById);
router.put('/:id', updateStockItem);
router.delete('/:id', deleteStockItem);

export default router;
