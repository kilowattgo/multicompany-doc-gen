import express from 'express';
import cors from 'cors';
import path from 'path';
import companyRoutes from './routes/company.routes';
import documentRoutes from './routes/document.routes';

const app = express();

app.use(cors());
app.use(express.json());

// เปิดโฟลเดอร์ uploads ให้ Frontend เข้าถึงรูปได้
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.use('/api/companies', companyRoutes);
app.use('/api/documents', documentRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
