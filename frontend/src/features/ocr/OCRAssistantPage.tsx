import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Contact, Product, Account, Journal, AnalyticAccount } from '../../types';
import { 
  ScanText, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Building2, 
  ShieldCheck, 
  Layers, 
  Trash2, 
  Plus 
} from 'lucide-react';

const SAMPLE_BILLS = [
  {
    title: 'Azure Furniture Raw Materials Bill',
    text: `TAX INVOICE / SUPPLIER BILL
Vendor: Azure Furniture
Invoice Number: AZ-2026-8812
Date: 2026-02-15
Due Date: 2026-03-15
Reference: PO-99011

Items:
Teak Wood Plank  5  4000  20000
Steel Fasteners Set  10  500  5000

Subtotal: 25000.00
GST Tax (18%): 4500.00
Total Amount: 29500.00
Payment Terms: 30 Days Net`,
  },
  {
    title: 'Office Equipment Maintenance Invoice',
    text: `INVOICE #EQ-44910
Vendor: Delta Tools & Hardware
Date: 2026-02-20
Due Date: 2026-03-05

Items:
CNC Drill Maintenance  1  8000  8000
Lubricants & Consumables  2  1500  3000

Subtotal: 11000.00
GST (18%): 1980.00
Grand Total: 12980.00`,
  },
];

export const OCRAssistantPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [documentType, setDocumentType] = useState<'BILL' | 'INVOICE'>('BILL');
  const [inputText, setInputText] = useState(SAMPLE_BILLS[0].text);
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Editable Form State populated from OCR
  const [formData, setFormData] = useState({
    partnerId: 0,
    docNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    journalId: 0,
    reference: '',
    lines: [] as {
      productId: number;
      description: string;
      accountId: number;
      analyticAccountId: number | null;
      quantity: number;
      unitPrice: number;
      taxRate: number;
    }[],
  });

  // Fetch Master Data
  const { data: contacts } = useQuery<Contact[]>({
    queryKey: ['contacts-list'],
    queryFn: async () => {
      const res = await api.get('/contacts');
      return res.data.data;
    },
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ['products-list'],
    queryFn: async () => {
      const res = await api.get('/products');
      return res.data.data;
    },
  });

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ['accounts-list'],
    queryFn: async () => {
      const res = await api.get('/accounts');
      return res.data.data;
    },
  });

  const { data: journals } = useQuery<Journal[]>({
    queryKey: ['journals-list'],
    queryFn: async () => {
      const res = await api.get('/journals');
      return res.data.data;
    },
  });

  const { data: analytics } = useQuery<AnalyticAccount[]>({
    queryKey: ['analytics-list'],
    queryFn: async () => {
      const res = await api.get('/analytics');
      return res.data.data;
    },
  });

  // OCR Parse Mutation
  const parseMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await api.post('/ocr/parse', { text });
      return res.data.data;
    },
    onSuccess: (data) => {
      setParsedData(data);
      setError(null);

      // Match partner
      let partnerId = data.partnerId;
      if (!partnerId && contacts) {
        const found = contacts.find(
          (c) => c.name.toLowerCase().includes((data.partnerName || '').toLowerCase())
        );
        if (found) partnerId = found.id;
      }
      if (!partnerId && contacts && contacts.length > 0) {
        partnerId = contacts[0].id;
      }

      // Match journal
      const targetType = documentType === 'BILL' ? 'PURCHASE' : 'SALES';
      const defaultJournal = journals?.find((j) => j.type === targetType) || journals?.[0];

      // Match account
      const accType = documentType === 'BILL' ? 'EXPENSE' : 'INCOME';
      const defaultAccount = accounts?.find((a) => a.type === accType) || accounts?.[0];

      // Populate editable lines
      const mappedLines = (data.lines || []).map((l: any) => {
        let prodId = products && products.length > 0 ? products[0].id : 0;
        if (products) {
          const matchedProd = products.find((p) =>
            l.description.toLowerCase().includes(p.name.toLowerCase()) ||
            p.name.toLowerCase().includes(l.description.toLowerCase())
          );
          if (matchedProd) prodId = matchedProd.id;
        }

        return {
          productId: prodId,
          description: l.description,
          accountId: defaultAccount ? defaultAccount.id : 0,
          analyticAccountId: analytics && analytics.length > 0 ? analytics[0].id : null,
          quantity: l.quantity || 1,
          unitPrice: l.unitPrice || 0,
          taxRate: l.taxRate || 18,
        };
      });

      setFormData({
        partnerId: partnerId || 0,
        docNumber: data.invoiceNumber || '',
        date: data.invoiceDate || new Date().toISOString().split('T')[0],
        dueDate: data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        journalId: defaultJournal ? defaultJournal.id : 0,
        reference: data.reference || data.invoiceNumber || '',
        lines: mappedLines.length > 0 ? mappedLines : [
          {
            productId: products && products.length > 0 ? products[0].id : 0,
            description: 'Item',
            accountId: defaultAccount ? defaultAccount.id : 0,
            analyticAccountId: null,
            quantity: 1,
            unitPrice: 0,
            taxRate: 18,
          },
        ],
      });
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'OCR parsing failed.');
    },
  });

  // Save Draft Mutation
  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      if (documentType === 'BILL') {
        const payload = {
          vendorId: formData.partnerId,
          billDate: formData.date,
          dueDate: formData.dueDate,
          journalId: formData.journalId,
          reference: formData.reference,
          lines: formData.lines,
        };
        const res = await api.post('/vendor-bills', payload);
        return { type: 'BILL', data: res.data.data };
      } else {
        const payload = {
          customerId: formData.partnerId,
          invoiceDate: formData.date,
          dueDate: formData.dueDate,
          journalId: formData.journalId,
          reference: formData.reference,
          lines: formData.lines,
        };
        const res = await api.post('/invoices', payload);
        return { type: 'INVOICE', data: res.data.data };
      }
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-bills'] });
      queryClient.invalidateQueries({ queryKey: ['customer-invoices'] });
      if (res.type === 'BILL') {
        alert(`Draft Vendor Bill ${res.data.billNumber} created successfully! You can now review and post it.`);
        navigate('/purchases/bills');
      } else {
        alert(`Draft Invoice ${res.data.invoiceNumber} created successfully! You can now review and post it.`);
        navigate('/sales/invoices');
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to save draft record.');
    },
  });

  const handleLineChange = (index: number, field: string, val: any) => {
    const updated = [...formData.lines];
    (updated[index] as any)[field] = val;
    setFormData({ ...formData, lines: updated });
  };

  const handleRemoveLine = (index: number) => {
    if (formData.lines.length <= 1) return;
    setFormData({
      ...formData,
      lines: formData.lines.filter((_, i) => i !== index),
    });
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let taxTotal = 0;
    formData.lines.forEach((l) => {
      const lineSub = Number(l.quantity) * Number(l.unitPrice);
      const lineTax = (lineSub * Number(l.taxRate || 0)) / 100;
      subtotal += lineSub;
      taxTotal += lineTax;
    });
    return { subtotal, taxTotal, total: subtotal + taxTotal };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ScanText className="w-7 h-7 text-[#714B67]" />
            OCR Invoice & Bill Assistant
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Accelerate invoice entry with automated document parsing. Populates an editable Draft record for human review.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-purple-50 text-purple-800 border border-purple-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Automated Data Extraction</span>
        </div>
      </div>

      {/* Safety Compliance Alert */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900 text-xs">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold block text-sm mb-0.5">Strict Accounting Guardrail:</strong>
          <span>
            The OCR Assistant extracts values into a <strong>DRAFT</strong> record only. It never auto-posts directly to the General Ledger. An accountant must review line accounts and confirm before posting double-entry records.
          </span>
        </div>
      </div>

      {/* Main Workspace: Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input / OCR Reader */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Document Ingestion
              </span>
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs">
                <button
                  onClick={() => setDocumentType('BILL')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    documentType === 'BILL' ? 'bg-[#714B67] text-white' : 'text-gray-600'
                  }`}
                >
                  Vendor Bill
                </button>
                <button
                  onClick={() => setDocumentType('INVOICE')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    documentType === 'INVOICE' ? 'bg-[#714B67] text-white' : 'text-gray-600'
                  }`}
                >
                  Customer Invoice
                </button>
              </div>
            </div>

            {/* Sample Selector */}
            <div className="space-y-1.5">
              <span className="text-xs text-gray-500 font-medium">Load Preset Sample Document:</span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_BILLS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInputText(sample.text)}
                    className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    {sample.title}
                  </button>
                ))}
              </div>
            </div>

            {/* OCR Text Area */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Raw Invoice / Document Text
              </label>
              <textarea
                rows={12}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste OCR text, scanned receipt details, or supplier invoice lines..."
                className="w-full p-3 border border-gray-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#714B67] focus:outline-none"
              />
            </div>

            <button
              onClick={() => parseMutation.mutate(inputText)}
              disabled={parseMutation.isPending || !inputText.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#714B67] hover:bg-[#5a3b52] disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              {parseMutation.isPending ? 'Extracting Key Data...' : 'Extract Invoice with OCR'}
            </button>
          </div>

          {/* OCR Confidence Badge */}
          {parsedData && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  Extraction Confidence: <strong>{parsedData.confidenceScore}%</strong>
                </span>
              </div>
              <span className="text-emerald-700 font-bold font-mono">
                {parsedData.lines?.length || 0} Lines Extracted
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Pre-populated Form Review */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {documentType === 'BILL' ? 'Draft Vendor Bill Review' : 'Draft Customer Invoice Review'}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Verify extracted fields, select accounts, and save as draft
                </p>
              </div>
              <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                Status: DRAFT
              </span>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!parsedData ? (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <ScanText className="w-12 h-12 mx-auto text-gray-300" />
                <p className="font-semibold text-gray-600 text-sm">Waiting for Document Scan</p>
                <p className="text-xs">
                  Click "Extract Invoice with OCR" on the left to populate this verification view.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Header Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {documentType === 'BILL' ? 'Vendor / Supplier *' : 'Customer *'}
                    </label>
                    <select
                      value={formData.partnerId}
                      onChange={(e) => setFormData({ ...formData, partnerId: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#714B67]"
                      required
                    >
                      <option value={0} disabled>Select Partner</option>
                      {contacts?.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Journal *
                    </label>
                    <select
                      value={formData.journalId}
                      onChange={(e) => setFormData({ ...formData, journalId: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#714B67]"
                      required
                    >
                      {journals?.map((j) => (
                        <option key={j.id} value={j.id}>{j.name} ({j.code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Document Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#714B67]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#714B67]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Supplier Reference #
                    </label>
                    <input
                      type="text"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#714B67]"
                    />
                  </div>
                </div>

                {/* Editable Lines */}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Extracted Lines
                  </h3>
                  <div className="border border-gray-200 rounded-xl overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[600px]">
                      <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600">
                        <tr>
                          <th className="py-2.5 px-3">Description</th>
                          <th className="py-2.5 px-3">GL Account</th>
                          <th className="py-2.5 px-3 w-16 text-right">Qty</th>
                          <th className="py-2.5 px-3 w-24 text-right">Unit Price</th>
                          <th className="py-2.5 px-3 w-16 text-right">Tax %</th>
                          <th className="py-2.5 px-3 w-24 text-right">Total</th>
                          <th className="py-2.5 px-3 w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {formData.lines.map((line, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="p-2">
                              <input
                                type="text"
                                value={line.description}
                                onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                                className="w-full p-1.5 border border-gray-200 rounded text-xs"
                              />
                            </td>
                            <td className="p-2">
                              <select
                                value={line.accountId}
                                onChange={(e) => handleLineChange(idx, 'accountId', Number(e.target.value))}
                                className="w-full p-1.5 border border-gray-200 rounded text-xs"
                              >
                                {accounts?.map((a) => (
                                  <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min={1}
                                value={line.quantity}
                                onChange={(e) => handleLineChange(idx, 'quantity', Number(e.target.value))}
                                className="w-full p-1.5 border border-gray-200 rounded text-xs text-right"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                step="0.01"
                                value={line.unitPrice}
                                onChange={(e) => handleLineChange(idx, 'unitPrice', Number(e.target.value))}
                                className="w-full p-1.5 border border-gray-200 rounded text-xs text-right"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                step="0.01"
                                value={line.taxRate}
                                onChange={(e) => handleLineChange(idx, 'taxRate', Number(e.target.value))}
                                className="w-full p-1.5 border border-gray-200 rounded text-xs text-right"
                              />
                            </td>
                            <td className="p-2 text-right font-semibold text-gray-900">
                              ₹{(Number(line.quantity) * Number(line.unitPrice)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveLine(idx)}
                                disabled={formData.lines.length <= 1}
                                className="text-gray-400 hover:text-rose-600 disabled:opacity-30"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Calculation Summary */}
                <div className="flex justify-end pt-2">
                  <div className="w-72 space-y-1.5 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between text-gray-600">
                      <span>Untaxed Subtotal:</span>
                      <span className="font-semibold">₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>GST Taxes (18%):</span>
                      <span className="font-semibold">₹{totals.taxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                      <span>Total Amount:</span>
                      <span className="text-[#714B67]">₹{totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {/* Save Draft Action */}
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => saveDraftMutation.mutate()}
                    disabled={saveDraftMutation.isPending}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#714B67] hover:bg-[#5a3b52] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {saveDraftMutation.isPending
                      ? 'Saving Draft...'
                      : `Save as Draft ${documentType === 'BILL' ? 'Vendor Bill' : 'Customer Invoice'}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
