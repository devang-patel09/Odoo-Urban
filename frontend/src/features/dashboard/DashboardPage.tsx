import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  Receipt, 
  CreditCard,
  Building2,
  Calendar
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-[#E5E7EB] shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#2F2F2F] tracking-tight">Accounting Overview</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Welcome back, <span className="font-semibold text-[#714B67]">{user?.name}</span>. Real-time ledger balances and financial snapshot.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F8F9FA] border border-[#E5E7EB] px-3 py-1.5 rounded-md text-xs font-medium text-gray-700">
            <Calendar className="w-3.5 h-3.5 text-[#714B67]" />
            <span>FY 2026 (Jan 01 - Dec 31)</span>
          </div>
          <button className="btn-primary">
            + New Transaction
          </button>
        </div>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-[#E5E7EB] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Sales</span>
            <span className="p-2 bg-[#E6F4F4] text-[#017E84] rounded-md">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900">₹29,500.00</span>
            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Calculated from posted invoices</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#E5E7EB] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Purchases</span>
            <span className="p-2 bg-[#F3EAF0] text-[#714B67] rounded-md">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900">₹30,000.00</span>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Calculated from vendor bills</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#E5E7EB] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Receivables (Debtors)</span>
            <span className="p-2 bg-amber-50 text-amber-700 rounded-md">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900">₹0.00</span>
            <div className="text-xs text-gray-500 mt-1">
              <span>Account 1100 balance</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#E5E7EB] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payables (Creditors)</span>
            <span className="p-2 bg-purple-50 text-[#714B67] rounded-md">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900">₹0.00</span>
            <div className="text-xs text-gray-500 mt-1">
              <span>Account 2000 balance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Journals Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-[#E5E7EB] shadow-sm hover:border-[#714B67]/40 transition-colors">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[#F3EAF0] text-[#714B67] flex items-center justify-center font-bold text-xs">
                INV
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Customer Invoices</h3>
                <span className="text-[11px] text-gray-500">Sales Journal</span>
              </div>
            </div>
            <span className="badge-purple">Active</span>
          </div>
          <div className="py-3 flex justify-between items-center text-xs">
            <span className="text-gray-500">Posted Invoices:</span>
            <span className="font-semibold text-gray-900">Ready</span>
          </div>
          <div className="pt-2 border-t border-gray-100 flex gap-2">
            <button className="btn-primary w-full text-xs py-1.5">New Invoice</button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#E5E7EB] shadow-sm hover:border-[#714B67]/40 transition-colors">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[#E6F4F4] text-[#017E84] flex items-center justify-center font-bold text-xs">
                BILL
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Vendor Bills</h3>
                <span className="text-[11px] text-gray-500">Purchase Journal</span>
              </div>
            </div>
            <span className="badge-teal">Active</span>
          </div>
          <div className="py-3 flex justify-between items-center text-xs">
            <span className="text-gray-500">Posted Bills:</span>
            <span className="font-semibold text-gray-900">Ready</span>
          </div>
          <div className="pt-2 border-t border-gray-100 flex gap-2">
            <button className="btn-secondary w-full text-xs py-1.5">Upload Bill (OCR)</button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#E5E7EB] shadow-sm hover:border-[#714B67]/40 transition-colors">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                BNK
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Bank Account</h3>
                <span className="text-[11px] text-gray-500">HDFC Bank A/c 1010</span>
              </div>
            </div>
            <span className="badge-green">Reconciled</span>
          </div>
          <div className="py-3 flex justify-between items-center text-xs">
            <span className="text-gray-500">Current Balance:</span>
            <span className="font-semibold text-gray-900 font-mono">₹0.00</span>
          </div>
          <div className="pt-2 border-t border-gray-100 flex gap-2">
            <button className="btn-outline w-full text-xs py-1.5">Bank Payments</button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#E5E7EB] shadow-sm hover:border-[#714B67]/40 transition-colors">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                CSH
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Cash in Hand</h3>
                <span className="text-[11px] text-gray-500">Cash A/c 1000</span>
              </div>
            </div>
            <span className="badge-amber">Ready</span>
          </div>
          <div className="py-3 flex justify-between items-center text-xs">
            <span className="text-gray-500">Current Balance:</span>
            <span className="font-semibold text-gray-900 font-mono">₹0.00</span>
          </div>
          <div className="pt-2 border-t border-gray-100 flex gap-2">
            <button className="btn-outline w-full text-xs py-1.5">Cash Receipts</button>
          </div>
        </div>
      </div>
    </div>
  );
};
