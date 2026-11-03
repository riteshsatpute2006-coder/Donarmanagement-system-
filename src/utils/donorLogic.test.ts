import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCurrency,
  formatCurrencyDetailed,
  calculateDashboardStats,
  filterDonors,
  filterDonations,
  calculateCampaignProgress,
  recalculateDonorStats,
} from './donorLogic';
import { Donor, Donation, Campaign } from '../types';

const sampleDonors: Donor[] = [
  {
    id: 'd1',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 'sarah.j@example.com',
    phone: '555-0101',
    address: '100 Maple St',
    city: 'Seattle',
    state: 'WA',
    postalCode: '98101',
    country: 'USA',
    status: 'active',
    tier: 'major',
    lifetimeGiving: 12500,
    totalGifts: 4,
    firstGiftDate: '2024-01-10',
    lastGiftDate: '2026-02-15',
    recurringMonthly: false,
    tags: ['Board Member', 'Clean Water Advocate'],
    notes: [],
    createdDate: '2024-01-10',
  },
  {
    id: 'd2',
    firstName: 'Marcus',
    lastName: 'Vance',
    email: 'marcus.v@example.com',
    phone: '555-0102',
    address: '240 Elm St',
    city: 'Portland',
    state: 'OR',
    postalCode: '97201',
    country: 'USA',
    status: 'active',
    tier: 'recurring',
    lifetimeGiving: 1200,
    totalGifts: 12,
    firstGiftDate: '2025-01-01',
    lastGiftDate: '2026-02-01',
    recurringMonthly: true,
    tags: ['Monthly Sustainer'],
    notes: [],
    createdDate: '2025-01-01',
  },
  {
    id: 'd3',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'elena.r@example.com',
    phone: '555-0103',
    address: '88 Ocean Ave',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94102',
    country: 'USA',
    status: 'lapsed',
    tier: 'lapsed',
    lifetimeGiving: 250,
    totalGifts: 1,
    firstGiftDate: '2024-05-12',
    lastGiftDate: '2024-05-12',
    recurringMonthly: false,
    tags: ['Gala 2024'],
    notes: [],
    createdDate: '2024-05-12',
  },
];

const sampleDonations: Donation[] = [
  {
    id: 'don1',
    donorId: 'd1',
    donorName: 'Sarah Jenkins',
    donorEmail: 'sarah.j@example.com',
    amount: 5000,
    date: '2026-02-15',
    campaignId: 'c1',
    campaignName: 'Clean Water Initiative',
    paymentMethod: 'bank_transfer',
    status: 'completed',
    isRecurring: false,
    isTaxDeductible: true,
    receiptNumber: 'REC-2026-1001',
  },
  {
    id: 'don2',
    donorId: 'd2',
    donorName: 'Marcus Vance',
    donorEmail: 'marcus.v@example.com',
    amount: 100,
    date: '2026-02-01',
    campaignId: 'c2',
    campaignName: 'Emergency Medical Care',
    paymentMethod: 'credit_card',
    status: 'completed',
    isRecurring: true,
    isTaxDeductible: true,
    receiptNumber: 'REC-2026-1002',
  },
  {
    id: 'don3',
    donorId: 'd3',
    donorName: 'Elena Rostova',
    donorEmail: 'elena.r@example.com',
    amount: 250,
    date: '2024-05-12',
    campaignId: 'c1',
    campaignName: 'Clean Water Initiative',
    paymentMethod: 'credit_card',
    status: 'completed',
    isRecurring: false,
    isTaxDeductible: true,
    receiptNumber: 'REC-2024-1003',
  },
  {
    id: 'don4',
    donorId: 'd1',
    donorName: 'Sarah Jenkins',
    donorEmail: 'sarah.j@example.com',
    amount: 1000,
    date: '2026-02-18',
    campaignId: 'c1',
    campaignName: 'Clean Water Initiative',
    paymentMethod: 'credit_card',
    status: 'pending',
    isRecurring: false,
    isTaxDeductible: true,
    receiptNumber: 'REC-2026-1004',
  },
];

test('formatCurrency formats whole dollars properly', () => {
  assert.equal(formatCurrency(5000), '$5,000');
  assert.equal(formatCurrency(0), '$0');
});

test('formatCurrencyDetailed formats dollars with cents', () => {
  assert.equal(formatCurrencyDetailed(250.5), '$250.50');
});

test('calculateDashboardStats computes totals and donor counts correctly', () => {
  const stats = calculateDashboardStats(sampleDonors, sampleDonations);
  // completed donations: 5000 + 100 + 250 = 5350
  assert.equal(stats.totalRaised, 5350);
  assert.equal(stats.totalDonors, 3);
  assert.equal(stats.activeRecurringDonors, 1);
  assert.equal(stats.averageDonation, Math.round(5350 / 3));
});

test('filterDonors filters by name, email, and tier correctly', () => {
  const searchResult = filterDonors(sampleDonors, 'marcus');
  assert.equal(searchResult.length, 1);
  assert.equal(searchResult[0].id, 'd2');

  const tierResult = filterDonors(sampleDonors, '', 'major');
  assert.equal(tierResult.length, 1);
  assert.equal(tierResult[0].id, 'd1');

  const lapsedResult = filterDonors(sampleDonors, '', 'all', 'lapsed');
  assert.equal(lapsedResult.length, 1);
  assert.equal(lapsedResult[0].id, 'd3');
});

test('filterDonations filters by campaign and payment method', () => {
  const c1Donations = filterDonations(sampleDonations, { campaignId: 'c1' });
  assert.equal(c1Donations.length, 3);

  const cardDonations = filterDonations(sampleDonations, { paymentMethod: 'credit_card' });
  assert.equal(cardDonations.length, 3);
});

test('calculateCampaignProgress calculates percentage cap correctly', () => {
  const campaign: Campaign = {
    id: 'c1',
    name: 'Clean Water',
    code: 'CW-01',
    description: 'Clean water for rural communities',
    goalAmount: 10000,
    raisedAmount: 7500,
    donorsCount: 45,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'active',
    category: 'Infrastructure',
  };
  assert.equal(calculateCampaignProgress(campaign), 75);
});

test('recalculateDonorStats updates lifetime giving and tier', () => {
  const donor = sampleDonors[1]; // Marcus Vance
  const extraDonation: Donation = {
    id: 'don5',
    donorId: 'd2',
    donorName: 'Marcus Vance',
    donorEmail: 'marcus.v@example.com',
    amount: 5000,
    date: '2026-02-20',
    campaignId: 'c1',
    campaignName: 'Clean Water Initiative',
    paymentMethod: 'bank_transfer',
    status: 'completed',
    isRecurring: false,
    isTaxDeductible: true,
    receiptNumber: 'REC-2026-1005',
  };

  const updated = recalculateDonorStats(donor, [...sampleDonations, extraDonation]);
  // total gifts for d2: don2 ($100) + don5 ($5000) = 2 completed
  assert.equal(updated.totalGifts, 2);
  assert.equal(updated.lifetimeGiving, 5100);
  assert.equal(updated.tier, 'major'); // >= 5000 is major
});
