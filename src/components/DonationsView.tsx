import React, { useState } from 'react';
import { Search, Download, Plus, FileText, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Donation, Campaign } from '../types';
import { formatCurrencyDetailed, formatDate, filterDonations, exportDonationsToCSV } from '../utils/donorLogic';

interface DonationsViewProps {
  donations: Donation[];
  campaigns: Campaign[];
  onOpenRecordModal: () => void;
  onViewReceipt: (donation: Donation) => void;
  onSelectDonorById: (donorId: string) => void;
}

export const DonationsView: React.FC<DonationsViewProps> = ({
  donations,
  campaigns,
  onOpenRecordModal,
  onViewReceipt,
  onSelectDonorById,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = filterDonations(donations, {
    query: searchQuery,
    campaignId: campaignFilter,
    paymentMethod: methodFilter,
    status: statusFilter,
  });

  // Sort by date descending
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalFilteredAmount = sorted.reduce(
    (acc, d) => (d.status === 'completed' ? acc + d.amount : acc),
    0
  );

  const handleExportCSV = () => {
    const csvContent = exportDonationsToCSV(sorted);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `donations_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-2xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-2xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1 text-2xs font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
            <AlertTriangle className="w-3 h-3" />
            <span>Refunded</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Donations Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">
            Auditable transaction records, 501(c)(3) receipt archives, and fund allocations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenRecordModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Record Gift</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip for this filtered view */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <span className="text-2xs text-slate-500 block uppercase tracking-wider">Filtered Revenue</span>
          <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            {formatCurrencyDetailed(totalFilteredAmount)}
          </span>
        </div>
        <div>
          <span className="text-2xs text-slate-500 block uppercase tracking-wider">Transactions Count</span>
          <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            {sorted.length}
          </span>
        </div>
        <div>
          <span className="text-2xs text-slate-500 block uppercase tracking-wider">Avg Contribution</span>
          <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            {sorted.length > 0
              ? formatCurrencyDetailed(totalFilteredAmount / (sorted.length || 1))
              : '$0.00'}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search donor, email, receipt..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-emerald-500"
            aria-label="Filter by campaign"
          >
            <option value="all">All Campaigns</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-emerald-500"
            aria-label="Filter by payment method"
          >
            <option value="all">All Payment Methods</option>
            <option value="credit_card">Credit / Debit Card</option>
            <option value="bank_transfer">ACH / Bank Wire</option>
            <option value="check">Check</option>
            <option value="cash">Cash</option>
            <option value="crypto">Cryptocurrency</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-emerald-500"
            aria-label="Filter by donation status"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Donor Name</th>
                <th className="py-3 px-4">Campaign Allocation</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No transactions match your search filters.
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setCampaignFilter('all');
                        setMethodFilter('all');
                        setStatusFilter('all');
                      }}
                      className="block mx-auto mt-2 text-xs text-emerald-700 font-medium hover:underline"
                    >
                      Reset filters
                    </button>
                  </td>
                </tr>
              ) : (
                sorted.map((don) => (
                  <tr key={don.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-2xs text-slate-600 font-medium">
                      {don.receiptNumber}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      {formatDate(don.date)}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onSelectDonorById(don.donorId)}
                        className="font-semibold text-slate-900 hover:text-emerald-700 text-left transition-colors"
                      >
                        {don.donorName}
                      </button>
                      <span className="text-2xs text-slate-400 block">{don.donorEmail}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">{don.campaignName}</span>
                      {don.dedication && (
                        <span className="text-2xs text-slate-500 block italic">
                          In {don.dedication.type} of {don.dedication.name}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatCurrencyDetailed(don.amount)}
                      {don.isRecurring && (
                        <span className="text-3xs bg-emerald-50 text-emerald-700 ml-1 px-1 py-0.5 rounded uppercase">
                          Mo
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 capitalize">
                      {don.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-center">{getStatusBadge(don.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onViewReceipt(don)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Displaying <strong className="text-slate-700">{sorted.length}</strong> recorded gifts
          </span>
          <span className="text-2xs">All gifts comply with IRS 501(c)(3) reporting standards</span>
        </div>
      </div>
    </div>
  );
};
