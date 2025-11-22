import { 
  LayoutDashboard, Users, Phone, CalendarCheck, Building2, 
  Briefcase, ClipboardCheck, HardHat, Wallet, BarChart3, 
  Settings, Code2, Archive, Shield, Megaphone, Truck, 
  Scale, Activity, CheckCircle, LayoutTemplate, UserCheck,
  Home, UserPlus, AlertCircle
} from 'lucide-react';

export const NAVIGATION_GROUPS = [
  {
    title: "Intelligence",
    items: [
      { 
        id: 'dashboard', 
        label: 'Dashboard', 
        icon: LayoutDashboard,
        description: 'Real-time overview of sales velocity, active leads, and pipeline health.'
      },
      { 
        id: 'cockpit', 
        label: 'Director\'s Cockpit', 
        icon: Activity,
        description: 'High-level strategic metrics, cash flow projections, and inventory aging.'
      },
      { 
        id: 'reports', 
        label: 'Report Builder', 
        icon: BarChart3,
        description: 'Create custom drag-and-drop reports and schedule automated emails.'
      }
    ]
  },
  {
    title: "Acquisition (Pre-Sales)",
    items: [
      { 
        id: 'marketing', 
        label: 'Marketing', 
        icon: Megaphone,
        description: 'Manage ad campaigns, track ROI, and sync leads from FB/Google.'
      },
      { 
        id: 'leads', 
        label: 'Lead Central', 
        icon: Users,
        description: 'Master database of all inquiries with status tracking and assignment.'
      },
      { 
        id: 'nurture', 
        label: 'Tele-Calling', 
        icon: Phone,
        description: 'Power dialer for Presales agents to qualify leads and schedule visits.'
      },
      { 
        id: 'reception', 
        label: 'Reception', 
        icon: UserCheck,
        description: 'QR Scan entry, digital gate pass, and sales handover management.'
      }
    ]
  },
  {
    title: "Transaction (Sales)",
    items: [
      { 
        id: 'sales', 
        label: 'Inventory & Sales', 
        icon: Building2,
        description: 'Interactive stacking plan, cost sheet generation, and unit blocking.'
      },
      { 
        id: 'visits', 
        label: 'Site Visits', 
        icon: CalendarCheck,
        description: 'Track walk-ins, re-visits, and site tour outcomes.'
      },
      { 
        id: 'bookings', 
        label: 'Bookings', 
        icon: Briefcase,
        description: 'Manage closed deals, KYC documents, and booking forms.'
      },
      { 
        id: 'loan', 
        label: 'Loan Management', 
        icon: Wallet,
        description: 'Track loan applications, banker assignments, and disbursements.'
      }
    ]
  },
  {
    title: "Fulfillment (Post-Sales)",
    items: [
      { 
        id: 'operations', 
        label: 'CRM Operations', 
        icon: ClipboardCheck,
        description: 'Post-sales documentation, demand letters, and agreements.'
      },
      { 
        id: 'construction', 
        label: 'Construction', 
        icon: HardHat,
        description: 'Update site progress milestones to trigger payment demands.'
      },
      { 
        id: 'snagging', 
        label: 'Snagging', 
        icon: CheckCircle,
        description: 'Manage quality checks and defect resolution before handover.'
      },
      { 
        id: 'customer-portal', 
        label: 'Customer App', 
        icon: Home,
        description: 'Simulate the client-facing app for payments and referrals.'
      }
    ]
  },
  {
    title: "Partners & Vendors",
    items: [
      { 
        id: 'channel-partners', 
        label: 'Channel Partners', 
        icon: UserPlus,
        description: 'Manage brokers, payouts, and conflict-free lead registration.'
      },
      { 
        id: 'procurement', 
        label: 'Procurement', 
        icon: Truck,
        description: 'Vendor onboarding, PO generation, and material management.'
      }
    ]
  },
  {
    title: "Administration",
    items: [
      { 
        id: 'incentives', 
        label: 'HR & Incentives', 
        icon: Wallet,
        description: 'Calculate sales commissions and performance bonuses.'
      },
      { 
        id: 'legal', 
        label: 'Legal Vault', 
        icon: Scale,
        description: 'Manage court cases, land documents, and RERA compliance.'
      },
      { 
        id: 'quality-audit', 
        label: 'Call Quality', 
        icon: AlertCircle,
        description: 'Listen to call recordings and score agent performance.'
      },
      { 
        id: 'landing-pages', 
        label: 'Page Builder', 
        icon: LayoutTemplate,
        description: 'No-code landing page creator for marketing offers.'
      },
      { 
        id: 'settings', 
        label: 'Settings', 
        icon: Settings,
        description: 'Global system configuration, users, and roles.'
      }
    ]
  },
  {
    title: "System",
    items: [
      { 
        id: 'developer-hub', 
        label: 'Developer Hub', 
        icon: Code2,
        description: 'API documentation, webhooks logs, and system health.'
      },
      { 
        id: 'archival', 
        label: 'Data Archival', 
        icon: Archive,
        description: 'Manage cold storage and data purging policies.'
      },
      { 
        id: 'super-admin', 
        label: 'Super Admin', 
        icon: Shield,
        description: 'SaaS tenant management and feature flags.'
      }
    ]
  }
];