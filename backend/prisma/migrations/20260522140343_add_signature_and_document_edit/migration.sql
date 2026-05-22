-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "signatureUrl" TEXT;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "companySignatureSnapshot" TEXT,
ADD COLUMN     "includeSignature" BOOLEAN NOT NULL DEFAULT false;
