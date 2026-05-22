import { Router } from 'express';
import { createCustomer, getCustomers, updateCustomer } from '../controllers/customer.controller';

const router = Router();

router.get('/', getCustomers);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);

export default router;
