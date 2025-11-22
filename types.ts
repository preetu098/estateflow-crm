
export enum LeadStage {
  NEW = 'New',
  CONNECTED = 'Connected',
  VISIT_SCHEDULED = 'Visit Scheduled',
  QUALIFIED = 'Qualified',
  NEGOTIATION = 'Negotiation',
  BOOKED = 'Booked',
  LOST = 'Lost',
  UNRESPONSIVE = 'Unresponsive'
}

export enum LeadSource {
  FACEBOOK = 'Facebook Ads',
  GOOGLE = 'Google Ads',
  REFERRAL = 'Referral',
  WEBSITE = 'Website',
  WALK_IN = 'Walk-in',
  MAGIC_BRICKS = 'Magic Bricks',
  HOUSING_COM = 'Housing.com',
  CHANNEL_PARTNER = 'Channel Partner',
  LINKEDIN = 'LinkedIn',
  EMAIL_PARSER = 'Email Inquiry',
  CSV_IMPORT = 'Bulk Import'
}

export enum ProjectType {
  RESIDENTIAL = 'Residential',
  COMMERCIAL = 'Commercial'
}

export interface RemarkLog {
  timestamp: string;
  text: string;
  author: string;
}

export interface MetaAttribution {
  adId?: string;
  adName?: string;
  adSetId?: string;
  adSetName?: string;
  campaignId?: string;
  campaignName?: string;
  platform?: string;
  formId?: string;
  formName?: string;
}

export interface Lead {
  id: string;
  createdAt: string;
  campaign: string;
  name: string;
  mobile: string;
  email?: string;
  source: LeadSource | string; // Allow dynamic sources
  subSource?: string;
  project: string;
  configuration?: string; // Stores "2 BHK" or "Office" based on project type
  stage: LeadStage;
  subStage?: string;
  subStageReason?: string;
  followUpDate: string; // ISO String YYYY-MM-DD
  followUpTime: string;
  agentName: string; // Assigned Presales Agent
  agentId?: string;
  callCount: number;
  remarksHistory: RemarkLog[];
  aiScore?: number;
  aiSummary?: string;
  
  // QR Gate Pass Fields
  visitToken?: string;
  visitTokenExpiry?: string; // ISO String
  isTokenUsed?: boolean;

  // Meta / Digital Footprint
  metaData?: MetaAttribution;
}

export interface UnitType {
    id: string;
    name: string; // e.g., "2BHK Type A"
    carpetArea: number;
    balconyArea: number;
    superArea: number;
}

export interface ProjectTower {
    name: string;
    floors: number;
    unitsPerFloor: number;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  type: ProjectType;
  campaigns?: string[]; // Linked campaigns
  towers?: ProjectTower[];
  unitTypes?: UnitType[];
}

export interface DashboardStats {
  totalLeads: number;
  qualifiedLeads: number;
  visitsScheduled: number;
  conversionRate: number;
}

export interface CommunicationTemplate {
  id: string;
  type: 'whatsapp' | 'sms';
  name: string;
  content: string;
}

export interface AgentSession {
  loginTime: string; // ISO String
  logoutTime?: string; // ISO String
  durationMinutes?: number;
}

export interface Agent {
  id: string;
  name: string;
  // 'Sales' is the Closing Manager. 'Presales' is the Tele-caller.
  role: 'TeamLeader' | 'Presales' | 'Sales' | 'SalesHead' | 'SuperAdmin' | 'Reception';
  email?: string;
  mobile?: string;
  reportingManagerId?: string;
  active: boolean; // Round Robin eligibility
  status: 'Online' | 'Offline' | 'Break' | 'Busy'; // Live status
  lastLeadAssignedAt: number; // Timestamp for LRU algorithm
  avatar?: string;
  sessions: AgentSession[]; // History of logins
}

// --- Sales Module Types ---

export interface Unit {
    id: string;
    unitNumber: string;
    floor: number;
    tower: string;
    type: string; // 2BHK
    status: 'Available' | 'Sold' | 'Blocked';
    carpetArea: number;
    basePrice: number;
    blockedBy?: string; // Agent ID
    blockedAt?: number; // Timestamp
    soldTo?: string; // Customer Name/Lead ID
}

export interface PricingConfig {
    baseRate: number;
    floorRise: number;
    amenities: number;
    parking: number;
    gst: number; // Percentage e.g. 0.05
    stampDuty: number; // Percentage e.g. 0.06
    registration: number; // Fixed amount
    maxDiscount: number; // Per sqft
}

export interface CostSheet {
    baseCost: number;
    floorRise: number;
    plc: number;
    amenities: number;
    taxes: number;
    total: number;
    discount: number;
    finalPrice: number;
}

export interface DiscountRequest {
    id: string;
    unitId: string;
    agentId: string;
    discountAmount: number;
    status: 'Pending' | 'Approved' | 'Rejected';
}

// --- Post Sales Types ---

export enum PaymentStatus {
  PAID = 'Paid',
  DUE = 'Due',
  OVERDUE = 'Overdue',
  UPCOMING = 'Upcoming'
}

export interface PaymentMilestone {
  id: string;
  name: string; // e.g., "Booking Amount", "Plinth Level"
  percentage: number;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  paidDate?: string;
  transactionId?: string;
  penalty?: number; // Late fee
  interest?: number; // Delayed interest
}

export interface BookingDocument {
  id: string;
  name: string; // e.g., "Booking Form", "Agreement to Sale"
  type: 'PDF' | 'Image';
  url: string;
  generatedAt: string;
  status: 'Draft' | 'Signed' | 'Registered';
}

export interface LoanDetails {
  bankName: string;
  sanctionAmount: number;
  status: 'Not Applied' | 'Applied' | 'Sanctioned' | 'Disbursed' | 'Rejected';
  agentName?: string; // Banker name
  applicationDate?: string;
}

export interface ServiceTicket {
  id: string;
  bookingId: string;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  category: 'Modification' | 'Document' | 'Payment' | 'Other';
  priority: 'Low' | 'Medium' | 'High';
}

export interface ModificationRequest {
  id: string;
  description: string;
  cost: number;
  status: 'Pending' | 'Approved' | 'Completed';
  addedToDemand: boolean; // Has this cost been added to a payment milestone?
}

export interface Booking {
  id: string;
  leadId: string;
  customerName: string;
  mobile: string;
  email: string;
  project: string;
  unitNumber: string;
  tower: string;
  floor: string;
  carpetArea: string;
  parkingSlot: string;
  
  agreementValue: number;
  taxes: number;
  otherCharges: number;
  totalCost: number;
  amountPaid: number;
  
  bookingDate: string;
  status: 'Active' | 'Cancelled' | 'Handover';
  channelPartnerName?: string;
  channelPartnerId?: string;
  
  paymentSchedule: PaymentMilestone[];
  documents: BookingDocument[];
  
  // New Fields for Post-Sales Module
  loanDetails?: LoanDetails;
  tickets: ServiceTicket[];
  modifications: ModificationRequest[];
  tdsCompliant: boolean; // Form 16B uploaded?
}

export interface ProjectMilestone {
    id: string;
    projectId: string; // Link to Project ID in INITIAL_PROJECTS
    name: string; // "Plinth", "1st Slab"
    completed: boolean;
    completionDate?: string;
}

// --- Channel Partner Types ---

export interface CPDocument {
    name: 'RERA Certificate' | 'Pan Card' | 'GST Certificate' | 'Cancelled Cheque';
    url: string;
    status: 'Pending' | 'Verified' | 'Rejected';
}

export interface ChannelPartner {
    id: string;
    name: string; // Owner Name
    firmName: string;
    mobile: string;
    email?: string;
    reraId: string;
    tier: 'Silver' | 'Gold' | 'Platinum';
    status: 'Pending' | 'Active' | 'Blacklisted';
    totalSalesValue: number;
    commissionEarned: number;
    leadsCount: number;
    
    // KYC & Bank Info
    panNumber?: string;
    gstNumber?: string;
    bankDetails?: {
        accountName: string;
        accountNumber: string;
        ifsc: string;
        bankName: string;
    };
    documents?: CPDocument[];
}

export interface CommissionInvoice {
    id: string;
    partnerId: string;
    bookingId?: string; // Linked booking
    unitNumber?: string;
    amount: number;
    invoiceDate: string;
    invoiceNumber: string;
    status: 'Unbilled' | 'Processing' | 'Paid' | 'Rejected';
    fileUrl?: string;
}

export interface MarketingCollateral {
    id: string;
    projectId: string;
    title: string; // e.g. "Project Brochure", "Floor Plans"
    type: 'PDF' | 'Image' | 'Video';
    url: string;
}

// --- Reception / GRE Types ---

export interface SiteVisit {
    id: string;
    leadId: string;
    visitorName: string;
    mobile: string;
    project: string;
    agentId: string;
    agentName: string;
    checkInTime: string; // ISO String
    checkOutTime?: string;
    status: 'Waiting' | 'In Meeting' | 'Completed';
    sourceType: 'Fresh' | 'Revisit';
    waitDuration?: number; // Minutes
}

// --- Marketing Module Types ---

export interface MetaAd {
    id: string;
    name: string;
    leads: number;
    cpl: number;
}

export interface MetaAdSet {
    id: string;
    name: string;
    ads: MetaAd[];
}

export interface MarketingCampaign {
    id: string;
    metaCampaignId?: string; // The Facebook Campaign ID
    name: string;
    platform: 'Facebook' | 'Google' | 'Housing' | 'Offline';
    budget: number; // Total Budget
    dailyBudget?: number; // Daily Budget from Meta
    spent: number;
    leadsGenerated: number;
    bookingsGenerated: number;
    status: 'Active' | 'Paused' | 'Ended';
    startDate: string;
    endDate?: string;
    utmSource: string;
    adSets?: MetaAdSet[]; // Hierarchical data
}

export interface DripStep {
    day: number; // e.g. Day 1, Day 3
    type: 'WhatsApp' | 'Email' | 'SMS';
    content: string;
}

// --- Construction Module Types ---

export interface ConstructionUpdate {
    id: string;
    projectId: string;
    towerName: string;
    milestoneName: string; // "Plinth", "1st Slab"
    percentageComplete: number;
    updateDate: string;
    photoUrl?: string;
    engineerName: string;
    status: 'Pending Approval' | 'Approved';
}

// --- Incentive Module Types ---

export interface IncentiveSlab {
    minUnits: number;
    maxUnits: number;
    amountPerUnit: number;
}

export interface IncentiveScheme {
    id: string;
    role: 'Presales' | 'Sales';
    slabs: IncentiveSlab[];
    kicker: number; // Extra per unit for difficult inventory
}

export interface EmployeeTarget {
    agentId: string;
    period: string; // e.g. "Oct 2024"
    target: number; // Unit count
    achieved: number; // Unit count
    incentiveEarned: number;
}

// --- Integration Types ---

export type IntegrationProvider = '99acres' | 'MagicBricks' | 'Housing' | 'Google' | 'Website' | 'Facebook';

export interface CsvMapping {
    csvHeader: string;
    crmField: keyof Lead | 'skip';
}
