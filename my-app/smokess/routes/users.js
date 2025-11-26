import { Router } from 'express';
import { getUsers, initUser, updateUser } from '../controllers/usersController.js';
const router = Router();


// get all Users
router.get('/',getUsers);

// init User
router.post('/',initUser);

// update User
router.put('/:id',updateUser);

export default router;