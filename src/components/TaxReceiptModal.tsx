import React from 'react';
import { X, Printer, CheckCircle, Download, Building2 } from 'lucide-react';
import { Donation, Donor } from '../types';
import { formatCurrencyDetailed, formatDate } from '../utils/donorLogic';

interface TaxReceiptModalProps {
  donation: Donation | null;
  donor?: Donor | null;
  onClose: () => void;
}

export const TaxReceiptModal: React.FC<TaxReceiptModalProps> = ({
  donation,
  donor,
  onClose,
}) => {
  if (!donation) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-slate-900 text-sm">Official Charitable Tax Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              aria-label="Print tax receipt"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Receipt Content - styled like a real non-profit IRS 501(c)(3) tax receipt */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800 text-sm">
          {/* Org Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Hope Horizons Foundation, Inc.
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                A Registered 501(c)(3) Non-Profit Organization
              </p>
              <p className="text-xs text-slate-500">
                1200 Avenue of the Americas, Suite 1800, New York, NY 10036
              </p>
              <p className="text-xs text-slate-500">
                Federal Tax ID (EIN): <span className="font-mono">82-4192084</span>
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                Official Receipt
              </span>
              <p className="font-mono text-xs text-slate-600 mt-2">
                {donation.receiptNumber}
              </p>
              <p className="text-xs text-slate-500">
                Date: {formatDate(donation.date)}
              </p>
            </div>
          </div>

          {/* Donor Information */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Contributor</p>
              <p className="font-semibold text-slate-900 mt-1">{donation.donorName}</p>
              <p className="text-xs text-slate-600">{donation.donorEmail}</p>
              {donor?.address && (
                <p className="text-xs text-slate-500 mt-1">
                  {donor.address}, {donor.city}, {donor.state} {donor.postalCode}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Designation / Fund</p>
              <p className="font-semibold text-slate-900 mt-1">{donation.campaignName}</p>
              <p className="text-xs text-slate-600 capitalize">
                Payment: {donation.paymentMethod.replace('_', ' ')}
              </p>
              {donation.dedication && (
                <p className="text-xs text-slate-600 mt-1 italic">
                  In {donation.dedication.type} of {donation.dedication.name}
                </p>
              )}
            </div>
          </div>

          {/* Donation Financials */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4 text-center">Tax Status</th>
                  <th className="py-2.5 px-4 text-right">Eligible Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    Direct Charitable Contribution to {donation.campaignName}
                    {donation.isRecurring && ' (Monthly Sustainer gift)'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {donation.isTaxDeductible ? (
                      <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                        100% Tax Deductible
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">Non-deductible</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {formatCurrencyDetailed(donation.amount)}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50/50">
                  <th className="py-3 px-4 font-semibold text-slate-700 text-right" colSpan={2}>
                    Total Deductible Gift:
                  </th>
                  <th className="py-3 px-4 text-right font-mono text-base font-bold text-emerald-700 tabular-nums">
                    {formatCurrencyDetailed(donation.amount)}
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Legal IRS Disclosure Clause */}
          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 leading-relaxed space-y-2">
            <p>
              <strong>IRS Disclosure:</strong> In compliance with Internal Revenue Code regulations, Hope Horizons Foundation affirms that no goods or services were provided in whole or partial exchange for this contribution other than intangible religious or charitable benefits.
            </p>
            <p>
              Please keep this document with your permanent tax records. Thank you for your vital partnership in creating lasting generational change.
            </p>
          </div>

          {/* Authorized Signature */}
          <div className="flex justify-between items-end pt-4">
            <div>
              <p className="text-xs text-slate-400">Electronic verification token</p>
              <p className="font-mono text-xs text-slate-500">SHA256:{donation.id.toUpperCase()}-VERIFIED</p>
            </div>
            <div className="text-right">
              <div className="font-serif italic text-lg text-slate-800">Victoria Sterling</div>
              <p className="text-xs text-slate-500 border-t border-slate-300 pt-1 mt-1">
                Authorized Signatory, Chief Financial Officer
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
