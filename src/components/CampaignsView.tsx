import React, { useState } from 'react';
import { Target, Plus, Users, Calendar, ArrowRight, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Campaign, Donation } from '../types';
import { formatCurrency, formatCurrencyDetailed, formatDate, calculateCampaignProgress } from '../utils/donorLogic';

interface CampaignsViewProps {
  campaigns: Campaign[];
  donations: Donation[];
  onCreateCampaign: (campaign: Campaign) => void;
  onSelectDonorById: (donorId: string) => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({
  campaigns,
  donations,
  onCreateCampaign,
  onSelectDonorById,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  // New campaign state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [goalAmount, setGoalAmount] = useState('50000');
  const [category, setCategory] = useState<Campaign['category']>('Infrastructure');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [error, setError] = useState<string | null>(null);

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);
  const campaignDonations = donations.filter((d) => d.campaignId === selectedCampaignId);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const goal = parseFloat(goalAmount);
    if (isNaN(goal) || goal <= 0) {
      setError('Please provide a valid campaign goal amount.');
      return;
    }
    if (!name.trim()) {
      setError('Please enter a campaign name.');
      return;
    }

    const newCampaign: Campaign = {
      id: `camp-${Date.now()}`,
      name: name.trim(),
      code: code.trim() || `CMP-${Math.floor(100 + Math.random() * 900)}`,
      description: description.trim() || 'Community initiative for sustainable impact.',
      goalAmount: goal,
      raisedAmount: 0,
      donorsCount: 0,
      startDate,
      endDate,
      status: 'active',
      category,
    };

    onCreateCampaign(newCampaign);
    setIsCreateModalOpen(false);
    setName('');
    setCode('');
    setDescription('');
    setGoalAmount('50000');
  };

  const getCategoryColor = (cat: Campaign['category']) => {
    switch (cat) {
      case 'Emergency':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Infrastructure':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Health':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Education':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Campaigns & Funds</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track capital campaigns, programmatic funds, and milestone deliverables
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Campaign</span>
        </button>
      </div>

      {/* Campaign Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.map((camp) => {
          const progress = calculateCampaignProgress(camp);
          const isSelected = selectedCampaignId === camp.id;

          return (
            <div
              key={camp.id}
              onClick={() => setSelectedCampaignId(isSelected ? null : camp.id)}
              className={`p-5 rounded-xl border bg-white shadow-2xs hover:shadow-xs transition-all cursor-pointer ${
                isSelected
                  ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-2xs font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${getCategoryColor(
                        camp.category
                      )}`}
                    >
                      {camp.category}
                    </span>
                    <span className="font-mono text-2xs text-slate-400">{camp.code}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{camp.name}</h3>
                </div>
                <span className="text-2xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize">
                  {camp.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                {camp.description}
              </p>

              {/* Progress Bar */}
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {formatCurrency(camp.raisedAmount)}
                    <span className="text-slate-400 font-normal"> / {formatCurrency(camp.goalAmount)}</span>
                  </span>
                  <span className="font-bold text-emerald-700 font-mono tabular-nums">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              {/* Card Meta Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-2xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    <strong className="text-slate-700">{camp.donorsCount}</strong> benefactors
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ends {formatDate(camp.endDate)}</span>
                </div>
                <div className="text-emerald-700 font-medium flex items-center gap-1">
                  <span>{isSelected ? 'Hide Details' : 'View Gifts'}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Campaign Breakdown Detail */}
      {selectedCampaign && (
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-2xs text-emerald-700 font-semibold uppercase tracking-wider">
                Fund Detail View
              </span>
              <h2 className="text-lg font-bold text-slate-900">{selectedCampaign.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{selectedCampaign.description}</p>
            </div>
            <button
              onClick={() => setSelectedCampaignId(null)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Close Fund View
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center py-2">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-2xs text-slate-500 block uppercase">Total Raised</span>
              <span className="font-mono font-bold text-slate-900 text-lg tabular-nums">
                {formatCurrency(selectedCampaign.raisedAmount)}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-2xs text-slate-500 block uppercase">Goal Target</span>
              <span className="font-mono font-bold text-slate-900 text-lg tabular-nums">
                {formatCurrency(selectedCampaign.goalAmount)}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-2xs text-slate-500 block uppercase">Remaining to Goal</span>
              <span className="font-mono font-bold text-slate-900 text-lg tabular-nums">
                {formatCurrency(Math.max(0, selectedCampaign.goalAmount - selectedCampaign.raisedAmount))}
              </span>
            </div>
          </div>

          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider pt-2">
            Recorded Gifts Designated to this Campaign ({campaignDonations.length})
          </h3>

          {campaignDonations.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No individual gifts logged specifically under this fund yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
              {campaignDonations.map((don) => (
                <div
                  key={don.id}
                  className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <button
                      onClick={() => onSelectDonorById(don.donorId)}
                      className="font-semibold text-slate-900 hover:text-emerald-700 text-left"
                    >
                      {don.donorName}
                    </button>
                    <span className="text-slate-400 text-2xs block">
                      {formatDate(don.date)} · {don.paymentMethod.replace('_', ' ')} ·{' '}
                      {don.receiptNumber}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 block tabular-nums">
                      {formatCurrencyDetailed(don.amount)}
                    </span>
                    {don.isRecurring && (
                      <span className="text-3xs text-emerald-700 font-medium">Monthly Sustainer</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Campaign Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-base font-semibold text-slate-900">Launch New Campaign Fund</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-sm">
              {error && (
                <div className="flex items-center gap-2 p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Campaign Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Solar Microgrid Community Initiative"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Fund Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="SOLAR-2026"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Campaign['category'])}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Health">Health & Medicine</option>
                    <option value="Education">Education & Literacy</option>
                    <option value="Emergency">Emergency Relief</option>
                    <option value="General">General Operating</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Target Goal ($ USD) *</label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  required
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description & Purpose</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the core impact, target deliverables, and beneficiaries..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Launch Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Target End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800"
                >
                  Publish Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
