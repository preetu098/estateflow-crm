
import { Lead, LeadSource, LeadStage, Project, ProjectType, CommunicationTemplate, Agent, Booking, PaymentStatus, Unit, ChannelPartner, ProjectMilestone, PricingConfig } from './types';

export const RESIDENTIAL_CONFIGS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'NA'];
export const COMMERCIAL_TYPES = ['Office', 'Retail Shop', 'Showroom', 'Warehouse', 'Co-working', 'Other', 'NA'];

export const INITIAL_PROJECTS: Project[] = [
  { 
      id: 'p1', 
      name: 'Krishna Trident', 
      location: 'Kalyan East', 
      type: ProjectType.RESIDENTIAL, 
      campaigns: ['Luxury Launch', '2BHK Promo'],
      towers: [
          { name: 'Wing A', floors: 20, unitsPerFloor: 4 },
          { name: 'Wing B', floors: 20, unitsPerFloor: 4 }
      ],
      unitTypes: [
          { id: 'ut1', name: '2BHK Type A', carpetArea: 750, balconyArea: 50, superArea: 1050 },
          { id: 'ut2', name: '3BHK Type B', carpetArea: 1050, balconyArea: 80, superArea: 1450 }
      ]
  },
  { 
      id: 'p2', 
      name: 'Gaondevi Crown: GoldClass', 
      location: 'Kalyan East', 
      type: ProjectType.RESIDENTIAL, 
      campaigns: ['GoldClass Premiere', 'Investor Meet'],
      towers: [
          { name: 'Tower 1', floors: 25, unitsPerFloor: 6 }
      ],
      unitTypes: [
          { id: 'ut3', name: '1BHK Compact', carpetArea: 450, balconyArea: 0, superArea: 650 },
          { id: 'ut4', name: '1BHK Large', carpetArea: 550, balconyArea: 30, superArea: 800 }
      ]
  },
  { id: 'p3', name: 'Krishna Anand', location: 'Kalyan East', type: ProjectType.RESIDENTIAL, campaigns: ['Site Visit Campaign', 'Facebook Ads'] },
  { id: 'p4', name: 'Gold Crest Hi Fi Living', location: 'Dombivli', type: ProjectType.RESIDENTIAL, campaigns: ['Smart Homes Promo', 'Digital Launch'] },
  { id: 'p5', name: 'Sonawane Business Park', location: 'Thane', type: ProjectType.COMMERCIAL, campaigns: ['Office Pre-launch'] },
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

// New Presales Team Roster
const PRESALES_NAMES = [
  'Tejaswi sonwane',
  'Sapna Jaiswal',
  'Satyam thakur',
  'Sarika wagh',
  'Shrutika jadhav',
  'Taslima Tadavi',
  'Shivangi singh',
  'Darshana Avgune'
];

export const INITIAL_AGENTS: Agent[] = [
  // Team Leader
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
    id: 'tl2', 
    name: 'Amit (Sales Head)', 
    role: 'SalesHead', 
    active: false, 
    status: 'Online',
    lastLeadAssignedAt: 0,
    sessions: [{ loginTime: `${today}T09:00:00.000Z`, logoutTime: undefined }]
  },
  // Generate Agents from the provided list
  ...PRESALES_NAMES.map((name, index) => ({
    id: `a${index + 1}`,
    name: name,
    role: 'Presales' as const,
    active: true,
    status: (index % 3 === 0 ? 'Online' : index % 3 === 1 ? 'Break' : 'Offline') as any, // Mock status distribution
    lastLeadAssignedAt: Date.now() - (Math.random() * 1000000),
    sessions: [
        { loginTime: `${today}T09:00:00.000Z`, logoutTime: `${today}T13:00:00.000Z`, durationMinutes: 240 },
        ...(index % 3 === 0 || index % 3 === 1 ? [{ loginTime: `${today}T14:00:00.000Z`, logoutTime: undefined }] : [])
    ]
  }))
];

export const SUB_STAGES: Record<LeadStage, string[]> = {
  [LeadStage.NEW]: ['Fresh', 'Not Contacted', 'Attempted'],
  [LeadStage.CONNECTED]: ['RNR (Ring No Response)', 'Busy', 'Switch Off', 'Call Back Later', 'Not Interested', 'Interested'],
  [LeadStage.VISIT_SCHEDULED]: ['Confirmed', 'Tentative', 'Rescheduled', 'Cab Required'],
  [LeadStage.QUALIFIED]: ['Hot', 'Warm', 'Cold', 'Budget Issue', 'Location Issue'],
  [LeadStage.NEGOTIATION]: ['Price Negotiation', 'Unit Selection', 'Legal Check', 'Payment Plan'],
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

export const MOCK_CHANNEL_PARTNERS: ChannelPartner[] = [
    { id: 'cp1', name: 'Sharma Estates', firmName: 'Sharma Realty', mobile: '9988776655', reraId: 'A51700000123', tier: 'Gold', status: 'Active', totalSalesValue: 25000000, commissionEarned: 750000, leadsCount: 12 },
    { id: 'cp2', name: 'PropTiger', firmName: 'PropTiger Realty', mobile: '9988000000', reraId: 'A51700000999', tier: 'Platinum', status: 'Active', totalSalesValue: 150000000, commissionEarned: 6000000, leadsCount: 50 },
    { id: 'cp3', name: 'Local Broker 1', firmName: 'Kalyan Homes', mobile: '8877665544', reraId: 'A51700000555', tier: 'Silver', status: 'Pending', totalSalesValue: 0, commissionEarned: 0, leadsCount: 1 },
];

export const COMMISSION_TIERS = {
    'Silver': 0.02,
    'Gold': 0.03,
    'Platinum': 0.04
};

export const MOCK_LEADS: Lead[] = [
  {
    id: 'LD-1001',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    campaign: 'Luxury Launch',
    name: 'Rahul Sharma',
    mobile: '9876543210',
    source: LeadSource.FACEBOOK,
    project: 'Krishna Trident',
    configuration: '2 BHK',
    stage: LeadStage.BOOKED, // Updated status
    subStage: 'Token Received',
    followUpDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    followUpTime: '10:00',
    agentName: 'Tejaswi sonwane',
    agentId: 'a1',
    callCount: 3,
    remarksHistory: [
      { timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), text: 'Lead received from FB.', author: 'System' },
      { timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), text: 'Spoke to client, interested in 2BHK.', author: 'Tejaswi sonwane' },
      { timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), text: 'Scheduled site visit for tomorrow.', author: 'Tejaswi sonwane' },
    ],
    aiScore: 95,
    aiSummary: "High intent buyer, booked 2BHK."
  },
  {
    id: 'LD-1002',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    campaign: 'GoldClass Premiere',
    name: 'Priya Verma',
    mobile: '9123456789',
    source: LeadSource.GOOGLE,
    project: 'Gaondevi Crown: GoldClass',
    configuration: '1 BHK',
    stage: LeadStage.LOST,
    subStage: 'Budget Mismatch',
    subStageReason: 'Budget is max 35L',
    followUpDate: '',
    followUpTime: '',
    agentName: 'Sapna Jaiswal',
    agentId: 'a2',
    callCount: 5,
    remarksHistory: [
      { timestamp: new Date(Date.now() - 86400000 * 10).toISOString(), text: 'Inquired about pricing.', author: 'System' },
      { timestamp: new Date(Date.now() - 86400000 * 8).toISOString(), text: 'Budget is max 35L. Our start is 45L.', author: 'Sapna Jaiswal' },
      { timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), text: 'Client dropped out due to price.', author: 'Sapna Jaiswal' },
    ],
    aiScore: 10,
    aiSummary: "Budget mismatch. Unlikely to convert."
  },
  {
    id: 'LD-1003',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    campaign: 'Site Visit Campaign',
    name: 'Amit Patel',
    mobile: '8887776665',
    source: LeadSource.CHANNEL_PARTNER,
    subSource: 'Sharma Estates',
    project: 'Krishna Anand',
    configuration: '2 BHK',
    stage: LeadStage.NEW,
    subStage: 'Fresh',
    followUpDate: new Date().toISOString().split('T')[0],
    followUpTime: '14:00',
    agentName: 'Satyam thakur',
    agentId: 'a3',
    callCount: 0,
    remarksHistory: [
        { timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), text: 'Referred by CP Sharma Estates.', author: 'System' }
    ]
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

// Sales Inventory Generation (Mock)
export const generateInventory = (projectId: string) => {
    const units: Unit[] = [];
    const towers = ['Wing A', 'Wing B'];
    const floors = 20;
    const unitsPerFloor = 4;
    
    towers.forEach(tower => {
        for(let f=1; f<=floors; f++) {
            for(let u=1; u<=unitsPerFloor; u++) {
                const unitNum = `${f}${u < 10 ? '0' + u : u}`;
                // Random status
                const rand = Math.random();
                let status: 'Available' | 'Sold' | 'Blocked' = 'Available';
                // Deterministic random based on floor/unit to keep it consistent-ish across re-renders if not saved
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
    floorRise: 50, // per floor
    amenities: 500000,
    parking: 300000,
    gst: 0.05, // 5%
    stampDuty: 0.07, // 7%
    registration: 30000,
    maxDiscount: 200 // per sqft
};
