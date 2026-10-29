import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Category,
  Service,
  Order,
  OrderStatus,
  ApiProvider,
  Payment,
  PaymentMethod,
  Ticket,
  TicketStatus,
  SystemSettings,
  Role,
  ChildPanel,
  SavedUrl,
  ReferralFriend
} from '../types/smm';

interface SMMContextType {
  currentUser: User | null;
  users: User[];
  categories: Category[];
  services: Service[];
  orders: Order[];
  apiProviders: ApiProvider[];
  payments: Payment[];
  tickets: Ticket[];
  settings: SystemSettings;
  activeCurrency: 'USD' | 'PKR';
  setActiveCurrency: (cur: 'USD' | 'PKR') => void;
  // Auth
  login: (identifier: string, pass: string) => boolean;
  register: (username: string, email: string, pass: string) => boolean;
  logout: () => void;
  switchRole: (role: Role) => void;
  // Dedicated Admin Auth
  isAdminLoggedIn: boolean;
  adminLogin: (identifier: string, pass: string) => boolean;
  adminLogout: () => void;
  // Currency helpers
  formatCurrency: (usdAmount: number, forceCurrency?: 'USD' | 'PKR') => string;
  convertUsdToPkr: (usd: number) => number;
  convertPkrToUsd: (pkr: number) => number;
  // User Actions
  createOrder: (data: { serviceId: number; link: string; quantity: number; runs?: number; interval?: number }) => { success: boolean; message: string; orderId?: number };
  createMassOrder: (text: string) => { successCount: number; failCount: number; errors: string[] };
  submitPayment: (data: { method: PaymentMethod; amount: number; amountPkr?: number; trxId: string; senderPhone?: string; accountTitle?: string }) => { success: boolean; message: string };
  createTicket: (data: { subject: string; category: Ticket['category']; orderId?: number; message: string; priority?: Ticket['priority'] }) => { success: boolean; message: string; ticketId?: number };
  replyTicket: (ticketId: number, message: string) => void;
  regenerateApiKey: (userId: number) => string;
  // Admin Actions
  approvePayment: (paymentId: number, adminNotes?: string) => void;
  rejectPayment: (paymentId: number, adminNotes: string) => void;
  updateTicketStatus: (ticketId: number, status: TicketStatus) => void;
  adjustUserBalance: (userId: number, amountUsd: number, reason?: string) => void;
  updateUserStatus: (userId: number, status: User['status']) => void;
  setUserCustomRate: (userId: number, serviceId: number, customRate: number | null) => void;
  saveCategory: (category: Partial<Category>) => void;
  deleteCategory: (id: number) => void;
  saveService: (service: Partial<Service>) => void;
  deleteService: (id: number) => void;
  saveApiProvider: (provider: Partial<ApiProvider>) => void;
  deleteApiProvider: (id: number) => void;
  syncProviderServices: (providerId: number) => number;
  updateOrderStatus: (orderId: number, status: OrderStatus) => void;
  refundOrder: (orderId: number) => void;
  resendOrderToApi: (orderId: number) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  runAutomatedCron: () => { forwarded: number; synced: number };
  // Child Panel & URL Options
  childPanels: ChildPanel[];
  savedUrls: SavedUrl[];
  referralFriends: ReferralFriend[];
  createChildPanel: (data: { domain: string; adminUser: string; currency: 'USD' | 'PKR' }) => { success: boolean; message: string };
  updateChildPanelStatus: (id: number, status: ChildPanel['status']) => void;
  addSavedUrl: (data: { title: string; url: string; platform: string }) => void;
  deleteSavedUrl: (id: number) => void;
  claimReferralEarnings: () => { success: boolean; amount: number; message: string };
}

const STORAGE_KEY = 'aksmm_panel_state_v4';

const defaultSettings: SystemSettings = {
  siteTitle: 'AK SMM Panel - #1 SMM Reseller Panel in Pakistan',
  currencySymbol: 'Rs.',
  activeCurrency: 'PKR',
  usdToPkrRate: 280.0,
  easypaisaTitle: 'Kaleem Ullah',
  easypaisaNumber: '03338831737',
  jazzcashTitle: 'Kaleem Ullah',
  jazzcashNumber: '03338831737',
  bankTitle: 'Kaleem Ullah',
  bankAccount: '03338831737',
  bankName: 'Meezan Bank Limited',
  bankIban: 'PK64MEZN0003338831737001',
  binanceTrc20Address: 'TP7eR69g4fQnK8FwE3R8s7tQ4bN1v9X2yA',
  perfectMoneyAccount: 'U38291048',
  maintenanceMode: false,
  announcement: '🎉 Welcome to AK SMM Panel! Pakistan’s cheapest SMM provider. 0% fee EasyPaisa & JazzCash deposits (Kaleem Ullah - 03338831737) with instant automated delivery.',
  childPanelMonthlyFee: 10.0
};

const initialUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@smmpanel.com',
    role: 'admin',
    balance: 550.0,
    spent: 120.0,
    currency: 'USD',
    apiKey: 'adm_smm_9a8b7c6d5e4f3a2b1c0099',
    status: 'active',
    createdAt: '2026-01-15'
  },
  {
    id: 2,
    username: 'kaleem',
    email: 'kaleemullahkhan144@gmail.com',
    role: 'user',
    balance: 85.5,
    spent: 314.5,
    currency: 'USD',
    apiKey: 'usr_key_8f3a9e1d2c4b5a6e7f8842',
    status: 'active',
    createdAt: '2026-02-10'
  },
  {
    id: 3,
    username: 'digital_pro',
    email: 'growth@agency.pk',
    role: 'user',
    balance: 240.0,
    spent: 890.0,
    currency: 'USD',
    apiKey: 'usr_key_31ab42ef90123c55',
    status: 'active',
    customRates: { 101: 1.10 },
    createdAt: '2026-03-01'
  }
];

const initialCategories: Category[] = [
  { id: 1, name: 'Instagram Followers [Guaranteed / Non-Drop]', icon: 'instagram', sortOrder: 1, status: 'active' },
  { id: 2, name: 'Instagram Likes & Views [Instant High Speed]', icon: 'instagram', sortOrder: 2, status: 'active' },
  { id: 3, name: 'TikTok Followers & Video Likes', icon: 'video', sortOrder: 3, status: 'active' },
  { id: 4, name: 'YouTube Subscribers & 4000h Watchtime', icon: 'youtube', sortOrder: 4, status: 'active' },
  { id: 5, name: 'Facebook Page Likes & Post Engagement', icon: 'facebook', sortOrder: 5, status: 'active' },
  { id: 6, name: 'Telegram Members & Channel Reactions', icon: 'send', sortOrder: 6, status: 'active' },
  { id: 7, name: 'Twitter / X Followers & Retweets', icon: 'twitter', sortOrder: 7, status: 'active' },
  { id: 8, name: 'Spotify Music Plays & Monthly Listeners', icon: 'music', sortOrder: 8, status: 'active' },
];

const initialApiProviders: ApiProvider[] = [
  {
    id: 1,
    name: 'Global SMM Server Node 1',
    url: 'https://smmhub.example.com/api/v2',
    apiKey: 'prov_key_998877665544332211',
    balance: 428.5,
    currency: 'USD',
    status: 'active',
    lastSync: '2026-10-28 20:30'
  },
  {
    id: 2,
    name: 'Turbo Reseller Direct API',
    url: 'https://turbosmm.example.com/api/v2',
    apiKey: 'turbo_live_920183746193',
    balance: 184.2,
    currency: 'USD',
    status: 'active',
    lastSync: '2026-10-28 21:15'
  }
];

const initialServices: Service[] = [
  {
    id: 101,
    categoryId: 1,
    name: 'Instagram Real Followers | 30 Days Auto Refill | Non-Drop',
    type: 'Default',
    rate: 1.25,
    minQuantity: 50,
    maxQuantity: 50000,
    description: 'Start: 0-15 minutes. Speed: 5,000 to 10,000/day. High-quality global accounts with posts and profile pictures. 30 days automatic refill button enabled.',
    dripfeed: true,
    refill: true,
    apiProviderId: 1,
    apiServiceId: '501',
    status: 'active'
  },
  {
    id: 102,
    categoryId: 1,
    name: 'Instagram Targeted Pakistani Followers [Real Accounts]',
    type: 'Default',
    rate: 3.40,
    minQuantity: 100,
    maxQuantity: 10000,
    description: '100% Genuine Pakistani followers with local profile names and Urdu bios. Excellent for local brands, restaurants, influencers and eCommerce stores.',
    dripfeed: false,
    refill: true,
    apiProviderId: 1,
    apiServiceId: '502',
    status: 'active'
  },
  {
    id: 103,
    categoryId: 2,
    name: 'Instagram High Speed Likes [Instant Start / 100k Daily]',
    type: 'Default',
    rate: 0.35,
    minQuantity: 20,
    maxQuantity: 100000,
    description: 'Super fast instant delivery within 60 seconds. Works on reels, IGTV, carousels and static photo posts. Safe and undetectable.',
    dripfeed: true,
    refill: false,
    apiProviderId: 1,
    apiServiceId: '601',
    status: 'active'
  },
  {
    id: 104,
    categoryId: 2,
    name: 'Instagram Reel Views [100% Organic Explore Reach Boost]',
    type: 'Default',
    rate: 0.08,
    minQuantity: 500,
    maxQuantity: 1000000,
    description: 'Ultra fast video views from genuine discovery feeds. Helps trigger the Instagram explore algorithm. Max 1,000,000 per post.',
    dripfeed: true,
    refill: false,
    apiProviderId: 1,
    apiServiceId: '602',
    status: 'active'
  },
  {
    id: 105,
    categoryId: 3,
    name: 'TikTok Real Followers [Global HQ Accounts / Lifetime Safe]',
    type: 'Default',
    rate: 2.10,
    minQuantity: 100,
    maxQuantity: 30000,
    description: 'Real TikTok profiles with bio and videos. Start time: 0-30 mins. Unlocks TikTok Live Stream feature at 1,000 followers.',
    dripfeed: true,
    refill: true,
    apiProviderId: 2,
    apiServiceId: '701',
    status: 'active'
  },
  {
    id: 106,
    categoryId: 3,
    name: 'TikTok Video Likes [Instant High Retention]',
    type: 'Default',
    rate: 0.45,
    minQuantity: 50,
    maxQuantity: 50000,
    description: 'High retention TikTok hearts. Boosts ranking on the For You Page (FYP). Immediate processing.',
    dripfeed: true,
    refill: false,
    apiProviderId: 2,
    apiServiceId: '702',
    status: 'active'
  },
  {
    id: 107,
    categoryId: 4,
    name: 'YouTube 4000 Monetization Watch Hours [Refill 60 Days]',
    type: 'Package',
    rate: 18.00,
    minQuantity: 500,
    maxQuantity: 4000,
    description: 'Requirements: Video duration must be 15+ minutes. Safe for YouTube Partner Program review. Non-drop high retention views.',
    dripfeed: false,
    refill: true,
    apiProviderId: 1,
    apiServiceId: '801',
    status: 'active'
  },
  {
    id: 108,
    categoryId: 4,
    name: 'YouTube Organic Subscribers [Non-Drop / Lifetime Refill]',
    type: 'Default',
    rate: 9.50,
    minQuantity: 50,
    maxQuantity: 5000,
    description: 'Permanent subscribers from verified active Google accounts. Speed: 50-150/day to ensure 100% channel safety and zero strikes.',
    dripfeed: true,
    refill: true,
    apiProviderId: 1,
    apiServiceId: '802',
    status: 'active'
  },
  {
    id: 109,
    categoryId: 5,
    name: 'Facebook Fan Page Likes + Followers [Global Profiles]',
    type: 'Default',
    rate: 2.80,
    minQuantity: 100,
    maxQuantity: 20000,
    description: 'Simultaneously adds Page Likes and Page Followers. Clean genuine profiles with friends and activity.',
    dripfeed: true,
    refill: true,
    apiProviderId: 2,
    apiServiceId: '901',
    status: 'active'
  },
  {
    id: 110,
    categoryId: 6,
    name: 'Telegram Real Channel Members [0% Drop / Instant]',
    type: 'Default',
    rate: 0.95,
    minQuantity: 100,
    maxQuantity: 50000,
    description: 'Fast members for public and private Telegram channels/groups. Start: 0-10 mins. Clean avatars and usernames.',
    dripfeed: true,
    refill: true,
    apiProviderId: 1,
    apiServiceId: '951',
    status: 'active'
  }
];

const initialOrders: Order[] = [
  {
    id: 10042,
    userId: 2,
    username: 'kaleem',
    serviceId: 101,
    serviceName: 'Instagram Real Followers | 30 Days Auto Refill | Non-Drop',
    categoryName: 'Instagram Followers',
    link: 'https://instagram.com/kaleem_official',
    quantity: 2000,
    charge: 2.50,
    startCount: 1420,
    remains: 0,
    status: 'Completed',
    apiProviderId: 1,
    apiOrderId: '849201',
    apiStatus: 'completed',
    createdAt: '2026-10-27 14:20'
  },
  {
    id: 10043,
    userId: 2,
    username: 'kaleem',
    serviceId: 103,
    serviceName: 'Instagram High Speed Likes [Instant Start / 100k Daily]',
    categoryName: 'Instagram Likes & Views',
    link: 'https://instagram.com/p/DBv9Q7Xz1/',
    quantity: 1500,
    charge: 0.525,
    startCount: 340,
    remains: 200,
    status: 'In progress',
    apiProviderId: 1,
    apiOrderId: '849312',
    apiStatus: 'inprogress',
    createdAt: '2026-10-28 09:15'
  },
  {
    id: 10044,
    userId: 2,
    username: 'kaleem',
    serviceId: 105,
    serviceName: 'TikTok Real Followers [Global HQ Accounts / Lifetime Safe]',
    categoryName: 'TikTok Followers',
    link: 'https://tiktok.com/@kaleem_tech',
    quantity: 1000,
    charge: 2.10,
    startCount: 80,
    remains: 1000,
    status: 'Processing',
    apiProviderId: 2,
    apiOrderId: '849455',
    apiStatus: 'processing',
    createdAt: '2026-10-28 18:40'
  },
  {
    id: 10045,
    userId: 3,
    username: 'digital_pro',
    serviceId: 107,
    serviceName: 'YouTube 4000 Monetization Watch Hours [Refill 60 Days]',
    categoryName: 'YouTube Subscribers & Watch Hours',
    link: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    quantity: 2000,
    charge: 36.00,
    startCount: 410,
    remains: 2000,
    status: 'Pending',
    createdAt: '2026-10-28 21:05'
  }
];

const initialPayments: Payment[] = [
  {
    id: 501,
    userId: 2,
    username: 'kaleem',
    method: 'easypaisa',
    amount: 50.0,
    amountPkr: 14000,
    currency: 'PKR',
    trxId: '829301928471',
    senderPhone: '03338831737',
    accountTitle: 'Kaleem Ullah',
    status: 'approved',
    adminNotes: 'Verified via EasyPaisa App TRX notification',
    createdAt: '2026-10-25 11:30',
    approvedAt: '2026-10-25 11:38'
  },
  {
    id: 502,
    userId: 2,
    username: 'kaleem',
    method: 'jazzcash',
    amount: 35.5,
    amountPkr: 9940,
    currency: 'PKR',
    trxId: '772918349201',
    senderPhone: '03338831737',
    accountTitle: 'Kaleem Ullah',
    status: 'approved',
    adminNotes: 'JazzCash transaction confirmed by Admin',
    createdAt: '2026-10-27 16:15',
    approvedAt: '2026-10-27 16:20'
  },
  {
    id: 503,
    userId: 3,
    username: 'digital_pro',
    method: 'easypaisa',
    amount: 100.0,
    amountPkr: 28000,
    currency: 'PKR',
    trxId: '918237461928',
    senderPhone: '03001234567',
    accountTitle: 'Digital Pro Agency',
    status: 'pending',
    createdAt: '2026-10-28 20:10'
  }
];

const initialTickets: Ticket[] = [
  {
    id: 801,
    userId: 2,
    username: 'kaleem',
    subject: 'Order #10043 speed inquiry',
    category: 'order',
    orderId: 10043,
    status: 'answered',
    priority: 'medium',
    createdAt: '2026-10-28 10:00',
    updatedAt: '2026-10-28 10:25',
    messages: [
      {
        id: 1,
        ticketId: 801,
        userId: 2,
        userName: 'kaleem',
        isAdmin: false,
        message: 'Hello, order #10043 was placed 1 hour ago. Can you check delivery speed?',
        createdAt: '2026-10-28 10:00'
      },
      {
        id: 2,
        ticketId: 801,
        userId: 1,
        userName: 'Support Team',
        isAdmin: true,
        message: 'Hello Kaleem! We checked the provider node. The order is running smoothly at 150 likes/min and will reach 100% completion shortly.',
        createdAt: '2026-10-28 10:25'
      }
    ]
  }
];

const initialChildPanels: ChildPanel[] = [
  {
    id: 1,
    userId: 2,
    username: 'kaleem',
    domain: 'myagencypanel.pk',
    currency: 'PKR',
    adminUser: 'kaleem_admin',
    priceMonthly: 10.0,
    status: 'active',
    nameservers: ['ns1.cheappakpanel.com', 'ns2.cheappakpanel.com'],
    createdAt: '2026-10-20'
  }
];

const initialSavedUrls: SavedUrl[] = [
  {
    id: 1,
    userId: 2,
    title: 'Official Instagram Profile',
    url: 'https://instagram.com/kaleem_official',
    platform: 'Instagram',
    createdAt: '2026-10-22'
  },
  {
    id: 2,
    userId: 2,
    title: 'TikTok Brand Video Post',
    url: 'https://tiktok.com/@kaleem_tech/video/73918237',
    platform: 'TikTok',
    createdAt: '2026-10-24'
  },
  {
    id: 3,
    userId: 2,
    title: 'YouTube Channel Monetization Link',
    url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    platform: 'YouTube',
    createdAt: '2026-10-26'
  }
];

const initialReferralFriends: ReferralFriend[] = [
  {
    id: 1,
    username: 'hamza_agency',
    joinedAt: '2026-10-15',
    totalDeposited: 140.0,
    commissionEarned: 7.0
  },
  {
    id: 2,
    username: 'lahore_smm_pro',
    joinedAt: '2026-10-19',
    totalDeposited: 90.0,
    commissionEarned: 4.5
  }
];

const SMMContext = createContext<SMMContextType | undefined>(undefined);

export const SMMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state or use seeds
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedId = localStorage.getItem(`${STORAGE_KEY}_current_user_id`);
    if (savedId) {
      const found = users.find(u => u.id === Number(savedId));
      if (found) return found;
    }
    // Default to 'kaleem' user
    return users.find(u => u.username === 'kaleem') || users[0];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_categories`);
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_services`);
    return saved ? JSON.parse(saved) : initialServices;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_orders`);
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [apiProviders, setApiProviders] = useState<ApiProvider[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_providers`);
    return saved ? JSON.parse(saved) : initialApiProviders;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_payments`);
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tickets`);
    return saved ? JSON.parse(saved) : initialTickets;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [activeCurrency, setActiveCurrency] = useState<'USD' | 'PKR'>(settings.activeCurrency || 'PKR');

  // Child Panel & URL State
  const [childPanels, setChildPanels] = useState<ChildPanel[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_child_panels`);
    return saved ? JSON.parse(saved) : initialChildPanels;
  });

  const [savedUrls, setSavedUrls] = useState<SavedUrl[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_saved_urls`);
    return saved ? JSON.parse(saved) : initialSavedUrls;
  });

  const [referralFriends, setReferralFriends] = useState<ReferralFriend[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_referrals`);
    return saved ? JSON.parse(saved) : initialReferralFriends;
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_child_panels`, JSON.stringify(childPanels));
  }, [childPanels]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_saved_urls`, JSON.stringify(savedUrls));
  }, [savedUrls]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_referrals`, JSON.stringify(referralFriends));
  }, [referralFriends]);

  // Dedicated Admin Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_admin_auth`) === 'true';
  });

  const adminLogin = (identifier: string, pass: string): boolean => {
    const id = identifier.trim().toLowerCase();
    if ((id === 'admin' || id === 'kaleem') && (pass === 'admin' || pass === 'admin123' || pass === 'password')) {
      setIsAdminLoggedIn(true);
      localStorage.setItem(`${STORAGE_KEY}_admin_auth`, 'true');
      return true;
    }
    const adminUser = users.find(u => u.role === 'admin' && (u.username.toLowerCase() === id || u.email.toLowerCase() === id));
    if (adminUser) {
      setIsAdminLoggedIn(true);
      localStorage.setItem(`${STORAGE_KEY}_admin_auth`, 'true');
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem(`${STORAGE_KEY}_admin_auth`);
  };
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY}_current_user_id`, String(currentUser.id));
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_current_user_id`);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_categories`, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_services`, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_providers`, JSON.stringify(apiProviders));
  }, [apiProviders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_tickets`, JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [settings]);

  // Keep currentUser state in sync with users array
  useEffect(() => {
    if (currentUser) {
      const updated = users.find(u => u.id === currentUser.id);
      if (updated && (updated.balance !== currentUser.balance || updated.spent !== currentUser.spent || updated.role !== currentUser.role)) {
        setCurrentUser(updated);
      }
    }
  }, [users]);

  // Currency helpers
  const convertUsdToPkr = (usd: number) => {
    return Math.round(usd * settings.usdToPkrRate * 100) / 100;
  };

  const convertPkrToUsd = (pkr: number) => {
    return Math.round((pkr / settings.usdToPkrRate) * 10000) / 10000;
  };

  const formatCurrency = (usdAmount: number, forceCurrency?: 'USD' | 'PKR') => {
    const cur = forceCurrency || activeCurrency;
    if (cur === 'PKR') {
      const pkr = convertUsdToPkr(usdAmount);
      return `Rs. ${pkr.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    return `$${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
  };

  // Auth
  const login = (identifier: string, _pass: string): boolean => {
    const user = users.find(
      u => u.username.toLowerCase() === identifier.toLowerCase() || u.email.toLowerCase() === identifier.toLowerCase()
    );
    if (user) {
      if (user.status === 'banned') {
        alert('This account has been banned. Please contact admin support.');
        return false;
      }
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const register = (username: string, email: string, _pass: string): boolean => {
    const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase());
    if (exists) return false;

    const newUser: User = {
      id: Date.now(),
      username,
      email,
      role: 'user',
      balance: 0.0,
      spent: 0.0,
      currency: 'USD',
      apiKey: `usr_key_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 10)}`,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchRole = (role: Role) => {
    const targetUser = users.find(u => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
    }
  };

  const regenerateApiKey = (userId: number): string => {
    const newKey = `usr_key_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString(36)}`;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, apiKey: newKey } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, apiKey: newKey } : null);
    }
    return newKey;
  };

  // Place single order
  const createOrder = ({
    serviceId,
    link,
    quantity,
    runs = 1,
    interval = 0
  }: {
    serviceId: number;
    link: string;
    quantity: number;
    runs?: number;
    interval?: number;
  }) => {
    if (!currentUser) return { success: false, message: 'Please log in to place an order' };

    const service = services.find(s => s.id === serviceId);
    if (!service) return { success: false, message: 'Service not found' };
    if (quantity < service.minQuantity || quantity > service.maxQuantity) {
      return { success: false, message: `Quantity must be between ${service.minQuantity} and ${service.maxQuantity}` };
    }

    // Check user custom rate if applicable
    const unitRate = currentUser.customRates?.[service.id] ?? service.rate;
    const totalUnits = quantity * runs;
    const charge = Math.round(((totalUnits / 1000) * unitRate) * 10000) / 10000;

    if (currentUser.balance < charge) {
      return {
        success: false,
        message: `Insufficient funds. Cost: ${formatCurrency(charge)}, Available Balance: ${formatCurrency(currentUser.balance)}`
      };
    }

    // Deduct balance and update user
    const updatedBalance = Math.round((currentUser.balance - charge) * 10000) / 10000;
    const updatedSpent = Math.round((currentUser.spent + charge) * 10000) / 10000;

    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, balance: updatedBalance, spent: updatedSpent } : u));
    setCurrentUser(prev => prev ? { ...prev, balance: updatedBalance, spent: updatedSpent } : null);

    const category = categories.find(c => c.id === service.categoryId);

    const newOrder: Order = {
      id: Math.floor(10000 + Math.random() * 90000),
      userId: currentUser.id,
      username: currentUser.username,
      serviceId: service.id,
      serviceName: service.name,
      categoryName: category?.name || 'Social Media',
      link,
      quantity: totalUnits,
      charge,
      startCount: Math.floor(Math.random() * 500),
      remains: totalUnits,
      status: 'Pending',
      apiProviderId: service.apiProviderId,
      apiOrderId: service.apiProviderId ? `ext_${Math.floor(100000 + Math.random() * 900000)}` : undefined,
      apiStatus: service.apiProviderId ? 'inqueue' : undefined,
      runs,
      interval,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setOrders(prev => [newOrder, ...prev]);

    return { success: true, message: `Order #${newOrder.id} submitted successfully!`, orderId: newOrder.id };
  };

  // Mass order
  const createMassOrder = (rawText: string) => {
    if (!currentUser) return { successCount: 0, failCount: 0, errors: ['Not logged in'] };

    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    lines.forEach((line, index) => {
      // Expected format: service_id|quantity|link
      const parts = line.split('|').map(p => p.trim());
      if (parts.length < 3) {
        failCount++;
        errors.push(`Line ${index + 1}: Invalid format. Expected service_id|quantity|link`);
        return;
      }

      const sId = parseInt(parts[0], 10);
      const qty = parseInt(parts[1], 10);
      const lnk = parts[2];

      const res = createOrder({ serviceId: sId, quantity: qty, link: lnk });
      if (res.success) {
        successCount++;
      } else {
        failCount++;
        errors.push(`Line ${index + 1}: ${res.message}`);
      }
    });

    return { successCount, failCount, errors };
  };

  // Submit manual/crypto payment
  const submitPayment = ({
    method,
    amount,
    amountPkr,
    trxId,
    senderPhone,
    accountTitle
  }: {
    method: PaymentMethod;
    amount: number;
    amountPkr?: number;
    trxId: string;
    senderPhone?: string;
    accountTitle?: string;
  }) => {
    if (!currentUser) return { success: false, message: 'Please log in' };

    const newPayment: Payment = {
      id: Math.floor(500 + Math.random() * 9500),
      userId: currentUser.id,
      username: currentUser.username,
      method,
      amount,
      amountPkr,
      currency: (method === 'easypaisa' || method === 'jazzcash' || method === 'bank_transfer') ? 'PKR' : 'USD',
      trxId: trxId.trim(),
      senderPhone: senderPhone?.trim(),
      accountTitle: accountTitle?.trim(),
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setPayments(prev => [newPayment, ...prev]);
    return {
      success: true,
      message: `Payment request #${newPayment.id} submitted! Pending admin verification.`
    };
  };

  // Admin approves manual payment -> CREDITS USER BALANCE INSTANTLY!
  const approvePayment = (paymentId: number, adminNotes: string = 'Verified & Approved by Admin') => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment || payment.status === 'approved') return;

    // Credit user balance
    setUsers(prev => prev.map(u => {
      if (u.id === payment.userId) {
        const newBalance = Math.round((u.balance + payment.amount) * 10000) / 10000;
        return { ...u, balance: newBalance };
      }
      return u;
    }));

    setPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: 'approved',
          adminNotes,
          approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return p;
    }));
  };

  const rejectPayment = (paymentId: number, adminNotes: string) => {
    setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'rejected', adminNotes } : p));
  };

  // Support Tickets
  const createTicket = ({
    subject,
    category,
    orderId,
    message,
    priority = 'medium'
  }: {
    subject: string;
    category: Ticket['category'];
    orderId?: number;
    message: string;
    priority?: Ticket['priority'];
  }) => {
    if (!currentUser) return { success: false, message: 'Must be logged in' };

    const tId = Math.floor(800 + Math.random() * 9200);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newTicket: Ticket = {
      id: tId,
      userId: currentUser.id,
      username: currentUser.username,
      subject,
      category,
      orderId,
      status: 'open',
      priority,
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: 1,
          ticketId: tId,
          userId: currentUser.id,
          userName: currentUser.username,
          isAdmin: currentUser.role === 'admin',
          message,
          createdAt: now
        }
      ]
    };

    setTickets(prev => [newTicket, ...prev]);
    return { success: true, message: `Ticket #${tId} opened successfully!`, ticketId: tId };
  };

  const replyTicket = (ticketId: number, msgText: string) => {
    if (!currentUser || !msgText.trim()) return;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const isAdmin = currentUser.role === 'admin';

    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const newMsg = {
          id: Date.now(),
          ticketId,
          userId: currentUser.id,
          userName: isAdmin ? 'ApexSMM Staff' : currentUser.username,
          isAdmin,
          message: msgText.trim(),
          createdAt: now
        };
        return {
          ...t,
          status: isAdmin ? 'answered' : 'open',
          updatedAt: now,
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    }));
  };

  const updateTicketStatus = (ticketId: number, status: TicketStatus) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) } : t));
  };

  // Admin user balance adjustment
  const adjustUserBalance = (userId: number, amountUsd: number, _reason?: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newBal = Math.max(0, Math.round((u.balance + amountUsd) * 10000) / 10000);
        return { ...u, balance: newBal };
      }
      return u;
    }));
  };

  const updateUserStatus = (userId: number, status: User['status']) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
  };

  const setUserCustomRate = (userId: number, serviceId: number, customRate: number | null) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextRates = { ...(u.customRates || {}) };
        if (customRate === null || customRate <= 0) {
          delete nextRates[serviceId];
        } else {
          nextRates[serviceId] = customRate;
        }
        return { ...u, customRates: nextRates };
      }
      return u;
    }));
  };

  // Categories & Services
  const saveCategory = (cat: Partial<Category>) => {
    if (cat.id) {
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, ...cat } as Category : c));
    } else {
      const newCat: Category = {
        id: Math.floor(10 + Math.random() * 90),
        name: cat.name || 'New Category',
        icon: cat.icon || 'send',
        sortOrder: categories.length + 1,
        status: cat.status || 'active'
      };
      setCategories(prev => [...prev, newCat]);
    }
  };

  const deleteCategory = (id: number) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const saveService = (svc: Partial<Service>) => {
    if (svc.id) {
      setServices(prev => prev.map(s => s.id === svc.id ? { ...s, ...svc } as Service : s));
    } else {
      const newSvc: Service = {
        id: Math.floor(110 + Math.random() * 890),
        categoryId: svc.categoryId || categories[0]?.id || 1,
        name: svc.name || 'New Service',
        type: svc.type || 'Default',
        rate: svc.rate || 1.0,
        minQuantity: svc.minQuantity || 50,
        maxQuantity: svc.maxQuantity || 10000,
        description: svc.description || '',
        dripfeed: svc.dripfeed ?? false,
        refill: svc.refill ?? false,
        apiProviderId: svc.apiProviderId,
        apiServiceId: svc.apiServiceId,
        status: svc.status || 'active'
      };
      setServices(prev => [...prev, newSvc]);
    }
  };

  const deleteService = (id: number) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // API Providers
  const saveApiProvider = (prov: Partial<ApiProvider>) => {
    if (prov.id) {
      setApiProviders(prev => prev.map(p => p.id === prov.id ? { ...p, ...prov } as ApiProvider : p));
    } else {
      const newProv: ApiProvider = {
        id: Math.floor(5 + Math.random() * 95),
        name: prov.name || 'New Provider',
        url: prov.url || 'https://api.provider.com/api/v2',
        apiKey: prov.apiKey || 'prov_key_demo',
        balance: 150.0,
        currency: 'USD',
        status: prov.status || 'active',
        lastSync: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setApiProviders(prev => [...prev, newProv]);
    }
  };

  const deleteApiProvider = (id: number) => {
    setApiProviders(prev => prev.filter(p => p.id !== id));
  };

  const syncProviderServices = (providerId: number) => {
    const prov = apiProviders.find(p => p.id === providerId);
    if (!prov) return 0;

    // Simulate syncing 3 sample imported services from provider
    const sampleImported: Service[] = [
      {
        id: Math.floor(200 + Math.random() * 700),
        categoryId: 1,
        name: `[${prov.name}] Instagram High Quality Followers`,
        type: 'Default',
        rate: 0.95,
        minQuantity: 100,
        maxQuantity: 100000,
        description: `Imported directly via API sync from ${prov.name}. Non drop with 30d refill.`,
        dripfeed: true,
        refill: true,
        apiProviderId: prov.id,
        apiServiceId: 'imported_' + Math.floor(100 + Math.random() * 900),
        status: 'active'
      },
      {
        id: Math.floor(200 + Math.random() * 700),
        categoryId: 3,
        name: `[${prov.name}] TikTok Global Video Views`,
        type: 'Default',
        rate: 0.04,
        minQuantity: 1000,
        maxQuantity: 2000000,
        description: `Instant speed TikTok views imported from ${prov.name}.`,
        dripfeed: true,
        refill: false,
        apiProviderId: prov.id,
        apiServiceId: 'imported_' + Math.floor(100 + Math.random() * 900),
        status: 'active'
      }
    ];

    setServices(prev => [...prev, ...sampleImported]);
    setApiProviders(prev => prev.map(p => p.id === providerId ? { ...p, lastSync: new Date().toISOString().replace('T', ' ').substring(0, 16) } : p));
    return sampleImported.length;
  };

  // Order Management
  const updateOrderStatus = (orderId: number, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const refundOrder = (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.status === 'Refunded' || order.status === 'Canceled') return;

    // Refund charge to user balance
    setUsers(prev => prev.map(u => {
      if (u.id === order.userId) {
        return {
          ...u,
          balance: Math.round((u.balance + order.charge) * 10000) / 10000,
          spent: Math.max(0, Math.round((u.spent - order.charge) * 10000) / 10000)
        };
      }
      return u;
    }));

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Refunded', remains: order.quantity } : o));
  };

  const resendOrderToApi = (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'In progress',
          apiOrderId: `ext_resend_${Math.floor(100000 + Math.random() * 900000)}`,
          apiStatus: 'resent_inprogress'
        };
      }
      return o;
    }));
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Simulate automated cron worker for pending orders & status progress
  const runAutomatedCron = () => {
    let forwarded = 0;
    let synced = 0;

    setOrders(prev => prev.map(ord => {
      if (ord.status === 'Pending') {
        forwarded++;
        return {
          ...ord,
          status: 'In progress',
          apiOrderId: ord.apiOrderId || `cron_ext_${Math.floor(100000 + Math.random() * 900000)}`,
          apiStatus: 'inprogress'
        };
      } else if (ord.status === 'In progress') {
        synced++;
        // randomly progress remains towards 0 or complete
        const nextRemains = Math.max(0, Math.floor(ord.remains * 0.4));
        const newStatus: OrderStatus = nextRemains === 0 ? 'Completed' : 'In progress';
        return {
          ...ord,
          remains: nextRemains,
          status: newStatus,
          apiStatus: newStatus.toLowerCase()
        };
      }
      return ord;
    }));

    return { forwarded, synced };
  };

  // Child Panel & URL Options
  const createChildPanel = ({ domain, adminUser, currency }: { domain: string; adminUser: string; currency: 'USD' | 'PKR' }) => {
    if (!currentUser) return { success: false, message: 'Please log in first' };
    const fee = settings.childPanelMonthlyFee || 10.0;
    if (currentUser.balance < fee) {
      return { success: false, message: `Insufficient balance. Monthly child panel fee is ${formatCurrency(fee)}.` };
    }

    const nextBal = Math.round((currentUser.balance - fee) * 10000) / 10000;
    const nextSpent = Math.round((currentUser.spent + fee) * 10000) / 10000;
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, balance: nextBal, spent: nextSpent } : u));
    setCurrentUser(prev => prev ? { ...prev, balance: nextBal, spent: nextSpent } : null);

    const newPanel: ChildPanel = {
      id: Math.floor(100 + Math.random() * 900),
      userId: currentUser.id,
      username: currentUser.username,
      domain: domain.trim().toLowerCase().replace(/^https?:\/\//, ''),
      currency,
      adminUser: adminUser.trim(),
      priceMonthly: fee,
      status: 'pending',
      nameservers: ['ns1.cheappakpanel.com', 'ns2.cheappakpanel.com'],
      createdAt: new Date().toISOString().split('T')[0]
    };

    setChildPanels(prev => [newPanel, ...prev]);
    return { success: true, message: `Child panel for ${newPanel.domain} requested! Point your nameservers to activate.` };
  };

  const updateChildPanelStatus = (id: number, status: ChildPanel['status']) => {
    setChildPanels(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const addSavedUrl = ({ title, url, platform }: { title: string; url: string; platform: string }) => {
    if (!currentUser) return;
    const newEntry: SavedUrl = {
      id: Date.now(),
      userId: currentUser.id,
      title: title.trim(),
      url: url.trim(),
      platform: platform.trim(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setSavedUrls(prev => [newEntry, ...prev]);
  };

  const deleteSavedUrl = (id: number) => {
    setSavedUrls(prev => prev.filter(u => u.id !== id));
  };

  const claimReferralEarnings = () => {
    if (!currentUser) return { success: false, amount: 0, message: 'Please log in' };
    const totalPending = referralFriends.reduce((acc, f) => acc + f.commissionEarned, 0);
    if (totalPending <= 0) {
      return { success: false, amount: 0, message: 'No pending referral commission to claim' };
    }

    const nextBal = Math.round((currentUser.balance + totalPending) * 10000) / 10000;
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, balance: nextBal } : u));
    setCurrentUser(prev => prev ? { ...prev, balance: nextBal } : null);

    setReferralFriends(prev => prev.map(f => ({ ...f, commissionEarned: 0 })));
    return {
      success: true,
      amount: totalPending,
      message: `Successfully claimed ${formatCurrency(totalPending)} referral commission to your balance!`
    };
  };

  return (
    <SMMContext.Provider
      value={{
        currentUser,
        users,
        categories,
        services,
        orders,
        apiProviders,
        payments,
        tickets,
        settings,
        activeCurrency,
        setActiveCurrency,
        login,
        register,
        logout,
        switchRole,
        isAdminLoggedIn,
        adminLogin,
        adminLogout,
        formatCurrency,
        convertUsdToPkr,
        convertPkrToUsd,
        createOrder,
        createMassOrder,
        submitPayment,
        createTicket,
        replyTicket,
        regenerateApiKey,
        approvePayment,
        rejectPayment,
        updateTicketStatus,
        adjustUserBalance,
        updateUserStatus,
        setUserCustomRate,
        saveCategory,
        deleteCategory,
        saveService,
        deleteService,
        saveApiProvider,
        deleteApiProvider,
        syncProviderServices,
        updateOrderStatus,
        refundOrder,
        resendOrderToApi,
        updateSettings,
        runAutomatedCron,
        childPanels,
        savedUrls,
        referralFriends,
        createChildPanel,
        updateChildPanelStatus,
        addSavedUrl,
        deleteSavedUrl,
        claimReferralEarnings
      }}
    >
      {children}
    </SMMContext.Provider>
  );
};

export const useSMM = () => {
  const context = useContext(SMMContext);
  if (!context) {
    throw new Error('useSMM must be used within a SMMProvider');
  }
  return context;
};
