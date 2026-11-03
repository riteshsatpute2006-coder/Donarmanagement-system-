export type DonorTier = 'major' | 'recurring' | 'regular' | 'lapsed';
export type DonorStatus = 'active' | 'lapsed' | 'new';
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'check' | 'cash' | 'crypto';
export type DonationStatus = 'completed' | 'pending' | 'refunded';

export interface DonorNote {
  id: string;
  date: string;
  author: string;
  content: string;
  type: 'call' | 'meeting' | 'email' | 'general';
}

export interface Donor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  avatarUrl?: string;
  status: DonorStatus;
  tier: DonorTier;
  lifetimeGiving: number;
  totalGifts: number;
  firstGiftDate: string;
  lastGiftDate: string;
  recurringMonthly: boolean;
  tags: string[];
  employer?: string;
  notes: DonorNote[];
  createdDate: string;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  date: string;
  campaignId: string;
  campaignName: string;
  paymentMethod: PaymentMethod;
  status: DonationStatus;
  isRecurring: boolean;
  recurringFrequency?: 'monthly' | 'quarterly' | 'annual';
  dedication?: {
    type: 'memory' | 'honor';
    name: string;
  };
  isTaxDeductible: boolean;
  receiptNumber: string;
  notes?: string;
}

export interface Campaign {
  id: string;
  name: string;
  code: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  donorsCount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
  category: 'Emergency' | 'Infrastructure' | 'Health' | 'Education' | 'General';
}

export interface StewardshipTemplate {
  id: string;
  title: string;
  type: 'thank_you' | 'tax_receipt' | 'quarterly_update' | 'major_gift';
  subject: string;
  body: string;
}

export interface DashboardStats {
  totalRaised: number;
  totalDonors: number;
  activeRecurringDonors: number;
  averageDonation: number;
  retentionRate: number;
  thisMonthRaised: number;
  raisedGrowthPercent: number;
}
