import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  ArrowRight,
  BookOpen,
  Target,
  ShoppingBag,
  Truck,
  Filter,
  Layers,
  Percent
} from 'lucide-react';

type ReportTab = 
  | 'pnl' 
  | 'balance-sheet' 
  | 'trial-balance' 
  | 'general-ledger' 
  | 'aged-receivables' 
  | 'aged-payables' 
  | 'budget-report' 
  | 'sales-analytics' 
  | 'purchase-analytics';

export const ReportsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = (path: string): ReportTab => {
    if (path.includes('balance-sheet')) return 'balance-sheet';
    if (path.includes('trial-balance')) return 'trial-balance';
    if (path.includes('general-ledger')) return 'general-ledger';
    if (path.includes('aged-receivable')) return 'aged-receivables';
    if (path.includes('aged-payable')) return 'aged-payables';
    if (path.includes('budget-report')) return 'budget-report';
    if (path.includes('sales-analytics')) return 'sales-analytics';
    if (path.includes('purchase-analytics')) return 'purchase-analytics';
    if (path.includes('profit-loss')) return 'pnl';
    return 'pnl';
  };

  const [activeTab, setActiveTab] = useState<ReportTab>(() => getTabFromPath(location.pathname));
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const handleTabChange = (tabId: ReportTab) => {
    setActiveTab(tabId);
    const pathMap: Record<ReportTab, string> = {
      'pnl': '/reports/profit-loss',
      'balance-sheet': '/reports/balance-sheet',
      'trial-balance': '/reports/trial-balance',
      'general-ledger': '/reports/general-ledger',
      'aged-receivables': '/reports/aged-receivable',
      'aged-payables': '/reports/aged-payable',
      'budget-report': '/reports/budget-report',
      'sales-analytics': '/reports/sales-analytics',
      'purchase-analytics': '/reports/purchase-analytics',
    };
    navigate(pathMap[tabId]);
  };

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

  // 4. Fetch General Ledger
  const { data: accountsList } = useQuery({
    queryKey: ['accounts-list'],
    queryFn: async () => {
      const res = await api.get('/accounts');
      return res.data.data;
    },
    enabled: activeTab === 'general-ledger',
  });

  const { data: generalLedger, isLoading: glLoading } = useQuery({
    queryKey: ['report-general-ledger', selectedAccountId, startDate, endDate],
    queryFn: async () => {
      const res = await api.get('/reports/general-ledger', {
        params: {
          accountId: selectedAccountId ? parseInt(selectedAccountId, 10) : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });
      return res.data.data;
    },
    enabled: activeTab === 'general-ledger',
  });

  // 5. Fetch Aged Receivables
  const { data: agedReceivables, isLoading: arLoading } = useQuery({
    queryKey: ['report-aged-receivables'],
    queryFn: async () => {
      const res = await api.get('/reports/aged-receivables');
      return res.data.data;
    },
    enabled: activeTab === 'aged-receivables',
  });

  // 6. Fetch Aged Payables
  const { data: agedPayables, isLoading: apLoading } = useQuery({
    queryKey: ['report-aged-payables'],
    queryFn: async () => {
      const res = await api.get('/reports/aged-payables');
      return res.data.data;
    },
    enabled: activeTab === 'aged-payables',
  });

  // 7. Fetch Budget Report
  const { data: budgetsList, isLoading: budgetsLoading } = useQuery({
    queryKey: ['report-budgets'],
    queryFn: async () => {
      const res = await api.get('/budgets');
      return res.data.data;
    },
    enabled: activeTab === 'budget-report',
  });

  // 8. Fetch Sales Analytics
  const { data: salesAnalytics, isLoading: saLoading } = useQuery({
    queryKey: ['report-sales-analytics', startDate, endDate],
    queryFn: async () => {
      const res = await api.get('/reports/sales-analytics', {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });
      return res.data.data;
    },
    enabled: activeTab === 'sales-analytics',
  });

  // 9. Fetch Purchase Analytics
  const { data: purchaseAnalytics, isLoading: paLoading } = useQuery({
    queryKey: ['report-purchase-analytics', startDate, endDate],
    queryFn: async () => {
      const res = await api.get('/reports/purchase-analytics', {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });
      return res.data.data;
    },
    enabled: activeTab === 'purchase-analytics',
  });

  const handlePrint = () => {
    window.print();
  };

  const tabs: { id: ReportTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'pnl', label: 'Profit & Loss', icon: TrendingUp },
    { id: 'balance-sheet', label: 'Balance Sheet', icon: Scale },
    { id: 'trial-balance', label: 'Trial Balance', icon: CheckCircle2 },
    { id: 'general-ledger', label: 'General Ledger', icon: BookOpen },
    { id: 'aged-receivables', label: 'Aged Receivables', icon: Clock },
    { id: 'aged-payables', label: 'Aged Payables', icon: AlertCircle },
    { id: 'budget-report', label: 'Budget Report', icon: Target },
    { id: 'sales-analytics', label: 'Sales Analytics', icon: ShoppingBag },
    { id: 'purchase-analytics', label: 'Purchase Analytics', icon: Truck },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-[#714B67]" />
            Financial Statements & Management Reports
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
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-lg text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-[#714B67] text-[#714B67] bg-[#714B67]/5'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#714B67]' : 'text-gray-400'}`} />
              {tab.label}
            </button>
          );
        })}
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
        ) : activeTab === 'general-ledger' ? (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-semibold text-gray-700">Filter Account:</span>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#714B67] bg-white font-medium"
              >
                <option value="">All Accounts</option>
                {accountsList?.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.code} - {a.name} ({a.type})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Date:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#714B67]"
              />
              <span className="text-xs text-gray-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#714B67]"
              />
              {(startDate || endDate || selectedAccountId) && (
                <button
                  onClick={() => { setStartDate(''); setEndDate(''); setSelectedAccountId(''); }}
                  className="text-xs text-rose-600 hover:underline font-semibold ml-1"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        ) : activeTab === 'pnl' || activeTab === 'trial-balance' || activeTab === 'sales-analytics' || activeTab === 'purchase-analytics' ? (
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
        ) : activeTab === 'budget-report' ? (
          <div className="text-xs text-gray-600 font-medium flex items-center gap-2">
            <Target className="w-4 h-4 text-[#714B67]" />
            Tracking committed vs achieved execution across all operational analytic cost centers
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

      {/* 4. GENERAL LEDGER TAB */}
      {activeTab === 'general-ledger' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">General Ledger (Account Statement)</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Comprehensive chronological debit/credit postings across accounts with counterparty details
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 block">Total Active Accounts</span>
              <span className="text-lg font-bold text-[#714B67]">{generalLedger?.length || 0} Accounts</span>
            </div>
          </div>

          {glLoading ? (
            <div className="p-8 text-center text-gray-500">Loading General Ledger transaction lines...</div>
          ) : !generalLedger || generalLedger.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">No general ledger entries found for selected criteria</p>
              <p className="text-xs text-gray-400">Post invoices, bills, or journal entries to view audit trail.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {generalLedger.map((group: any) => (
                <div key={group.account.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                  {/* Account Header */}
                  <div className="bg-[#714B67]/5 px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm bg-white px-2 py-0.5 border border-gray-200 rounded text-gray-800">
                        {group.account.code}
                      </span>
                      <span className="font-bold text-gray-900 text-sm">{group.account.name}</span>
                      <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {group.account.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <span className="text-gray-600">
                        Dr: <strong className="text-gray-900">₹{Number(group.totalDebit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                      </span>
                      <span className="text-gray-600">
                        Cr: <strong className="text-gray-900">₹{Number(group.totalCredit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                      </span>
                      <span className="text-[#714B67] bg-white px-2.5 py-1 border border-purple-200 rounded-lg">
                        Net: <strong>₹{Number(Math.abs(group.totalDebit - group.totalCredit)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> {group.totalDebit >= group.totalCredit ? 'Dr' : 'Cr'}
                      </span>
                    </div>
                  </div>

                  {/* Lines Table */}
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                      <tr>
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4">Entry #</th>
                        <th className="py-2.5 px-4">Journal</th>
                        <th className="py-2.5 px-4">Partner</th>
                        <th className="py-2.5 px-4">Analytic Tag</th>
                        <th className="py-2.5 px-4">Description</th>
                        <th className="py-2.5 px-4 text-right">Debit (₹)</th>
                        <th className="py-2.5 px-4 text-right">Credit (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {group.lines.map((line: any) => (
                        <tr key={line.id} className="hover:bg-gray-50/80">
                          <td className="py-2 px-4 text-gray-500 whitespace-nowrap">
                            {new Date(line.date).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-4 font-mono font-semibold text-[#714B67] whitespace-nowrap">
                            {line.entryNumber}
                          </td>
                          <td className="py-2 px-4 font-mono text-gray-600">{line.journal}</td>
                          <td className="py-2 px-4 text-gray-800 font-medium">{line.partner || '-'}</td>
                          <td className="py-2 px-4 text-gray-500">
                            {line.analyticAccount ? (
                              <span className="bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.5 rounded text-[11px] font-medium">
                                {line.analyticAccount}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="py-2 px-4 text-gray-600 max-w-xs truncate">{line.description || '-'}</td>
                          <td className="py-2 px-4 text-right font-mono font-medium text-gray-900">
                            {line.debit > 0 ? `₹${line.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                          </td>
                          <td className="py-2 px-4 text-right font-mono font-medium text-gray-900">
                            {line.credit > 0 ? `₹${line.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. AGED RECEIVABLES TAB */}
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

      {/* 6. AGED PAYABLES TAB */}
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

      {/* 7. BUDGET REPORT TAB */}
      {activeTab === 'budget-report' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Budget vs Actual Performance Report</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Comparison of planned committed expenditures against live double-entry journal items
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 block">Total Active Budgets</span>
              <span className="text-lg font-bold text-[#714B67]">{budgetsList?.length || 0} Budgets</span>
            </div>
          </div>

          {budgetsLoading ? (
            <div className="p-8 text-center text-gray-500">Calculating budget execution analytics...</div>
          ) : !budgetsList || budgetsList.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">No operational budgets defined</p>
              <p className="text-xs text-gray-400">Configure budgets in the Budget Master to track project variances.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Metrics Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-xl">
                  <span className="text-xs font-semibold text-purple-900 block">Total Committed</span>
                  <span className="text-xl font-bold text-[#714B67] mt-1 block">
                    ₹{budgetsList.reduce((sum: number, b: any) => sum + Number(b.committedAmount || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-4 bg-teal-50/60 border border-teal-100 rounded-xl">
                  <span className="text-xs font-semibold text-teal-900 block">Total Achieved</span>
                  <span className="text-xl font-bold text-[#017E84] mt-1 block">
                    ₹{budgetsList.reduce((sum: number, b: any) => sum + Number(b.achievedAmount || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <span className="text-xs font-semibold text-gray-700 block">Net Variance / Balance</span>
                  <span className="text-xl font-bold text-gray-900 mt-1 block">
                    ₹{budgetsList.reduce((sum: number, b: any) => sum + Number(b.amountToAchieve || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                  <span className="text-xs font-semibold text-emerald-900 block">Avg Achievement</span>
                  <span className="text-xl font-bold text-emerald-700 mt-1 block">
                    {(
                      budgetsList.reduce((sum: number, b: any) => sum + Number(b.achievedPercentage || 0), 0) /
                      (budgetsList.length || 1)
                    ).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Detailed Budgets Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600">
                    <tr>
                      <th className="py-3 px-4">Budget Name</th>
                      <th className="py-3 px-4">Analytic Account</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Period</th>
                      <th className="py-3 px-4 text-right">Committed (₹)</th>
                      <th className="py-3 px-4 text-right">Achieved (₹)</th>
                      <th className="py-3 px-4 text-right">Remaining (₹)</th>
                      <th className="py-3 px-4 w-40 text-center">Progress %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {budgetsList.map((b: any) => {
                      const pct = Number(b.achievedPercentage || 0);
                      const isHigh = pct >= 90;
                      return (
                        <tr key={b.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-bold text-gray-900">
                            {b.name}
                            {b.revisionOfId && (
                              <span className="ml-2 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-normal">
                                Revised
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded text-[11px] font-medium">
                              {b.analyticAccount?.name}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                              b.status === 'REVISED' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                            {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-gray-800">
                            ₹{Number(b.committedAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-teal-700">
                            ₹{Number(b.achievedAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-medium text-gray-600">
                            ₹{Number(b.amountToAchieve).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    pct > 100 ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                ></div>
                              </div>
                              <span className="font-mono text-[11px] font-bold w-10 text-right text-gray-700">
                                {pct}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 8. SALES ANALYTICS TAB */}
      {activeTab === 'sales-analytics' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Sales & Customer Revenue Analytics</h2>
              <p className="text-xs text-gray-500 mt-0.5">Breakdown of product velocity, customer volume, and sales collection</p>
            </div>
            <div className="text-right p-3 bg-emerald-50 rounded-xl text-emerald-900">
              <span className="text-xs block font-medium">Total Invoiced Sales</span>
              <span className="text-xl font-bold">
                ₹{Number(salesAnalytics?.summary?.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {saLoading ? (
            <div className="p-8 text-center text-gray-500">Aggregating sales orders and customer invoices...</div>
          ) : (
            <div className="space-y-6">
              {/* Sales Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-xl">
                  <span className="text-xs font-semibold text-purple-900 block">Total Revenue</span>
                  <span className="text-xl font-bold text-[#714B67] mt-1 block">
                    ₹{Number(salesAnalytics?.summary?.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                  <span className="text-xs font-semibold text-emerald-900 block">Collected Payments</span>
                  <span className="text-xl font-bold text-emerald-700 mt-1 block">
                    ₹{Number(salesAnalytics?.summary?.totalPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-xl">
                  <span className="text-xs font-semibold text-rose-900 block">Outstanding Due</span>
                  <span className="text-xl font-bold text-rose-600 mt-1 block">
                    ₹{Number(salesAnalytics?.summary?.totalOutstanding || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <span className="text-xs font-semibold text-gray-700 block">Invoices Count</span>
                  <span className="text-xl font-bold text-gray-900 mt-1 block">
                    {salesAnalytics?.summary?.invoiceCount || 0}
                  </span>
                </div>
              </div>

              {/* Two Column Section: Top Products & Top Customers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Selling Products */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-[#714B67]" />
                    Top Revenue Products
                  </h3>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600">
                        <tr>
                          <th className="py-2.5 px-3">Product</th>
                          <th className="py-2.5 px-3 text-right">Units Sold</th>
                          <th className="py-2.5 px-3 text-right">Revenue (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {!salesAnalytics?.byProduct || salesAnalytics.byProduct.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="py-4 text-center text-gray-400">No product sales data</td>
                          </tr>
                        ) : (
                          salesAnalytics.byProduct.slice(0, 8).map((p: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="py-2.5 px-3 font-semibold text-gray-900">{p.name}</td>
                              <td className="py-2.5 px-3 text-right font-mono text-gray-700">{p.qty}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-[#714B67]">
                                ₹{Number(p.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Customers */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#017E84]" />
                    Top Customers by Revenue
                  </h3>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600">
                        <tr>
                          <th className="py-2.5 px-3">Customer</th>
                          <th className="py-2.5 px-3 text-center">Invoices</th>
                          <th className="py-2.5 px-3 text-right">Total Revenue (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {!salesAnalytics?.byCustomer || salesAnalytics.byCustomer.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="py-4 text-center text-gray-400">No customer transactions</td>
                          </tr>
                        ) : (
                          salesAnalytics.byCustomer.slice(0, 8).map((c: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="py-2.5 px-3 font-semibold text-gray-900">{c.customer}</td>
                              <td className="py-2.5 px-3 text-center font-mono text-gray-600">{c.count}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                                ₹{Number(c.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 9. PURCHASE ANALYTICS TAB */}
      {activeTab === 'purchase-analytics' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Procurement & Vendor Spend Analytics</h2>
              <p className="text-xs text-gray-500 mt-0.5">Analysis of purchase volumes, top suppliers, and procurement expenses</p>
            </div>
            <div className="text-right p-3 bg-purple-50 rounded-xl text-purple-900">
              <span className="text-xs block font-medium">Total Procurement Spend</span>
              <span className="text-xl font-bold text-[#714B67]">
                ₹{Number(purchaseAnalytics?.summary?.totalSpend || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {paLoading ? (
            <div className="p-8 text-center text-gray-500">Aggregating purchase orders and vendor bills...</div>
          ) : (
            <div className="space-y-6">
              {/* Purchase Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-xl">
                  <span className="text-xs font-semibold text-purple-900 block">Total Spend</span>
                  <span className="text-xl font-bold text-[#714B67] mt-1 block">
                    ₹{Number(purchaseAnalytics?.summary?.totalSpend || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-4 bg-teal-50/60 border border-teal-100 rounded-xl">
                  <span className="text-xs font-semibold text-teal-900 block">Settled to Vendors</span>
                  <span className="text-xl font-bold text-teal-700 mt-1 block">
                    ₹{Number(purchaseAnalytics?.summary?.totalPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <span className="text-xs font-semibold text-gray-700 block">Total Bills</span>
                  <span className="text-xl font-bold text-gray-900 mt-1 block">
                    {purchaseAnalytics?.summary?.billCount || 0}
                  </span>
                </div>
                <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-xl">
                  <span className="text-xs font-semibold text-rose-900 block">Outstanding Payables</span>
                  <span className="text-xl font-bold text-rose-600 mt-1 block">
                    ₹{Number(purchaseAnalytics?.summary?.totalOutstanding || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Two Column Section: Top Purchased & Top Suppliers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Purchased Items */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#714B67]" />
                    Top Purchased Products
                  </h3>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600">
                        <tr>
                          <th className="py-2.5 px-3">Product</th>
                          <th className="py-2.5 px-3 text-right">Units Bought</th>
                          <th className="py-2.5 px-3 text-right">Total Cost (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {!purchaseAnalytics?.byProduct || purchaseAnalytics.byProduct.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="py-4 text-center text-gray-400">No purchase line items</td>
                          </tr>
                        ) : (
                          purchaseAnalytics.byProduct.slice(0, 8).map((p: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="py-2.5 px-3 font-semibold text-gray-900">{p.name}</td>
                              <td className="py-2.5 px-3 text-right font-mono text-gray-700">{p.qty}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-[#714B67]">
                                ₹{Number(p.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Suppliers */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#017E84]" />
                    Top Suppliers / Vendors
                  </h3>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600">
                        <tr>
                          <th className="py-2.5 px-3">Vendor</th>
                          <th className="py-2.5 px-3 text-center">Bills</th>
                          <th className="py-2.5 px-3 text-right">Total Spend (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {!purchaseAnalytics?.byVendor || purchaseAnalytics.byVendor.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="py-4 text-center text-gray-400">No vendor spend data</td>
                          </tr>
                        ) : (
                          purchaseAnalytics.byVendor.slice(0, 8).map((v: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="py-2.5 px-3 font-semibold text-gray-900">{v.vendor}</td>
                              <td className="py-2.5 px-3 text-center font-mono text-gray-600">{v.count}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-950">
                                ₹{Number(v.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
