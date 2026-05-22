import { Router } from 'express';
import { createCompany, getCompanies, upload } from '../controllers/company.controller';

const router = Router();

router.post('/', upload.single('logo'), createCompany);
router.get('/', getCompanies);

export default router;
