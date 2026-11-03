import React from 'react';
import {
  TrendingUp,
  Users,
  Repeat,
  DollarSign,
  HeartHandshake,
  AlertCircle,
  ArrowRight,
  Plus,
  FileText,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Donor, Donation, Campaign } from '../types';
import {
  calculateDashboardStats,
  formatCurrency,
  formatCurrencyDetailed,
  formatDate,
  calculateCampaignProgress,
} from '../utils/donorLogic';

interface DashboardViewProps {
  donors: Donor[];
  donations: Donation[];
  campaigns: Campaign[];
  onOpenRecordModal: () => void;
  onOpenAddDonorModal: () => void;
  onSelectDonorById: (donorId: string) => void;
  onViewReceipt: (donation: Donation) => void;
  onNavigateToCampaigns: () => void;
  onNavigateToStewardshipWithDonor: (donor: Donor) => void;
  onNavigateToPortal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  donors,
  donations,
  campaigns,
  onOpenRecordModal,
  onOpenAddDonorModal,
  onSelectDonorById,
  onViewReceipt,
  onNavigateToCampaigns,
  onNavigateToStewardshipWithDonor,
  onNavigateToPortal,
}) => {
  const stats = calculateDashboardStats(donors, donations);

  // Annual Goal
  const annualGoal = 450000;
  const goalProgress = Math.min(Math.round((stats.totalRaised / annualGoal) * 100), 100);

  // Recent 6 donations
  const recentDonations = [...donations]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // Lapsed donors for retention stewardship
  const lapsedDonors = donors.filter((d) => d.status === 'lapsed' || d.tier === 'lapsed');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Fundraising & Donor Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time financial stewardship, capital campaign progress, and donor engagement
          </p>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1: Total Raised */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500">
              Total Raised
            </span>
            <span className="text-emerald-700 bg-emerald-50 text-2xs px-1.5 py-0.5 rounded font-medium">
              +14.8% YoY
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {formatCurrency(stats.totalRaised)}
          </div>
          <span className="text-2xs text-slate-400 block">
            Across {donations.filter((d) => d.status === 'completed').length} completed gifts
          </span>
        </div>

        {/* KPI 2: Total Donors */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500">
              Active Constituents
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {stats.totalDonors}
          </div>
          <span className="text-2xs text-slate-400 block">
            {donors.filter((d) => d.tier === 'major').length} Major Benefactors ($5k+)
          </span>
        </div>

        {/* KPI 3: Recurring Sustainers */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500">
              Monthly Sustainers
            </span>
            <Repeat className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {stats.activeRecurringDonors}
          </div>
          <span className="text-2xs text-emerald-700 font-medium block">
            Predictable monthly revenue
          </span>
        </div>

        {/* KPI 4: Donor Retention */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500">
              Donor Retention
            </span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {stats.retentionRate}%
          </div>
          <span className="text-2xs text-slate-400 block">
            Avg Gift: {formatCurrency(stats.averageDonation)}
          </span>
        </div>
      </div>

      {/* 2-Column Section: Annual Goal & Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Annual Goal & Lapsed Alert */}
        <div className="lg:col-span-5 space-y-4">
          {/* Annual Goal Card */}
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500">
                  Fiscal Year 2026 Target
                </span>
                <h3 className="font-bold text-slate-900 text-lg">Annual Operating & Impact Goal</h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                {goalProgress}% Reached
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {formatCurrency(stats.totalRaised)}
                </span>
                <span className="text-slate-400 font-mono tabular-nums">
                  Target: {formatCurrency(annualGoal)}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-700"
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-100">
              <div>
                <span className="text-2xs text-slate-400 block">Remaining to Target</span>
                <span className="font-mono font-bold text-slate-800 tabular-nums">
                  {formatCurrency(Math.max(0, annualGoal - stats.totalRaised))}
                </span>
              </div>
              <div>
                <span className="text-2xs text-slate-400 block">Projected Completion</span>
                <span className="font-medium text-slate-800">Q3 2026 (On Pace)</span>
              </div>
            </div>
          </div>

          {/* Lapsed Donors Stewardship Card */}
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Retention Alert: Lapsed Donors ({lapsedDonors.length})
                </h3>
              </div>
            </div>
            <p className="text-2xs text-slate-500">
              Constituents with no gift activity in 12+ months. Re-engaging lapsed donors yields 4x higher return than new acquisition.
            </p>

            <div className="space-y-2 pt-1">
              {lapsedDonors.slice(0, 3).map((donor) => (
                <div
                  key={donor.id}
                  className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-800 block">
                      {donor.firstName} {donor.lastName}
                    </span>
                    <span className="text-2xs text-slate-400">
                      Last Gift: {formatDate(donor.lastGiftDate)} · Lifetime: {formatCurrency(donor.lifetimeGiving)}
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigateToStewardshipWithDonor(donor)}
                    className="text-2xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded transition-colors"
                  >
                    Reach Out
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Active Campaigns Progress */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Active Capital & Fund Milestones</h3>
              <p className="text-2xs text-slate-500 mt-0.5">Real-time allocation across designated initiatives</p>
            </div>
            <button
              onClick={onNavigateToCampaigns}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View All Funds</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {campaigns.slice(0, 4).map((c) => {
              const progress = calculateCampaignProgress(c);
              return (
                <div key={c.id} className="space-y-1.5 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{c.name}</span>
                      <span className="text-2xs text-slate-400 ml-2">({c.category})</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-2xs text-slate-500">
                    <span className="font-mono tabular-nums">
                      {formatCurrency(c.raisedAmount)} raised of {formatCurrency(c.goalAmount)}
                    </span>
                    <span>{c.donorsCount} benefactors</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Contributions Feed */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recent Incoming Gifts</h3>
            <p className="text-2xs text-slate-500 mt-0.5">Live auditable stream of processed donations</p>
          </div>
          <button
            onClick={onOpenRecordModal}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            + Record Gift
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4">Receipt #</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Contributor</th>
                <th className="py-2.5 px-4">Fund Designation</th>
                <th className="py-2.5 px-4 text-right">Amount</th>
                <th className="py-2.5 px-4">Method</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentDonations.map((don) => (
                <tr key={don.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-2xs text-slate-500">{don.receiptNumber}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-600">{formatDate(don.date)}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onSelectDonorById(don.donorId)}
                      className="font-semibold text-slate-900 hover:text-emerald-700 text-left transition-colors"
                    >
                      {don.donorName}
                    </button>
                    <span className="text-2xs text-slate-400 block">{don.donorEmail}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{don.campaignName}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {formatCurrencyDetailed(don.amount)}
                    {don.isRecurring && (
                      <span className="text-3xs bg-emerald-50 text-emerald-700 ml-1 px-1 py-0.2 rounded uppercase">
                        Mo
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600 capitalize">
                    {don.paymentMethod.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onViewReceipt(don)}
                      className="inline-flex items-center gap-1 text-2xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
