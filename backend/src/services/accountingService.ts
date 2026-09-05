import { PrismaClient, EntryStatus, UserRole } from '@prisma/client';
import { SequenceService } from './sequenceService';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export interface CreateJournalEntryInput {
  date: string;
  journalId: number;
  reference?: string;
  items: {
    accountId: number;
    partnerId?: number | null;
    analyticAccountId?: number | null;
    description?: string;
    debit: number;
    credit: number;
  }[];
}

export class AccountingService {
  /**
   * List all journal entries with source links, status, and debit/credit totals
   */
  static async listJournalEntries(params?: {
    journalId?: number;
    status?: EntryStatus;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = {};

    if (params?.journalId) where.journalId = params.journalId;
    if (params?.status) where.status = params.status;
    if (params?.startDate || params?.endDate) {
      where.date = {};
      if (params.startDate) where.date.gte = new Date(params.startDate);
      if (params.endDate) where.date.lte = new Date(params.endDate);
    }

    if (params?.search) {
      where.OR = [
        { entryNumber: { contains: params.search } },
        { reference: { contains: params.search } },
        { vendorBill: { billNumber: { contains: params.search } } },
        { customerInvoice: { invoiceNumber: { contains: params.search } } },
        { payment: { paymentNumber: { contains: params.search } } },
      ];
    }

    return prisma.journalEntry.findMany({
      where,
      include: {
        journal: true,
        vendorBill: { select: { id: true, billNumber: true, vendor: { select: { name: true } } } },
        customerInvoice: { select: { id: true, invoiceNumber: true, customer: { select: { name: true } } } },
        payment: { select: { id: true, paymentNumber: true, partner: { select: { name: true } } } },
        items: {
          include: {
            account: true,
            partner: true,
            analyticAccount: true,
          },
        },
      },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    });
  }

  /**
   * Get single journal entry with detailed items
   */
  static async getJournalEntry(id: number) {
    const entry = await prisma.journalEntry.findUnique({
      where: { id },
      include: {
        journal: true,
        vendorBill: {
          include: {
            vendor: true,
          },
        },
        customerInvoice: {
          include: {
            customer: true,
          },
        },
        payment: {
          include: {
            partner: true,
          },
        },
        items: {
          include: {
            account: true,
            partner: true,
            analyticAccount: true,
          },
        },
      },
    });

    if (!entry) {
      const err = new Error('Journal entry not found') as any;
      err.statusCode = 404;
      throw err;
    }

    return entry;
  }

  /**
   * Create and post a manual miscellaneous journal entry with balanced debit and credit
   */
  static async createManualJournalEntry(input: CreateJournalEntryInput) {
    if (!input.items || input.items.length < 2) {
      const err = new Error('A journal entry must contain at least 2 lines') as any;
      err.statusCode = 400;
      throw err;
    }

    let totalDebit = 0;
    let totalCredit = 0;

    for (const item of input.items) {
      const deb = Number(item.debit || 0);
      const cred = Number(item.credit || 0);
      if (deb < 0 || cred < 0) {
        const err = new Error('Debit and Credit amounts must be non-negative') as any;
        err.statusCode = 400;
        throw err;
      }
      if (deb > 0 && cred > 0) {
        const err = new Error('A single journal item cannot have both Debit and Credit amounts') as any;
        err.statusCode = 400;
        throw err;
      }
      totalDebit += deb;
      totalCredit += cred;
    }

    // Strict Double-Entry check: rounding to 2 decimal places
    const diff = Math.abs(totalDebit - totalCredit);
    if (diff > 0.009) {
      const err = new Error(
        `Total Debit (₹${totalDebit.toFixed(2)}) must equal Total Credit (₹${totalCredit.toFixed(2)}). Difference: ₹${diff.toFixed(2)}`
      ) as any;
      err.statusCode = 400;
      throw err;
    }

    return prisma.$transaction(async (tx) => {
      const entryNumber = await SequenceService.getNextSequence(tx, 'JE');
      const entryDate = new Date(input.date);

      const entry = await tx.journalEntry.create({
        data: {
          entryNumber,
          date: entryDate,
          journalId: input.journalId,
          status: EntryStatus.POSTED,
          reference: input.reference || null,
          sourceType: 'MANUAL',
          totalDebit: new Decimal(totalDebit),
          totalCredit: new Decimal(totalCredit),
          items: {
            create: input.items.map((it) => ({
              accountId: it.accountId,
              partnerId: it.partnerId || null,
              analyticAccountId: it.analyticAccountId || null,
              description: it.description || null,
              debit: new Decimal(it.debit || 0),
              credit: new Decimal(it.credit || 0),
            })),
          },
        },
        include: {
          journal: true,
          items: {
            include: {
              account: true,
              partner: true,
              analyticAccount: true,
            },
          },
        },
      });

      return entry;
    });
  }
}
