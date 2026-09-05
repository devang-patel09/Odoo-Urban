import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Save, 
  CreditCard, 
  MapPin, 
  FileText, 
  Percent, 
  CheckCircle2 
} from 'lucide-react';

export const CompanySettingsPage: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    companyName: 'Urban Furniture Ltd.',
    legalName: 'Urban Furniture Manufacturing & Retail Pvt. Ltd.',
    gstin: '27AAACU1234F1Z5',
    pan: 'AAACU1234F',
    cin: 'U36100MH2026PTC123456',
    email: 'accounts@urbanfurniture.com',
    phone: '+91 22 4567 8900',
    street: 'Plot 42, Industrial Area, Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400093',
    currency: 'INR (₹)',
    fiscalYearStart: 'January 01',
    fiscalYearEnd: 'December 31',
    defaultTaxRate: 18,
    bankName: 'HDFC Bank Ltd.',
    bankAccountNo: '50200012345678',
    bankIfsc: 'HDFC0000123',
    bankBranch: 'Andheri East Branch',
    enforceDoubleEntry: true,
    autoProvisionPortalUser: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-[#714B67]" />
            Company & ERP Configuration
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure legal entity profiles, statutory tax parameters, default GL policies, and banking details
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved Successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Legal Profile */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <FileText className="w-5 h-5 text-[#714B67]" />
            Legal Entity & Statutory Identifiers
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Trade Name *</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#714B67]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Registered Legal Name *</label>
              <input
                type="text"
                value={formData.legalName}
                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#714B67]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">GSTIN Identification *</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono uppercase focus:ring-2 focus:ring-[#714B67]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Permanent Account # (PAN)</label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono uppercase focus:ring-2 focus:ring-[#714B67]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Corporate Identity # (CIN)</label>
              <input
                type="text"
                value={formData.cin}
                onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono uppercase focus:ring-2 focus:ring-[#714B67]"
              />
            </div>
          </div>
        </div>

        {/* Address & Communication */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <MapPin className="w-5 h-5 text-[#714B67]" />
            Headquarters Address & Contact Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Street Address</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#714B67]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#714B67]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#714B67]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#714B67]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#714B67]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Telephone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#714B67]"
              />
            </div>
          </div>
        </div>

        {/* Banking & Disbursement Account */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <CreditCard className="w-5 h-5 text-[#714B67]" />
            Default Banking & Settlement Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#714B67]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Account Number</label>
              <input
                type="text"
                value={formData.bankAccountNo}
                onChange={(e) => setFormData({ ...formData, bankAccountNo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#714B67]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">IFSC Code</label>
              <input
                type="text"
                value={formData.bankIfsc}
                onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono uppercase focus:ring-2 focus:ring-[#714B67]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Branch Name</label>
              <input
                type="text"
                value={formData.bankBranch}
                onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#714B67]"
              />
            </div>
          </div>
        </div>

        {/* Accounting Policies & Guardrails */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-[#714B67]" />
            Accounting Standards & Guardrails
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Operating Currency</label>
              <input
                type="text"
                value={formData.currency}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Default GST Rate (%)</label>
              <input
                type="number"
                value={formData.defaultTaxRate}
                onChange={(e) => setFormData({ ...formData, defaultTaxRate: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#714B67]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Active Fiscal Year</label>
              <input
                type="text"
                value="2026 (Jan 01 - Dec 31)"
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="doubleEntryCheck"
                checked={formData.enforceDoubleEntry}
                disabled
                className="w-4 h-4 text-[#714B67] rounded cursor-not-allowed"
              />
              <label htmlFor="doubleEntryCheck" className="text-xs font-semibold text-gray-800">
                Enforce Strict Double-Entry Ledger Validation (Total Debit == Total Credit)
              </label>
            </div>
            <p className="text-[11px] text-gray-400 pl-6">
              Mandatory accounting core constraint. Cannot be disabled.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="portalUserCheck"
                checked={formData.autoProvisionPortalUser}
                onChange={(e) => setFormData({ ...formData, autoProvisionPortalUser: e.target.checked })}
                className="w-4 h-4 text-[#714B67] rounded"
              />
              <label htmlFor="portalUserCheck" className="text-xs font-semibold text-gray-800">
                Auto-provision Customer / Vendor Portal Users on Contact Creation with Email
              </label>
            </div>
            <p className="text-[11px] text-gray-400 pl-6">
              Enables customer and supplier accounts to log into their self-service invoice and bill settlement portal.
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#714B67] hover:bg-[#5a3b52] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
