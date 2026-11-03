import React, { useState } from 'react';
import {
  Heart,
  ShieldCheck,
  CreditCard,
  Building,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Lock,
  FileText,
} from 'lucide-react';
import { Campaign, Donation, Donor } from '../types';
import { formatCurrency, formatCurrencyDetailed, generateReceiptNumber } from '../utils/donorLogic';

interface PublicGivingPortalProps {
  campaigns: Campaign[];
  onCompleteDonation: (donation: Donation, newDonorData?: Partial<Donor>) => void;
  onNavigateToLedger: () => void;
  onViewReceipt: (donation: Donation) => void;
}

export const PublicGivingPortal: React.FC<PublicGivingPortalProps> = ({
  campaigns,
  onCompleteDonation,
  onNavigateToLedger,
  onViewReceipt,
}) => {
  const [frequency, setFrequency] = useState<'one_time' | 'monthly'>('one_time');
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    campaigns.length > 0 ? campaigns[0].id : ''
  );
  const [hasDedication, setHasDedication] = useState(false);
  const [dedicationType, setDedicationType] = useState<'honor' | 'memory'>('honor');
  const [dedicationName, setDedicationName] = useState('');

  // Donor form
  const [firstName, setFirstName] = useState('Eleanor');
  const [lastName, setLastName] = useState('Sterling');
  const [email, setEmail] = useState('eleanor.sterling@example.org');
  const [address, setAddress] = useState('742 Evergreen Terrace');
  const [city, setCity] = useState('Seattle');
  const [state, setState] = useState('WA');
  const [postalCode, setPostalCode] = useState('98101');

  // Payment mock
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExp, setCardExp] = useState('08/29');
  const [cardCvc, setCardCvc] = useState('123');

  // Submission state
  const [completedDonation, setCompletedDonation] = useState<Donation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const amountPresets = [25, 50, 100, 250, 500, 1000];

  const getEffectiveAmount = (): number => {
    if (selectedAmount === 'custom') {
      const parsed = parseFloat(customAmount);
      return isNaN(parsed) || parsed <= 0 ? 0 : parsed;
    }
    return selectedAmount;
  };

  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveAmount = getEffectiveAmount();
    if (effectiveAmount <= 0) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const campaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];
      const donationId = `don-${Date.now()}`;
      const donorId = `donor-${Date.now()}`;
      const date = new Date().toISOString().split('T')[0];

      const newDonation: Donation = {
        id: donationId,
        donorId,
        donorName: `${firstName.trim()} ${lastName.trim()}`,
        donorEmail: email.trim(),
        amount: effectiveAmount,
        date,
        campaignId: campaign.id,
        campaignName: campaign.name,
        paymentMethod: 'credit_card',
        status: 'completed',
        isRecurring: frequency === 'monthly',
        recurringFrequency: frequency === 'monthly' ? 'monthly' : undefined,
        dedication:
          hasDedication && dedicationName.trim()
            ? {
                type: dedicationType,
                name: dedicationName.trim(),
              }
            : undefined,
        isTaxDeductible: true,
        receiptNumber: generateReceiptNumber(donationId, date),
        notes: `Online portal contribution (${frequency === 'monthly' ? 'Monthly Sustainer' : 'One-time'})`,
      };

      const newDonorPayload: Partial<Donor> = {
        id: donorId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: '—',
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: 'United States',
        status: 'new',
        tier: effectiveAmount >= 5000 ? 'major' : frequency === 'monthly' ? 'recurring' : 'regular',
        lifetimeGiving: effectiveAmount,
        totalGifts: 1,
        firstGiftDate: date,
        lastGiftDate: date,
        recurringMonthly: frequency === 'monthly',
        tags: ['Online Donor', frequency === 'monthly' ? 'Monthly Sustainer' : 'General Supporter'],
        notes: [
          {
            id: `n-${Date.now()}`,
            date,
            author: 'Online Giving Gateway',
            content: `Initial contribution of ${formatCurrencyDetailed(
              effectiveAmount
            )} to ${campaign.name}.`,
            type: 'general',
          },
        ],
        createdDate: date,
      };

      onCompleteDonation(newDonation, newDonorPayload);
      setCompletedDonation(newDonation);
      setIsSubmitting(false);
    }, 600);
  };

  const handleResetForAnotherGift = () => {
    setCompletedDonation(null);
    setSelectedAmount(100);
    setCustomAmount('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Notice Banner */}
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Public Donation Simulator:</strong> Test the constituent checkout experience. Gifts submitted here automatically sync to your CRM ledger and update stats.
          </span>
        </div>
        <button
          onClick={onNavigateToLedger}
          className="text-xs font-semibold text-emerald-800 underline hover:text-emerald-950 shrink-0 ml-2"
        >
          Back to CRM Ledger
        </button>
      </div>

      {completedDonation ? (
        /* Success Screen */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div>
            <span className="text-2xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
              Contribution Confirmed & Processed
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              Thank You for Your Generosity!
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
              Your gift of{' '}
              <strong className="text-slate-900 font-mono text-sm">
                {formatCurrencyDetailed(completedDonation.amount)}
              </strong>{' '}
              to <strong>{completedDonation.campaignName}</strong> has been received and credited to Hope Horizons Foundation.
            </p>
          </div>

          {/* Receipt Info Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 max-w-md mx-auto text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Official Receipt #:</span>
              <span className="font-mono font-semibold text-slate-800">
                {completedDonation.receiptNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Contributor:</span>
              <span className="font-medium text-slate-800">{completedDonation.donorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tax Status:</span>
              <span className="text-emerald-700 font-medium">100% Tax Deductible (501(c)(3))</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Giving Frequency:</span>
              <span className="capitalize font-medium text-slate-800">
                {completedDonation.isRecurring ? 'Monthly Recurring Gift' : 'One-Time Contribution'}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onViewReceipt(completedDonation)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>View Official Tax Receipt</span>
            </button>
            <button
              onClick={onNavigateToLedger}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 shadow-xs"
            >
              <span>View in CRM Database</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetForAnotherGift}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium px-3 py-2"
            >
              Simulate Another Gift
            </button>
          </div>
        </div>
      ) : (
        /* Giving Form */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 text-white p-6 sm:p-8">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Heart className="w-4 h-4 fill-emerald-400" />
              <span>Hope Horizons Foundation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Invest in Enduring Human Impact
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
              Every tax-deductible dollar directly accelerates clean drinking water, emergency medical supplies, and educational labs for underserved families worldwide.
            </p>
          </div>

          <form onSubmit={handleDonateSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Frequency Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                1. Select Giving Cadence
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => setFrequency('one_time')}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all text-center ${
                    frequency === 'one_time'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Give One-Time
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency('monthly')}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                    frequency === 'monthly'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Give Monthly (Sustainer)</span>
                </button>
              </div>
            </div>

            {/* Gift Amount Grid */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                2. Choose Gift Amount ($ USD)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 mb-3">
                {amountPresets.map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => {
                      setSelectedAmount(preset);
                      setCustomAmount('');
                    }}
                    className={`py-3 px-2 rounded-xl border text-sm font-bold font-mono transition-all text-center tabular-nums ${
                      selectedAmount === preset
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>

              {/* Custom Amount option */}
              <div className="max-w-xs flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAmount('custom')}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    selectedAmount === 'custom'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Custom Amount
                </button>
                {selectedAmount === 'custom' && (
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2 text-xs font-mono text-slate-500">$</span>
                    <input
                      type="number"
                      min="5"
                      step="any"
                      required
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-7 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-semibold"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Fund Allocation */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                3. Direct Your Impact
              </label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full max-w-lg px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                aria-label="Direct your donation to a specific initiative"
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Dedication Tribute */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={hasDedication}
                  onChange={(e) => setHasDedication(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Dedicate this gift in honor or memory of someone special</span>
              </label>

              {hasDedication && (
                <div className="flex gap-2 pt-2">
                  <select
                    value={dedicationType}
                    onChange={(e) => setDedicationType(e.target.value as 'honor' | 'memory')}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
                  >
                    <option value="honor">In honor of</option>
                    <option value="memory">In memory of</option>
                  </select>
                  <input
                    type="text"
                    value={dedicationName}
                    onChange={(e) => setDedicationName(e.target.value)}
                    placeholder="Enter their full name"
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
              )}
            </div>

            {/* Donor Information */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                4. Your Information (for Tax Receipt)
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs text-slate-600 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-2xs text-slate-600 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs text-slate-600 mb-1">Email Address (Receipt will be sent here) *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-2xs text-slate-600 mb-1">Mailing Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-2xs text-slate-600 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Payment Details (Simulated Test Card) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  5. Payment Details
                </label>
                <div className="flex items-center gap-1 text-2xs text-slate-500">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>256-bit SSL Encrypted</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <label className="block text-2xs text-slate-600 mb-1">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-white"
                    />
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-2xs text-slate-600 mb-1">Expires (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs text-slate-600 mb-1">CVC Code</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submission Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || getEffectiveAmount() <= 0}
                className="w-full py-4 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Securing & Processing Contribution...</span>
                ) : (
                  <>
                    <Heart className="w-4 h-4 fill-white" />
                    <span>
                      Complete {frequency === 'monthly' ? 'Monthly' : 'One-Time'} Gift of{' '}
                      {formatCurrencyDetailed(getEffectiveAmount())}
                    </span>
                  </>
                )}
              </button>
              <p className="text-center text-2xs text-slate-400 mt-2">
                Hope Horizons Foundation is an official 501(c)(3) tax-exempt public charity. All contributions are tax-deductible to the full extent of the law.
              </p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
