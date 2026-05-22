import { Router } from 'express';
import { createDocument, getDocuments, getDocumentPdf, getDocumentById, updateDocument } from '../controllers/document.controller';

const router = Router();

router.post('/', createDocument);
router.get('/', getDocuments);
router.get('/:id/pdf', getDocumentPdf);
router.get('/:id', getDocumentById);
router.put('/:id', updateDocument);

export default router;
