import React, { useState } from 'react';
import { X, DollarSign, Check, AlertCircle } from 'lucide-react';
import { Donor, Campaign, Donation, PaymentMethod } from '../types';
import { generateReceiptNumber } from '../utils/donorLogic';

interface RecordDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  donors: Donor[];
  campaigns: Campaign[];
  onSaveDonation: (donation: Donation, newDonorData?: Partial<Donor>) => void;
  preselectedDonorId?: string;
}

export const RecordDonationModal: React.FC<RecordDonationModalProps> = ({
  isOpen,
  onClose,
  donors,
  campaigns,
  onSaveDonation,
  preselectedDonorId,
}) => {
  if (!isOpen) return null;

  const [donorMode, setDonorMode] = useState<'existing' | 'new'>(
    preselectedDonorId ? 'existing' : 'existing'
  );
  const [selectedDonorId, setSelectedDonorId] = useState<string>(
    preselectedDonorId || (donors.length > 0 ? donors[0].id : '')
  );

  // New donor fields
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Donation fields
  const [amount, setAmount] = useState<string>('250');
  const [campaignId, setCampaignId] = useState<string>(
    campaigns.length > 0 ? campaigns[0].id : ''
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [isTaxDeductible, setIsTaxDeductible] = useState(true);
  const [hasDedication, setHasDedication] = useState(false);
  const [dedicationType, setDedicationType] = useState<'honor' | 'memory'>('honor');
  const [dedicationName, setDedicationName] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const amountPresets = [50, 100, 250, 500, 1000, 2500];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid gift amount greater than $0.');
      return;
    }

    let donorIdToUse = selectedDonorId;
    let donorNameToUse = '';
    let donorEmailToUse = '';
    let newDonorPayload: Partial<Donor> | undefined = undefined;

    if (donorMode === 'existing') {
      const existing = donors.find((d) => d.id === selectedDonorId);
      if (!existing) {
        setError('Please select an existing donor.');
        return;
      }
      donorIdToUse = existing.id;
      donorNameToUse = `${existing.firstName} ${existing.lastName}`;
      donorEmailToUse = existing.email;
    } else {
      if (!newFirstName.trim() || !newLastName.trim() || !newEmail.trim()) {
        setError('Please provide first name, last name, and valid email for the new donor.');
        return;
      }
      donorIdToUse = `donor-${Date.now()}`;
      donorNameToUse = `${newFirstName.trim()} ${newLastName.trim()}`;
      donorEmailToUse = newEmail.trim();

      newDonorPayload = {
        id: donorIdToUse,
        firstName: newFirstName.trim(),
        lastName: newLastName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim() || '—',
        address: '—',
        city: '—',
        state: '—',
        postalCode: '—',
        country: 'USA',
        status: 'new',
        tier: parsedAmount >= 5000 ? 'major' : isRecurring ? 'recurring' : 'regular',
        lifetimeGiving: parsedAmount,
        totalGifts: 1,
        firstGiftDate: date,
        lastGiftDate: date,
        recurringMonthly: isRecurring && recurringFrequency === 'monthly',
        tags: ['New Donor'],
        notes: notes ? [{
          id: `n-${Date.now()}`,
          date,
          author: 'Gift Entry Staff',
          content: notes,
          type: 'general',
        }] : [],
        createdDate: date,
      };
    }

    const campaign = campaigns.find((c) => c.id === campaignId) || campaigns[0];
    const newDonationId = `don-${Date.now()}`;

    const newDonation: Donation = {
      id: newDonationId,
      donorId: donorIdToUse,
      donorName: donorNameToUse,
      donorEmail: donorEmailToUse,
      amount: parsedAmount,
      date,
      campaignId: campaign?.id || 'camp-general',
      campaignName: campaign?.name || 'General Operating Fund',
      paymentMethod,
      status: 'completed',
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      dedication: hasDedication && dedicationName.trim() ? {
        type: dedicationType,
        name: dedicationName.trim(),
      } : undefined,
      isTaxDeductible,
      receiptNumber: generateReceiptNumber(newDonationId, date),
      notes: notes.trim() || undefined,
    };

    onSaveDonation(newDonation, newDonorPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Record Contribution</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enter a gift, check, wire transfer, or pledge payment</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-sm">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Donor Selection Toggle */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">Donor Record</label>
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg max-w-fit mb-3">
              <button
                type="button"
                onClick={() => setDonorMode('existing')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  donorMode === 'existing'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Existing Donor
              </button>
              <button
                type="button"
                onClick={() => setDonorMode('new')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  donorMode === 'new'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                + New Donor
              </button>
            </div>

            {donorMode === 'existing' ? (
              <div>
                <select
                  value={selectedDonorId}
                  onChange={(e) => setSelectedDonorId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  aria-label="Select existing donor"
                >
                  {donors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.firstName} {d.lastName} ({d.email}) — Lifetime: ${d.lifetimeGiving.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="e.g. Katherine"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white text-sm focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="e.g. Brooks"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white text-sm focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. k.brooks@example.com"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white text-sm focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white text-sm focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Amount and Presets */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Gift Amount ($ USD) *</label>
            <div className="relative rounded-lg shadow-xs mb-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-mono">
                $
              </div>
              <input
                type="number"
                min="1"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono text-base font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                placeholder="0.00"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {amountPresets.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setAmount(preset.toString())}
                  className={`px-2.5 py-1 text-xs font-medium font-mono rounded-md border transition-colors ${
                    amount === preset.toString()
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>

          {/* Campaign and Payment Method */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Campaign Allocation</label>
              <select
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500"
                aria-label="Select campaign"
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500"
                aria-label="Select payment method"
              >
                <option value="credit_card">Credit / Debit Card</option>
                <option value="bank_transfer">ACH / Bank Wire</option>
                <option value="check">Check</option>
                <option value="cash">Cash</option>
                <option value="crypto">Cryptocurrency</option>
              </select>
            </div>
          </div>

          {/* Date and Tax Deductible */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Contribution Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={isTaxDeductible}
                  onChange={(e) => setIsTaxDeductible(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Tax Deductible Gift (501(c)(3))</span>
              </label>
            </div>
          </div>

          {/* Recurring Option */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-800">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Enroll as Recurring Sustainer Gift</span>
            </label>
            {isRecurring && (
              <div className="flex items-center gap-4 pl-6 pt-1 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="freq"
                    checked={recurringFrequency === 'monthly'}
                    onChange={() => setRecurringFrequency('monthly')}
                    className="text-emerald-600"
                  />
                  <span>Monthly</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="freq"
                    checked={recurringFrequency === 'quarterly'}
                    onChange={() => setRecurringFrequency('quarterly')}
                    className="text-emerald-600"
                  />
                  <span>Quarterly</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="freq"
                    checked={recurringFrequency === 'annual'}
                    onChange={() => setRecurringFrequency('annual')}
                    className="text-emerald-600"
                  />
                  <span>Annual</span>
                </label>
              </div>
            )}
          </div>

          {/* Dedication Tribute */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-700 mb-2">
              <input
                type="checkbox"
                checked={hasDedication}
                onChange={(e) => setHasDedication(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Add Dedication / Tribute (In honor or in memory)</span>
            </label>
            {hasDedication && (
              <div className="flex gap-2 pl-6">
                <select
                  value={dedicationType}
                  onChange={(e) => setDedicationType(e.target.value as 'honor' | 'memory')}
                  className="px-2 py-1.5 border border-slate-300 rounded-md text-xs bg-white text-slate-800"
                >
                  <option value="honor">In honor of</option>
                  <option value="memory">In memory of</option>
                </select>
                <input
                  type="text"
                  value={dedicationName}
                  onChange={(e) => setDedicationName(e.target.value)}
                  placeholder="Honoree full name"
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-md text-xs bg-white"
                />
              </div>
            )}
          </div>

          {/* Internal Staff Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Internal Stewardship Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Check #4120 deposited; matched by employer; thank you call planned"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Save & Generate Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
