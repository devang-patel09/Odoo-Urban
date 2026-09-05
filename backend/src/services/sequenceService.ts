import prisma from '../config/db';

export class SequenceService {
  static async getNextPONumber(tx?: any): Promise<string> {
    const client = tx || prisma;
    const count = await client.purchaseOrder.count();
    const nextNum = (count + 1).toString().padStart(5, '0');
    return `P${nextNum}`;
  }

  static async getNextSONumber(tx?: any): Promise<string> {
    const client = tx || prisma;
    const count = await client.salesOrder.count();
    const nextNum = (count + 1).toString().padStart(5, '0');
    return `S${nextNum}`;
  }

  static async getNextBillNumber(tx?: any): Promise<string> {
    const client = tx || prisma;
    const year = new Date().getFullYear();
    const count = await client.vendorBill.count();
    const nextNum = (count + 1).toString().padStart(4, '0');
    return `Bill/${year}/${nextNum}`;
  }

  static async getNextInvoiceNumber(tx?: any): Promise<string> {
    const client = tx || prisma;
    const year = new Date().getFullYear();
    const count = await client.customerInvoice.count();
    const nextNum = (count + 1).toString().padStart(4, '0');
    return `INV/${year}/${nextNum}`;
  }

  static async getNextPaymentNumber(tx?: any): Promise<string> {
    const client = tx || prisma;
    const year = new Date().getFullYear();
    const count = await client.payment.count();
    const nextNum = (count + 1).toString().padStart(4, '0');
    return `PAY/${year}/${nextNum}`;
  }

  static async getNextJournalEntryNumber(tx?: any): Promise<string> {
    const client = tx || prisma;
    const year = new Date().getFullYear();
    const count = await client.journalEntry.count();
    const nextNum = (count + 1).toString().padStart(4, '0');
    return `JE/${year}/${nextNum}`;
  }

  static async getNextSequence(tx?: any, prefix?: string): Promise<string> {
    switch (prefix) {
      case 'PO':
      case 'P':
        return this.getNextPONumber(tx);
      case 'SO':
      case 'S':
        return this.getNextSONumber(tx);
      case 'BILL':
      case 'Bill':
        return this.getNextBillNumber(tx);
      case 'INV':
        return this.getNextInvoiceNumber(tx);
      case 'PAY':
        return this.getNextPaymentNumber(tx);
      case 'JE':
      default:
        return this.getNextJournalEntryNumber(tx);
    }
  }
}
