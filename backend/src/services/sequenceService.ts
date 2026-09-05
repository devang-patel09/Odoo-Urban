import prisma from '../config/db';

export class SequenceService {
  static async getNextPONumber(): Promise<string> {
    const count = await prisma.purchaseOrder.count();
    const nextNum = (count + 1).toString().padStart(5, '0');
    return `P${nextNum}`;
  }

  static async getNextSONumber(): Promise<string> {
    const count = await prisma.salesOrder.count();
    const nextNum = (count + 1).toString().padStart(5, '0');
    return `S${nextNum}`;
  }

  static async getNextBillNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.vendorBill.count();
    const nextNum = (count + 1).toString().padStart(4, '0');
    return `Bill/${year}/${nextNum}`;
  }

  static async getNextInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.customerInvoice.count();
    const nextNum = (count + 1).toString().padStart(4, '0');
    return `INV/${year}/${nextNum}`;
  }

  static async getNextPaymentNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.payment.count();
    const nextNum = (count + 1).toString().padStart(4, '0');
    return `PAY/${year}/${nextNum}`;
  }

  static async getNextJournalEntryNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.journalEntry.count();
    const nextNum = (count + 1).toString().padStart(4, '0');
    return `JE/${year}/${nextNum}`;
  }
}
