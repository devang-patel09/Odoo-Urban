import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { 
  BarChart3, 
  PieChart, 
  Scale, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Clock, 
  DollarSign, 
  ArrowRight 
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pnl' | 'balance-sheet' | 'trial-balance' | 'aged-receivables' | 'aged-payables'>('pnl');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  // 1. Fetch Profit & Loss
  const { data: pnl, isLoading: pnlLoading } = useQuery({
    queryKey: ['report-pnl', startDate, endDate],
    queryFn: async () => {
      const res = await api.get('/reports/profit-and-loss', {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });
      return res.data.data;
    },
    enabled: activeTab === 'pnl',
  });

  // 2. Fetch Balance Sheet
  const { data: balanceSheet, isLoading: bsLoading } = useQuery({
    queryKey: ['report-balance-sheet', asOfDate],
    queryFn: async () => {
      const res = await api.get('/reports/balance-sheet', {
        params: { asOfDate: asOfDate || undefined },
      });
      return res.data.data;
    },
    enabled: activeTab === 'balance-sheet',
  });

  // 3. Fetch Trial Balance
  const { data: trialBalance, isLoading: tbLoading } = useQuery({
    queryKey: ['report-trial-balance', startDate, endDate],
    queryFn: async () => {
      const res = await api.get('/reports/trial-balance', {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });
      return res.data.data;
    },
    enabled: activeTab === 'trial-balance',
  });

  // 4. Fetch Aged Receivables
  const { data: agedReceivables, isLoading: arLoading } = useQuery({
    queryKey: ['report-aged-receivables'],
    queryFn: async () => {
      const res = await api.get('/reports/aged-receivables');
      return res.data.data;
    },
    enabled: activeTab === 'aged-receivables',
  });

  // 5. Fetch Aged Payables
  const { data: agedPayables, isLoading: apLoading } = useQuery({
    queryKey: ['report-aged-payables'],
    queryFn: async () => {
      const res = await api.get('/reports/aged-payables');
      return res.data.data;
    },
    enabled: activeTab === 'aged-payables',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-[#714B67]" />
            Financial Statements & Compliance Reports
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Dynamic, unmanipulated accounting statements computed directly from posted double-entry journal items
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print / PDF Export
        </button>
      </div>

      {/* Report Type Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200">
        {[
          { id: 'pnl', label: 'Profit & Loss (P&L)' },
          { id: 'balance-sheet', label: 'Balance Sheet' },
          { id: 'trial-balance', label: 'Trial Balance' },
          { id: 'aged-receivables', label: 'Aged Receivables' },
          { id: 'aged-payables', label: 'Aged Payables' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#714B67] text-[#714B67] bg-[#714B67]/5'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Controls / Date Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {activeTab === 'balance-sheet' ? (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-700">As of Date:</span>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#714B67]"
            />
          </div>
        ) : activeTab === 'pnl' || activeTab === 'trial-balance' ? (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-gray-700">Reporting Period:</span>
            <input
              type="date"
              value={startDate}
              placeholder="Start Date"
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#714B67]"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="date"
              value={endDate}
              placeholder="End Date"
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#714B67]"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-xs text-rose-600 hover:underline"
              >
                Clear Dates
              </button>
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-500 font-medium">
            Live aging calculated based on current date overdue intervals (0-30, 31-60, 61-90, 90+ days)
          </div>
        )}

        <div className="text-xs text-gray-400">
          All values in Indian Rupees (₹)
        </div>
      </div>

      {/* 1. PROFIT AND LOSS TAB */}
      {activeTab === 'pnl' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Profit & Loss Statement</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {startDate && endDate ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}` : 'All Time Posted Entries'}
              </p>
            </div>
            <div className={`text-right p-3 rounded-xl ${pnl?.netProfit >= 0 ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
              <span className="text-xs block font-medium">Net Profit / (Loss)</span>
              <span className="text-xl font-bold">
                ₹{Number(pnl?.netProfit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {pnlLoading ? (
            <div className="p-8 text-center text-gray-500">Calculating Income & Expense ledger totals...</div>
          ) : (
            <div className="space-y-6">
              {/* Income Section */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Operating Revenue / Income
                </h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600">
                      <tr>
                        <th className="py-2.5 px-4">Account Code</th>
                        <th className="py-2.5 px-4">Account Name</th>
                        <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pnl?.income.accounts.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-4 text-center text-gray-400">No income posted</td>
                        </tr>
                      ) : (
                        pnl?.income.accounts.map((acc: any) => (
                          <tr key={acc.id} className="hover:bg-gray-50">
                            <td className="py-2.5 px-4 font-mono font-medium text-gray-700">{acc.code}</td>
                            <td className="py-2.5 px-4 text-gray-900">{acc.name}</td>
                            <td className="py-2.5 px-4 text-right font-semibold text-emerald-700">
                              ₹{Number(acc.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="bg-emerald-50/50 font-bold border-t border-emerald-100">
                      <tr>
                        <td colSpan={2} className="py-3 px-4 text-emerald-950">Total Operating Income</td>
                        <td className="py-3 px-4 text-right text-emerald-700 text-sm">
                          ₹{Number(pnl?.income.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Expense Section */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                  Operating Expenses & COGS
                </h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600">
                      <tr>
                        <th className="py-2.5 px-4">Account Code</th>
                        <th className="py-2.5 px-4">Account Name</th>
                        <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pnl?.expenses.accounts.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-4 text-center text-gray-400">No expenses posted</td>
                        </tr>
                      ) : (
                        pnl?.expenses.accounts.map((acc: any) => (
                          <tr key={acc.id} className="hover:bg-gray-50">
                            <td className="py-2.5 px-4 font-mono font-medium text-gray-700">{acc.code}</td>
                            <td className="py-2.5 px-4 text-gray-900">{acc.name}</td>
                            <td className="py-2.5 px-4 text-right font-semibold text-rose-600">
                              ₹{Number(acc.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="bg-rose-50/50 font-bold border-t border-rose-100">
                      <tr>
                        <td colSpan={2} className="py-3 px-4 text-rose-950">Total Operating Expenses</td>
                        <td className="py-3 px-4 text-right text-rose-600 text-sm">
                          ₹{Number(pnl?.expenses.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Net Profit Summary */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-sm">
                <span className="font-bold text-gray-900">Net Profit for the Period:</span>
                <span className={`text-xl font-extrabold ${pnl?.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  ₹{Number(pnl?.netProfit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. BALANCE SHEET TAB */}
      {activeTab === 'balance-sheet' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Balance Sheet</h2>
              <p className="text-xs text-gray-500 mt-0.5">As of {new Date(asOfDate).toLocaleDateString()}</p>
            </div>
            {balanceSheet && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Accounting Equation Verified (Assets = Liabilities + Equity)</span>
              </div>
            )}
          </div>

          {bsLoading ? (
            <div className="p-8 text-center text-gray-500">Computing asset, liability, and equity positions...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Assets */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Assets (Dr)
                  </h3>
                  <span className="font-bold text-sm text-[#714B67]">
                    ₹{Number(balanceSheet?.assets.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <tbody className="divide-y divide-gray-100">
                      {balanceSheet?.assets.accounts.map((acc: any) => (
                        <tr key={acc.id} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3 font-mono text-gray-500">{acc.code}</td>
                          <td className="py-2.5 px-3 font-medium text-gray-800">{acc.name}</td>
                          <td className="py-2.5 px-3 text-right font-semibold text-gray-900">
                            ₹{Number(acc.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Liabilities & Equity */}
              <div className="space-y-6">
                {/* Liabilities */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Liabilities (Cr)
                    </h3>
                    <span className="font-bold text-sm text-[#714B67]">
                      ₹{Number(balanceSheet?.liabilities.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <tbody className="divide-y divide-gray-100">
                        {balanceSheet?.liabilities.accounts.map((acc: any) => (
                          <tr key={acc.id} className="hover:bg-gray-50">
                            <td className="py-2.5 px-3 font-mono text-gray-500">{acc.code}</td>
                            <td className="py-2.5 px-3 font-medium text-gray-800">{acc.name}</td>
                            <td className="py-2.5 px-3 text-right font-semibold text-gray-900">
                              ₹{Number(acc.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Equity */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Equity (Cr)
                    </h3>
                    <span className="font-bold text-sm text-[#714B67]">
                      ₹{Number(balanceSheet?.equity.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <tbody className="divide-y divide-gray-100">
                        {balanceSheet?.equity.accounts.map((acc: any) => (
                          <tr key={acc.id} className="hover:bg-gray-50">
                            <td className="py-2.5 px-3 font-mono text-gray-500">{acc.code}</td>
                            <td className="py-2.5 px-3 font-medium text-gray-800">{acc.name}</td>
                            <td className="py-2.5 px-3 text-right font-semibold text-gray-900">
                              ₹{Number(acc.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-purple-50/50">
                          <td className="py-2.5 px-3 font-mono text-purple-700">P&L</td>
                          <td className="py-2.5 px-3 font-semibold text-purple-900">Current Year Retained Earnings</td>
                          <td className="py-2.5 px-3 text-right font-bold text-purple-900">
                            ₹{Number(balanceSheet?.equity.currentYearProfit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Total Liabilities & Equity Box */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-700">Total Liabilities & Equity:</span>
                  <span className="text-sm text-[#714B67]">
                    ₹{Number(balanceSheet?.totalLiabilitiesAndEquity || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. TRIAL BALANCE TAB */}
      {activeTab === 'trial-balance' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Trial Balance</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Every account with debit, credit, and net balances. Total Debit must equal Total Credit.
              </p>
            </div>
            {trialBalance && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Balanced: ∑ Dr (₹{trialBalance.grandTotalDebit}) == ∑ Cr (₹{trialBalance.grandTotalCredit})</span>
              </div>
            )}
          </div>

          {tbLoading ? (
            <div className="p-8 text-center text-gray-500">Calculating trial balance...</div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600">
                  <tr>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Account Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Debit (₹)</th>
                    <th className="py-3 px-4 text-right">Credit (₹)</th>
                    <th className="py-3 px-4 text-right">Net Debit (₹)</th>
                    <th className="py-3 px-4 text-right">Net Credit (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {trialBalance?.rows.map((row: any) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-4 font-bold text-gray-800 font-sans">{row.code}</td>
                      <td className="py-2.5 px-4 font-medium text-gray-900 font-sans">{row.name}</td>
                      <td className="py-2.5 px-4 text-gray-500 font-sans">{row.type}</td>
                      <td className="py-2.5 px-4 text-right text-gray-700">
                        {row.debit > 0 ? `₹${row.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-right text-gray-700">
                        {row.credit > 0 ? `₹${row.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold text-gray-900">
                        {row.netDebit > 0 ? `₹${row.netDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold text-gray-900">
                        {row.netCredit > 0 ? `₹${row.netCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-purple-50 font-bold border-t-2 border-purple-200 text-xs font-mono">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 font-sans uppercase text-purple-900 text-sm">
                      Grand Total (Balanced)
                    </td>
                    <td className="py-3 px-4 text-right text-[#714B67] text-sm">
                      ₹{Number(trialBalance?.grandTotalDebit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-[#714B67] text-sm">
                      ₹{Number(trialBalance?.grandTotalCredit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. AGED RECEIVABLES TAB */}
      {activeTab === 'aged-receivables' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Aged Receivables (Customer Aging)</h2>
              <p className="text-xs text-gray-500 mt-0.5">Tracking unpaid invoices across overdue intervals</p>
            </div>
            <div className="text-right p-3 bg-rose-50 rounded-xl text-rose-900">
              <span className="text-xs block font-medium">Total Outstanding</span>
              <span className="text-xl font-bold">
                ₹{Number(agedReceivables?.totals.totalOutstanding || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {arLoading ? (
            <div className="p-8 text-center text-gray-500">Calculating aged receivables...</div>
          ) : !agedReceivables || agedReceivables.customers.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">All customer accounts are current!</p>
              <p className="text-xs text-gray-400">No overdue receivables at this time.</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600">
                  <tr>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4 text-right">0-30 Days</th>
                    <th className="py-3 px-4 text-right">31-60 Days</th>
                    <th className="py-3 px-4 text-right">61-90 Days</th>
                    <th className="py-3 px-4 text-right">90+ Days</th>
                    <th className="py-3 px-4 text-right">Total Due (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {agedReceivables.customers.map((c: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="py-2.5 px-4 font-semibold text-gray-900">{c.customer}</td>
                      <td className="py-2.5 px-4 text-right text-gray-700">
                        ₹{Number(c.bucket0_30).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right text-amber-700">
                        ₹{Number(c.bucket31_60).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right text-orange-700">
                        ₹{Number(c.bucket61_90).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-rose-600">
                        ₹{Number(c.bucket90Plus).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-gray-900">
                        ₹{Number(c.totalDue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. AGED PAYABLES TAB */}
      {activeTab === 'aged-payables' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Aged Payables (Vendor Aging)</h2>
              <p className="text-xs text-gray-500 mt-0.5">Tracking unpaid bills across supplier payment terms</p>
            </div>
            <div className="text-right p-3 bg-gray-50 rounded-xl text-gray-900">
              <span className="text-xs block font-medium">Total Payables Due</span>
              <span className="text-xl font-bold text-[#714B67]">
                ₹{Number(agedPayables?.totals.totalOutstanding || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {apLoading ? (
            <div className="p-8 text-center text-gray-500">Calculating aged payables...</div>
          ) : !agedPayables || agedPayables.vendors.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">All vendor accounts are settled!</p>
              <p className="text-xs text-gray-400">No overdue vendor bills.</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600">
                  <tr>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4 text-right">0-30 Days</th>
                    <th className="py-3 px-4 text-right">31-60 Days</th>
                    <th className="py-3 px-4 text-right">61-90 Days</th>
                    <th className="py-3 px-4 text-right">90+ Days</th>
                    <th className="py-3 px-4 text-right">Total Due (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {agedPayables.vendors.map((v: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="py-2.5 px-4 font-semibold text-gray-900">{v.vendor}</td>
                      <td className="py-2.5 px-4 text-right text-gray-700">
                        ₹{Number(v.bucket0_30).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right text-amber-700">
                        ₹{Number(v.bucket31_60).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right text-orange-700">
                        ₹{Number(v.bucket61_90).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-rose-600">
                        ₹{Number(v.bucket90Plus).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-gray-900">
                        ₹{Number(v.totalDue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
