export const INITIAL_USER = {
  id: 'usr_101',
  name: 'Timilehin Oye',
  email: 'timioye84@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  title: 'Freelance Full-Stack Developer & Product Engineer',
  bio: 'Building modern web applications, scalable client software, and automated workflows.',
  theme: 'dark',
  notifications: true,
  createdAt: '2026-01-15'
};

export const INITIAL_PROJECTS = [
  {
    id: 'proj_1',
    name: 'Mobile Banking Redesign',
    description: 'Complete UI/UX overhaul and design system for iOS and Android mobile banking apps.',
    client: 'FinTech Corp',
    category: 'Mobile App',
    status: 'In Progress', // 'Planned' | 'In Progress' | 'In Review' | 'Completed'
    priority: 'High', // 'Low' | 'Medium' | 'High'
    deadline: '2026-08-15',
    budget: '$12,500',
    progress: 65,
    color: '#3b82f6',
    milestones: [
      { id: 'm1', title: 'UX Wireframes & User Flows', completed: true, dueDate: '2026-07-10' },
      { id: 'm2', title: 'Figma UI Component System', completed: true, dueDate: '2026-07-25' },
      { id: 'm3', title: 'Interactive Prototype Handoff', completed: false, dueDate: '2026-08-05' },
      { id: 'm4', title: 'Final QA & Client Sign-off', completed: false, dueDate: '2026-08-15' }
    ],
    notes: [
      { id: 'n1', title: 'Client Feedback Notes', content: 'Client prefers dark mode contrast on account summary cards. Ensure 4.5:1 AA contrast.', updatedAt: '2026-07-22' },
      { id: 'n2', title: 'API Integration Spec', content: 'OAuth2 endpoints provided in staging environment: https://api.staging.fintechcorp.internal', updatedAt: '2026-07-20' }
    ],
    files: [
      { id: 'f1', name: 'Design_System_v2.fig', size: '24.2 MB', uploadedAt: '2026-07-24' },
      { id: 'f2', name: 'Project_Scope_SOW.pdf', size: '1.8 MB', uploadedAt: '2026-07-02' }
    ],
    createdAt: '2026-07-01'
  },
  {
    id: 'proj_2',
    name: 'E-Commerce SaaS Dashboard',
    description: 'Analytics and inventory control dashboard for multi-channel online merchants.',
    client: 'Aura Commerce',
    category: 'Web Application',
    status: 'In Progress',
    priority: 'High',
    deadline: '2026-08-30',
    budget: '$18,000',
    progress: 40,
    color: '#8b5cf6',
    milestones: [
      { id: 'm21', title: 'Backend Schema Architecture', completed: true, dueDate: '2026-07-15' },
      { id: 'm22', title: 'Real-time Sales Chart Components', completed: false, dueDate: '2026-08-01' },
      { id: 'm23', title: 'Stripe Billing & Subscriptions', completed: false, dueDate: '2026-08-18' },
      { id: 'm24', title: 'Production Deployment', completed: false, dueDate: '2026-08-30' }
    ],
    notes: [
      { id: 'n21', title: 'Database Indexing Strategy', content: 'Index sales transactions by merchant_id and created_at to keep query latency below 50ms.', updatedAt: '2026-07-21' }
    ],
    files: [
      { id: 'f21', name: 'Architecture_Diagram.png', size: '4.5 MB', uploadedAt: '2026-07-16' }
    ],
    createdAt: '2026-07-05'
  },
  {
    id: 'proj_3',
    name: 'HealthTrack Brand Identity',
    description: 'Visual identity system, logo suite, typography rules, and marketing collateral.',
    client: 'HealthTrack Inc',
    category: 'Branding',
    status: 'In Review',
    priority: 'Medium',
    deadline: '2026-08-05',
    budget: '$6,000',
    progress: 90,
    color: '#10b981',
    milestones: [
      { id: 'm31', title: 'Brand Discovery & Moodboards', completed: true, dueDate: '2026-06-28' },
      { id: 'm32', title: 'Logo Exploration & Vector Concepts', completed: true, dueDate: '2026-07-10' },
      { id: 'm33', title: 'Brand Guidelines Manual PDF', completed: true, dueDate: '2026-07-22' },
      { id: 'm34', title: 'Final Assets Delivery', completed: false, dueDate: '2026-08-05' }
    ],
    notes: [
      { id: 'n31', title: 'Color Palette Codes', content: 'Primary Emerald: #10B981, Deep Navy: #0F172A, Accent Cyan: #06B6D4.', updatedAt: '2026-07-11' }
    ],
    files: [
      { id: 'f31', name: 'HealthTrack_Brand_Guidelines.pdf', size: '12.4 MB', uploadedAt: '2026-07-23' }
    ],
    createdAt: '2026-06-20'
  },
  {
    id: 'proj_4',
    name: 'AI Portfolio Builder',
    description: 'Internal side-project for generating responsive developer portfolios automatically.',
    client: 'Internal Project',
    category: 'Developer Tools',
    status: 'Completed',
    priority: 'Low',
    deadline: '2026-07-20',
    budget: '$0',
    progress: 100,
    color: '#f59e0b',
    milestones: [
      { id: 'm41', title: 'MVP Spec & CLI Tool', completed: true, dueDate: '2026-07-01' },
      { id: 'm42', title: 'Theme Templates (3 Layouts)', completed: true, dueDate: '2026-07-12' },
      { id: 'm43', title: 'Vercel One-Click Deploy', completed: true, dueDate: '2026-07-20' }
    ],
    notes: [
      { id: 'n41', title: 'Launch Summary', content: 'Project completed successfully. Released v1.0 on GitHub with 150+ stars.', updatedAt: '2026-07-20' }
    ],
    files: [
      { id: 'f41', name: 'v1_release_notes.md', size: '12 KB', uploadedAt: '2026-07-20' }
    ],
    createdAt: '2026-06-15'
  }
];

export const INITIAL_TASKS = [
  {
    id: 'task_1',
    title: 'Design Figma Component Library for Banking App',
    description: 'Build buttons, input forms, modal overlays, and status badges in Figma with auto-layout.',
    projectId: 'proj_1',
    status: 'In Progress', // 'Todo' | 'In Progress' | 'In Review' | 'Done'
    priority: 'High', // 'Low' | 'Medium' | 'High'
    dueDate: '2026-08-01',
    assignee: 'Timilehin Oye',
    estimatedHours: 16,
    loggedHours: 11,
    createdAt: '2026-07-15'
  },
  {
    id: 'task_2',
    title: 'Setup JWT & Role Auth Middleware',
    description: 'Implement JWT refresh token rotation and role-based route guard middleware in Node/Express.',
    projectId: 'proj_2',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-08-03',
    assignee: 'Timilehin Oye',
    estimatedHours: 8,
    loggedHours: 5,
    createdAt: '2026-07-18'
  },
  {
    id: 'task_3',
    title: 'Export Vector Assets & Brand Guidelines PDF',
    description: 'Compile high-res PNG, SVG, and EPS logo files alongside 24-page brand style guide PDF.',
    projectId: 'proj_3',
    status: 'Done',
    priority: 'Medium',
    dueDate: '2026-07-25',
    assignee: 'Timilehin Oye',
    estimatedHours: 12,
    loggedHours: 12,
    createdAt: '2026-07-10'
  },
  {
    id: 'task_4',
    title: 'Configure CI/CD Deployment Pipeline',
    description: 'Set up GitHub Actions to test, build, and deploy preview builds to staging container.',
    projectId: 'proj_2',
    status: 'Todo',
    priority: 'Medium',
    dueDate: '2026-08-10',
    assignee: 'Timilehin Oye',
    estimatedHours: 6,
    loggedHours: 0,
    createdAt: '2026-07-20'
  },
  {
    id: 'task_5',
    title: 'User Testing & Feedback Analysis',
    description: 'Conduct 5 moderated usability testing sessions with prototype link and document friction points.',
    projectId: 'proj_1',
    status: 'Todo',
    priority: 'Low',
    dueDate: '2026-08-12',
    assignee: 'Timilehin Oye',
    estimatedHours: 10,
    loggedHours: 0,
    createdAt: '2026-07-21'
  },
  {
    id: 'task_6',
    title: 'Refactor Database Schema for Milestones',
    description: 'Add foreign key relations and cascade deletes for milestone items in PostgreSQL.',
    projectId: 'proj_4',
    status: 'Done',
    priority: 'Low',
    dueDate: '2026-07-18',
    assignee: 'Timilehin Oye',
    estimatedHours: 4,
    loggedHours: 4,
    createdAt: '2026-07-08'
  }
];

export const INITIAL_ACTIVITIES = [
  { id: 'act_1', user: 'Timilehin Oye', action: 'completed milestone', target: 'Brand Guidelines Manual PDF', time: '2 hours ago', icon: 'CheckCircle' },
  { id: 'act_2', user: 'Timilehin Oye', action: 'updated status of', target: 'Design Figma Component Library', time: '5 hours ago', icon: 'Clock' },
  { id: 'act_3', user: 'Timilehin Oye', action: 'added note to', target: 'Mobile Banking Redesign', time: '1 day ago', icon: 'FileText' },
  { id: 'act_4', user: 'Timilehin Oye', action: 'created project', target: 'E-Commerce SaaS Dashboard', time: '3 days ago', icon: 'FolderPlus' },
];
