import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, address, taxId } = req.body;
    const customer = await prisma.customer.create({
      data: { name, address, taxId }
    });
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
};

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customers = await prisma.customer.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(customers);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const { name, address, taxId } = req.body;
    
    const customer = await prisma.customer.update({
      where: { id },
      data: { name, address, taxId }
    });
    res.json(customer);
  } catch (error) {
    next(error);
  }
};
