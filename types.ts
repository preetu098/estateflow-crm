
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
  CHANNEL_PARTNER = 'Channel Partner'
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
  role: 'TeamLeader' | 'Presales' | 'SalesHead' | 'SuperAdmin' | 'Reception';
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

export interface ChannelPartner {
    id: string;
    name: string;
    firmName: string;
    mobile: string;
    reraId: string;
    tier: 'Silver' | 'Gold' | 'Platinum';
    status: 'Pending' | 'Active' | 'Blacklisted';
    totalSalesValue: number;
    commissionEarned: number;
    leadsCount: number;
}

export interface CommissionRecord {
    id: string;
    partnerId: string;
    bookingId: string;
    unitNumber: string;
    amount: number;
    status: 'Pending' | 'Invoiced' | 'Paid';
    invoiceUrl?: string;
    date: string;
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
