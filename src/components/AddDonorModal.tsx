import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Donor, DonorTier, DonorStatus } from '../types';

interface AddDonorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDonor: (donor: Donor) => void;
  initialDonor?: Donor | null;
}

export const AddDonorModal: React.FC<AddDonorModalProps> = ({
  isOpen,
  onClose,
  onSaveDonor,
  initialDonor,
}) => {
  if (!isOpen) return null;

  const isEditing = !!initialDonor;

  const [firstName, setFirstName] = useState(initialDonor?.firstName || '');
  const [lastName, setLastName] = useState(initialDonor?.lastName || '');
  const [email, setEmail] = useState(initialDonor?.email || '');
  const [phone, setPhone] = useState(initialDonor?.phone || '');
  const [address, setAddress] = useState(initialDonor?.address || '');
  const [city, setCity] = useState(initialDonor?.city || '');
  const [state, setState] = useState(initialDonor?.state || '');
  const [postalCode, setPostalCode] = useState(initialDonor?.postalCode || '');
  const [country, setCountry] = useState(initialDonor?.country || 'United States');
  const [employer, setEmployer] = useState(initialDonor?.employer || '');
  const [tier, setTier] = useState<DonorTier>(initialDonor?.tier || 'regular');
  const [status, setStatus] = useState<DonorStatus>(initialDonor?.status || 'new');
  const [tagInput, setTagInput] = useState(initialDonor?.tags.join(', ') || 'Community Member');
  const [initialNote, setInitialNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('Please provide at least a first name, last name, and contact email.');
      return;
    }

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const notesList = initialDonor?.notes ? [...initialDonor.notes] : [];
    if (initialNote.trim()) {
      notesList.unshift({
        id: `note-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        author: 'Staff Entry',
        content: initialNote.trim(),
        type: 'general',
      });
    }

    const donor: Donor = {
      id: initialDonor?.id || `donor-${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim() || '—',
      address: address.trim() || '—',
      city: city.trim() || '—',
      state: state.trim() || '—',
      postalCode: postalCode.trim() || '—',
      country: country.trim() || 'USA',
      status,
      tier,
      lifetimeGiving: initialDonor?.lifetimeGiving || 0,
      totalGifts: initialDonor?.totalGifts || 0,
      firstGiftDate: initialDonor?.firstGiftDate || '',
      lastGiftDate: initialDonor?.lastGiftDate || '',
      recurringMonthly: initialDonor?.recurringMonthly || tier === 'recurring',
      employer: employer.trim() || undefined,
      tags: tags.length > 0 ? tags : ['General Supporter'],
      notes: notesList,
      createdDate: initialDonor?.createdDate || new Date().toISOString().split('T')[0],
    };

    onSaveDonor(donor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {isEditing ? 'Edit Donor Profile' : 'Add New Donor'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing ? 'Update constituent details and CRM records' : 'Register a new benefactor or constituent profile'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Names */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Eleanor"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Sterling"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="eleanor@example.org"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 234-5678"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Employer & Address */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Employer / Affiliation</label>
            <input
              type="text"
              value={employer}
              onChange={(e) => setEmployer(e.target.value)}
              placeholder="e.g. Apex BioTech / Sterling Family Fund"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Street Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Orchard Lane, Suite 200"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Seattle"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">State / Province</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="WA"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Postal Code</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="98101"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Tier and Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Giving Tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as DonorTier)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                aria-label="Select giving tier"
              >
                <option value="regular">Regular Supporter</option>
                <option value="recurring">Recurring Sustainer</option>
                <option value="major">Major Benefactor ($5,000+)</option>
                <option value="lapsed">Lapsed Constituent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DonorStatus)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                aria-label="Select donor status"
              >
                <option value="active">Active</option>
                <option value="new">New</option>
                <option value="lapsed">Lapsed</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Constituent Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. Major Donor, Clean Water, Board Member"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Initial note */}
          {!isEditing && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Initial Stewardship Note (Optional)
              </label>
              <textarea
                rows={2}
                value={initialNote}
                onChange={(e) => setInitialNote(e.target.value)}
                placeholder="e.g. Met at annual gala; expressed interest in clean water initiative."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Actions */}
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
              className="px-5 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            >
              {isEditing ? 'Save Changes' : 'Create Donor Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
