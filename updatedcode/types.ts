
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
  type?: 'call' | 'whatsapp' | 'email' | 'system' | 'visit' | 'sms';
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

export interface SiteVisitLog {
    id: string;
    date: string;
    type: 'First Visit' | 'Revisit';
    projectVisited: string;
    pickupProvided: boolean;
    dropProvided: boolean;
    withFamily: boolean;
    withCP: boolean;
    salesManager: string;
    outcome: 'Hot' | 'Warm' | 'Cold' | 'Dead';
    remarks: string;
    nextFollowUp: string;
}

export interface VisitorProfile {
    salutation: string;
    firstName: string;
    lastName: string;
    ageGroup: string;
    maritalStatus: string;
    familySize: number;
    residenceStatus: 'Owned' | 'Rented';
    address: string;
    city: string;
    pincode: string;
    occupation: {
        industry: string;
        designation: string;
        annualIncome: string;
        officeLocation: string;
    };
}

export interface CostSheet {
    baseCost: number;
    floorRise: number;
    plc: number; 
    amenities: number;
    
    // Parking
    parkingCount: number;
    parkingCost: number;

    // Core
    agreementValue: number;
    
    // Taxes
    gstRate: number; // 0, 0.01, 0.05, 0.12
    gstAmount: number;
    
    // Statutory
    stampDutyAmount: number;
    registrationAmount: number;
    
    total: number; // Gross Total
    discount: number;
    finalPrice: number; // Net Payable
    paymentPlan?: string;
}

export interface Quote {
    id: string;
    leadId: string;
    unitId: string;
    unitNumber: string;
    version: number;
    costSheet: CostSheet;
    paymentPlan: string;
    status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Booked';
    generatedBy: string;
    createdAt: string;
    validUntil: string;
}

export interface Lead {
  id: string;
  createdAt: string;
  
  name: string; 
  mobile: string;
  email?: string;
  visitorProfile?: VisitorProfile; 

  project: string;
  configuration?: string; 
  budgetRange?: string;
  buyingPurpose?: 'Self-Use' | 'Investment';
  possessionTimeframe?: 'Ready to Move' | 'Under Construction';
  
  campaign: string;
  source: LeadSource | string;
  subSource?: string;
  channelPartnerId?: string;
  
  stage: LeadStage;
  subStage?: string;
  subStageReason?: string;
  followUpDate: string;
  followUpTime: string;
  agentName: string;
  agentId?: string;
  
  callCount: number;
  remarksHistory: RemarkLog[];
  siteVisitLogs?: SiteVisitLog[]; 
  quotes?: Quote[]; 
  
  aiScore?: number;
  aiSummary?: string;
  visitToken?: string;
  visitTokenExpiry?: string;
  isTokenUsed?: boolean;
  metaData?: MetaAttribution;
  customFields?: Record<string, any>;
}

export interface UnitType {
    id: string;
    name: string;
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
  status: 'Under Construction' | 'Ready to Move';
  isMetro: boolean; // For Affordable Housing logic
  campaigns?: string[];
  towers?: ProjectTower[];
  unitTypes?: UnitType[];
  coordinates?: { lat: number, lng: number };
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

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string; 
}

export interface AgentSession {
  loginTime: string;
  logoutTime?: string;
  durationMinutes?: number;
}

export interface Agent {
  id: string;
  name: string;
  role: 'TeamLeader' | 'Presales' | 'Sales' | 'SalesHead' | 'SuperAdmin' | 'Reception' | 'Legal' | 'Banker';
  department?: string;
  email?: string;
  mobile?: string;
  reportingManagerId?: string;
  active: boolean;
  status: 'Online' | 'Offline' | 'Break' | 'Busy';
  lastLeadAssignedAt: number;
  avatar?: string;
  sessions: AgentSession[];
  joinedAt?: string;
  ipRestriction?: string;
}

export interface AuditLog {
    id: string;
    timestamp: string;
    action: string;
    performedBy: string;
    targetUser?: string;
    details: string;
}

export interface Unit {
    id: string;
    unitNumber: string;
    floor: number;
    tower: string;
    type: string;
    status: 'Available' | 'Sold' | 'Blocked';
    carpetArea: number;
    basePrice: number;
    blockedBy?: string;
    blockedAt?: number;
    soldTo?: string;
}

export interface PricingConfig {
    baseRate: number;
    floorRise: number;
    amenities: number;
    parking: number; // Legacy field (Single Parking)
    parkingRate: number; // New Per Slot Rate
    gst: number; // Default Rate (deprecated by dynamic logic)
    stampDuty: number;
    registration: number;
    maxDiscount: number;
}

export interface DiscountRequest {
    id: string;
    unitId: string;
    agentId: string;
    discountAmount: number;
    status: 'Pending' | 'Approved' | 'Rejected';
}

export enum PaymentStatus {
  PAID = 'Paid',
  DUE = 'Due',
  OVERDUE = 'Overdue',
  UPCOMING = 'Upcoming'
}

export interface PaymentMilestone {
  id: string;
  name: string;
  percentage: number;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  paidDate?: string;
  transactionId?: string;
  penalty?: number;
  interest?: number;
}

export interface BookingDocument {
  id: string;
  name: string;
  type: 'PDF' | 'Image';
  url: string;
  generatedAt: string;
  status: 'Draft' | 'Signed' | 'Registered';
}

export interface LoanDetails {
  bankName: string;
  sanctionAmount: number;
  status: 'Not Applied' | 'Applied' | 'Sanctioned' | 'Disbursed' | 'Rejected';
  agentName?: string;
  agentId?: string;
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
  status: 'Pending' | 'Costing' | 'Approved' | 'Completed';
  addedToDemand: boolean;
}

export interface Referral {
    id: string;
    name: string;
    mobile: string;
    status: 'Sent' | 'Site Visit' | 'Booked' | 'Agreement Done';
    rewardAmount: number;
    date: string;
}

export interface CancellationRecord {
    bookingId: string;
    reason: string;
    forfeitureAmount: number;
    refundAmount: number;
    refundStatus: 'Pending' | 'Processed';
    cancelledAt: string;
}

export interface TransferRequest {
    id: string;
    originalName: string;
    newName: string;
    relationship: string;
    transferFee: number;
    status: 'Pending' | 'Approved' | 'Completed';
    requestDate: string;
}

// --- BOOKING INTERFACES ---

export interface Address {
    street: string;
    city: string;
    state: string;
    pincode: string;
}

export interface Applicant {
    type: 'Primary' | 'Co-Applicant';
    title: string;
    fullName: string;
    mobile: string;
    email: string;
    dob: string;
    pan: string;
    aadhaar: string;
    occupation: string;
    relationship?: string; 
    address: Address;
}

export interface BookingPaymentDetails {
    amount: number;
    mode: 'Cheque' | 'NEFT' | 'RTGS' | 'UPI' | 'Card';
    bankName?: string;
    branch?: string;
    instrumentNo?: string; 
    instrumentDate?: string;
    isTdsDeducted: boolean;
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
  handoverStatus?: 'Pending Welcome' | 'Active' | 'Snagging' | 'Ready for Possession' | 'Handed Over';
  channelPartnerName?: string;
  channelPartnerId?: string;
  
  // Deep Data
  applicants?: Applicant[];
  paymentTransaction?: BookingPaymentDetails;

  paymentSchedule: PaymentMilestone[];
  documents: BookingDocument[];
  
  loanDetails?: LoanDetails;
  tickets: ServiceTicket[];
  modifications: ModificationRequest[];
  tdsCompliant: boolean;
  
  referrals?: Referral[];
  cancellation?: CancellationRecord;
  transferHistory?: TransferRequest[];
  possessionChecklist?: {
        paymentCleared: boolean;
        snaggingCleared: boolean;
        agreementRegistered: boolean;
        ndcIssued: boolean;
        possessionLetterIssued: boolean;
  };
}

// ... (Rest of types remain same: ProjectMilestone, CPDocument, ChannelPartner, CommissionInvoice, MarketingCollateral, SiteVisit, etc.)

export interface ProjectMilestone {
    id: string;
    projectId: string;
    name: string;
    completed: boolean;
    completionDate?: string;
}

export interface CPDocument {
    name: 'RERA Certificate' | 'Pan Card' | 'GST Certificate' | 'Cancelled Cheque';
    url: string;
    status: 'Pending' | 'Verified' | 'Rejected';
}

export interface ChannelPartner {
    id: string;
    name: string;
    firmName: string;
    mobile: string;
    email?: string;
    reraId: string;
    tier: 'Silver' | 'Gold' | 'Platinum';
    status: 'Pending' | 'Active' | 'Blacklisted';
    totalSalesValue: number;
    commissionEarned: number;
    leadsCount: number;
    
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
    bookingId?: string;
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
    title: string;
    type: 'PDF' | 'Image' | 'Video';
    url: string;
}

export interface SiteVisit {
    id: string;
    leadId: string;
    visitorName: string;
    mobile: string;
    project: string;
    agentId: string;
    agentName: string;
    checkInTime: string;
    checkOutTime?: string;
    status: 'Waiting' | 'In Meeting' | 'Completed';
    sourceType: 'Fresh' | 'Revisit';
    waitDuration?: number;
}

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
    metaCampaignId?: string;
    name: string;
    platform: 'Facebook' | 'Google' | 'Housing' | 'Offline';
    budget: number;
    dailyBudget?: number;
    spent: number;
    leadsGenerated: number;
    bookingsGenerated: number;
    status: 'Active' | 'Paused' | 'Ended';
    startDate: string;
    endDate?: string;
    utmSource: string;
    adSets?: MetaAdSet[];
}

export interface DripStep {
    day: number;
    type: 'WhatsApp' | 'Email' | 'SMS';
    content: string;
}

export interface ConstructionUpdate {
    id: string;
    projectId: string;
    towerName: string;
    milestoneName: string;
    percentageComplete: number;
    updateDate: string;
    photoUrl?: string;
    engineerName: string;
    status: 'Pending Approval' | 'Approved';
}

export interface IncentiveSlab {
    minUnits: number;
    maxUnits: number;
    amountPerUnit: number;
}

export interface IncentiveScheme {
    id: string;
    role: 'Presales' | 'Sales';
    slabs: IncentiveSlab[];
    kicker: number;
}

export interface EmployeeTarget {
    agentId: string;
    period: string;
    target: number;
    achieved: number;
    incentiveEarned: number;
}

export type IntegrationProvider = '99acres' | 'MagicBricks' | 'Housing' | 'Google' | 'Website' | 'Facebook' | 'MailChimp' | 'SendGrid' | 'WhatsApp';

export interface CsvMapping {
    csvHeader: string;
    crmField: keyof Lead | 'skip';
}

export interface SecurityConfig {
  ipWhitelistEnabled: boolean;
  screenShieldEnabled: boolean;
  decoyDataEnabled: boolean;
  allowedIps: string[];
}

export interface IntegrationConfig {
    mailchimpKey?: string;
    sendgridKey?: string;
    tallyEnabled?: boolean;
    tallyUrl?: string;
}

export interface FeatureFlags {
    cpModule: boolean;
    postSales: boolean;
    presalesDialer: boolean;
    visitEngine: boolean;
    pricingVisibility: boolean;
    operationsModule: boolean;
    marketingModule: boolean;
    reportsModule: boolean;
    constructionModule: boolean;
    procurementModule: boolean;
    legalModule: boolean;
    loanModule?: boolean; 
    snaggingModule?: boolean;
    
    dashboard?: boolean;
    leads?: boolean;
    settings?: boolean;
    team?: boolean;
    'developer-hub'?: boolean;
    archival?: boolean;
    'super-admin'?: boolean;
    inventoryModule?: boolean;
    bookings?: boolean;
    calendar?: boolean;
    'customer-portal'?: boolean;
    qualityAudit?: boolean;
    landingPages?: boolean;
    incentives?: boolean;
}

export interface FraudAlert {
    id: string;
    severity: 'High' | 'Medium' | 'Low';
    type: 'Duplicate' | 'Pricing' | 'Conflict' | 'Access';
    message: string;
    timestamp: string;
    status: 'Open' | 'Resolved' | 'Ignored';
    agentId?: string;
    details?: string;
}

export interface ApprovalWorkflow {
    id: string;
    name: string;
    triggerCondition: string;
    approverRole: 'SalesHead' | 'SuperAdmin';
    status: 'Active' | 'Inactive';
}

export interface SimulationScenario {
    name: string;
    priceIncrease: number;
    salesVelocityChange: number;
    inventoryImpact: number;
}

export type VendorCategory = 'Civil' | 'Electrical' | 'Plumbing' | 'Marketing' | 'Services' | 'Steel' | 'Cement';

export interface Vendor {
    id: string;
    companyName: string;
    gst: string;
    category: VendorCategory;
    contactPerson: string;
    mobile: string;
    status: 'Active' | 'Pending' | 'Blacklisted';
    rating: number;
    balance: number;
}

export interface Indent {
    id: string;
    projectId: string;
    requestedBy: string;
    material: string;
    quantity: number;
    unit: string;
    status: 'Pending' | 'RFQ Sent' | 'Ordered' | 'Fulfilled';
    date: string;
}

export interface VendorQuote {
    vendorId: string;
    vendorName: string;
    price: number;
    deliveryDays: number;
    terms?: string;
}

export interface PurchaseOrder {
    id: string;
    indentId: string;
    vendorId: string;
    amount: number;
    status: 'Draft' | 'Pending Approval' | 'Issued' | 'Partially Received' | 'Closed';
    date: string;
    items: { material: string; qty: number; rate: number }[];
}

export interface GRN {
    id: string;
    poId: string;
    receivedDate: string;
    itemsReceived: { material: string; qty: number; condition: 'Good' | 'Damaged' }[];
    receiverName: string;
}

export interface LegalCase {
    id: string;
    caseNumber: string;
    courtName: string;
    opposingParty: string;
    status: 'Active' | 'Adjourned' | 'Disposed';
    nextHearingDate: string;
    history: { date: string; outcome: string }[];
}

export interface LandParcel {
    id: string;
    surveyNumber: string;
    village: string;
    areaAcres: number;
    ownerName: string;
    status: 'Clear Title' | 'Litigation' | 'In Process';
    documents: { name: string; type: string }[];
}

export interface ReraProject {
    projectId: string;
    projectName: string;
    reraId: string;
    completionDate: string;
    qprDeadline: string;
    complianceStatus: 'Compliant' | 'Warning' | 'Critical';
}

export type ModuleName = 'Leads' | 'Sales' | 'Inventory' | 'Legal' | 'Finance' | 'HR' | 'Admin';
export type DataScope = 'Own' | 'Team' | 'All';

export interface Permission {
    module: ModuleName;
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canExport: boolean;
    scope: DataScope;
}

export interface RoleConfig {
    id: string;
    roleName: string;
    description: string;
    permissions: Permission[];
}

export type ChartType = 'Bar' | 'Line' | 'Pie' | 'Area' | 'Table';

export interface ReportFilter {
    id: string;
    field: string;
    operator: 'equals' | 'contains' | 'gt' | 'lt' | 'not_equals';
    value: string;
}

export interface ReportConfig {
    source: 'Leads' | 'Bookings' | 'Inventory';
    filters: ReportFilter[];
    groupBy: string;
    metric: 'Count' | 'Sum';
    metricField?: string;
    chartType: ChartType;
    title: string;
    description?: string;
}

export interface AutomationTrigger {
    id: string;
    name: string;
    event: 'New Lead' | 'Status Change' | 'Payment Received' | 'Site Visit Scheduled';
    condition?: string;
    actions: { type: 'SMS' | 'WhatsApp' | 'Email'; templateId: string }[];
    isActive: boolean;
}

export interface DLTTemplate {
    id: string;
    name: string;
    dltTeId: string;
    senderId: string;
    content: string;
}

export interface WABATemplate {
    id: string;
    name: string;
    content: string;
    status: 'Approved' | 'Rejected' | 'Pending';
    language: string;
}

export interface CallAudit {
    id: string;
    leadId: string;
    agentId: string;
    callDate: string;
    duration: string;
    recordingUrl: string;
    score: number;
    status: 'Pending' | 'Audited';
    feedback?: string;
    criteria: {
        greeting: number;
        knowledge: number;
        closing: number;
        empathy: number;
    };
}

export interface LandingPageBlock {
    id: string;
    type: 'Hero' | 'Video' | 'Text' | 'Form' | 'Footer';
    content: any;
}

export interface LandingPage {
    id: string;
    title: string;
    slug: string;
    status: 'Draft' | 'Published';
    blocks: LandingPageBlock[];
    seoTitle?: string;
    seoDesc?: string;
    leadsGenerated: number;
}

export interface ArchivalConfig {
    autoArchiveJunk: boolean;
    autoArchiveLost: boolean;
    purgeRecordings: boolean;
    lastRun: string;
}

export type PlanType = 'Silver' | 'Gold' | 'Platinum' | 'Enterprise';

export interface CustomFieldDefinition {
    id: string;
    entity: 'Lead' | 'Booking' | 'Inventory';
    label: string;
    type: 'Text' | 'Number' | 'Date' | 'Dropdown';
    options?: string[];
    mandatory: boolean;
}

export interface BrandingConfig {
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
    terminology: Record<string, string>;
}

export interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    plan: PlanType;
    status: 'Active' | 'Inactive' | 'Suspended';
    createdAt: string;
    branding: BrandingConfig;
    customFields: CustomFieldDefinition[];
    usersCount: number;
    dbShardId?: string;
}

export interface PlanFeature {
    id: string;
    name: string;
    module: keyof FeatureFlags;
    description: string;
}

export interface SaaSPlan {
    name: PlanType;
    price: number;
    features: (keyof FeatureFlags)[];
}

export interface FormField {
    id: string;
    label: string;
    type: 'Text' | 'Number' | 'Dropdown' | 'Date' | 'Checkbox';
    mandatory: boolean;
    options?: string[];
    visibleToTeamOnly?: boolean;
}

export interface KnowledgeItem {
    id: string;
    question: string;
    answer: string;
    category: 'Project' | 'Pricing' | 'Legal' | 'Competitor';
}

export interface LedgerMapping {
    crmLedger: string;
    tallyLedger: string;
    status: 'Mapped' | 'Unmapped';
}

export interface Snag {
    id: string;
    unitId: string; 
    location: 'Kitchen' | 'Master Bedroom' | 'Living Room' | 'Bathroom' | 'Balcony';
    category: 'Plumbing' | 'Electrical' | 'Civil' | 'Paint' | 'Carpentry';
    description: string;
    status: 'Open' | 'Fixed' | 'Closed';
    photoUrl?: string;
    priority: 'Low' | 'Medium' | 'Critical';
    loggedBy: string;
    loggedAt: string;
}
