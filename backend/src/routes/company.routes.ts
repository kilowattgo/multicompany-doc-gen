import { Router } from 'express';
import { createCompany, getCompanies, updateCompany, upload } from '../controllers/company.controller';

const router = Router();

router.post('/', upload.single('logo'), createCompany);
router.get('/', getCompanies);
router.put('/:id', upload.single('logo'), updateCompany);

export default router;
