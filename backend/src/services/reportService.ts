import { PrismaClient, EntryStatus, AccountType, InvoiceStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class ReportService {
  /**
   * Profit and Loss Statement
   * Income - Expenses = Net Profit
   */
  static async getProfitAndLoss(startDate?: string, endDate?: string) {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const items = await prisma.journalItem.findMany({
      where: {
        journalEntry: {
          status: EntryStatus.POSTED,
          ...(startDate || endDate ? { date: dateFilter } : {}),
        },
        account: {
          type: { in: [AccountType.INCOME, AccountType.EXPENSE, AccountType.OTHER_EXPENSE] },
        },
      },
      include: {
        account: true,
      },
    });

    const incomeAccounts: Record<string, { id: number; code: string; name: string; total: number }> = {};
    const expenseAccounts: Record<string, { id: number; code: string; name: string; total: number }> = {};

    let totalIncome = 0;
    let totalExpense = 0;

    for (const item of items) {
      const code = item.account.code;
      if (item.account.type === AccountType.INCOME) {
        // Income is credited (+)
        const net = Number(item.credit) - Number(item.debit);
        if (!incomeAccounts[code]) {
          incomeAccounts[code] = {
            id: item.account.id,
            code: item.account.code,
            name: item.account.name,
            total: 0,
          };
        }
        incomeAccounts[code].total += net;
        totalIncome += net;
      } else {
        // Expense is debited (+)
        const net = Number(item.debit) - Number(item.credit);
        if (!expenseAccounts[code]) {
          expenseAccounts[code] = {
            id: item.account.id,
            code: item.account.code,
            name: item.account.name,
            total: 0,
          };
        }
        expenseAccounts[code].total += net;
        totalExpense += net;
      }
    }

    const netProfit = totalIncome - totalExpense;

    return {
      period: { startDate, endDate },
      income: {
        accounts: Object.values(incomeAccounts),
        total: Number(totalIncome.toFixed(2)),
      },
      expenses: {
        accounts: Object.values(expenseAccounts),
        total: Number(totalExpense.toFixed(2)),
      },
      netProfit: Number(netProfit.toFixed(2)),
    };
  }

  /**
   * Balance Sheet
   * Assets = Liabilities + Equity
   */
  static async getBalanceSheet(asOfDate?: string) {
    const dateFilter = asOfDate ? { lte: new Date(asOfDate) } : undefined;

    const items = await prisma.journalItem.findMany({
      where: {
        journalEntry: {
          status: EntryStatus.POSTED,
          ...(dateFilter ? { date: dateFilter } : {}),
        },
      },
      include: {
        account: true,
      },
    });

    const assetsMap: Record<string, { id: number; code: string; name: string; total: number }> = {};
    const liabilitiesMap: Record<string, { id: number; code: string; name: string; total: number }> = {};
    const equityMap: Record<string, { id: number; code: string; name: string; total: number }> = {};

    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;
    let netIncome = 0;

    for (const item of items) {
      const { type, code, name, id } = item.account;
      const debit = Number(item.debit);
      const credit = Number(item.credit);

      if (type === AccountType.ASSET) {
        // Assets are normally debit (+)
        const net = debit - credit;
        if (!assetsMap[code]) assetsMap[code] = { id, code, name, total: 0 };
        assetsMap[code].total += net;
        totalAssets += net;
      } else if (type === AccountType.LIABILITY) {
        // Liabilities are normally credit (+)
        const net = credit - debit;
        if (!liabilitiesMap[code]) liabilitiesMap[code] = { id, code, name, total: 0 };
        liabilitiesMap[code].total += net;
        totalLiabilities += net;
      } else if (type === AccountType.EQUITY) {
        // Equity is normally credit (+)
        const net = credit - debit;
        if (!equityMap[code]) equityMap[code] = { id, code, name, total: 0 };
        equityMap[code].total += net;
        totalEquity += net;
      } else if (type === AccountType.INCOME) {
        netIncome += credit - debit;
      } else if (type === AccountType.EXPENSE || type === AccountType.OTHER_EXPENSE) {
        netIncome -= debit - credit;
      }
    }

    // Current Year Profit / Retained Earnings contributes to Equity
    const totalEquityWithProfit = totalEquity + netIncome;
    const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquityWithProfit)) < 0.05;

    return {
      asOfDate: asOfDate || new Date().toISOString(),
      assets: {
        accounts: Object.values(assetsMap),
        total: Number(totalAssets.toFixed(2)),
      },
      liabilities: {
        accounts: Object.values(liabilitiesMap),
        total: Number(totalLiabilities.toFixed(2)),
      },
      equity: {
        accounts: Object.values(equityMap),
        currentYearProfit: Number(netIncome.toFixed(2)),
        total: Number(totalEquityWithProfit.toFixed(2)),
      },
      totalLiabilitiesAndEquity: Number((totalLiabilities + totalEquityWithProfit).toFixed(2)),
      isBalanced,
      equationCheck: `Assets (₹${totalAssets.toFixed(2)}) ${isBalanced ? '==' : '!='} Liabilities (₹${totalLiabilities.toFixed(2)}) + Equity (₹${totalEquityWithProfit.toFixed(2)})`,
    };
  }

  /**
   * Trial Balance
   * Lists every account with Debit, Credit, and Net Balance.
   * Total Debit MUST equal Total Credit.
   */
  static async getTrialBalance(startDate?: string, endDate?: string) {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const accounts = await prisma.account.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });

    const items = await prisma.journalItem.findMany({
      where: {
        journalEntry: {
          status: EntryStatus.POSTED,
          ...(startDate || endDate ? { date: dateFilter } : {}),
        },
      },
      include: {
        account: true,
      },
    });

    const accountTotals: Record<number, { debit: number; credit: number }> = {};

    for (const item of items) {
      if (!accountTotals[item.accountId]) {
        accountTotals[item.accountId] = { debit: 0, credit: 0 };
      }
      accountTotals[item.accountId].debit += Number(item.debit);
      accountTotals[item.accountId].credit += Number(item.credit);
    }

    let grandTotalDebit = 0;
    let grandTotalCredit = 0;

    const rows = accounts.map((acc) => {
      const deb = accountTotals[acc.id]?.debit || 0;
      const cred = accountTotals[acc.id]?.credit || 0;

      grandTotalDebit += deb;
      grandTotalCredit += cred;

      // Net balance determination according to account normal sign
      let netDebit = 0;
      let netCredit = 0;
      if (acc.type === AccountType.ASSET || acc.type === AccountType.EXPENSE || acc.type === AccountType.OTHER_EXPENSE) {
        if (deb >= cred) netDebit = deb - cred;
        else netCredit = cred - deb;
      } else {
        if (cred >= deb) netCredit = cred - deb;
        else netDebit = deb - cred;
      }

      return {
        id: acc.id,
        code: acc.code,
        name: acc.name,
        type: acc.type,
        debit: Number(deb.toFixed(2)),
        credit: Number(cred.toFixed(2)),
        netDebit: Number(netDebit.toFixed(2)),
        netCredit: Number(netCredit.toFixed(2)),
      };
    });

    const isBalanced = Math.abs(grandTotalDebit - grandTotalCredit) < 0.05;

    return {
      period: { startDate, endDate },
      rows,
      grandTotalDebit: Number(grandTotalDebit.toFixed(2)),
      grandTotalCredit: Number(grandTotalCredit.toFixed(2)),
      isBalanced,
    };
  }

  /**
   * General Ledger
   * Detailed transactions for each account with running balances
   */
  static async getGeneralLedger(accountId?: number, startDate?: string, endDate?: string) {
    const where: any = {
      status: EntryStatus.POSTED,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const items = await prisma.journalItem.findMany({
      where: {
        ...(accountId ? { accountId } : {}),
        journalEntry: where,
      },
      include: {
        account: true,
        partner: true,
        analyticAccount: true,
        journalEntry: {
          include: {
            journal: true,
          },
        },
      },
      orderBy: [{ journalEntry: { date: 'asc' } }, { id: 'asc' }],
    });

    // Group by account
    const accountsGrouped: Record<number, any> = {};

    for (const item of items) {
      if (!accountsGrouped[item.accountId]) {
        accountsGrouped[item.accountId] = {
          account: item.account,
          lines: [],
          totalDebit: 0,
          totalCredit: 0,
        };
      }

      const deb = Number(item.debit);
      const cred = Number(item.credit);
      accountsGrouped[item.accountId].totalDebit += deb;
      accountsGrouped[item.accountId].totalCredit += cred;

      accountsGrouped[item.accountId].lines.push({
        id: item.id,
        date: item.journalEntry.date,
        entryNumber: item.journalEntry.entryNumber,
        journal: item.journalEntry.journal.code,
        partner: item.partner?.name,
        analyticAccount: item.analyticAccount?.name,
        description: item.description,
        debit: deb,
        credit: cred,
      });
    }

    return Object.values(accountsGrouped);
  }

  /**
   * Aged Receivables (Debtors Aging)
   * Buckets: 0-30 days, 31-60 days, 61-90 days, 90+ days based on unpaid invoices
   */
  static async getAgedReceivables() {
    const invoices = await prisma.customerInvoice.findMany({
      where: {
        status: { in: [InvoiceStatus.POSTED, InvoiceStatus.PARTIALLY_PAID] },
        amountDue: { gt: 0 },
      },
      include: {
        customer: true,
      },
    });

    const now = new Date().getTime();

    const partnerAging: Record<string, {
      customer: string;
      totalDue: number;
      bucket0_30: number;
      bucket31_60: number;
      bucket61_90: number;
      bucket90Plus: number;
    }> = {};

    let totalOutstanding = 0;
    let total0_30 = 0;
    let total31_60 = 0;
    let total61_90 = 0;
    let total90Plus = 0;

    for (const inv of invoices) {
      const custName = inv.customer?.name || 'Unknown Customer';
      const dueAmount = Number(inv.amountDue);
      const dueDate = new Date(inv.dueDate).getTime();
      const daysOverdue = Math.max(0, Math.floor((now - dueDate) / (1000 * 60 * 60 * 24)));

      if (!partnerAging[custName]) {
        partnerAging[custName] = {
          customer: custName,
          totalDue: 0,
          bucket0_30: 0,
          bucket31_60: 0,
          bucket61_90: 0,
          bucket90Plus: 0,
        };
      }

      partnerAging[custName].totalDue += dueAmount;
      totalOutstanding += dueAmount;

      if (daysOverdue <= 30) {
        partnerAging[custName].bucket0_30 += dueAmount;
        total0_30 += dueAmount;
      } else if (daysOverdue <= 60) {
        partnerAging[custName].bucket31_60 += dueAmount;
        total31_60 += dueAmount;
      } else if (daysOverdue <= 90) {
        partnerAging[custName].bucket61_90 += dueAmount;
        total61_90 += dueAmount;
      } else {
        partnerAging[custName].bucket90Plus += dueAmount;
        total90Plus += dueAmount;
      }
    }

    return {
      customers: Object.values(partnerAging),
      totals: {
        totalOutstanding: Number(totalOutstanding.toFixed(2)),
        bucket0_30: Number(total0_30.toFixed(2)),
        bucket31_60: Number(total31_60.toFixed(2)),
        bucket61_90: Number(total61_90.toFixed(2)),
        bucket90Plus: Number(total90Plus.toFixed(2)),
      },
    };
  }

  /**
   * Aged Payables (Creditors Aging)
   * Buckets: 0-30 days, 31-60 days, 61-90 days, 90+ days based on unpaid vendor bills
   */
  static async getAgedPayables() {
    const bills = await prisma.vendorBill.findMany({
      where: {
        status: { in: [InvoiceStatus.POSTED, InvoiceStatus.PARTIALLY_PAID] },
        amountDue: { gt: 0 },
      },
      include: {
        vendor: true,
      },
    });

    const now = new Date().getTime();

    const vendorAging: Record<string, {
      vendor: string;
      totalDue: number;
      bucket0_30: number;
      bucket31_60: number;
      bucket61_90: number;
      bucket90Plus: number;
    }> = {};

    let totalOutstanding = 0;
    let total0_30 = 0;
    let total31_60 = 0;
    let total61_90 = 0;
    let total90Plus = 0;

    for (const bill of bills) {
      const vendorName = bill.vendor?.name || 'Unknown Vendor';
      const dueAmount = Number(bill.amountDue);
      const dueDate = new Date(bill.dueDate).getTime();
      const daysOverdue = Math.max(0, Math.floor((now - dueDate) / (1000 * 60 * 60 * 24)));

      if (!vendorAging[vendorName]) {
        vendorAging[vendorName] = {
          vendor: vendorName,
          totalDue: 0,
          bucket0_30: 0,
          bucket31_60: 0,
          bucket61_90: 0,
          bucket90Plus: 0,
        };
      }

      vendorAging[vendorName].totalDue += dueAmount;
      totalOutstanding += dueAmount;

      if (daysOverdue <= 30) {
        vendorAging[vendorName].bucket0_30 += dueAmount;
        total0_30 += dueAmount;
      } else if (daysOverdue <= 60) {
        vendorAging[vendorName].bucket31_60 += dueAmount;
        total31_60 += dueAmount;
      } else if (daysOverdue <= 90) {
        vendorAging[vendorName].bucket61_90 += dueAmount;
        total61_90 += dueAmount;
      } else {
        vendorAging[vendorName].bucket90Plus += dueAmount;
        total90Plus += dueAmount;
      }
    }

    return {
      vendors: Object.values(vendorAging),
      totals: {
        totalOutstanding: Number(totalOutstanding.toFixed(2)),
        bucket0_30: Number(total0_30.toFixed(2)),
        bucket31_60: Number(total31_60.toFixed(2)),
        bucket61_90: Number(total61_90.toFixed(2)),
        bucket90Plus: Number(total90Plus.toFixed(2)),
      },
    };
  }

  /**
   * Executive Dashboard KPIs & Chart Feeds
   */
  static async getDashboardKPIs() {
    const pnl = await this.getProfitAndLoss();
    const balanceSheet = await this.getBalanceSheet();
    const agedReceivables = await this.getAgedReceivables();
    const agedPayables = await this.getAgedPayables();

    // Cash and bank accounts balances
    const cashAndBankAccounts = balanceSheet.assets.accounts.filter(
      (a) => a.code === '1000' || a.code === '1010' || a.name.toLowerCase().includes('cash') || a.name.toLowerCase().includes('bank')
    );
    const cashBankTotal = cashAndBankAccounts.reduce((acc, a) => acc + a.total, 0);

    // Recent activity counts
    const activeInvoicesCount = await prisma.customerInvoice.count();
    const activeBillsCount = await prisma.vendorBill.count();
    const totalPaymentsCount = await prisma.payment.count();

    return {
      kpis: {
        totalRevenue: pnl.income.total,
        totalExpenses: pnl.expenses.total,
        netProfit: pnl.netProfit,
        cashBankBalance: Number(cashBankTotal.toFixed(2)),
        totalReceivables: agedReceivables.totals.totalOutstanding,
        totalPayables: agedPayables.totals.totalOutstanding,
      },
      counts: {
        invoices: activeInvoicesCount,
        bills: activeBillsCount,
        payments: totalPaymentsCount,
      },
      receivablesAging: agedReceivables.totals,
      payablesAging: agedPayables.totals,
      topIncomeAccounts: pnl.income.accounts.slice(0, 5),
      topExpenseAccounts: pnl.expenses.accounts.slice(0, 5),
    };
  }

  /**
   * Sales Analytics
   * Revenue, customer volume, product breakdown, and monthly revenue trends
   */
  static async getSalesAnalytics(startDate?: string, endDate?: string) {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const invoices = await prisma.customerInvoice.findMany({
      where: {
        status: { in: [InvoiceStatus.POSTED, InvoiceStatus.PARTIALLY_PAID] },
        ...(startDate || endDate ? { invoiceDate: dateFilter } : {}),
      },
      include: {
        customer: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { invoiceDate: 'asc' },
    });

    let totalRevenue = 0;
    let totalTax = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;

    const customerMap: Record<string, { customer: string; count: number; total: number }> = {};
    const productMap: Record<string, { name: string; code: string; qty: number; total: number }> = {};
    const monthlyMap: Record<string, { month: string; count: number; total: number }> = {};

    for (const inv of invoices) {
      const tot = Number(inv.totalAmount);
      const tax = Number(inv.taxAmount);
      const paid = Number(inv.paidAmount);
      const due = Number(inv.amountDue);

      totalRevenue += tot;
      totalTax += tax;
      totalPaid += paid;
      totalOutstanding += due;

      // Customer
      const custName = inv.customer?.name || 'Walk-in Customer';
      if (!customerMap[custName]) customerMap[custName] = { customer: custName, count: 0, total: 0 };
      customerMap[custName].count += 1;
      customerMap[custName].total += tot;

      // Month
      const monthKey = inv.invoiceDate.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { month: monthKey, count: 0, total: 0 };
      monthlyMap[monthKey].count += 1;
      monthlyMap[monthKey].total += tot;

      // Lines / Products
      for (const line of inv.lines) {
        const pName = line.product?.name || line.description || 'Custom Item';
        const pCode = `PROD-${line.productId}`;
        const qty = Number(line.quantity);
        const sub = Number(line.subtotal);

        if (!productMap[pName]) productMap[pName] = { name: pName, code: pCode, qty: 0, total: 0 };
        productMap[pName].qty += qty;
        productMap[pName].total += sub;
      }
    }

    return {
      summary: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalTax: Number(totalTax.toFixed(2)),
        totalPaid: Number(totalPaid.toFixed(2)),
        totalOutstanding: Number(totalOutstanding.toFixed(2)),
        invoiceCount: invoices.length,
      },
      byCustomer: Object.values(customerMap).sort((a, b) => b.total - a.total),
      byProduct: Object.values(productMap).sort((a, b) => b.total - a.total),
      monthlyTrends: Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month)),
    };
  }

  /**
   * Purchase Analytics
   * Expenses, vendor spend, product purchases, and monthly spending trends
   */
  static async getPurchaseAnalytics(startDate?: string, endDate?: string) {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const bills = await prisma.vendorBill.findMany({
      where: {
        status: { in: [InvoiceStatus.POSTED, InvoiceStatus.PARTIALLY_PAID] },
        ...(startDate || endDate ? { billDate: dateFilter } : {}),
      },
      include: {
        vendor: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { billDate: 'asc' },
    });

    let totalSpend = 0;
    let totalTax = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;

    const vendorMap: Record<string, { vendor: string; count: number; total: number }> = {};
    const productMap: Record<string, { name: string; code: string; qty: number; total: number }> = {};
    const monthlyMap: Record<string, { month: string; count: number; total: number }> = {};

    for (const bill of bills) {
      const tot = Number(bill.totalAmount);
      const tax = Number(bill.taxAmount);
      const paid = Number(bill.paidAmount);
      const due = Number(bill.amountDue);

      totalSpend += tot;
      totalTax += tax;
      totalPaid += paid;
      totalOutstanding += due;

      // Vendor
      const vendName = bill.vendor?.name || 'General Supplier';
      if (!vendorMap[vendName]) vendorMap[vendName] = { vendor: vendName, count: 0, total: 0 };
      vendorMap[vendName].count += 1;
      vendorMap[vendName].total += tot;

      // Month
      const monthKey = bill.billDate.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { month: monthKey, count: 0, total: 0 };
      monthlyMap[monthKey].count += 1;
      monthlyMap[monthKey].total += tot;

      // Lines / Products
      for (const line of bill.lines) {
        const pName = line.product?.name || line.description || 'Supplies Item';
        const pCode = `PROD-${line.productId}`;
        const qty = Number(line.quantity);
        const sub = Number(line.subtotal);

        if (!productMap[pName]) productMap[pName] = { name: pName, code: pCode, qty: 0, total: 0 };
        productMap[pName].qty += qty;
        productMap[pName].total += sub;
      }
    }

    return {
      summary: {
        totalSpend: Number(totalSpend.toFixed(2)),
        totalTax: Number(totalTax.toFixed(2)),
        totalPaid: Number(totalPaid.toFixed(2)),
        totalOutstanding: Number(totalOutstanding.toFixed(2)),
        billCount: bills.length,
      },
      byVendor: Object.values(vendorMap).sort((a, b) => b.total - a.total),
      byProduct: Object.values(productMap).sort((a, b) => b.total - a.total),
      monthlyTrends: Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month)),
    };
  }
}
