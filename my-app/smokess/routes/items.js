import { Router } from 'express';
const router = Router();
import { getItems,getItem, createItem,deleteItem,updateItem,getItemsByCategory} from '../controllers/itemController.js';


// get all Items
router.get('/',getItems);

// get an item by id
router.get('/:id', getItem);

// get items by category
router.get('/category/:category',getItemsByCategory);

// Create new Item
router.post('/',createItem);

// Update Item
router.put('/:id',updateItem);

// Delete Item
router.delete('/:id',deleteItem);

export default router;