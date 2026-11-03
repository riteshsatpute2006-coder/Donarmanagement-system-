import React, { useState, useEffect } from 'react';
import { Donor, Donation, Campaign, DonorNote } from './types';
import { INITIAL_DONORS, INITIAL_DONATIONS, INITIAL_CAMPAIGNS } from './data/seedData';
import { recalculateDonorStats } from './utils/donorLogic';
import { Sidebar, NavView } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/DashboardView';
import { DonorsView } from './components/DonorsView';
import { DonationsView } from './components/DonationsView';
import { CampaignsView } from './components/CampaignsView';
import { StewardshipView } from './components/StewardshipView';
import { PublicGivingPortal } from './components/PublicGivingPortal';
import { RecordDonationModal } from './components/RecordDonationModal';
import { AddDonorModal } from './components/AddDonorModal';
import { DonorProfileDrawer } from './components/DonorProfileDrawer';
import { TaxReceiptModal } from './components/TaxReceiptModal';

const STORAGE_KEYS = {
  DONORS: 'kith_kin_donors_v1',
  DONATIONS: 'kith_kin_donations_v1',
  CAMPAIGNS: 'kith_kin_campaigns_v1',
};

export default function App() {
  // Initialize state with localStorage fallbacks
  const [donors, setDonors] = useState<Donor[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DONORS);
      return saved ? JSON.parse(saved) : INITIAL_DONORS;
    } catch {
      return INITIAL_DONORS;
    }
  });

  const [donations, setDonations] = useState<Donation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DONATIONS);
      return saved ? JSON.parse(saved) : INITIAL_DONATIONS;
    } catch {
      return INITIAL_DONATIONS;
    }
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
      return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
    } catch {
      return INITIAL_CAMPAIGNS;
    }
  });

  // Navigation & UI state
  const [currentView, setCurrentView] = useState<NavView>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals & Drawers state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [preselectedDonorIdForRecord, setPreselectedDonorIdForRecord] = useState<string | undefined>(undefined);
  const [isAddDonorModalOpen, setIsAddDonorModalOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [drawerDonorId, setDrawerDonorId] = useState<string | null>(null);
  const [receiptDonation, setReceiptDonation] = useState<Donation | null>(null);
  const [stewardshipTargetDonor, setStewardshipTargetDonor] = useState<Donor | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DONORS, JSON.stringify(donors));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
  }, [donors]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
  }, [donations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
  }, [campaigns]);

  // Handle new donation record
  const handleSaveDonation = (donation: Donation, newDonorData?: Partial<Donor>) => {
    let updatedDonors = [...donors];

    if (newDonorData && newDonorData.id) {
      // Add new donor
      const fullNewDonor: Donor = {
        id: newDonorData.id,
        firstName: newDonorData.firstName || 'Anonymous',
        lastName: newDonorData.lastName || 'Benefactor',
        email: newDonorData.email || 'noreply@example.org',
        phone: newDonorData.phone || '—',
        address: newDonorData.address || '—',
        city: newDonorData.city || '—',
        state: newDonorData.state || '—',
        postalCode: newDonorData.postalCode || '—',
        country: newDonorData.country || 'USA',
        status: 'new',
        tier: donation.amount >= 5000 ? 'major' : donation.isRecurring ? 'recurring' : 'regular',
        lifetimeGiving: donation.amount,
        totalGifts: 1,
        firstGiftDate: donation.date,
        lastGiftDate: donation.date,
        recurringMonthly: donation.isRecurring,
        tags: newDonorData.tags || ['New Donor'],
        employer: newDonorData.employer,
        notes: newDonorData.notes || [],
        createdDate: donation.date,
      };
      updatedDonors = [fullNewDonor, ...updatedDonors];
    }

    const updatedDonations = [donation, ...donations];

    // Recalculate stats for the donor
    const targetDonor = updatedDonors.find((d) => d.id === donation.donorId);
    if (targetDonor) {
      const recalculated = recalculateDonorStats(targetDonor, updatedDonations);
      updatedDonors = updatedDonors.map((d) => (d.id === recalculated.id ? recalculated : d));
    }

    // Update campaign raisedAmount and donorsCount
    const updatedCampaigns = campaigns.map((c) => {
      if (c.id === donation.campaignId) {
        return {
          ...c,
          raisedAmount: c.raisedAmount + (donation.status === 'completed' ? donation.amount : 0),
          donorsCount: c.donorsCount + 1,
        };
      }
      return c;
    });

    setDonors(updatedDonors);
    setDonations(updatedDonations);
    setCampaigns(updatedCampaigns);
  };

  // Handle donor add / edit
  const handleSaveDonor = (donor: Donor) => {
    const exists = donors.some((d) => d.id === donor.id);
    if (exists) {
      setDonors(donors.map((d) => (d.id === donor.id ? donor : d)));
    } else {
      setDonors([donor, ...donors]);
    }
  };

  // Handle note addition to donor
  const handleAddNoteToDonor = (donorId: string, note: DonorNote) => {
    setDonors((prev) =>
      prev.map((d) => {
        if (d.id === donorId) {
          const notes = d.notes ? [note, ...d.notes] : [note];
          return { ...d, notes };
        }
        return d;
      })
    );
  };

  // Reset to initial demo records
  const handleResetData = () => {
    if (window.confirm('Reset all donors, donations, and campaigns back to initial demo data?')) {
      localStorage.removeItem(STORAGE_KEYS.DONORS);
      localStorage.removeItem(STORAGE_KEYS.DONATIONS);
      localStorage.removeItem(STORAGE_KEYS.CAMPAIGNS);
      setDonors(INITIAL_DONORS);
      setDonations(INITIAL_DONATIONS);
      setCampaigns(INITIAL_CAMPAIGNS);
      setDrawerDonorId(null);
      setReceiptDonation(null);
    }
  };

  const activeDrawerDonor = donors.find((d) => d.id === drawerDonorId) || null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenRecordModal={() => {
          setPreselectedDonorIdForRecord(undefined);
          setIsRecordModalOpen(true);
        }}
        onResetData={handleResetData}
        totalDonors={donors.length}
        totalDonations={donations.length}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <TopBar
          currentView={currentView}
          onOpenRecordModal={() => {
            setPreselectedDonorIdForRecord(undefined);
            setIsRecordModalOpen(true);
          }}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onNavigateToPortal={() => setCurrentView('public_portal')}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'overview' && (
            <DashboardView
              donors={donors}
              donations={donations}
              campaigns={campaigns}
              onOpenRecordModal={() => {
                setPreselectedDonorIdForRecord(undefined);
                setIsRecordModalOpen(true);
              }}
              onOpenAddDonorModal={() => {
                setEditingDonor(null);
                setIsAddDonorModalOpen(true);
              }}
              onSelectDonorById={(donorId) => setDrawerDonorId(donorId)}
              onViewReceipt={(donation) => setReceiptDonation(donation)}
              onNavigateToCampaigns={() => setCurrentView('campaigns')}
              onNavigateToStewardshipWithDonor={(donor) => {
                setStewardshipTargetDonor(donor);
                setCurrentView('stewardship');
              }}
              onNavigateToPortal={() => setCurrentView('public_portal')}
            />
          )}

          {currentView === 'donors' && (
            <DonorsView
              donors={donors}
              onSelectDonor={(donor) => setDrawerDonorId(donor.id)}
              onOpenAddDonorModal={() => {
                setEditingDonor(null);
                setIsAddDonorModalOpen(true);
              }}
            />
          )}

          {currentView === 'donations' && (
            <DonationsView
              donations={donations}
              campaigns={campaigns}
              onOpenRecordModal={() => {
                setPreselectedDonorIdForRecord(undefined);
                setIsRecordModalOpen(true);
              }}
              onViewReceipt={(donation) => setReceiptDonation(donation)}
              onSelectDonorById={(donorId) => setDrawerDonorId(donorId)}
            />
          )}

          {currentView === 'campaigns' && (
            <CampaignsView
              campaigns={campaigns}
              donations={donations}
              onCreateCampaign={(newCampaign) => setCampaigns([newCampaign, ...campaigns])}
              onSelectDonorById={(donorId) => setDrawerDonorId(donorId)}
            />
          )}

          {currentView === 'stewardship' && (
            <StewardshipView
              donors={donors}
              donations={donations}
              onLogTouchpoint={(donorId, content, type) => {
                handleAddNoteToDonor(donorId, {
                  id: `note-${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  author: 'Stewardship Officer',
                  content,
                  type,
                });
              }}
              initialDonor={stewardshipTargetDonor}
            />
          )}

          {currentView === 'public_portal' && (
            <PublicGivingPortal
              campaigns={campaigns}
              onCompleteDonation={handleSaveDonation}
              onNavigateToLedger={() => setCurrentView('donations')}
              onViewReceipt={(donation) => setReceiptDonation(donation)}
            />
          )}
        </main>
      </div>

      {/* Record Donation Modal */}
      <RecordDonationModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        donors={donors}
        campaigns={campaigns}
        onSaveDonation={handleSaveDonation}
        preselectedDonorId={preselectedDonorIdForRecord}
      />

      {/* Add / Edit Donor Modal */}
      <AddDonorModal
        isOpen={isAddDonorModalOpen}
        onClose={() => {
          setIsAddDonorModalOpen(false);
          setEditingDonor(null);
        }}
        onSaveDonor={handleSaveDonor}
        initialDonor={editingDonor}
      />

      {/* Donor Detailed Profile Drawer */}
      <DonorProfileDrawer
        donor={activeDrawerDonor}
        donations={donations}
        onClose={() => setDrawerDonorId(null)}
        onEditDonor={(donor) => {
          setEditingDonor(donor);
          setIsAddDonorModalOpen(true);
        }}
        onRecordGiftForDonor={(donorId) => {
          setPreselectedDonorIdForRecord(donorId);
          setIsRecordModalOpen(true);
        }}
        onViewReceipt={(donation) => setReceiptDonation(donation)}
        onAddNote={handleAddNoteToDonor}
        onGenerateTaxStatement={(donor) => {
          setStewardshipTargetDonor(donor);
          setCurrentView('stewardship');
          setDrawerDonorId(null);
        }}
      />

      {/* 501(c)(3) Tax Receipt Modal */}
      <TaxReceiptModal
        donation={receiptDonation}
        donor={donors.find((d) => d.id === receiptDonation?.donorId) || null}
        onClose={() => setReceiptDonation(null)}
      />
    </div>
  );
}
