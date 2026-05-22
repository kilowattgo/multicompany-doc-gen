import { Router } from 'express';
import { createDocument, getDocumentPdf, getDocuments } from '../controllers/document.controller';

const router = Router();

router.get('/', getDocuments);
router.post('/', createDocument);
router.get('/:id/pdf', getDocumentPdf);

export default router;
