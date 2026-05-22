import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// สร้างโฟลเดอร์อัตโนมัติถ้ายังไม่มี
const uploadDir = path.join(__dirname, '../../../uploads/logos');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ storage });

export const createCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, address, taxId } = req.body;
    const logoUrl = req.file ? `/uploads/logos/${req.file.filename}` : null;

    const company = await prisma.company.create({
      data: { name, address, taxId, logoUrl }
    });
    res.status(201).json(company);
  } catch (error) {
    next(error);
  }
};

export const getCompanies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companies = await prisma.company.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(companies);
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const { name, address, taxId } = req.body;
    
    const dataToUpdate: any = { name, address, taxId };
    if (req.file) {
      dataToUpdate.logoUrl = `/uploads/logos/${req.file.filename}`;
    }

    const company = await prisma.company.update({
      where: { id },
      data: dataToUpdate
    });
    res.json(company);
  } catch (error) {
    next(error);
  }
};
