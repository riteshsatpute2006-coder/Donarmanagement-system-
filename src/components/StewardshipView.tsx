import React, { useState } from 'react';
import { Mail, Printer, Copy, Check, FileCheck, Send, Sparkles } from 'lucide-react';
import { Donor, Donation, StewardshipTemplate } from '../types';
import { STEWARDSHIP_TEMPLATES } from '../data/seedData';
import { formatCurrency, formatCurrencyDetailed, formatDate } from '../utils/donorLogic';

interface StewardshipViewProps {
  donors: Donor[];
  donations: Donation[];
  onLogTouchpoint: (donorId: string, content: string, type: 'email') => void;
  initialDonor?: Donor | null;
}

export const StewardshipView: React.FC<StewardshipViewProps> = ({
  donors,
  donations,
  onLogTouchpoint,
  initialDonor,
}) => {
  const [selectedDonorId, setSelectedDonorId] = useState<string>(
    initialDonor?.id || (donors.length > 0 ? donors[0].id : '')
  );
  const [taxYear, setTaxYear] = useState<string>('2026');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(STEWARDSHIP_TEMPLATES[0].id);
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const selectedDonor = donors.find((d) => d.id === selectedDonorId) || donors[0];
  const selectedTemplate =
    STEWARDSHIP_TEMPLATES.find((t) => t.id === selectedTemplateId) || STEWARDSHIP_TEMPLATES[0];

  // Donations by this donor in the tax year
  const donorYearDonations = donations.filter((d) => {
    if (d.donorId !== selectedDonorId) return false;
    if (d.status !== 'completed') return false;
    const year = new Date(d.date).getFullYear().toString();
    return year === taxYear;
  });

  const yearTotal = donorYearDonations.reduce((sum, d) => sum + d.amount, 0);

  // Template text interpolation
  const getRenderedContent = () => {
    if (!selectedDonor) return { subject: '', body: '' };

    const firstDonation = donorYearDonations[0] || donations.find((d) => d.donorId === selectedDonor.id);
    const amountStr = firstDonation ? formatCurrencyDetailed(firstDonation.amount) : '$250.00';
    const campaignStr = firstDonation?.campaignName || 'Clean Water Initiative';
    const receiptStr = firstDonation?.receiptNumber || 'REC-2026-4091';

    let body = selectedTemplate.body
      .replace(/{{donor_name}}/g, `${selectedDonor.firstName} ${selectedDonor.lastName}`)
      .replace(/{{amount}}/g, amountStr)
      .replace(/{{campaign_name}}/g, campaignStr)
      .replace(/{{organization_name}}/g, 'Hope Horizons Foundation')
      .replace(/{{date}}/g, formatDate(firstDonation?.date || new Date().toISOString()))
      .replace(/{{receipt_number}}/g, receiptStr)
      .replace(/{{lifetime_giving}}/g, formatCurrency(selectedDonor.lifetimeGiving))
      .replace(/{{period_total}}/g, formatCurrency(yearTotal || selectedDonor.lifetimeGiving))
      .replace(/{{total_gifts}}/g, selectedDonor.totalGifts.toString());

    let subject = selectedTemplate.subject
      .replace(/{{organization_name}}/g, 'Hope Horizons Foundation')
      .replace(/{{donor_name}}/g, `${selectedDonor.firstName} ${selectedDonor.lastName}`);

    return { subject, body };
  };

  const { subject: renderedSubject, body: renderedBody } = getRenderedContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${renderedSubject}\n\n${renderedBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendSimulated = () => {
    onLogTouchpoint(
      selectedDonor.id,
      `Dispatched "${selectedTemplate.title}" to ${selectedDonor.email}`,
      'email'
    );
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Stewardship & Tax Statements
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate formal 501(c)(3) tax receipts, annual giving summaries, and donor touchpoints
          </p>
        </div>
      </div>

      {/* Target Donor & Year Selector Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            Select Constituent:
          </label>
          <select
            value={selectedDonorId}
            onChange={(e) => setSelectedDonorId(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
            aria-label="Select constituent for stewardship"
          >
            {donors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.firstName} {d.lastName} ({d.email}) — {formatCurrency(d.lifetimeGiving)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">Tax Year:</label>
          <select
            value={taxYear}
            onChange={(e) => setTaxYear(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
            aria-label="Select tax year"
          >
            <option value="2026">2026 (Current)</option>
            <option value="2025">2025 (Prior Year)</option>
            <option value="2024">2024</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Template Selector & Email Dispatcher */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>Stewardship Communication Templates</span>
            </h2>

            <div className="space-y-2">
              {STEWARDSHIP_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-colors ${
                    selectedTemplateId === tmpl.id
                      ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <p className="font-semibold text-slate-900">{tmpl.title}</p>
                  <p className="text-2xs text-slate-500 truncate mt-0.5">{tmpl.subject}</p>
                </button>
              ))}
            </div>

            {/* Simulated Send */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>

              <button
                onClick={handleSendSimulated}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch to Donor</span>
              </button>
            </div>

            {sentSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Message successfully logged and dispatched to {selectedDonor.email}!</span>
              </div>
            )}
          </div>

          {/* Donor Context Summary */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
            <h3 className="font-semibold text-slate-900 uppercase tracking-wider text-2xs">
              Constituent Giving Profile
            </h3>
            <div className="space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Name:</span>
                <span className="font-semibold text-slate-900">
                  {selectedDonor.firstName} {selectedDonor.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Lifetime Giving:</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {formatCurrency(selectedDonor.lifetimeGiving)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Recorded Gifts:</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {selectedDonor.totalGifts}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax Year {taxYear} Total:</span>
                <span className="font-mono font-bold text-emerald-700 tabular-nums">
                  {formatCurrencyDetailed(yearTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Official Printable Annual Tax Statement Preview */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            {/* Header toolbar */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-900">
                  Official 501(c)(3) Annual Giving Statement ({taxYear})
                </span>
              </div>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Statement</span>
              </button>
            </div>

            {/* Formal Statement Paper */}
            <div className="p-8 text-xs text-slate-800 space-y-6 bg-white">
              {/* Org Header */}
              <div className="border-b border-slate-200 pb-5 flex justify-between items-start">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Hope Horizons Foundation, Inc.
                  </h2>
                  <p className="text-slate-500 mt-0.5">501(c)(3) Tax-Exempt Non-Profit</p>
                  <p className="text-slate-500">1200 Avenue of the Americas, Suite 1800, New York, NY 10036</p>
                  <p className="text-slate-500 font-mono mt-0.5">Federal EIN: 82-4192084</p>
                </div>
                <div className="text-right">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Tax Year {taxYear}
                  </span>
                  <p className="text-slate-400 mt-2 font-mono text-2xs">
                    STMT-{taxYear}-{selectedDonor.id.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Addressee */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-2xs uppercase text-slate-400 font-semibold mb-1">Delivered To:</p>
                <p className="font-bold text-slate-900 text-sm">
                  {selectedDonor.firstName} {selectedDonor.lastName}
                </p>
                <p className="text-slate-600">{selectedDonor.email}</p>
                {selectedDonor.address && selectedDonor.address !== '—' && (
                  <p className="text-slate-500 mt-0.5">
                    {selectedDonor.address}, {selectedDonor.city}, {selectedDonor.state}{' '}
                    {selectedDonor.postalCode}
                  </p>
                )}
              </div>

              {/* Itemized Table of Gifts */}
              <div>
                <h4 className="font-semibold text-slate-800 uppercase tracking-wider text-2xs mb-2">
                  Itemized Charitable Contributions for Tax Year {taxYear}
                </h4>
                {donorYearDonations.length === 0 ? (
                  <p className="text-slate-500 italic py-4 text-center border border-dashed border-slate-200 rounded-lg">
                    No completed gifts recorded for {selectedDonor.firstName} in tax year {taxYear}.
                  </p>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-2xs font-semibold text-slate-500 uppercase">
                        <th className="py-2">Date</th>
                        <th className="py-2">Receipt #</th>
                        <th className="py-2">Designation</th>
                        <th className="py-2">Method</th>
                        <th className="py-2 text-right">Tax Deductible Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {donorYearDonations.map((d) => (
                        <tr key={d.id}>
                          <td className="py-2.5 text-slate-600">{formatDate(d.date)}</td>
                          <td className="py-2.5 font-mono text-2xs text-slate-500">{d.receiptNumber}</td>
                          <td className="py-2.5 font-medium text-slate-900">{d.campaignName}</td>
                          <td className="py-2.5 text-slate-600 capitalize">
                            {d.paymentMethod.replace('_', ' ')}
                          </td>
                          <td className="py-2.5 text-right font-mono font-semibold text-slate-900 tabular-nums">
                            {formatCurrencyDetailed(d.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-300">
                        <th colSpan={4} className="py-3 text-right font-bold text-slate-800">
                          Total Eligible Tax-Deductible Gifts for {taxYear}:
                        </th>
                        <th className="py-3 text-right font-mono font-bold text-base text-emerald-700 tabular-nums">
                          {formatCurrencyDetailed(yearTotal)}
                        </th>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>

              {/* Legal IRS affirmation */}
              <div className="pt-4 border-t border-slate-100 text-slate-500 leading-relaxed text-2xs space-y-2">
                <p>
                  <strong>Internal Revenue Code Affirmation:</strong> Thank you for your support. No goods or services were provided in exchange for the contributions listed above other than intangible religious or charitable benefits. Hope Horizons Foundation is an organization described in Section 501(c)(3) of the Internal Revenue Code.
                </p>
              </div>

              {/* Signature block */}
              <div className="flex justify-between items-end pt-4">
                <p className="text-2xs text-slate-400 font-mono">
                  ISSUED: {new Date().toISOString().split('T')[0]}
                </p>
                <div className="text-right">
                  <div className="font-serif italic text-base text-slate-800">Victoria Sterling</div>
                  <p className="text-2xs text-slate-500 border-t border-slate-200 pt-0.5 mt-0.5">
                    Chief Financial Officer, Hope Horizons Foundation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
