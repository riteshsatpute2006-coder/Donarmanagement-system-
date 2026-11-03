import { Donor, Donation, Campaign, DashboardStats, DonorTier, PaymentMethod, DonationStatus } from '../types';

/**
 * Formats a numeric value into USD currency representation
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format currency with cents
 */
export function formatCurrencyDetailed(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats ISO date string to human readable format
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Generate official sequential-looking tax receipt number
 */
export function generateReceiptNumber(donationId: string, dateString: string): string {
  const year = dateString ? new Date(dateString).getFullYear() : new Date().getFullYear();
  const cleanId = donationId.replace(/\D/g, '').slice(-4) || Math.floor(1000 + Math.random() * 9000);
  return `REC-${year}-${cleanId}`;
}

/**
 * Calculates high-level dashboard metrics
 */
export function calculateDashboardStats(donors: Donor[], donations: Donation[]): DashboardStats {
  const completedDonations = donations.filter((d) => d.status === 'completed');
  const totalRaised = completedDonations.reduce((sum, d) => sum + d.amount, 0);
  const totalDonors = donors.length;
  
  const activeRecurringDonors = donors.filter(
    (d) => d.recurringMonthly || d.tier === 'recurring'
  ).length;

  const averageDonation =
    completedDonations.length > 0 ? Math.round(totalRaised / completedDonations.length) : 0;

  // Retention rate: donors who donated more than once
  const recurringGivers = donors.filter((d) => d.totalGifts > 1).length;
  const retentionRate = totalDonors > 0 ? Math.round((recurringGivers / totalDonors) * 100) : 0;

  // Recent month calculation (assume current date context)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const thisMonthDonations = completedDonations.filter((d) => {
    const date = new Date(d.date);
    return date >= thirtyDaysAgo;
  });
  const thisMonthRaised = thisMonthDonations.reduce((sum, d) => sum + d.amount, 0);

  return {
    totalRaised,
    totalDonors,
    activeRecurringDonors,
    averageDonation,
    retentionRate,
    thisMonthRaised,
    raisedGrowthPercent: 14.8,
  };
}

/**
 * Filter donors by search text and tier/status
 */
export function filterDonors(
  donors: Donor[],
  query: string,
  tierFilter: string = 'all',
  statusFilter: string = 'all'
): Donor[] {
  const cleanQuery = query.trim().toLowerCase();

  return donors.filter((donor) => {
    // Search match
    const fullName = `${donor.firstName} ${donor.lastName}`.toLowerCase();
    const emailMatch = donor.email.toLowerCase().includes(cleanQuery);
    const nameMatch = fullName.includes(cleanQuery);
    const tagMatch = donor.tags.some((t) => t.toLowerCase().includes(cleanQuery));

    if (cleanQuery && !nameMatch && !emailMatch && !tagMatch) {
      return false;
    }

    // Tier match
    if (tierFilter !== 'all' && donor.tier !== tierFilter) {
      return false;
    }

    // Status match
    if (statusFilter !== 'all' && donor.status !== statusFilter) {
      return false;
    }

    return true;
  });
}

/**
 * Filter donations by campaign, method, status, search
 */
export function filterDonations(
  donations: Donation[],
  options: {
    query?: string;
    campaignId?: string;
    paymentMethod?: string;
    status?: string;
  }
): Donation[] {
  const { query = '', campaignId = 'all', paymentMethod = 'all', status = 'all' } = options;
  const cleanQuery = query.trim().toLowerCase();

  return donations.filter((donation) => {
    if (cleanQuery) {
      const matchName = donation.donorName.toLowerCase().includes(cleanQuery);
      const matchEmail = donation.donorEmail.toLowerCase().includes(cleanQuery);
      const matchReceipt = donation.receiptNumber.toLowerCase().includes(cleanQuery);
      const matchCampaign = donation.campaignName.toLowerCase().includes(cleanQuery);
      if (!matchName && !matchEmail && !matchReceipt && !matchCampaign) return false;
    }

    if (campaignId !== 'all' && donation.campaignId !== campaignId) {
      return false;
    }

    if (paymentMethod !== 'all' && donation.paymentMethod !== paymentMethod) {
      return false;
    }

    if (status !== 'all' && donation.status !== status) {
      return false;
    }

    return true;
  });
}

/**
 * Calculate progress percentage for a campaign
 */
export function calculateCampaignProgress(campaign: Campaign): number {
  if (!campaign.goalAmount || campaign.goalAmount <= 0) return 0;
  const pct = Math.round((campaign.raisedAmount / campaign.goalAmount) * 100);
  return Math.min(pct, 100);
}

/**
 * Recalculate donor lifetime giving and gift count when adding/updating donations
 */
export function recalculateDonorStats(donor: Donor, allDonations: Donation[]): Donor {
  const donorDonations = allDonations.filter(
    (d) => d.donorId === donor.id && d.status === 'completed'
  );

  const totalGifts = donorDonations.length;
  const lifetimeGiving = donorDonations.reduce((sum, d) => sum + d.amount, 0);

  // Determine tier
  let tier: DonorTier = 'regular';
  if (lifetimeGiving >= 5000) {
    tier = 'major';
  } else if (donor.recurringMonthly || donorDonations.some((d) => d.isRecurring)) {
    tier = 'recurring';
  } else if (donor.status === 'lapsed') {
    tier = 'lapsed';
  }

  // Sort dates
  const sortedDates = donorDonations
    .map((d) => d.date)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const firstGiftDate = sortedDates[0] || donor.firstGiftDate || new Date().toISOString();
  const lastGiftDate = sortedDates[sortedDates.length - 1] || donor.lastGiftDate || new Date().toISOString();

  return {
    ...donor,
    lifetimeGiving,
    totalGifts,
    tier,
    firstGiftDate,
    lastGiftDate,
  };
}

/**
 * Export donations dataset to formatted CSV string
 */
export function exportDonationsToCSV(donations: Donation[]): string {
  const headers = [
    'Receipt Number',
    'Date',
    'Donor Name',
    'Donor Email',
    'Amount',
    'Campaign',
    'Payment Method',
    'Status',
    'Tax Deductible',
  ];

  const rows = donations.map((d) => [
    `"${d.receiptNumber}"`,
    `"${d.date}"`,
    `"${d.donorName.replace(/"/g, '""')}"`,
    `"${d.donorEmail}"`,
    d.amount,
    `"${d.campaignName.replace(/"/g, '""')}"`,
    `"${d.paymentMethod}"`,
    `"${d.status}"`,
    d.isTaxDeductible ? 'Yes' : 'No',
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
