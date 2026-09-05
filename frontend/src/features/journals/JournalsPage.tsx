import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Journal, JournalType, Account } from '../../types';
import { BookOpen, Plus, Search, Layers, X, AlertCircle, CheckCircle2 } from 'lucide-react';

export const JournalsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'GENERAL' as JournalType,
    defaultDebitAccountId: null as number | null,
    defaultCreditAccountId: null as number | null,
  });

  const { data: journals, isLoading } = useQuery<Journal[]>({
    queryKey: ['journals'],
    queryFn: async () => {
      const res = await api.get('/journals');
      return res.data.data;
    },
  });

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: async () => {
      const res = await api.get('/accounts');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      const res = await api.post('/journals', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      setModalOpen(false);
      setFormData({
        name: '',
        code: '',
        type: 'GENERAL',
        defaultDebitAccountId: null,
        defaultCreditAccountId: null,
      });
      setError(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to create journal.';
      setError(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const getJournalBadge = (type: JournalType) => {
    switch (type) {
      case 'SALES':
        return <span className="badge-purple">Sales</span>;
      case 'PURCHASE':
        return <span className="badge-teal">Purchase</span>;
      case 'BANK':
        return <span className="badge-green">Bank</span>;
      case 'CASH':
        return <span className="badge-amber">Cash</span>;
      case 'GENERAL':
        return <span className="badge-gray">General</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-[#E5E7EB] shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#2F2F2F] tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#714B67]" />
            Journals Master
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Group transactions into Sales, Purchase, Bank, Cash, and Miscellaneous General journals.
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          New Journal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-3 bg-white p-12 text-center text-gray-500 rounded-lg border border-gray-200">
            Loading journals...
          </div>
        ) : (
          journals?.map((j) => (
            <div
              key={j.id}
              className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm hover:border-[#714B67]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                    {j.code}
                  </span>
                  {getJournalBadge(j.type)}
                </div>

                <h3 className="font-bold text-base text-gray-900 mt-3">{j.name}</h3>

                <div className="mt-4 space-y-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div>
                    <span className="text-gray-400">Default Debit:</span>
                    <p className="font-medium text-gray-800">
                      {j.defaultDebitAccount
                        ? `${j.defaultDebitAccount.code} - ${j.defaultDebitAccount.name}`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Default Credit:</span>
                    <p className="font-medium text-gray-800">
                      {j.defaultCreditAccount
                        ? `${j.defaultCreditAccount.code} - ${j.defaultCreditAccount.name}`
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>{(j as any)._count?.journalEntries || 0} Posted Entries</span>
                <span className="text-[#714B67] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Journal Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-[#E5E7EB] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F8F9FA]">
              <h2 className="text-lg font-bold text-gray-900">Create Journal Master</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Journal Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Export Sales, Online Gateway"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Short Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. EXPS, ONL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Journal Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as JournalType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                >
                  <option value="SALES">Sales</option>
                  <option value="PURCHASE">Purchase</option>
                  <option value="BANK">Bank</option>
                  <option value="CASH">Cash</option>
                  <option value="GENERAL">General / Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Default Debit Account
                </label>
                <select
                  value={formData.defaultDebitAccountId || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      defaultDebitAccountId: e.target.value ? parseInt(e.target.value, 10) : null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                >
                  <option value="">None</option>
                  {accounts?.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} - {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Default Credit Account
                </label>
                <select
                  value={formData.defaultCreditAccountId || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      defaultCreditAccountId: e.target.value ? parseInt(e.target.value, 10) : null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                >
                  <option value="">None</option>
                  {accounts?.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} - {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={createMutation.isPending} className="btn-primary">
                  {createMutation.isPending ? 'Saving...' : 'Save Journal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
