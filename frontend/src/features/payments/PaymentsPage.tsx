import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Payment, Contact, Journal, PaymentType, PaymentMethod } from '../../types';
import { 
  CreditCard, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  FileText, 
  X,
  Plus
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [detailPaymentId, setDetailPaymentId] = useState<number | null>(null);

  // Fetch payments
  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ['payments', search, typeFilter],
    queryFn: async () => {
      const res = await api.get('/payments', {
        params: {
          search: search || undefined,
          type: typeFilter !== 'ALL' ? typeFilter : undefined,
        },
      });
      return res.data.data;
    },
  });

  // Single payment detail
  const { data: paymentDetail } = useQuery<Payment>({
    queryKey: ['payment', detailPaymentId],
    queryFn: async () => {
      if (!detailPaymentId) return null;
      const res = await api.get(`/payments/${detailPaymentId}`);
      return res.data.data;
    },
    enabled: !!detailPaymentId,
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-[#714B67]" />
            Payments & Bank Receipts
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Complete audit trail of all customer collections and supplier disbursements
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by payment #, partner, or UTR/ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {['ALL', 'CUSTOMER', 'VENDOR'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === t
                  ? 'bg-[#714B67] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t === 'ALL' ? 'All Transactions' : t === 'CUSTOMER' ? 'Customer Receipts' : 'Vendor Payments'}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading payments ledger...</div>
        ) : !payments || payments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No payment records found</p>
            <p className="text-gray-400 text-sm mt-1">
              Payments are recorded when reconciling Invoices or Vendor Bills
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Payment #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Partner</th>
                  <th className="py-3 px-4">Journal / Method</th>
                  <th className="py-3 px-4">Reference / UTR</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setDetailPaymentId(p.id)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-[#714B67]">
                      {p.paymentNumber}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {new Date(p.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.type === 'CUSTOMER' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <ArrowDownLeft className="w-3 h-3" />
                          Receipt (Inflow)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                          <ArrowUpRight className="w-3 h-3" />
                          Payment (Outflow)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-800">
                      {p.partner?.name}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 text-xs">
                      {p.journal?.name} ({p.paymentMethod})
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 font-mono text-xs">
                      {p.reference || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                      {p.type === 'CUSTOMER' ? '+' : '-'}₹{Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setDetailPaymentId(p.id)}
                        className="text-xs font-medium text-[#714B67] hover:underline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Detail Modal */}
      {detailPaymentId && paymentDetail && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#714B67]/10 text-[#714B67] rounded-xl">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">{paymentDetail.paymentNumber}</h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {paymentDetail.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {paymentDetail.type === 'CUSTOMER' ? 'Customer Collection' : 'Supplier Payment'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailPaymentId(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 block mb-1">Partner</span>
                  <span className="font-semibold text-gray-800 text-sm">
                    {paymentDetail.partner?.name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Payment Date</span>
                  <span className="font-semibold text-gray-800 text-sm">
                    {new Date(paymentDetail.paymentDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Journal</span>
                  <span className="font-semibold text-gray-800">
                    {paymentDetail.journal?.name} ({paymentDetail.paymentMethod})
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Reference / UTR</span>
                  <span className="font-semibold text-gray-800 font-mono">
                    {paymentDetail.reference || 'None'}
                  </span>
                </div>
              </div>

              {/* Accounting Traceability Alert */}
              {paymentDetail.journalEntry && (
                <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-xs text-purple-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-700" />
                    <span>
                      Posted to General Ledger Entry:{' '}
                      <strong className="font-mono">{paymentDetail.journalEntry.entryNumber}</strong> (Balanced Dr = Cr)
                    </span>
                  </div>
                  <span className="text-purple-700 font-medium">Verified Double-Entry</span>
                </div>
              )}

              {/* Allocations */}
              {paymentDetail.allocations && paymentDetail.allocations.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Reconciled Documents
                  </h3>
                  <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Document</th>
                          <th className="py-2.5 px-3 text-right">Allocated Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paymentDetail.allocations.map((alloc) => (
                          <tr key={alloc.id}>
                            <td className="py-2.5 px-3 font-medium text-gray-800">
                              {alloc.customerInvoiceId ? `Customer Invoice #${alloc.customerInvoiceId}` : `Vendor Bill #${alloc.vendorBillId}`}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                              ₹{Number(alloc.amountAllocated).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Amount Display */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600">Total Transaction Amount:</span>
                <span className="text-2xl font-extrabold text-[#714B67]">
                  ₹{Number(paymentDetail.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button
                onClick={() => setDetailPaymentId(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
