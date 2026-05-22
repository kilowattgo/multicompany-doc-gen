import { Router } from 'express';
import { createCompany, getCompanies, updateCompany, upload } from '../controllers/company.controller';

const router = Router();

const cpUpload = upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'signature', maxCount: 1 }]);

router.post('/', cpUpload, createCompany);
router.get('/', getCompanies);
router.put('/:id', cpUpload, updateCompany);

export default router;
