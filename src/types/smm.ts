export type Role = 'user' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'banned';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  balance: number; // in USD
  spent: number;   // in USD
  currency: 'USD' | 'PKR';
  apiKey: string;
  status: UserStatus;
  customRates?: Record<number, number>; // serviceId -> custom rate per 1000
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  sortOrder: number;
  status: 'active' | 'inactive';
}

export interface Service {
  id: number;
  categoryId: number;
  name: string;
  type: 'Default' | 'Custom Comments' | 'Package' | 'Subscriptions';
  rate: number; // Base rate per 1000 in USD
  minQuantity: number;
  maxQuantity: number;
  description: string;
  dripfeed: boolean;
  refill: boolean;
  apiProviderId?: number;
  apiServiceId?: string;
  status: 'active' | 'inactive';
}

export type OrderStatus = 'Pending' | 'Processing' | 'In progress' | 'Completed' | 'Partial' | 'Canceled' | 'Refunded';

export interface Order {
  id: number;
  userId: number;
  username: string;
  serviceId: number;
  serviceName: string;
  categoryName: string;
  link: string;
  quantity: number;
  charge: number; // in USD
  startCount: number;
  remains: number;
  status: OrderStatus;
  apiProviderId?: number;
  apiOrderId?: string;
  apiStatus?: string;
  isApi?: boolean;
  runs?: number;
  interval?: number;
  createdAt: string;
}

export interface ApiProvider {
  id: number;
  name: string;
  url: string;
  apiKey: string;
  balance: number;
  currency: string;
  status: 'active' | 'inactive';
  lastSync?: string;
}

export type PaymentMethod = 'easypaisa' | 'jazzcash' | 'bank_transfer' | 'binance_pay' | 'perfect_money';
export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface Payment {
  id: number;
  userId: number;
  username: string;
  method: PaymentMethod;
  amount: number;       // In USD
  amountPkr?: number;   // In PKR if local payment
  currency: string;
  trxId: string;
  senderPhone?: string;
  accountTitle?: string;
  status: PaymentStatus;
  adminNotes?: string;
  createdAt: string;
  approvedAt?: string;
}

export interface TicketMessage {
  id: number;
  ticketId: number;
  userId: number;
  userName: string;
  isAdmin: boolean;
  message: string;
  createdAt: string;
}

export type TicketStatus = 'open' | 'answered' | 'closed';

export interface Ticket {
  id: number;
  userId: number;
  username: string;
  subject: string;
  category: 'order' | 'payment' | 'service' | 'api' | 'other';
  orderId?: number;
  status: TicketStatus;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export interface SystemSettings {
  siteTitle: string;
  currencySymbol: string;
  activeCurrency: 'USD' | 'PKR';
  usdToPkrRate: number;
  easypaisaTitle: string;
  easypaisaNumber: string;
  jazzcashTitle: string;
  jazzcashNumber: string;
  bankTitle: string;
  bankAccount: string;
  bankName: string;
  bankIban: string;
  binanceTrc20Address: string;
  perfectMoneyAccount: string;
  maintenanceMode: boolean;
  announcement: string;
  childPanelMonthlyFee: number; // in USD
}

export interface ChildPanel {
  id: number;
  userId: number;
  username: string;
  domain: string;
  currency: 'USD' | 'PKR';
  adminUser: string;
  priceMonthly: number;
  status: 'pending' | 'active' | 'suspended' | 'canceled';
  nameservers: string[];
  createdAt: string;
}

export interface SavedUrl {
  id: number;
  userId: number;
  title: string;
  url: string;
  platform: string;
  createdAt: string;
}

export interface ReferralFriend {
  id: number;
  username: string;
  joinedAt: string;
  totalDeposited: number;
  commissionEarned: number;
}
