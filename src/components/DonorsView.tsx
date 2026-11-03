import React, { useState } from 'react';
import { Search, UserPlus, Filter, ArrowUpDown, ChevronRight, Mail, Phone } from 'lucide-react';
import { Donor, DonorTier } from '../types';
import { formatCurrency, formatDate, filterDonors } from '../utils/donorLogic';

interface DonorsViewProps {
  donors: Donor[];
  onSelectDonor: (donor: Donor) => void;
  onOpenAddDonorModal: () => void;
}

export const DonorsView: React.FC<DonorsViewProps> = ({
  donors,
  onSelectDonor,
  onOpenAddDonorModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'lifetime' | 'name' | 'lastGift'>('lifetime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filtered = filterDonors(donors, searchQuery, tierFilter, statusFilter);

  const sortedDonors = [...filtered].sort((a, b) => {
    let multiplier = sortDirection === 'asc' ? 1 : -1;
    if (sortField === 'lifetime') {
      return (a.lifetimeGiving - b.lifetimeGiving) * multiplier;
    }
    if (sortField === 'name') {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB) * multiplier;
    }
    if (sortField === 'lastGift') {
      const timeA = new Date(a.lastGiftDate || 0).getTime();
      const timeB = new Date(b.lastGiftDate || 0).getTime();
      return (timeA - timeB) * multiplier;
    }
    return 0;
  });

  const toggleSort = (field: 'lifetime' | 'name' | 'lastGift') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getTierLabel = (tier: DonorTier) => {
    switch (tier) {
      case 'major':
        return { label: 'Major', class: 'text-amber-800 bg-amber-50 border-amber-200' };
      case 'recurring':
        return { label: 'Sustainer', class: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
      case 'lapsed':
        return { label: 'Lapsed', class: 'text-rose-800 bg-rose-50 border-rose-200' };
      default:
        return { label: 'Regular', class: 'text-slate-700 bg-slate-100 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Donors Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage benefactor relationships, giving tiers, and stewardship histories
          </p>
        </div>
        <button
          onClick={onOpenAddDonorModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Donor</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, employer, or tag..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-colors"
            />
          </div>

          {/* Tier Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Tiers' },
              { id: 'major', label: 'Major ($5k+)' },
              { id: 'recurring', label: 'Monthly' },
              { id: 'regular', label: 'Regular' },
              { id: 'lapsed', label: 'Lapsed' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTierFilter(t.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  tierFilter === t.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-emerald-500"
            aria-label="Filter by donor status"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="new">New</option>
            <option value="lapsed">Lapsed</option>
          </select>
        </div>
      </div>

      {/* Donors Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                <th
                  onClick={() => toggleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Donor Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Tier & Status</th>
                <th
                  onClick={() => toggleSort('lifetime')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Lifetime Giving</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Gifts</th>
                <th
                  onClick={() => toggleSort('lastGift')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Last Gift</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Tags</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {sortedDonors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No donors matching the specified search or filter criteria.
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setTierFilter('all');
                        setStatusFilter('all');
                      }}
                      className="block mx-auto mt-2 text-xs text-emerald-700 font-medium hover:underline"
                    >
                      Clear search filters
                    </button>
                  </td>
                </tr>
              ) : (
                sortedDonors.map((donor) => {
                  const tierBadge = getTierLabel(donor.tier);
                  return (
                    <tr
                      key={donor.id}
                      onClick={() => onSelectDonor(donor)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-xs shrink-0 group-hover:bg-emerald-100 group-hover:text-emerald-900 transition-colors">
                            {donor.firstName[0]}
                            {donor.lastName[0]}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block group-hover:text-emerald-700 transition-colors">
                              {donor.firstName} {donor.lastName}
                            </span>
                            <span className="text-2xs text-slate-500 block">{donor.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-2xs px-2 py-0.5 rounded border font-medium ${tierBadge.class}`}
                          >
                            {tierBadge.label}
                          </span>
                          <span className="text-2xs text-slate-400 capitalize">
                            · {donor.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatCurrency(donor.lifetimeGiving)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-600 tabular-nums">
                        {donor.totalGifts}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        {formatDate(donor.lastGiftDate)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {donor.tags.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="text-2xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded"
                            >
                              {t}
                            </span>
                          ))}
                          {donor.tags.length > 2 && (
                            <span className="text-2xs text-slate-400">
                              +{donor.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDonor(donor);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition-colors"
                        >
                          <span>Profile</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-700">{sortedDonors.length}</strong> of{' '}
            <strong className="text-slate-700">{donors.length}</strong> donors
          </span>
          <span className="text-2xs">Click any row to view complete stewardship history</span>
        </div>
      </div>
    </div>
  );
};
