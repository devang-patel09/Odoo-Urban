import prisma from '../config/db';
import { SequenceService } from './sequenceService';
import { AppError } from '../middleware/errorHandler';
import { PaymentType, PaymentMethod, PaymentStatus, InvoiceStatus, EntryStatus } from '@prisma/client';

export class PaymentService {
  static async listPayments(filter?: { type?: string; partnerId?: number; search?: string }) {
    const where: any = {};
    if (filter?.type && filter.type !== 'ALL') {
      where.type = filter.type as PaymentType;
    }
    if (filter?.partnerId) {
      where.partnerId = Number(filter.partnerId);
    }
    if (filter?.search) {
      where.OR = [
        { paymentNumber: { contains: filter.search } },
        { reference: { contains: filter.search } },
        { partner: { name: { contains: filter.search } } },
      ];
    }

    return await prisma.payment.findMany({
      where,
      orderBy: { id: 'desc' },
      include: {
        partner: true,
        journal: true,
        allocations: {
          include: {
            customerInvoice: { select: { id: true, invoiceNumber: true, totalAmount: true } },
            vendorBill: { select: { id: true, billNumber: true, totalAmount: true } },
          },
        },
        journalEntry: { select: { id: true, entryNumber: true } },
      },
    });
  }

  static async getPayment(id: number) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        partner: true,
        journal: true,
        allocations: {
          include: {
            customerInvoice: true,
            vendorBill: true,
          },
        },
        journalEntry: {
          include: {
            items: { include: { account: true, partner: true } },
          },
        },
      },
    });
    if (!payment) throw new AppError('Payment not found', 404);
    return payment;
  }

  // ==================== REGISTER PAYMENT (ATOMIC TRANSACTION) ====================
  static async registerPayment(data: {
    type: PaymentType;
    partnerId: number;
    amount: number;
    paymentMethod: PaymentMethod;
    paymentDate?: Date | string;
    reference?: string | null;
    notes?: string | null;
    invoiceId?: number | null;
    billId?: number | null;
  }) {
    const paymentAmount = Number(data.amount);
    if (paymentAmount <= 0) {
      throw new AppError('Payment amount must be greater than zero', 400);
    }

    // Determine target Journal (Bank or Cash)
    const journalType = data.paymentMethod === 'BANK' ? 'BANK' : 'CASH';
    const paymentJournal = await prisma.journal.findFirst({
      where: { type: journalType },
    });
    if (!paymentJournal) {
      throw new AppError(`No default ${journalType} Journal configured in the system.`, 400);
    }

    // Find Cash (1000) or Bank (1010) account
    const paymentAccountCode = data.paymentMethod === 'BANK' ? '1010' : '1000';
    const paymentAccount = await prisma.account.findFirst({
      where: { code: paymentAccountCode },
    });
    if (!paymentAccount) {
      throw new AppError(`Payment account (${paymentAccountCode}) not found in CoA.`, 400);
    }

    const partner = await prisma.contact.findUnique({ where: { id: data.partnerId } });
    if (!partner) throw new AppError('Partner not found', 404);

    const paymentNumber = await SequenceService.getNextPaymentNumber();
    const entryNumber = await SequenceService.getNextJournalEntryNumber();

    return await prisma.$transaction(async (tx) => {
      // 1. If registering against a Customer Invoice
      if (data.type === 'CUSTOMER' && data.invoiceId) {
        const invoice = await tx.customerInvoice.findUnique({
          where: { id: data.invoiceId },
        });
        if (!invoice) throw new AppError('Customer invoice not found', 404);
        if (invoice.status === 'DRAFT') {
          throw new AppError('Cannot register payment on a Draft invoice. Please Post it first.', 400);
        }
        if (invoice.status === 'PAID') {
          throw new AppError('Invoice is already fully paid.', 400);
        }

        const due = Number(invoice.amountDue);
        if (paymentAmount > due + 0.01) {
          throw new AppError(`Payment amount (₹${paymentAmount}) exceeds outstanding due (₹${due}).`, 400);
        }

        const newPaid = Number(invoice.paidAmount) + paymentAmount;
        const newDue = Math.max(0, Number(invoice.totalAmount) - newPaid);
        const newStatus = newDue <= 0.01 ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

        // Debtors Account (1100)
        const debtorsAccount = await tx.account.findFirst({ where: { code: '1100' } });
        if (!debtorsAccount) throw new AppError('Debtors account (1100) not found in CoA.', 400);

        // Create Payment
        const payment = await tx.payment.create({
          data: {
            paymentNumber,
            type: PaymentType.CUSTOMER,
            partnerId: data.partnerId,
            amount: paymentAmount,
            paymentMethod: data.paymentMethod,
            journalId: paymentJournal.id,
            paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
            reference: data.reference || invoice.invoiceNumber,
            status: PaymentStatus.POSTED,
            notes: data.notes || `Received for ${invoice.invoiceNumber}`,
            allocations: {
              create: [
                {
                  customerInvoiceId: invoice.id,
                  amountAllocated: paymentAmount,
                },
              ],
            },
          },
        });

        // Create Balanced Accounting Journal Entry:
        // Debit: Cash/Bank
        // Credit: Debtors
        await tx.journalEntry.create({
          data: {
            entryNumber,
            date: payment.paymentDate,
            journalId: paymentJournal.id,
            status: EntryStatus.POSTED,
            reference: payment.paymentNumber,
            sourceType: 'PAYMENT',
            sourceId: payment.id,
            paymentId: payment.id,
            totalDebit: paymentAmount,
            totalCredit: paymentAmount,
            items: {
              create: [
                {
                  accountId: paymentAccount.id,
                  partnerId: partner.id,
                  description: `Receipt ${payment.paymentNumber} via ${data.paymentMethod}`,
                  debit: paymentAmount,
                  credit: 0,
                },
                {
                  accountId: debtorsAccount.id,
                  partnerId: partner.id,
                  description: `Payment applied to ${invoice.invoiceNumber}`,
                  debit: 0,
                  credit: paymentAmount,
                },
              ],
            },
          },
        });

        // Update Invoice status and due
        await tx.customerInvoice.update({
          where: { id: invoice.id },
          data: {
            paidAmount: newPaid,
            amountDue: newDue,
            status: newStatus,
          },
        });

        return payment;
      }

      // 2. If registering against a Vendor Bill
      if (data.type === 'VENDOR' && data.billId) {
        const bill = await tx.vendorBill.findUnique({
          where: { id: data.billId },
        });
        if (!bill) throw new AppError('Vendor bill not found', 404);
        if (bill.status === 'DRAFT') {
          throw new AppError('Cannot register payment on a Draft bill. Please Post it first.', 400);
        }
        if (bill.status === 'PAID') {
          throw new AppError('Bill is already fully paid.', 400);
        }

        const due = Number(bill.amountDue);
        if (paymentAmount > due + 0.01) {
          throw new AppError(`Payment amount (₹${paymentAmount}) exceeds bill outstanding due (₹${due}).`, 400);
        }

        const newPaid = Number(bill.paidAmount) + paymentAmount;
        const newDue = Math.max(0, Number(bill.totalAmount) - newPaid);
        const newStatus = newDue <= 0.01 ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

        // Creditors Account (2000)
        const creditorsAccount = await tx.account.findFirst({ where: { code: '2000' } });
        if (!creditorsAccount) throw new AppError('Creditors account (2000) not found in CoA.', 400);

        // Create Payment
        const payment = await tx.payment.create({
          data: {
            paymentNumber,
            type: PaymentType.VENDOR,
            partnerId: data.partnerId,
            amount: paymentAmount,
            paymentMethod: data.paymentMethod,
            journalId: paymentJournal.id,
            paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
            reference: data.reference || bill.billNumber,
            status: PaymentStatus.POSTED,
            notes: data.notes || `Disbursement for ${bill.billNumber}`,
            allocations: {
              create: [
                {
                  vendorBillId: bill.id,
                  amountAllocated: paymentAmount,
                },
              ],
            },
          },
        });

        // Create Balanced Accounting Journal Entry:
        // Debit: Creditors
        // Credit: Cash/Bank
        await tx.journalEntry.create({
          data: {
            entryNumber,
            date: payment.paymentDate,
            journalId: paymentJournal.id,
            status: EntryStatus.POSTED,
            reference: payment.paymentNumber,
            sourceType: 'PAYMENT',
            sourceId: payment.id,
            paymentId: payment.id,
            totalDebit: paymentAmount,
            totalCredit: paymentAmount,
            items: {
              create: [
                {
                  accountId: creditorsAccount.id,
                  partnerId: partner.id,
                  description: `Bill settlement for ${bill.billNumber}`,
                  debit: paymentAmount,
                  credit: 0,
                },
                {
                  accountId: paymentAccount.id,
                  partnerId: partner.id,
                  description: `Payment ${payment.paymentNumber} via ${data.paymentMethod}`,
                  debit: 0,
                  credit: paymentAmount,
                },
              ],
            },
          },
        });

        // Update Bill status and due
        await tx.vendorBill.update({
          where: { id: bill.id },
          data: {
            paidAmount: newPaid,
            amountDue: newDue,
            status: newStatus,
          },
        });

        return payment;
      }

      // Standalone payment without specific invoice/bill
      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          type: data.type,
          partnerId: data.partnerId,
          amount: paymentAmount,
          paymentMethod: data.paymentMethod,
          journalId: paymentJournal.id,
          paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
          reference: data.reference || null,
          status: PaymentStatus.POSTED,
          notes: data.notes || null,
        },
      });

      return payment;
    });
  }
}
