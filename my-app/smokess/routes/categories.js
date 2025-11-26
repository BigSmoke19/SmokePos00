import { Router } from 'express';
const router = Router();
import { createCategory, deleteCategory, getCategories, updateCategory } from '../controllers/categoriesController.js';


// get all categories
router.get('/',getCategories);


// add a new category
router.post('/',createCategory);

// edit a category
router.put('/:id',updateCategory);

// delete a category 
router.delete('/:id',deleteCategory);


export default router;