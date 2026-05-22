import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';

const prisma = new PrismaClient();

const generateDocNumber = async (type: string) => {
  const prefixMap: any = { QUOTATION: 'QT', INVOICE: 'IV', BILL: 'BL', TAX_INVOICE: 'TI' };
  const prefix = prefixMap[type] || 'DC';
  const date = new Date();
  const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  
  const latestDoc = await prisma.document.findFirst({
    where: { docNumber: { startsWith: `${prefix}${yearMonth}` } },
    orderBy: { docNumber: 'desc' }
  });

  let runningNum = 1;
  if (latestDoc) {
    const seqStr = latestDoc.docNumber.replace(`${prefix}${yearMonth}`, '');
    const parsed = parseInt(seqStr, 10);
    if (!isNaN(parsed)) runningNum = parsed + 1;
  }
  return `${prefix}${yearMonth}${String(runningNum).padStart(4, '0')}`;
};

export const createDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, companyId, customerName, customerAddress, customerTaxId, items, dueDate, includeSignature } = req.body;
    let customDocNumber = req.body.docNumber;

    const company = await prisma.company.findUnique({ where: { id: parseInt(companyId as string) } });
    if (!company) return res.status(404).json({ message: 'Company not found' });

    let subTotal = 0;
    const processedItems = items.map((item: any) => {
      const totalPrice = item.quantity * item.pricePerUnit;
      subTotal += totalPrice;
      return {
        description: item.description,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit,
        totalPrice
      };
    });

    const vatRate = 7.0;
    const vatAmount = (subTotal * vatRate) / 100;
    const grandTotal = subTotal + vatAmount;

    let finalDocNumber = customDocNumber && customDocNumber.trim() !== '' ? customDocNumber.trim() : await generateDocNumber(type);

    if (customDocNumber && customDocNumber.trim() !== '') {
      const existing = await prisma.document.findUnique({
        where: { docNumber_type: { docNumber: finalDocNumber, type } }
      });
      if (existing) {
        return res.status(400).json({ message: `Document number ${finalDocNumber} already exists for type ${type}` });
      }
    }

    const document = await prisma.$transaction(async (tx) => {
      return tx.document.create({
        data: {
          docNumber: finalDocNumber, type,
          companyId: company.id,
          companyNameSnapshot: company.name,
          companyAddressSnapshot: company.address,
          companyTaxIdSnapshot: company.taxId,
          companyLogoSnapshot: company.logoUrl,
          companySignatureSnapshot: company.signatureUrl,
          includeSignature: includeSignature === true,
          customerName, customerAddress, customerTaxId,
          subTotal, vatRate, vatAmount, grandTotal,
          dueDate: dueDate ? new Date(dueDate) : null,
          items: { create: processedItems }
        }
      });
    });

    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
};

export const getDocumentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: parseInt(req.params.id as string) },
      include: { items: true }
    });
    if (!document) return res.status(404).json({ message: 'Document not found' });
    res.json(document);
  } catch (error) {
    next(error);
  }
};

export const updateDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const { type, companyId, customerName, customerAddress, customerTaxId, items, dueDate, includeSignature, docNumber } = req.body;

    const company = await prisma.company.findUnique({ where: { id: parseInt(companyId as string) } });
    if (!company) return res.status(404).json({ message: 'Company not found' });

    let subTotal = 0;
    const processedItems = items.map((item: any) => {
      const totalPrice = item.quantity * item.pricePerUnit;
      subTotal += totalPrice;
      return {
        description: item.description,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit,
        totalPrice
      };
    });

    const vatRate = 7.0;
    const vatAmount = (subTotal * vatRate) / 100;
    const grandTotal = subTotal + vatAmount;
    
    let updateData: any = {
      type,
      companyId: company.id,
      companyNameSnapshot: company.name,
      companyAddressSnapshot: company.address,
      companyTaxIdSnapshot: company.taxId,
      companyLogoSnapshot: company.logoUrl,
      companySignatureSnapshot: company.signatureUrl,
      includeSignature: includeSignature === true,
      customerName, customerAddress, customerTaxId,
      subTotal, vatRate, vatAmount, grandTotal,
      dueDate: dueDate ? new Date(dueDate) : null,
      items: { create: processedItems }
    };

    if (docNumber && docNumber.trim() !== '') {
      const existing = await prisma.document.findUnique({
        where: { docNumber_type: { docNumber: docNumber.trim(), type } }
      });
      if (existing && existing.id !== id) {
        return res.status(400).json({ message: `Document number ${docNumber.trim()} already exists for type ${type}` });
      }
      updateData.docNumber = docNumber.trim();
    }

    const document = await prisma.$transaction(async (tx) => {
      // Delete old items
      await tx.documentItem.deleteMany({ where: { documentId: id } });

      // Update document and insert new items
      return tx.document.update({
        where: { id },
        data: updateData
      });
    });

    res.json(document);
  } catch (error) {
    next(error);
  }
};

export const getDocumentPdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: parseInt(req.params.id as string) },
      include: { items: true }
    });
    if (!document) return res.status(404).json({ message: 'Not found' });

    // In Docker, Puppeteer runs inside the backend container itself.
    // It's safest to fetch images from localhost:3001 (the backend process) to avoid routing issues.
    const baseUrl = 'http://localhost:3001';

    const logoUrl = document.companyLogoSnapshot 
      ? `${baseUrl}${document.companyLogoSnapshot}` : '';

    const signatureUrl = document.includeSignature && document.companySignatureSnapshot
      ? `${baseUrl}${document.companySignatureSnapshot}` : '';

    const typeTitleMap: any = {
      QUOTATION: 'ใบเสนอราคา',
      INVOICE: 'ใบแจ้งหนี้',
      BILL: 'ใบเสร็จรับเงิน',
      TAX_INVOICE: 'ใบกำกับภาษี'
    };
    const title = typeTitleMap[document.type] || document.type;

    const html = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
          body { font-family: 'Sarabun', sans-serif; padding: 40px; color: #000; font-size: 12px; margin: 0; display: flex; flex-direction: column; min-height: 100vh; box-sizing: border-box; }
          .header-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
          .company-logo { max-height: 150px; max-width: 250px; margin-bottom: 10px; object-fit: contain; }
          .company-name { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
          .company-details { font-size: 11px; line-height: 1.4; color: #333; }
          .doc-title { font-size: 32px; font-weight: bold; text-align: right; color: #333; }
          
          .blue-banner-container { margin-left: -40px; margin-bottom: 20px; }
          .blue-banner { background-color: #2b65e8; color: white; padding: 8px 20px 8px 40px; border-radius: 0 20px 20px 0; display: inline-block; font-size: 14px; font-weight: bold; min-width: 300px; }
          
          .info-grid { display: grid; grid-template-columns: 60% 40%; gap: 20px; margin-bottom: 20px; font-size: 11px; }
          .info-row { display: flex; margin-bottom: 4px; }
          .info-label { width: 100px; color: #555; }
          .info-value { font-weight: bold; flex: 1; }
          
          .table-section { margin-bottom: 20px; }
          .intro-text { font-weight: bold; margin-bottom: 10px; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { background-color: #2b65e8; color: white; padding: 8px; border: 1px solid #2b65e8; }
          td { padding: 8px; border-bottom: 1px solid #eee; border-left: 1px solid #eee; border-right: 1px solid #eee; }
          .tr-even { background-color: #f9f9f9; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
          
          .totals-container { display: flex; justify-content: flex-end; margin-bottom: 30px; margin-top: 10px; }
          .totals-table { width: 350px; border-collapse: separate; border-spacing: 0 4px;}
          .totals-table td { padding: 5px 10px; border: none; text-align: right; }
          .totals-table .label-td { text-align: right; width: 60%; }
          .grand-total-row { background-color: #2b65e8; color: white; font-weight: bold; }
          .grand-total-row td:first-child { border-radius: 20px 0 0 20px; text-align: center; }
          .grand-total-row td:last-child { border-radius: 0 20px 20px 0; }
          
          .terms { font-size: 10px; line-height: 1.5; margin-bottom: 40px; }
          .terms-title { font-weight: bold; margin-bottom: 5px; font-size: 11px; }
          .terms ul { padding-left: 15px; margin: 0; }
          
          .signatures { display: flex; justify-content: space-between; margin-top: auto; text-align: center; font-size: 11px; padding: 0 40px; padding-bottom: 20px; }
          .signature-box { width: 200px; position: relative; }
          .sign-title { font-weight: bold; margin-bottom: 40px; }
          .sign-line { border-bottom: 1px solid #999; margin-bottom: 5px; position: relative; z-index: 10; }
          .sign-image { position: absolute; max-width: 150px; max-height: 80px; bottom: 25px; left: 50%; transform: translateX(-50%); z-index: 5; }
        </style>
      </head>
      <body>
        <div class="header-container">
          <div>
            ${logoUrl ? `<img src="${logoUrl}" class="company-logo">` : ''}
            <div class="company-name">${document.companyNameSnapshot}</div>
            <div class="company-details">
              ${document.companyAddressSnapshot.replace(/\n/g, '<br>')}<br>
              เลขประจำตัวผู้เสียภาษี: ${document.companyTaxIdSnapshot}
            </div>
          </div>
          <div class="doc-title">${title}</div>
        </div>

        <div class="blue-banner-container">
          <div class="blue-banner">เลขที่: ${document.docNumber}</div>
        </div>

        <div class="info-grid">
          <div>
            <div class="info-row"><div class="info-label">เรียน</div><div class="info-value">${document.customerName}</div></div>
            <div class="info-row"><div class="info-label">ที่อยู่</div><div class="info-value">${document.customerAddress.replace(/\n/g, '<br>')}</div></div>
            <div class="info-row"><div class="info-label">เลขประจำตัวผู้เสียภาษี</div><div class="info-value">${document.customerTaxId}</div></div>
          </div>
          <div>
            <div class="info-row"><div class="info-label">วันที่สร้าง</div><div class="info-value">${document.createdAt.toLocaleDateString('en-GB')}</div></div>
            <div class="info-row"><div class="info-label">มีผลถึงวันที่</div><div class="info-value">${document.dueDate ? document.dueDate.toLocaleDateString('en-GB') : '-'}</div></div>
          </div>
        </div>

        <div class="table-section">
          <div class="intro-text">ขอเสนอราคาและเงื่อนไขสำหรับท่านดังนี้</div>
          <table>
            <thead>
              <tr>
                <th width="10%">ลำดับ</th>
                <th width="45%" class="text-left">สินค้า</th>
                <th width="15%" class="text-right">ราคาต่อหน่วย</th>
                <th width="10%" class="text-center">จำนวน</th>
                <th width="20%" class="text-right">มูลค่าก่อนภาษี</th>
              </tr>
            </thead>
            <tbody>
              ${document.items.map((item, index) => `
                <tr class="${index % 2 === 1 ? 'tr-even' : ''}">
                  <td class="text-center">${index + 1}</td>
                  <td>${item.description}</td>
                  <td class="text-right">${item.pricePerUnit.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right font-bold">${item.totalPrice.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="totals-container">
          <table class="totals-table">
            <tr>
              <td class="label-td">มูลค่าก่อนภาษี</td>
              <td class="font-bold">${document.subTotal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            </tr>
            <tr>
              <td class="label-td">ภาษีมูลค่าเพิ่ม (${document.vatRate}%)</td>
              <td class="font-bold">${document.vatAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            </tr>
            <tr class="grand-total-row">
              <td>จำนวนเงินทั้งสิ้น (THB)</td>
              <td>${document.grandTotal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            </tr>
          </table>
        </div>

        <div class="terms">
          <div class="terms-title">เงื่อนไขการชำระเงิน</div>
          <ul>
            <li>ใบเสนอราคานี้มีอายุ 30 วัน</li>
            <li>ชำระเงินมัดจำ 30% ของมูลค่าสินค้าก่อนดำเนินการ</li>
            <li>หากมีการยกเลิกคำสั่งซื้อหลังจากชำระมัดจำมาแล้ว จะไม่สามารถขอคืนเงินได้</li>
          </ul>
        </div>

        <div class="signatures">
          <div class="signature-box">
            <div class="sign-title">ผู้อนุมัติซื้อ</div>
            <div class="sign-line"></div>
            <div>( <span style="display:inline-block; width:120px;"></span> )</div>
            <div style="margin-top: 5px;">วันที่ ........ / ........ / ........</div>
          </div>
          <div class="signature-box">
            <div class="sign-title">ผู้เสนอราคา</div>
            ${signatureUrl ? `<img src="${signatureUrl}" class="sign-image">` : ''}
            <div class="sign-line"></div>
            <div>ฝ่ายขาย</div>
            <div style="margin-top: 5px;">วันที่ ${document.createdAt.toLocaleDateString('en-GB')}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${document.docNumber}.pdf"`,
      'Content-Length': String(pdf.length)
    });
    res.send(pdf);
  } catch (error) {
    next(error);
  }
};

export const getDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.query;
    const filter: any = {};
    if (type && type !== '') {
      filter.type = type;
    }

    const documents = await prisma.document.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      include: {
        company: {
          select: { name: true }
        }
      }
    });

    res.json(documents);
  } catch (error) {
    next(error);
  }
};
