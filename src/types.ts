export type DestinationType = 'raast' | 'bank' | 'wallet' | 'cnic';

export type TransactionType =
  | 'transfer_send'
  | 'transfer_receive'
  | 'bill_payment'
  | 'mobile_load'
  | 'add_money'
  | 'qr_pay'
  | 'cash_pickup'
  | 'zakat_donation'
  | 'savings_deposit'
  | 'savings_withdraw';

export interface RecipientInfo {
  name: string;
  accountNumber: string;
  bankOrWallet: string;
  type: DestinationType;
  raastId?: string;
  iban?: string;
  cnic?: string;
  avatarBg?: string;
  verified?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  subtitle: string;
  amount: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  recipient: RecipientInfo;
  raastRef?: string;
  fee: number;
  purpose?: string;
  category: string;
  note?: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  phoneOrAccount: string;
  bankOrWallet: string;
  type: DestinationType;
  avatarBg: string;
  isFavorite: boolean;
  lastTransferDate?: string;
}

export interface BillCompany {
  id: string;
  name: string;
  urduName: string;
  category: 'electricity' | 'gas' | 'water' | 'internet' | 'government';
  logoText: string;
  badgeColor: string;
  sampleConsumerNo: string;
  consumerNoLength: number;
  sampleAmount: number;
  sampleDueDate: string;
  sampleConsumerTitle: string;
}

export interface TelcoBundle {
  id: string;
  title: string;
  urduTitle: string;
  type: 'hybrid' | 'data' | 'voice' | 'sms';
  dataGb: string;
  onNetMins: string;
  offNetMins: string;
  sms: string;
  validity: string;
  price: number;
  isPopular?: boolean;
}

export interface TelcoOperator {
  id: 'jazz' | 'zong' | 'telenor' | 'ufone' | 'onic';
  name: string;
  prefix: string[];
  brandColor: string;
  badgeBg: string;
  textColor: string;
  bundles: TelcoBundle[];
}

export interface SavingsPocket {
  id: string;
  title: string;
  urduTitle: string;
  targetAmount: number;
  currentAmount: number;
  category: 'emergency' | 'hajj' | 'vehicle' | 'gadget' | 'general';
  profitRate: number; // e.g. 11.5% Halal Mudarabah profit
  lastProfitCredited?: number;
}

export interface CharityOrg {
  id: string;
  name: string;
  urduName: string;
  category: 'zakat' | 'sadqah' | 'health' | 'food' | 'disaster';
  logoText: string;
  color: string;
  description: string;
  verifiedTaxExempt: boolean;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  cnic: string;
  raastId: string;
  tier: 'Level 0' | 'Level 1 (Biometric)' | 'Level 2 (Asaan Digital)';
  dailyLimit: number;
  dailyUsed: number;
  monthlyLimit: number;
  monthlyUsed: number;
  balance: number;
  isBiometricEnabled: boolean;
  romanUrduAssisted: boolean;
  avatarInitials: string;
  accountCreated: string;
}
