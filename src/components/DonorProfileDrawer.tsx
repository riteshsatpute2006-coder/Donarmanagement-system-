import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  DollarSign,
  Plus,
  FileText,
  Clock,
  MessageSquare,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Donor, Donation, DonorNote } from '../types';
import { formatCurrency, formatCurrencyDetailed, formatDate } from '../utils/donorLogic';

interface DonorProfileDrawerProps {
  donor: Donor | null;
  donations: Donation[];
  onClose: () => void;
  onEditDonor: (donor: Donor) => void;
  onRecordGiftForDonor: (donorId: string) => void;
  onViewReceipt: (donation: Donation) => void;
  onAddNote: (donorId: string, note: DonorNote) => void;
  onGenerateTaxStatement: (donor: Donor) => void;
}

export const DonorProfileDrawer: React.FC<DonorProfileDrawerProps> = ({
  donor,
  donations,
  onClose,
  onEditDonor,
  onRecordGiftForDonor,
  onViewReceipt,
  onAddNote,
  onGenerateTaxStatement,
}) => {
  if (!donor) return null;

  const donorDonations = donations
    .filter((d) => d.donorId === donor.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a).getTime());

  const [activeTab, setActiveTab] = useState<'giving' | 'notes' | 'details'>('giving');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState<'call' | 'meeting' | 'email' | 'general'>('call');

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    const note: DonorNote = {
      id: `note-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      author: 'Development Officer',
      content: newNoteContent.trim(),
      type: newNoteType,
    };

    onAddNote(donor.id, note);
    setNewNoteContent('');
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'major':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'recurring':
        return 'text-emerald-800 bg-emerald-50 border-emerald-200';
      case 'lapsed':
        return 'text-rose-800 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-800 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-base shrink-0">
              {donor.firstName[0]}
              {donor.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {donor.firstName} {donor.lastName}
                </h2>
                <span
                  className={`text-xs px-2 py-0.5 rounded border capitalize font-medium ${getTierBadge(
                    donor.tier
                  )}`}
                >
                  {donor.tier === 'major'
                    ? 'Major Benefactor'
                    : donor.tier === 'recurring'
                    ? 'Monthly Sustainer'
                    : donor.tier === 'lapsed'
                    ? 'Lapsed'
                    : 'Regular Donor'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {donor.email}
                </span>
                {donor.phone && donor.phone !== '—' && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {donor.phone}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close profile drawer"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-4 gap-2 px-6 py-3 bg-white border-b border-slate-100 text-center">
          <div className="p-2 bg-slate-50 rounded-lg">
            <span className="block text-xs text-slate-500">Lifetime Giving</span>
            <span className="font-mono font-bold text-slate-900 text-base tabular-nums">
              {formatCurrency(donor.lifetimeGiving)}
            </span>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <span className="block text-xs text-slate-500">Total Gifts</span>
            <span className="font-mono font-bold text-slate-900 text-base tabular-nums">
              {donor.totalGifts}
            </span>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <span className="block text-xs text-slate-500">Last Gift</span>
            <span className="text-xs font-semibold text-slate-800 mt-1 block">
              {formatDate(donor.lastGiftDate)}
            </span>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <span className="block text-xs text-slate-500">Status</span>
            <span className="text-xs font-semibold text-slate-800 capitalize mt-1 block">
              {donor.status}
            </span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRecordGiftForDonor(donor.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Record Gift</span>
            </button>
            <button
              onClick={() => onGenerateTaxStatement(donor)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tax Statement</span>
            </button>
          </div>
          <button
            onClick={() => onEditDonor(donor)}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded hover:bg-slate-100"
          >
            Edit Constituent
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 px-6 gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('giving')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'giving'
                ? 'border-emerald-600 text-emerald-800 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Giving History ({donorDonations.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'notes'
                ? 'border-emerald-600 text-emerald-800 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Stewardship Notes ({donor.notes?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-emerald-600 text-emerald-800 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Constituent Info
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: GIVING HISTORY */}
          {activeTab === 'giving' && (
            <div className="space-y-4">
              {donorDonations.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No donations logged yet for this donor.</p>
                  <button
                    onClick={() => onRecordGiftForDonor(donor.id)}
                    className="mt-3 text-xs text-emerald-700 font-medium hover:underline"
                  >
                    + Record First Gift
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {donorDonations.map((don) => (
                    <div
                      key={don.id}
                      className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-white flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {formatCurrencyDetailed(don.amount)}
                          </span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs font-medium text-slate-700">{don.campaignName}</span>
                          {don.isRecurring && (
                            <span className="text-2xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded uppercase">
                              Recurring
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span>{formatDate(don.date)}</span>
                          <span>·</span>
                          <span className="capitalize">{don.paymentMethod.replace('_', ' ')}</span>
                          <span>·</span>
                          <span className="font-mono">{don.receiptNumber}</span>
                        </div>
                        {don.dedication && (
                          <p className="text-xs text-slate-500 italic mt-1">
                            In {don.dedication.type} of {don.dedication.name}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => onViewReceipt(don)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STEWARDSHIP NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              {/* Form to add note */}
              <form
                onSubmit={handleAddNoteSubmit}
                className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Log Touchpoint / Note</span>
                  <div className="flex gap-1.5">
                    {(['call', 'meeting', 'email', 'general'] as const).map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setNewNoteType(type)}
                        className={`text-2xs px-2 py-0.5 rounded capitalize transition-colors ${
                          newNoteType === type
                            ? 'bg-slate-900 text-white'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={2}
                  required
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Record call summary, meeting highlights, or outreach commitments..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-emerald-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
                  >
                    Save Touchpoint
                  </button>
                </div>
              </form>

              {/* Timeline of existing notes */}
              <div className="space-y-4">
                {donor.notes && donor.notes.length > 0 ? (
                  donor.notes.map((note) => (
                    <div key={note.id} className="relative pl-6 border-l-2 border-slate-200 pb-2">
                      <div className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full bg-slate-400 border-2 border-white" />
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span className="font-semibold text-slate-700 capitalize">
                          {note.type} · {note.author}
                        </span>
                        <span>{formatDate(note.date)}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-md border border-slate-100 shadow-2xs">
                        {note.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No notes recorded yet. Log the first touchpoint above.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CONSTITUENT INFO */}
          {activeTab === 'details' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
                <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">
                  Contact & Location
                </h4>
                <div className="grid grid-cols-2 gap-3 text-slate-600">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Primary Email</span>
                    <span className="font-medium text-slate-900">{donor.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Phone Number</span>
                    <span className="font-medium text-slate-900">{donor.phone || '—'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block mb-0.5">Mailing Address</span>
                    <span className="font-medium text-slate-900">
                      {donor.address !== '—'
                        ? `${donor.address}, ${donor.city}, ${donor.state} ${donor.postalCode}, ${donor.country}`
                        : 'No physical address on file'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
                <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">
                  Constituent Profile
                </h4>
                <div className="grid grid-cols-2 gap-3 text-slate-600">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Employer / Affiliation</span>
                    <span className="font-medium text-slate-900">{donor.employer || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">First Gift Date</span>
                    <span className="font-medium text-slate-900">{formatDate(donor.firstGiftDate)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Recurring Sustainer</span>
                    <span className="font-medium text-slate-900">
                      {donor.recurringMonthly ? 'Yes (Active Monthly)' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Member Since</span>
                    <span className="font-medium text-slate-900">{formatDate(donor.createdDate)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block mb-1">Tags & Interests</span>
                  <div className="flex flex-wrap gap-1.5">
                    {donor.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-2xs font-medium text-slate-700 bg-white border border-slate-200 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
