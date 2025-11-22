
// ... (Keep imports)
import { Lead, LeadSource, LeadStage, Project, ProjectType, CommunicationTemplate, Agent, Booking, PaymentStatus, Unit, ChannelPartner, ProjectMilestone, PricingConfig, CommissionInvoice, MarketingCollateral, MarketingCampaign, IncentiveScheme, ConstructionUpdate, SecurityConfig, EmailTemplate, FeatureFlags, FraudAlert, Vendor, Indent, LegalCase, LandParcel, ReraProject, RoleConfig, ModuleName, AutomationTrigger, DLTTemplate, WABATemplate, CallAudit, LandingPage, Tenant, SaaSPlan, PlanFeature, KnowledgeItem, LedgerMapping, Snag } from './types';

export const RESIDENTIAL_CONFIGS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'NA'];
export const COMMERCIAL_TYPES = ['Office', 'Retail Shop', 'Showroom', 'Warehouse', 'Co-working', 'Other', 'NA'];

export const ENABLE_POWERED_BY = true;

export const INITIAL_PROJECTS: Project[] = [
  { 
      id: 'p1', 
      name: 'Krishna Trident', 
      location: 'Kalyan East', 
      type: ProjectType.RESIDENTIAL, 
      status: 'Under Construction',
      isMetro: true, // MMR Region
      campaigns: ['Luxury Launch', '2BHK Promo'],
      towers: [
          { name: 'Wing A', floors: 36, unitsPerFloor: 8 }, 
      ],
      unitTypes: [
          { id: 'ut1', name: '2 BHK', carpetArea: 560, balconyArea: 0, superArea: 850 },
          { id: 'ut2', name: '1 BHK', carpetArea: 410, balconyArea: 0, superArea: 650 }
      ],
      coordinates: { lat: 19.235, lng: 73.129 } 
  },
  { 
      id: 'p2', 
      name: 'Gaondevi Crown: GoldClass', 
      location: 'Kalyan East', 
      type: ProjectType.RESIDENTIAL, 
      status: 'Under Construction',
      isMetro: true,
      campaigns: ['GoldClass Premiere', 'Investor Meet'],
      towers: [
          { name: 'Tower 1', floors: 21, unitsPerFloor: 8 }
      ],
      unitTypes: [
          { id: 'ut3', name: '1BHK Compact', carpetArea: 450, balconyArea: 0, superArea: 650 },
          { id: 'ut4', name: '1BHK Large', carpetArea: 550, balconyArea: 30, superArea: 800 }
      ],
      coordinates: { lat: 19.238, lng: 73.131 }
  },
  { 
      id: 'p3', 
      name: 'Krishna Anand', 
      location: 'Kalyan East', 
      type: ProjectType.RESIDENTIAL, 
      status: 'Ready to Move',
      isMetro: true,
      campaigns: ['Site Visit Campaign', 'Facebook Ads'], 
      coordinates: { lat: 19.232, lng: 73.135 } 
  },
  { 
      id: 'p4', 
      name: 'Gold Crest Hi Fi Living', 
      location: 'Dombivli', 
      type: ProjectType.RESIDENTIAL, 
      status: 'Under Construction',
      isMetro: true,
      campaigns: ['Smart Homes Promo', 'Digital Launch'], 
      coordinates: { lat: 19.218, lng: 73.086 } 
  },
  { 
      id: 'p5', 
      name: 'Sonawane Business Park', 
      location: 'Thane', 
      type: ProjectType.COMMERCIAL, 
      status: 'Under Construction',
      isMetro: true,
      campaigns: ['Office Pre-launch'], 
      coordinates: { lat: 19.218, lng: 72.978 } 
  },
];

export const INITIAL_CAMPAIGNS = [
  'Luxury Launch',
  'GoldClass Premiere',
  'Smart Homes Promo',
  'Site Visit Campaign',
  'Facebook Lead Form',
  'Google PPC',
  'Magic Bricks Premium',
  'Walk-in',
  'CP Event'
];

const today = new Date().toISOString().split('T')[0];

const PRESALES_NAMES = [
  'Tejaswi sonwane',
  'Sapna Jaiswal',
  'Satyam thakur',
  'Sarika wagh'
];

const SALES_NAMES = [
    'Amit (Sales Head)',
    'Rohit Closer',
    'Vikram Senior'
];

const BANKER_NAMES = [
    'HDFC Manager',
    'SBI Manager'
];

export const INITIAL_AGENTS: Agent[] = [
  { 
    id: 'tl1', 
    name: 'Admin User', 
    role: 'SuperAdmin', 
    active: false, 
    status: 'Online',
    lastLeadAssignedAt: 0,
    sessions: [{ loginTime: `${today}T09:00:00.000Z`, logoutTime: undefined }]
  },
  {
    id: 'rec1', 
    name: 'Front Desk',
    role: 'Reception',
    active: false, 
    status: 'Online',
    lastLeadAssignedAt: 0,
    sessions: []
  },
  {
    id: 'legal1', 
    name: 'Adv. Deshmukh',
    role: 'Legal',
    active: false, 
    status: 'Offline',
    lastLeadAssignedAt: 0,
    sessions: []
  },
  ...PRESALES_NAMES.map((name, index) => ({
    id: `presales${index + 1}`,
    name: name,
    role: 'Presales' as const,
    active: true,
    status: (index % 2 === 0 ? 'Online' : 'Busy') as any, 
    lastLeadAssignedAt: Date.now() - (Math.random() * 1000000),
    sessions: []
  })),
  ...SALES_NAMES.map((name, index) => ({
      id: `sales${index + 1}`,
      name: name,
      role: 'Sales' as const,
      active: true,
      status: 'Online' as any,
      lastLeadAssignedAt: Date.now(),
      sessions: []
  })),
  ...BANKER_NAMES.map((name, index) => ({
      id: `banker${index + 1}`,
      name: name,
      role: 'Banker' as const,
      active: true,
      status: 'Online' as any,
      lastLeadAssignedAt: 0,
      sessions: []
  }))
];

export const SUB_STAGES: Record<LeadStage, string[]> = {
  [LeadStage.NEW]: ['Fresh', 'Not Contacted', 'Attempted'],
  [LeadStage.CONNECTED]: ['RNR (Ring No Response)', 'Busy', 'Switch Off', 'Call Back Later', 'Not Interested', 'Interested'],
  [LeadStage.VISIT_SCHEDULED]: ['Confirmed', 'Tentative', 'Rescheduled', 'Cab Required'],
  [LeadStage.QUALIFIED]: ['Hot', 'Warm', 'Cold', 'Budget Issue', 'Location Issue'],
  [LeadStage.NEGOTIATION]: ['Site Visit Done', 'Price Negotiation', 'Unit Selection', 'Legal Check', 'Payment Plan'],
  [LeadStage.BOOKED]: ['Token Received', 'Agreement Signed'],
  [LeadStage.LOST]: ['Competitor', 'Budget Mismatch', 'Location Mismatch', 'Dropped', 'Invalid Number'],
  [LeadStage.UNRESPONSIVE]: ['Stopped Picking Up', 'Blocked'],
};

export const MOCK_TEMPLATES: CommunicationTemplate[] = [
  { id: 't1', type: 'whatsapp', name: 'Intro', content: 'Hi {name}, thank you for your interest in {project}. Can we schedule a call?' },
  { id: 't2', type: 'whatsapp', name: 'Brochure', content: 'Hi {name}, here is the brochure for {project} you requested: [LINK]' },
  { id: 't3', type: 'sms', name: 'Follow-up', content: 'Hello {name}, trying to reach you regarding {project}. Please call back.' },
  { id: 't4', type: 'whatsapp', name: 'Site Visit Confirm', content: 'Hi {name}, confirming your site visit for {project} tomorrow at 10 AM. Location: [MAP]' },
  { id: 't5', type: 'whatsapp', name: 'RNR Followup', content: 'Hi {name}, tried calling you regarding {project}. When is a good time to connect?' },
];

export const MOCK_EMAIL_TEMPLATES: EmailTemplate[] = [
    { id: 'et1', name: 'Welcome Email', subject: 'Welcome to {project} Family', body: 'Dear {name},\n\nThank you for your interest in {project}. We are delighted to introduce you to our premium offerings.\n\nPlease find attached the project brochure.\n\nRegards,\n{agent_name}' },
    { id: 'et2', name: 'Cost Sheet Share', subject: 'Cost Sheet for {project}', body: 'Hi {name},\n\nAs discussed, please find attached the detailed cost sheet for the 2BHK unit.\n\nThis pricing is valid for 7 days.\n\nRegards,\n{agent_name}' },
    { id: 'et3', name: 'Site Visit Thanks', subject: 'Thank you for visiting {project}', body: 'Dear {name},\n\nIt was a pleasure hosting you at {project} today. We hope you liked the show flat.\n\nLet us know if you need any more details regarding loan eligibility.\n\nRegards,\nTeam EstateFlow' }
];

export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  ipWhitelistEnabled: false,
  screenShieldEnabled: false,
  decoyDataEnabled: false,
  allowedIps: ['192.168.1.1']
};

// Ensure default flags are TRUE to prevent lockout in fallback scenarios
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
    cpModule: true,
    postSales: true,
    presalesDialer: true,
    visitEngine: true,
    pricingVisibility: true,
    operationsModule: true,
    marketingModule: true,
    reportsModule: true,
    constructionModule: true,
    procurementModule: true,
    legalModule: true,
    loanModule: true,
    snaggingModule: true
};

export const MOCK_CHANNEL_PARTNERS: ChannelPartner[] = [
    { 
        id: 'cp1', 
        name: 'Rajesh Sharma', 
        firmName: 'Sharma Realty', 
        mobile: '9988776655', 
        reraId: 'A51700000123', 
        tier: 'Gold', 
        status: 'Active', 
        totalSalesValue: 25000000, 
        commissionEarned: 750000, 
        leadsCount: 12,
        documents: [
            { name: 'RERA Certificate', url: '#', status: 'Verified' },
            { name: 'Pan Card', url: '#', status: 'Verified' }
        ]
    },
    { 
        id: 'cp2', 
        name: 'Priya Deshmukh', 
        firmName: 'PropTiger Realty', 
        mobile: '9988000000', 
        reraId: 'A51700000999', 
        tier: 'Platinum', 
        status: 'Active', 
        totalSalesValue: 150000000, 
        commissionEarned: 6000000, 
        leadsCount: 50,
        documents: [
            { name: 'RERA Certificate', url: '#', status: 'Verified' },
            { name: 'Pan Card', url: '#', status: 'Verified' }
        ]
    },
    { 
        id: 'cp3', 
        name: 'Amit Local', 
        firmName: 'Kalyan Homes', 
        mobile: '8877665544', 
        reraId: 'A51700000555', 
        tier: 'Silver', 
        status: 'Pending', 
        totalSalesValue: 0, 
        commissionEarned: 0, 
        leadsCount: 1,
        documents: [
            { name: 'RERA Certificate', url: '#', status: 'Pending' },
            { name: 'Pan Card', url: '#', status: 'Pending' }
        ]
    },
];

export const MOCK_INVOICES: CommissionInvoice[] = [
    {
        id: 'inv1',
        partnerId: 'cp1',
        bookingId: 'BK-101',
        unitNumber: 'Wing A-1204',
        amount: 150000,
        invoiceDate: '2024-10-20',
        invoiceNumber: 'INV-001',
        status: 'Paid',
    },
    {
        id: 'inv2',
        partnerId: 'cp1',
        bookingId: 'BK-105',
        unitNumber: 'Wing B-502',
        amount: 125000,
        invoiceDate: '2024-11-05',
        invoiceNumber: 'INV-003',
        status: 'Processing',
    }
];

export const MOCK_COLLATERAL: MarketingCollateral[] = [
    { id: 'col1', projectId: 'p1', title: 'Krishna Trident - E-Brochure', type: 'PDF', url: '#' },
    { id: 'col2', projectId: 'p1', title: 'Krishna Trident - Walkthrough', type: 'Video', url: '#' },
    { id: 'col3', projectId: 'p1', title: 'Wing A - Floor Plans', type: 'PDF', url: '#' },
    { id: 'col4', projectId: 'p2', title: 'GoldClass - Investor Deck', type: 'PDF', url: '#' },
];

export const COMMISSION_TIERS = {
    'Silver': 0.02,
    'Gold': 0.03,
    'Platinum': 0.04
};

export const MOCK_CAMPAIGNS: MarketingCampaign[] = [
    {
        id: 'cmp1',
        metaCampaignId: '120238474',
        name: 'Diwali Bonanza - Facebook',
        platform: 'Facebook',
        budget: 500000,
        dailyBudget: 5000,
        spent: 350000,
        leadsGenerated: 450,
        bookingsGenerated: 12,
        status: 'Active',
        startDate: '2024-10-01',
        endDate: '2024-12-31',
        utmSource: 'fb_ads_diwali',
        adSets: [
            { id: 'as1', name: 'Pune_IT_Professionals_25-40', ads: [
                { id: 'ad1', name: 'Video_Walkthrough_v2', leads: 120, cpl: 250 },
                { id: 'ad2', name: 'Static_Diwali_Offer', leads: 80, cpl: 400 }
            ]},
            { id: 'as2', name: 'Lookalike_Previous_Buyers', ads: [
                { id: 'ad3', name: 'Video_Testimonial', leads: 250, cpl: 180 }
            ]}
        ]
    },
    {
        id: 'cmp2',
        metaCampaignId: '889922334',
        name: 'Google Search - Luxury',
        platform: 'Google',
        budget: 800000,
        dailyBudget: 10000,
        spent: 780000,
        leadsGenerated: 200,
        bookingsGenerated: 8,
        status: 'Active',
        startDate: '2024-09-15',
        utmSource: 'google_cpc_lux'
    },
    {
        id: 'cmp3',
        name: 'Housing.com Premium Slot',
        platform: 'Housing',
        budget: 200000,
        spent: 200000,
        leadsGenerated: 150,
        bookingsGenerated: 3,
        status: 'Ended',
        startDate: '2024-08-01',
        endDate: '2024-09-01',
        utmSource: 'housing_prem'
    }
];

export const MOCK_INCENTIVES: IncentiveScheme[] = [
    {
        id: 'inc1',
        role: 'Presales',
        slabs: [
            { minUnits: 0, maxUnits: 3, amountPerUnit: 2000 },
            { minUnits: 4, maxUnits: 6, amountPerUnit: 3500 },
            { minUnits: 7, maxUnits: 99, amountPerUnit: 5000 }
        ],
        kicker: 500
    },
    {
        id: 'inc2',
        role: 'Sales',
        slabs: [
            { minUnits: 0, maxUnits: 2, amountPerUnit: 10000 },
            { minUnits: 3, maxUnits: 5, amountPerUnit: 15000 },
            { minUnits: 6, maxUnits: 99, amountPerUnit: 25000 }
        ],
        kicker: 2000
    }
];

export const MOCK_CONSTRUCTION_LOGS: ConstructionUpdate[] = [
    { id: 'log1', projectId: 'p1', towerName: 'Wing A', milestoneName: 'Plinth Level', percentageComplete: 100, updateDate: '2024-08-15', engineerName: 'Rakesh Civil', status: 'Approved' },
    { id: 'log2', projectId: 'p1', towerName: 'Wing A', milestoneName: '1st Slab', percentageComplete: 100, updateDate: '2024-09-20', engineerName: 'Rakesh Civil', status: 'Approved' },
    { id: 'log3', projectId: 'p1', towerName: 'Wing A', milestoneName: '5th Slab', percentageComplete: 100, updateDate: '2024-11-01', engineerName: 'Suresh Site', status: 'Approved' },
    { id: 'log4', projectId: 'p1', towerName: 'Wing B', milestoneName: 'Plinth Level', percentageComplete: 80, updateDate: '2024-11-05', engineerName: 'Suresh Site', status: 'Pending Approval' },
];

export const MOCK_LEADS: Lead[] = [
  {
    id: 'LD-1001',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    campaign: 'Luxury Launch',
    name: 'Rahul Sharma',
    mobile: '9876543210',
    email: 'rahul.sharma@gmail.com',
    source: LeadSource.FACEBOOK,
    project: 'Krishna Trident',
    configuration: '2 BHK',
    stage: LeadStage.BOOKED,
    subStage: 'Token Received',
    followUpDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    followUpTime: '10:00',
    agentName: 'Rohit Closer',
    agentId: 'sales2',
    callCount: 3,
    remarksHistory: [
      { timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), text: 'Lead received from FB.', author: 'System', type: 'system' },
      { timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), text: 'Spoke to client, interested in 2BHK.', author: 'Tejaswi sonwane', type: 'call' },
      { timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), text: 'Scheduled site visit for tomorrow.', author: 'Tejaswi sonwane', type: 'call' },
      { timestamp: new Date(Date.now()).toISOString(), text: 'Handover to Sales. Booking Confirmed.', author: 'Reception', type: 'visit' },
    ],
    aiScore: 95,
    aiSummary: "High intent buyer, booked 2BHK.",
    visitorProfile: {
        salutation: 'Mr.',
        firstName: 'Rahul',
        lastName: 'Sharma',
        ageGroup: '25-35',
        maritalStatus: 'Married',
        familySize: 3,
        residenceStatus: 'Rented',
        address: 'Kalyan West',
        city: 'Mumbai',
        pincode: '421301',
        occupation: { industry: 'IT', designation: 'Developer', annualIncome: '12L', officeLocation: 'Airoli' }
    },
    siteVisitLogs: [
        {
            id: 'SVL-1', date: new Date().toISOString(), type: 'First Visit', projectVisited: 'Krishna Trident', 
            pickupProvided: false, dropProvided: false, withFamily: true, withCP: false, salesManager: 'Rohit Closer',
            outcome: 'Hot', remarks: 'Very interested in Wing A.', nextFollowUp: ''
        }
    ]
  },
  {
    id: 'LD-1002',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    campaign: 'GoldClass Premiere',
    name: 'Priya Verma',
    mobile: '9123456789',
    email: 'priya.v@yahoo.com',
    source: LeadSource.GOOGLE,
    project: 'Gaondevi Crown: GoldClass',
    configuration: '1 BHK',
    stage: LeadStage.LOST,
    subStage: 'Budget Mismatch',
    subStageReason: 'Budget is max 35L',
    followUpDate: '',
    followUpTime: '',
    agentName: 'Sapna Jaiswal',
    agentId: 'presales2',
    callCount: 5,
    remarksHistory: [
      { timestamp: new Date(Date.now() - 86400000 * 10).toISOString(), text: 'Inquired about pricing.', author: 'System', type: 'system' },
      { timestamp: new Date(Date.now() - 86400000 * 8).toISOString(), text: 'Budget is max 35L. Our start is 45L.', author: 'Sapna Jaiswal', type: 'call' },
      { timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), text: 'Client dropped out due to price.', author: 'Sapna Jaiswal', type: 'call' },
    ],
    aiScore: 10,
    aiSummary: "Budget mismatch. Unlikely to convert.",
    siteVisitLogs: []
  },
  {
    id: 'LD-1003',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    campaign: 'Site Visit Campaign',
    name: 'Amit Patel',
    mobile: '8887776665',
    email: 'amit.patel@outlook.com',
    source: LeadSource.CHANNEL_PARTNER,
    subSource: 'Sharma Estates',
    project: 'Krishna Anand',
    configuration: '2 BHK',
    stage: LeadStage.NEW,
    subStage: 'Fresh',
    followUpDate: new Date().toISOString().split('T')[0],
    followUpTime: '14:00',
    agentName: 'Satyam thakur',
    agentId: 'presales3',
    callCount: 0,
    remarksHistory: [
        { timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), text: 'Referred by CP Sharma Estates.', author: 'System', type: 'system' }
    ],
    siteVisitLogs: []
  }
];

export const STAGE_COLORS: Record<LeadStage, string> = {
  [LeadStage.NEW]: 'bg-blue-100 text-blue-800',
  [LeadStage.CONNECTED]: 'bg-indigo-100 text-indigo-800',
  [LeadStage.VISIT_SCHEDULED]: 'bg-yellow-100 text-yellow-800',
  [LeadStage.QUALIFIED]: 'bg-green-100 text-green-800',
  [LeadStage.NEGOTIATION]: 'bg-purple-100 text-purple-800',
  [LeadStage.BOOKED]: 'bg-emerald-100 text-emerald-800',
  [LeadStage.LOST]: 'bg-red-100 text-red-800',
  [LeadStage.UNRESPONSIVE]: 'bg-gray-100 text-gray-800',
};

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'BK-101',
    leadId: 'LD-1001', 
    customerName: 'Rahul Sharma',
    mobile: '9876543210',
    email: 'rahul.sharma@email.com',
    project: 'Krishna Trident',
    unitNumber: 'Wing A-1204',
    tower: 'Wing A',
    floor: '12',
    carpetArea: '750 sqft',
    parkingSlot: 'P-12',
    agreementValue: 6500000,
    taxes: 325000, // 5% GST
    otherCharges: 200000, // Dev charges
    totalCost: 7025000,
    amountPaid: 700000,
    bookingDate: '2024-10-15',
    status: 'Active',
    channelPartnerName: 'Sharma Estates',
    channelPartnerId: 'cp1',
    paymentSchedule: [
      { id: 'pm1', name: 'Booking Token', percentage: 10, amount: 700000, dueDate: '2024-10-15', status: PaymentStatus.PAID, paidDate: '2024-10-15', transactionId: 'TXN88329' },
      { id: 'pm2', name: 'Plinth Level', percentage: 15, amount: 1050000, dueDate: '2024-11-15', status: PaymentStatus.OVERDUE, penalty: 2500, interest: 1500 },
      { id: 'pm3', name: '1st Slab', percentage: 10, amount: 700000, dueDate: '2024-12-15', status: PaymentStatus.UPCOMING },
      { id: 'pm4', name: '5th Slab', percentage: 10, amount: 700000, dueDate: '2025-02-15', status: PaymentStatus.UPCOMING },
      { id: 'pm5', name: 'Possession', percentage: 5, amount: 350000, dueDate: '2025-06-15', status: PaymentStatus.UPCOMING },
    ],
    documents: [
      { id: 'd1', name: 'Booking Form', type: 'PDF', url: '#', generatedAt: '2024-10-15', status: 'Signed' },
      { id: 'd2', name: 'KYC Documents', type: 'Image', url: '#', generatedAt: '2024-10-16', status: 'Registered' },
    ],
    loanDetails: {
        bankName: 'HDFC Bank',
        sanctionAmount: 5000000,
        status: 'Applied',
        agentId: 'banker1',
        agentName: 'HDFC Manager',
        applicationDate: '2024-10-20'
    },
    tickets: [
        { id: 't1', bookingId: 'BK-101', subject: 'Spelling error in Agreement', description: 'My surname is spelled Sarma instead of Sharma.', status: 'Open', createdAt: '2024-10-25', category: 'Document', priority: 'High' }
    ],
    modifications: [],
    tdsCompliant: false
  },
  {
    id: 'BK-102',
    leadId: 'LD-999',
    customerName: 'Sneha Gupta',
    mobile: '9988776655',
    email: 'sneha.g@email.com',
    project: 'Sonawane Business Park',
    unitNumber: 'Main Hub-302',
    tower: 'Main Hub',
    floor: '3',
    carpetArea: '1200 sqft',
    parkingSlot: 'NA',
    agreementValue: 12000000,
    taxes: 1440000, // 12% GST for Commercial
    otherCharges: 500000,
    totalCost: 13940000,
    amountPaid: 4000000,
    bookingDate: '2024-09-01',
    status: 'Active',
    paymentSchedule: [
      { id: 'pm1', name: 'Booking', percentage: 10, amount: 1394000, dueDate: '2024-09-01', status: PaymentStatus.PAID, paidDate: '2024-09-01' },
      { id: 'pm2', name: 'Agreement', percentage: 20, amount: 2788000, dueDate: '2024-09-15', status: PaymentStatus.PAID, paidDate: '2024-09-14' },
      { id: 'pm3', name: 'Foundation', percentage: 15, amount: 2091000, dueDate: '2024-10-30', status: PaymentStatus.DUE },
    ],
    documents: [
      { id: 'd1', name: 'Booking Form', type: 'PDF', url: '#', generatedAt: '2024-09-01', status: 'Signed' },
      { id: 'd2', name: 'Agreement to Sale', type: 'PDF', url: '#', generatedAt: '2024-09-15', status: 'Registered' },
    ],
    loanDetails: {
        bankName: 'SBI',
        sanctionAmount: 8000000,
        status: 'Sanctioned',
        agentId: 'banker2',
        agentName: 'SBI Manager',
        applicationDate: '2024-09-05'
    },
    tickets: [],
    modifications: [
        { id: 'm1', description: 'Merge two cabins into one conference room', cost: 50000, status: 'Approved', addedToDemand: true }
    ],
    tdsCompliant: true
  }
];

export const MOCK_PROJECT_MILESTONES: ProjectMilestone[] = [
    { id: 'pm1', projectId: 'p1', name: 'Foundation', completed: true, completionDate: '2024-09-15' },
    { id: 'pm2', projectId: 'p1', name: 'Plinth Level', completed: true, completionDate: '2024-11-10' },
    { id: 'pm3', projectId: 'p1', name: '1st Slab', completed: false },
    { id: 'pm4', projectId: 'p1', name: '5th Slab', completed: false },
    { id: 'pm5', projectId: 'p2', name: 'Excavation', completed: true, completionDate: '2024-10-01' },
    { id: 'pm6', projectId: 'p2', name: 'Plinth Level', completed: false },
];

const KRISHNA_TRIDENT_RAW_DATA = `
Floor - 36
3601 / 2 BHK / 560.00 / MHADA / 1
3602 / 2 BHK / 560.00 / MHADA / 2
3603 / 1 BHK / 430.00 / MHADA / 3
3604 / 1 BHK / 430.00 / MHADA / 4
3605 / 1 BHK / 410.00 / MHADA / 5
3606 / 1 BHK / 410.00 / MHADA / 6
3607 / 1 BHK / 410.00 / MHADA / 7
3608 / 1 BHK / 410.00 / MHADA / 8
Floor - 35
3501 / 2 BHK / 560.00 / Hold by Management / 1
3502 / 2 BHK / 560.00 / Hold by Management / 2
3503 / 1 BHK / 430.00 / Retail / 3
3504 / 1 BHK / 430.00 / Hold by Management / 4
3505 / 1 BHK / 410.00 / Hold by Management / 5
3506 / 1 BHK / 410.00 / Hold by Management / 6
3507 / 1 BHK / 410.00 / Hold by Management / 7
3508 / 1 BHK / 410.00 / Land Owner / 8
Floor - 34
3401 / 2 BHK / 560.00 / Hold by Management / 1
3402 / 2 BHK / 560.00 / Hold by Management / 2
3403 / 1 BHK / 430.00 / Retail / 3
3404 / 1 BHK / 430.00 / Land Owner / 4
3405 / 1 BHK / 410.00 / Hold by Management / 5
3406 / 1 BHK / 410.00 / Hold by Management / 6
3407 / 1 BHK / 410.00 / Hold by Management / 7
3408 / 1 BHK / 410.00 / Hold by Management / 8
Floor - 33
3301 / 2 BHK / 560.00 / Hold by Management / 1
3302 / 2 BHK / 560.00 / Hold by Management / 2
3303 / 1 BHK / 430.00 / Land Owner / 3
3304 / 1 BHK / 430.00 / Hold by Management / 4
3305 / 1 BHK / 410.00 / Hold by Management / 5
3306 / 1 BHK / 410.00 / Hold by Management / 6
3307 / 1 BHK / 410.00 / Hold by Management / 7
3308 / 1 BHK / 410.00 / Hold by Management / 8
Floor - 32
3201 / 2 BHK / 560.00 / Hold by Management / 1
3202 / 2 BHK / 560.00 / Hold by Management / 2
3203 / 1 BHK / 430.00 / Hold by Management / 3
3204 / 1 BHK / 430.00 / Hold by Management / 4
3205 / 1 BHK / 410.00 / Hold by Management / 5
3206 / 1 BHK / 410.00 / Hold by Management / 6
3207 / 1 BHK / 410.00 / Refuge / 7
3208 / 1 BHK / 410.00 / Hold by Management / 8
Floor - 31
3101 / 2 BHK / 560.00 / Retail / 1
3102 / 2 BHK / 560.00 / Retail / 2
3103 / 1 BHK / 430.00 / Hold by Management / 3
3104 / 1 BHK / 430.00 / Hold by Management / 4
3105 / 1 BHK / 410.00 / Hold by Management / 5
3106 / 1 BHK / 410.00 / Hold by Management / 6
3107 / 1 BHK / 410.00 / Land Owner / 7
3108 / 1 BHK / 410.00 / Land Owner / 8
Floor - 30
3001 / 2 BHK / 560.00 / Hold by Management / 1
3002 / 2 BHK / 560.00 / Hold by Management / 2
3003 / 1 BHK / 430.00 / Hold by Management / 3
3004 / 1 BHK / 430.00 / Hold by Management / 4
3005 / 1 BHK / 410.00 / Hold by Management / 5
3006 / 1 BHK / 410.00 / Hold by Management / 6
3007 / 1 BHK / 410.00 / Hold by Management / 7
3008 / 1 BHK / 410.00 / Hold by Management / 8
Floor - 29
2901 / 2 BHK / 560.00 / Hold by Management / 1
2902 / 2 BHK / 560.00 / Hold by Management / 2
2903 / 1 BHK / 430.00 / Hold by Management / 3
2904 / 1 BHK / 430.00 / Hold by Management / 4
2905 / 1 BHK / 410.00 / Hold by Management / 5
2906 / 1 BHK / 410.00 / Hold by Management / 6
2907 / 1 BHK / 410.00 / Hold by Management / 7
2908 / 1 BHK / 410.00 / Hold by Management / 8
Floor - 28
2801 / 2 BHK / 560.00 / Hold by Management / 1
2802 / 2 BHK / 560.00 / Hold by Management / 2
2803 / 1 BHK / 430.00 / Hold by Management / 3
2804 / 1 BHK / 430.00 / Hold by Management / 4
2805 / 1 BHK / 410.00 / Hold by Management / 5
2806 / 1 BHK / 410.00 / Hold by Management / 6
2807 / 1 BHK / 410.00 / Hold by Management / 7
2808 / 1 BHK / 410.00 / Hold by Management / 8
Floor - 27
2701 / 2 BHK / 560.00 / Retail / 1
2702 / 2 BHK / 560.00 / Hold by Management / 2
2703 / 1 BHK / 430.00 / Hold by Management / 3
2704 / 1 BHK / 430.00 / Hold by Management / 4
2705 / 1 BHK / 410.00 / Retail / 5
2706 / 1 BHK / 410.00 / Hold by Management / 6
2707 / 1 BHK / 410.00 / Refuge / 7
2708 / 1 BHK / 410.00 / Land Owner / 8
Floor - 26
2601 / 2 BHK / 560.00 / Hold by Management / 1
2602 / 2 BHK / 560.00 / Retail / 2
2603 / 1 BHK / 430.00 / Hold by Management / 3
2604 / 1 BHK / 430.00 / Hold by Management / 4
2605 / 1 BHK / 410.00 / Land Owner / 5
2606 / 1 BHK / 410.00 / Hold by Management / 6
2607 / 1 BHK / 410.00 / Hold by Management / 7
2608 / 1 BHK / 410.00 / Hold by Management / 8
Floor - 25
2501 / 2 BHK / 560.00 / Retail / 1
2502 / 2 BHK / 560.00 / Retail / 2
2503 / 1 BHK / 430.00 / Retail / 3
2504 / 1 BHK / 430.00 / Retail / 4
2505 / 1 BHK / 410.00 / Retail / 5
2506 / 1 BHK / 410.00 / Retail / 6
2507 / 1 BHK / 410.00 / Retail / 7
2508 / 1 BHK / 410.00 / Retail / 8
Floor - 24
2401 / 2 BHK / 560.00 / Retail / 1
2402 / 2 BHK / 560.00 / Retail / 2
2403 / 1 BHK / 430.00 / Retail / 3
2404 / 1 BHK / 430.00 / Retail / 4
2405 / 1 BHK / 410.00 / Retail / 5
2406 / 1 BHK / 410.00 / Retail / 6
2407 / 1 BHK / 410.00 / Retail / 7
2408 / 1 BHK / 410.00 / Retail / 8
Floor - 23
2301 / 2 BHK / 560.00 / Retail / 1
2302 / 2 BHK / 560.00 / Retail / 2
2303 / 1 BHK / 430.00 / Retail / 3
2304 / 1 BHK / 430.00 / Land Owner / 4
2305 / 1 BHK / 410.00 / Retail / 5
2306 / 1 BHK / 410.00 / Retail / 6
2307 / 1 BHK / 410.00 / Retail / 7
2308 / 1 BHK / 410.00 / Retail / 8
Floor - 22
2201 / 2 BHK / 560.00 / Land Owner / 1
2202 / 2 BHK / 560.00 / Retail / 2
2203 / 1 BHK / 430.00 / Retail / 3
2204 / 1 BHK / 430.00 / Retail / 4
2205 / 1 BHK / 410.00 / Retail / 5
2206 / 1 BHK / 410.00 / Retail / 6
2207 / 1 BHK / 410.00 / Refuge / 7
2208 / 1 BHK / 410.00 / Retail / 8
Floor - 21
2101 / 2 BHK / 560.00 / Retail / 1
2102 / 2 BHK / 560.00 / Retail / 2
2103 / 1 BHK / 430.00 / Land Owner / 3
2104 / 1 BHK / 430.00 / Land Owner / 4
2105 / 1 BHK / 410.00 / Retail / 5
2106 / 1 BHK / 410.00 / Retail / 6
2107 / 1 BHK / 410.00 / Retail / 7
2108 / 1 BHK / 410.00 / Retail / 8
Floor - 20
2001 / 2 BHK / 560.00 / Retail / 1
2002 / 2 BHK / 560.00 / Retail / 2
2003 / 1 BHK / 430.00 / Retail / 3
2004 / 1 BHK / 430.00 / Retail / 4
2005 / 1 BHK / 410.00 / Retail / 5
2006 / 1 BHK / 410.00 / Retail / 6
2007 / 1 BHK / 410.00 / Retail / 7
2008 / 1 BHK / 410.00 / Retail / 8
Floor - 19
1901 / 2 BHK / 560.00 / Retail / 1
1902 / 2 BHK / 560.00 / Retail / 2
1903 / 1 BHK / 430.00 / Retail / 3
1904 / 1 BHK / 430.00 / Retail / 4
1905 / 1 BHK / 410.00 / Retail / 5
1906 / 1 BHK / 410.00 / Retail / 6
1907 / 1 BHK / 410.00 / Land Owner / 7
1908 / 1 BHK / 410.00 / Retail / 8
Floor - 18
1801 / 2 BHK / 560.00 / Retail / 1
1802 / 2 BHK / 560.00 / Retail / 2
1803 / 1 BHK / 430.00 / Retail / 3
1804 / 1 BHK / 430.00 / Retail / 4
1805 / 1 BHK / 410.00 / Retail / 5
1806 / 1 BHK / 410.00 / Retail / 6
1807 / 1 BHK / 410.00 / Retail / 7
1808 / 1 BHK / 410.00 / Retail / 8
Floor - 17
1701 / 2 BHK / 560.00 / Retail / 1
1702 / 2 BHK / 560.00 / Retail / 2
1703 / 1 BHK / 430.00 / Retail / 3
1704 / 1 BHK / 430.00 / Retail / 4
1705 / 1 BHK / 410.00 / Retail / 5
1706 / 1 BHK / 410.00 / Land Owner / 6
1707 / 1 BHK / 410.00 / Refuge / 7
1708 / 1 BHK / 410.00 / Retail / 8
Floor - 16
1601 / 2 BHK / 560.00 / Retail / 1
1602 / 2 BHK / 560.00 / Retail / 2
1603 / 1 BHK / 430.00 / Land Owner / 3
1604 / 1 BHK / 430.00 / Retail / 4
1605 / 1 BHK / 410.00 / Retail / 5
1606 / 1 BHK / 410.00 / Land Owner / 6
1607 / 1 BHK / 410.00 / Retail / 7
1608 / 1 BHK / 410.00 / Retail / 8
Floor - 15
1501 / 2 BHK / 560.00 / Retail / 1
1502 / 2 BHK / 560.00 / Retail / 2
1503 / 1 BHK / 430.00 / Land Owner / 3
1504 / 1 BHK / 430.00 / Land Owner / 4
1505 / 1 BHK / 410.00 / Retail / 5
1506 / 1 BHK / 410.00 / Retail / 6
1507 / 1 BHK / 410.00 / Retail / 7
1508 / 1 BHK / 410.00 / Retail / 8
Floor - 14
1401 / 2 BHK / 560.00 / Retail / 1
1402 / 2 BHK / 560.00 / Retail / 2
1403 / 1 BHK / 430.00 / Land Owner / 3
1404 / 1 BHK / 430.00 / Land Owner / 4
1405 / 1 BHK / 410.00 / Retail / 5
1406 / 1 BHK / 410.00 / Retail / 6
1407 / 1 BHK / 410.00 / Retail / 7
1408 / 1 BHK / 410.00 / Retail / 8
Floor - 13
1301 / 2 BHK / 560.00 / Retail / 1
1302 / 2 BHK / 560.00 / Retail / 2
1303 / 1 BHK / 430.00 / Land Owner / 3
1304 / 1 BHK / 430.00 / Land Owner / 4
1305 / 1 BHK / 410.00 / Retail / 5
1306 / 1 BHK / 410.00 / Retail / 6
1307 / 1 BHK / 410.00 / Retail / 7
1308 / 1 BHK / 410.00 / Retail / 8
Floor - 12
1201 / 2 BHK / 560.00 / Retail / 1
1202 / 2 BHK / 560.00 / Retail / 2
1203 / 1 BHK / 430.00 / Retail / 3
1204 / 1 BHK / 430.00 / Land Owner / 4
1205 / 1 BHK / 410.00 / Retail / 5
1206 / 1 BHK / 410.00 / Retail / 6
1207 / 1 BHK / 410.00 / Refuge / 7
1208 / 1 BHK / 410.00 / Retail / 8
Floor - 11
1101 / 2 BHK / 560.00 / Retail / 1
1102 / 2 BHK / 560.00 / Retail / 2
1103 / 1 BHK / 430.00 / Land Owner / 3
1104 / 1 BHK / 430.00 / Land Owner / 4
1105 / 1 BHK / 410.00 / Retail / 5
1106 / 1 BHK / 410.00 / Retail / 6
1107 / 1 BHK / 410.00 / Retail / 7
1108 / 1 BHK / 410.00 / Retail / 8
Floor - 10
1001 / 2 BHK / 560.00 / Retail / 1
1002 / 2 BHK / 560.00 / Retail / 2
1003 / 1 BHK / 430.00 / Retail / 3
1004 / 1 BHK / 430.00 / Retail / 4
1005 / 1 BHK / 410.00 / Retail / 5
1006 / 1 BHK / 410.00 / Retail / 6
1007 / 1 BHK / 410.00 / Retail / 7
1008 / 1 BHK / 410.00 / Retail / 8
Floor - 9
901 / 2 BHK / 560.00 / Retail / 1
902 / 2 BHK / 560.00 / Retail / 2
903 / 1 BHK / 430.00 / Retail / 3
904 / 1 BHK / 430.00 / Retail / 4
905 / 1 BHK / 410.00 / Retail / 5
906 / 1 BHK / 410.00 / Retail / 6
907 / 1 BHK / 410.00 / Retail / 7
908 / 1 BHK / 410.00 / Retail / 8
Floor - 8
801 / 2 BHK / 560.00 / Retail / 1
802 / 2 BHK / 560.00 / Retail / 2
803 / 1 BHK / 430.00 / Land Owner / 3
804 / 1 BHK / 430.00 / Land Owner / 4
805 / 1 BHK / 410.00 / Retail / 5
806 / 1 BHK / 410.00 / Retail / 6
807 / 1 BHK / 410.00 / Retail / 7
808 / 1 BHK / 410.00 / Retail / 8
Floor - 7
701 / 2 BHK / 560.00 / Land Owner / 1
702 / 2 BHK / 560.00 / Retail / 2
703 / 1 BHK / 430.00 / Land Owner / 3
704 / 1 BHK / 430.00 / Land Owner / 4
705 / 1 BHK / 410.00 / Retail / 5
706 / 1 BHK / 410.00 / Retail / 6
707 / 1 BHK / 410.00 / Refuge / 7
708 / 1 BHK / 410.00 / Retail / 8
Floor - 6
601 / 2 BHK / 560.00 / Retail / 1
602 / 2 BHK / 560.00 / Retail / 2
603 / 1 BHK / 430.00 / Land Owner / 3
604 / 1 BHK / 430.00 / Land Owner / 4
605 / 1 BHK / 410.00 / Retail / 5
606 / 1 BHK / 410.00 / Retail / 6
607 / 1 BHK / 410.00 / Retail / 7
608 / 1 BHK / 410.00 / Retail / 8
Floor - 5
501 / 2 BHK / 560.00 / MHADA / 1
502 / 2 BHK / 560.00 / MHADA / 2
503 / 1 BHK / 430.00 / MHADA / 3
504 / 1 BHK / 430.00 / MHADA / 4
505 / 1 BHK / 410.00 / MHADA / 5
506 / 1 BHK / 410.00 / MHADA / 6
507 / 1 BHK / 410.00 / MHADA / 7
508 / 1 BHK / 410.00 / MHADA / 8
Floor - 4
401 / 2 BHK / 560.00 / MHADA / 1
402 / 2 BHK / 560.00 / MHADA / 2
403 / 1 BHK / 430.00 / MHADA / 3
404 / 1 BHK / 430.00 / MHADA / 4
405 / 1 BHK / 410.00 / MHADA / 5
406 / 1 BHK / 410.00 / MHADA / 6
407 / 1 BHK / 410.00 / MHADA / 7
408 / 1 BHK / 410.00 / MHADA / 8
Floor - 3
301 / 2 BHK / 560.00 / MHADA / 1
302 / 2 BHK / 560.00 / MHADA / 2
303 / 1 BHK / 430.00 / MHADA / 3
304 / 1 BHK / 430.00 / MHADA / 4
305 / 1 BHK / 410.00 / MHADA / 5
306 / 1 BHK / 410.00 / MHADA / 6
307 / 1 BHK / 410.00 / MHADA / 7
308 / 1 BHK / 410.00 / MHADA / 8
Floor - 2
201 / 2 BHK / 560.00 / MHADA / 1
202 / 2 BHK / 560.00 / MHADA / 2
203 / 1 BHK / 430.00 / MHADA / 3
204 / 1 BHK / 430.00 / MHADA / 4
205 / 1 BHK / 410.00 / MHADA / 5
206 / 1 BHK / 410.00 / MHADA / 6
207 / 1 BHK / 410.00 / MHADA / 7
208 / 1 BHK / 410.00 / MHADA / 8
`;

const parseTridentInventory = (projectId: string): Unit[] => {
    const units: Unit[] = [];
    // Split by new lines and filter out empty lines
    const lines = KRISHNA_TRIDENT_RAW_DATA.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('Floor -'));
    
    lines.forEach(line => {
        // Format: 3601 / 2 BHK / 560.00 / MHADA / 1
        // Note: Some lines might be split in the raw input if copy-pasted weirdly, but we assume single line per unit based on structure
        // Let's handle potential line breaks if they occurred by checking for '/' count, but here we assume clean lines.
        const parts = line.split('/').map(p => p.trim());
        
        if (parts.length >= 4) {
            const unitNo = parts[0];
            const type = parts[1];
            // const area = parts[2]; // Used for carpet area
            const rawStatus = parts[3];
            
            let status: 'Available' | 'Sold' | 'Blocked' = 'Available';
            const statusUpper = rawStatus.toUpperCase();

            if (['MHADA', 'LAND OWNER', 'HOLD BY MANAGEMENT', 'REFUGE'].includes(statusUpper)) {
                status = 'Blocked';
            } else if (statusUpper === 'RETAIL') {
                // Logic from summary: 2 BHK Retail are all Booked (Sold). 1 BHK are mixed.
                if (type.includes('2 BHK')) {
                    status = 'Sold';
                } else {
                    // 1 BHK Retail: Mix of Available and Sold. ~55% Available.
                    status = Math.random() > 0.45 ? 'Available' : 'Sold';
                }
            }

            // Calculate Floor
            let floor = 0;
            if (unitNo.length === 3) floor = parseInt(unitNo.substring(0, 1));
            else if (unitNo.length === 4) floor = parseInt(unitNo.substring(0, 2));

            units.push({
                id: `${projectId}-Wing A-${unitNo}`,
                unitNumber: `Wing A-${unitNo}`,
                floor: floor,
                tower: 'Wing A',
                type: type,
                status: status,
                carpetArea: parseFloat(parts[2]),
                basePrice: type.includes('2 BHK') ? 6500000 : 4500000 // Estimate based on type
            });
        }
    });
    return units;
};

export const generateInventory = (projectId: string) => {
    // Specific logic for Krishna Trident (p1)
    if (projectId === 'p1') {
        return parseTridentInventory(projectId);
    }

    // Fallback for other projects (Mock generation)
    const units: Unit[] = [];
    const towers = ['Wing A', 'Wing B'];
    const floors = 20;
    const unitsPerFloor = 4;
    
    towers.forEach(tower => {
        for(let f=1; f<=floors; f++) {
            for(let u=1; u<=unitsPerFloor; u++) {
                const unitNum = `${f}${u < 10 ? '0' + u : u}`;
                let status: 'Available' | 'Sold' | 'Blocked' = 'Available';
                const pseudoRand = ((f * 10) + u) % 10;
                
                if (pseudoRand === 3 || pseudoRand === 7) status = 'Sold';
                else if (pseudoRand === 5) status = 'Blocked';

                units.push({
                    id: `${projectId}-${tower}-${unitNum}`,
                    unitNumber: `${tower}-${unitNum}`,
                    floor: f,
                    tower: tower,
                    type: u <= 2 ? '2 BHK' : '3 BHK',
                    status: status,
                    carpetArea: u <= 2 ? 750 : 1050,
                    basePrice: u <= 2 ? 6500000 : 9500000
                });
            }
        }
    });
    return units;
};

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
    baseRate: 8500,
    floorRise: 50,
    amenities: 500000,
    parking: 300000, // Legacy field (Single Parking)
    parkingRate: 500000, // New Per Slot Rate
    gst: 0.05, // Default Rate (deprecated by dynamic logic)
    stampDuty: 0.07,
    registration: 30000,
    maxDiscount: 200
};

export const MOCK_FRAUD_ALERTS: FraudAlert[] = [
    { id: 'fa1', severity: 'High', type: 'Duplicate', message: 'Same lead assigned to 2 active agents', timestamp: new Date().toISOString(), status: 'Open', details: 'Lead LD-1001 assigned to both Rohit Closer and Sapna Jaiswal within 1 hour.' },
    { id: 'fa2', severity: 'Medium', type: 'Pricing', message: 'Discount exceeded approved limit', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'Resolved', details: 'Unit Wing A-1204 given 8% discount. Approved limit 5%.' },
    { id: 'fa3', severity: 'Low', type: 'Access', message: 'Login attempt from unauthorized IP', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'Ignored', details: 'User Sapna Jaiswal tried login from IP 45.12.33.11 (Non-office).' }
];

export const MOCK_VENDORS: Vendor[] = [
    { id: 'v1', companyName: 'Ultratech Cement Ltd', gst: '27AABCU1234Z1Z5', category: 'Cement', contactPerson: 'Anil Singh', mobile: '9988776655', status: 'Active', rating: 4.8, balance: 50000 },
    { id: 'v2', companyName: 'Jindal Steel & Power', gst: '27AAJSP5678Z1Z5', category: 'Steel', contactPerson: 'Priya Mehta', mobile: '9876543210', status: 'Active', rating: 4.5, balance: 120000 },
    { id: 'v3', companyName: 'Local Hardware Store', gst: '27ABCHD9999Z1Z5', category: 'Plumbing', contactPerson: 'Ramesh', mobile: '8877665544', status: 'Pending', rating: 3.0, balance: 0 },
];

export const MOCK_INDENTS: Indent[] = [
    { id: 'IND-101', projectId: 'p1', requestedBy: 'Suresh Site', material: 'Cement (PPC)', quantity: 500, unit: 'Bags', status: 'Ordered', date: new Date().toISOString().split('T')[0] },
    { id: 'IND-102', projectId: 'p1', requestedBy: 'Suresh Site', material: 'Steel 12mm', quantity: 10, unit: 'Tons', status: 'Pending', date: new Date().toISOString().split('T')[0] },
];

export const MOCK_LEGAL_CASES: LegalCase[] = [
    { 
        id: 'LC-001', caseNumber: 'CIVIL/2023/449', courtName: 'Kalyan Civil Court', opposingParty: 'Smt. Deshmukh (Land Owner)', 
        status: 'Active', nextHearingDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], 
        history: [{ date: '2023-12-01', outcome: 'First hearing. Notice issued.' }, { date: '2024-01-15', outcome: 'Adjourned. Docs pending.' }] 
    },
    { 
        id: 'LC-002', caseNumber: 'CONS/2024/99', courtName: 'Consumer Forum Mumbai', opposingParty: 'Mr. Mehta (Customer)', 
        status: 'Adjourned', nextHearingDate: '2024-12-20', 
        history: [{ date: '2024-05-10', outcome: 'Complaint filed regarding delay.' }] 
    }
];

export const MOCK_LAND_RECORDS: LandParcel[] = [
    { id: 'LP-101', surveyNumber: '44/1A', village: 'Kalyan East', areaAcres: 2.5, ownerName: 'Sonawane Developers', status: 'Clear Title', documents: [{ name: '7/12 Extract', type: 'PDF' }, { name: 'NA Order', type: 'PDF' }] },
    { id: 'LP-102', surveyNumber: '45/2', village: 'Kalyan East', areaAcres: 1.2, ownerName: 'Joint Venture (Patil Family)', status: 'Litigation', documents: [{ name: 'MoU', type: 'PDF' }] },
];

export const MOCK_RERA_PROJECTS: ReraProject[] = [
    { projectId: 'p1', projectName: 'Krishna Trident', reraId: 'P51700001234', completionDate: '2025-12-31', qprDeadline: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], complianceStatus: 'Compliant' },
    { projectId: 'p2', projectName: 'Gaondevi Crown', reraId: 'P51700005678', completionDate: '2026-06-30', qprDeadline: new Date(Date.now() - 86400000).toISOString().split('T')[0], complianceStatus: 'Critical' },
];

export const MODULE_LIST: ModuleName[] = ['Leads', 'Sales', 'Inventory', 'Legal', 'Finance', 'HR', 'Admin'];

export const DEFAULT_ROLES: RoleConfig[] = [
    {
        id: 'role_admin', roleName: 'Super Admin', description: 'Full access to all modules.',
        permissions: MODULE_LIST.map(m => ({ module: m, canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true, scope: 'All' }))
    },
    {
        id: 'role_sales_head', roleName: 'Sales Head', description: 'Can view all sales data but cannot delete.',
        permissions: MODULE_LIST.map(m => ({ 
            module: m, 
            canView: true, 
            canCreate: ['Leads', 'Sales'].includes(m), 
            canEdit: ['Leads', 'Sales'].includes(m), 
            canDelete: false, 
            canExport: true, 
            scope: 'All' 
        }))
    },
    {
        id: 'role_presales', roleName: 'Presales Executive', description: 'Restricted to own leads only.',
        permissions: MODULE_LIST.map(m => ({ 
            module: m, 
            canView: ['Leads'].includes(m), 
            canCreate: ['Leads'].includes(m), 
            canEdit: ['Leads'].includes(m), 
            canDelete: false, 
            canExport: false, 
            scope: 'Own' 
        }))
    },
    {
        id: 'role_legal', roleName: 'Legal Officer', description: 'Access to Legal & Compliance only.',
        permissions: MODULE_LIST.map(m => ({ 
            module: m, 
            canView: ['Legal'].includes(m), 
            canCreate: ['Legal'].includes(m), 
            canEdit: ['Legal'].includes(m), 
            canDelete: false, 
            canExport: true, 
            scope: 'All' 
        }))
    }
];

export const MOCK_DLT_TEMPLATES: DLTTemplate[] = [
    { id: 'dlt1', name: 'Welcome SMS', dltTeId: '10072384799283', senderId: 'SNGROUP', content: 'Welcome to Sonawane Group. Your OTP is {#var#}.' },
    { id: 'dlt2', name: 'Site Visit Confirmation', dltTeId: '10072384799284', senderId: 'SNGROUP', content: 'Your site visit is confirmed for {#date#} at {#time#}.' }
];

export const MOCK_WABA_TEMPLATES: WABATemplate[] = [
    { id: 'waba1', name: 'project_brochure_v1', content: 'Hi {{1}}, here is the brochure you requested.', status: 'Approved', language: 'en_US' },
    { id: 'waba2', name: 'visit_reminder_24h', content: 'Hello {{1}}, reminder for your visit tomorrow.', status: 'Approved', language: 'en_US' },
    { id: 'waba3', name: 'festival_offer_diwali', content: 'Special Diwali Offer!', status: 'Pending', language: 'en_US' }
];

export const MOCK_TRIGGERS: AutomationTrigger[] = [
    { id: 'at1', name: 'New Lead Welcome', event: 'New Lead', actions: [{ type: 'SMS', templateId: 'dlt1' }, { type: 'WhatsApp', templateId: 'waba1' }], isActive: true },
    { id: 'at2', name: 'Visit Scheduled Pass', event: 'Site Visit Scheduled', actions: [{ type: 'WhatsApp', templateId: 'waba2' }], isActive: true }
];

export const MOCK_CALL_AUDITS: CallAudit[] = [
    {
        id: 'aud1', leadId: 'LD-1001', agentId: 'presales1', callDate: new Date().toISOString(), duration: '03:45', recordingUrl: '#', 
        score: 85, status: 'Audited', feedback: 'Good greeting, clear pitch.', 
        criteria: { greeting: 5, knowledge: 4, closing: 4, empathy: 4 }
    },
    {
        id: 'aud2', leadId: 'LD-1002', agentId: 'presales2', callDate: new Date().toISOString(), duration: '01:20', recordingUrl: '#', 
        score: 40, status: 'Audited', feedback: 'Rude tone, did not ask budget.', 
        criteria: { greeting: 2, knowledge: 3, closing: 1, empathy: 2 }
    },
    {
        id: 'aud3', leadId: 'LD-1003', agentId: 'presales1', callDate: new Date().toISOString(), duration: '05:10', recordingUrl: '#', 
        score: 0, status: 'Pending', criteria: { greeting: 0, knowledge: 0, closing: 0, empathy: 0 }
    }
];

export const MOCK_LANDING_PAGES: LandingPage[] = [
    {
        id: 'lp1', title: 'Monsoon Dhamaka 2024', slug: 'monsoon-offer', status: 'Published',
        blocks: [
            { id: 'b1', type: 'Hero', content: { headline: 'Monsoon Offer: No EMI till Possession', image: '#' } },
            { id: 'b2', type: 'Form', content: { fields: ['Name', 'Mobile'] } }
        ],
        leadsGenerated: 120
    },
    {
        id: 'lp2', title: 'NRI Investment Summit', slug: 'nri-invest', status: 'Draft',
        blocks: [
            { id: 'b1', type: 'Video', content: { url: '#' } }
        ],
        leadsGenerated: 0
    }
];

export const SAAS_PLANS: SaaSPlan[] = [
    { 
        name: 'Silver', 
        price: 9999, 
        features: ['presalesDialer', 'visitEngine', 'pricingVisibility', 'legalModule'] 
    },
    { 
        name: 'Gold', 
        price: 19999, 
        features: ['presalesDialer', 'visitEngine', 'pricingVisibility', 'cpModule', 'marketingModule', 'reportsModule', 'legalModule'] 
    },
    { 
        name: 'Platinum', 
        price: 29999, 
        features: [
            // Core
            'dashboard', 'leads', 'settings', 'team', 'developer-hub', 'archival', 'super-admin',
            // Acquisition
            'marketingModule', 'presalesDialer', 'visitEngine', 
            // Sales
            'inventoryModule', 'bookings', 'calendar', 'loanModule',
            // Partners
            'cpModule', 
            // Fulfillment
            'postSales', 'constructionModule', 'procurementModule', 'operationsModule',
            'customer-portal', 'snaggingModule', 
            // Admin & Legal
            'legalModule', 'reportsModule', 'qualityAudit', 'landingPages', 'incentives'
        ] 
    }
];

export const MOCK_TENANTS: Tenant[] = [
    {
        id: 't_001',
        name: 'Sonawane Group',
        subdomain: 'sonawane',
        plan: 'Platinum',
        status: 'Active',
        createdAt: '2023-01-15',
        usersCount: 25,
        branding: {
            primaryColor: '#2563eb',
            secondaryColor: '#1e293b',
            terminology: { 'Lead': 'Lead', 'Unit': 'Unit' }
        },
        customFields: []
    },
    {
        id: 't_002',
        name: 'Prestige Estates',
        subdomain: 'prestige',
        plan: 'Gold',
        status: 'Active',
        createdAt: '2023-06-20',
        usersCount: 15,
        branding: {
            primaryColor: '#b91c1c',
            secondaryColor: '#7f1d1d',
            terminology: { 'Lead': 'Prospect', 'Unit': 'Apartment' }
        },
        customFields: [
            { id: 'cf1', entity: 'Lead', label: 'Passport No', type: 'Text', mandatory: false }
        ]
    },
    {
        id: 't_003',
        name: 'Lodha Developers',
        subdomain: 'lodha',
        plan: 'Gold',
        status: 'Active',
        createdAt: '2023-08-10',
        usersCount: 40,
        branding: {
            primaryColor: '#d97706',
            secondaryColor: '#451a03',
            terminology: { 'Lead': 'Client', 'Unit': 'Residence' }
        },
        customFields: []
    },
    {
        id: 't_004',
        name: 'Skyline Builders',
        subdomain: 'skyline',
        plan: 'Silver',
        status: 'Suspended',
        createdAt: '2023-11-05',
        usersCount: 5,
        branding: {
            primaryColor: '#059669',
            secondaryColor: '#064e3b',
            terminology: { 'Lead': 'Lead', 'Unit': 'Flat' }
        },
        customFields: []
    }
];

export const MOCK_KNOWLEDGE_BASE: KnowledgeItem[] = [
    { id: 'kb1', question: 'Distance to Railway Station?', answer: '1.2 Kms (approx 5 mins by auto).', category: 'Project' },
    { id: 'kb2', question: 'Is this RERA Approved?', answer: 'Yes, RERA ID is P51700001234. You can check on MahaRERA website.', category: 'Legal' },
    { id: 'kb3', question: 'Why is the price high?', answer: 'Sir, compare our carpet area loading (35%) vs Competitor X (45%). Our usable area is higher.', category: 'Pricing' },
    { id: 'kb4', question: 'Competitor X is offering Gold Coin', answer: 'We offer Modular Kitchen + AC which has higher utility value than a coin.', category: 'Competitor' }
];

export const MOCK_LEDGERS: LedgerMapping[] = [
    { crmLedger: 'Booking Amount', tallyLedger: 'Advance from Customers', status: 'Mapped' },
    { crmLedger: 'GST Output', tallyLedger: 'GST Payable (Output)', status: 'Mapped' },
    { crmLedger: 'Cancellation Refund', tallyLedger: '', status: 'Unmapped' }
];

export const MOCK_SNAGS: Snag[] = [
    { id: 'snag1', unitId: 'p1-Wing A-101', location: 'Kitchen', category: 'Plumbing', description: 'Tap leaking in sink', status: 'Open', priority: 'Medium', loggedBy: 'Customer', loggedAt: '2024-10-20' },
    { id: 'snag2', unitId: 'p1-Wing A-101', location: 'Master Bedroom', category: 'Paint', description: 'Paint peeling near window', status: 'Fixed', priority: 'Low', loggedBy: 'Site Engineer', loggedAt: '2024-10-18' }
];
