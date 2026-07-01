export interface Story {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: boolean;
  qaSignOff: boolean;
  pmApproval: boolean;
  criteriaDetails: string;
  assignedQAReviewer?: string;
  assignedDeveloper?: string;
  assignedTester?: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  storyPoints?: number;
  sprint?: string;
  dependencies?: string[];
  comments?: any[];
  activityLog?: any[];
  createdAt: Date;
  updatedAt: Date;
  status: string;
}

export interface TestCase {
  id: string;
  title: string;
  description: string;
  type: 'Functional' | 'Regression' | 'Integration' | 'Smoke' | 'Performance';
  steps: string[];
  expectedResults: string[];
  status: 'Pass' | 'Fail' | 'Blocked' | 'Not Run';
  assignedTo?: string;
  linkedStory?: string;
  lastRun?: Date;
  executionTime?: number;
  priority: 'High' | 'Medium' | 'Low';
  moduleId?: string;
  isDraft?: boolean;
}

export interface Bug {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Fixed' | 'Verified' | 'Closed' | 'Reopened';
  linkedStory?: string;
  foundBy: string;
  assignedTo?: string;
  assignedDeveloper?: string;
  assignedTester?: string;
  createdAt: Date;
  resolvedAt?: Date;
  steps: string[];
  expectedBehavior: string;
  actualBehavior: string;
  environment?: string;
  attachments?: string[];
  comments?: any[];
}

export const defaultStories: Story[] = [
  {
    id: 'US-101',
    title: 'User Authentication - Login Flow',
    description: 'As a user, I want to securely log into the system using my email and password.',
    acceptanceCriteria: true,
    qaSignOff: true,
    pmApproval: true,
    criteriaDetails: 'Given a valid user account\nWhen I enter correct credentials\nThen I should be redirected to the dashboard\nAnd my session should be maintained',
    assignedQAReviewer: 'Damilola Ogunlade (Head of QA)',
    assignedDeveloper: 'James Martinez',
    assignedTester: 'Damilola Ogunlade',
    priority: 'Critical',
    storyPoints: 8,
    sprint: 'Sprint 12',
    dependencies: [],
    comments: [],
    activityLog: [],
    createdAt: new Date('2026-04-15'),
    updatedAt: new Date('2026-04-20'),
    status: 'Ready for Dev'
  },
  {
    id: 'US-102',
    title: 'Payment Gateway Integration',
    description: 'As a user, I want to make payments through Stripe for my purchases.',
    acceptanceCriteria: true,
    qaSignOff: false,
    pmApproval: true,
    criteriaDetails: 'Given I have items in cart\nWhen I proceed to checkout\nThen I should see Stripe payment form\nAnd payment should process securely',
    assignedQAReviewer: 'Damilola Ogunlade (Head of QA)',
    assignedDeveloper: '',
    assignedTester: '',
    priority: 'Critical',
    storyPoints: 13,
    sprint: 'Sprint 12',
    dependencies: [],
    comments: [],
    activityLog: [],
    createdAt: new Date('2026-04-16'),
    updatedAt: new Date('2026-04-22'),
    status: 'Locked'
  },
  {
    id: 'US-103',
    title: 'Dashboard Analytics Widget',
    description: 'As an admin, I want to view real-time analytics on my dashboard.',
    acceptanceCriteria: true,
    qaSignOff: true,
    pmApproval: false,
    criteriaDetails: 'Given I am logged in as admin\nWhen I access the dashboard\nThen I should see analytics widgets\nAnd data should update in real-time',
    assignedQAReviewer: 'Damilola Ogunlade (Head of QA)',
    assignedDeveloper: '',
    priority: 'High',
    storyPoints: 5,
    sprint: 'Sprint 12',
    dependencies: ['US-101'],
    comments: [],
    activityLog: [],
    createdAt: new Date('2026-04-14'),
    updatedAt: new Date('2026-04-21'),
    status: 'Locked'
  },
  {
    id: 'US-104',
    title: 'User Profile Update Feature',
    description: 'As a user, I want to update my profile information including name, email, and avatar.',
    acceptanceCriteria: false,
    qaSignOff: false,
    pmApproval: false,
    criteriaDetails: '',
    assignedQAReviewer: '',
    priority: 'Medium',
    storyPoints: 3,
    sprint: 'Sprint 13',
    dependencies: [],
    comments: [],
    activityLog: [],
    createdAt: new Date('2026-04-18'),
    updatedAt: new Date('2026-04-18'),
    status: 'Locked'
  },
  {
    id: 'US-105',
    title: 'Email Notification System',
    description: 'As a user, I want to receive email notifications for important account activities.',
    acceptanceCriteria: true,
    qaSignOff: true,
    pmApproval: true,
    criteriaDetails: 'Given an important account event occurs\nWhen the event is triggered\nThen I should receive an email notification\nAnd the email should contain relevant details',
    assignedQAReviewer: 'Damilola Ogunlade (Head of QA)',
    assignedDeveloper: 'Maria Rodriguez',
    assignedTester: 'Linda Thompson',
    priority: 'High',
    storyPoints: 8,
    sprint: 'Sprint 12',
    dependencies: [],
    comments: [],
    activityLog: [],
    createdAt: new Date('2026-04-13'),
    updatedAt: new Date('2026-04-23'),
    status: 'Ready for Dev'
  },
  {
    id: 'US-106',
    title: 'Search Functionality Enhancement',
    description: 'As a user, I want to improved search with filters and sorting options.',
    acceptanceCriteria: true,
    qaSignOff: false,
    pmApproval: false,
    criteriaDetails: 'Given I am on the search page\nWhen I enter a search query\nThen results should be filtered and sortable\nAnd search should be performant',
    assignedQAReviewer: 'Damilola Ogunlade (Head of QA)',
    assignedDeveloper: '',
    assignedTester: '',
    priority: 'Low',
    storyPoints: 2,
    sprint: 'Sprint 13',
    dependencies: [],
    comments: [],
    activityLog: [],
    createdAt: new Date('2026-04-19'),
    updatedAt: new Date('2026-04-19'),
    status: 'Locked'
  },
];

export const defaultTestCases: TestCase[] = [
  {
    id: 'TC-001',
    title: 'Login with valid credentials',
    description: 'Verify user can login with correct email and password',
    type: 'Functional',
    steps: [
      'Navigate to login page',
      'Enter valid email: test@example.com',
      'Enter valid password',
      'Click login button',
    ],
    expectedResults: [
      'Login page is displayed',
      'Email field accepts the input',
      'Password field accepts the input and masks it',
      'User is redirected to dashboard',
    ],
    status: 'Pass',
    assignedTo: 'Damilola Ogunlade',
    linkedStory: 'US-101',
    lastRun: new Date('2026-04-25'),
    executionTime: 45,
    priority: 'High',
  },
  {
    id: 'TC-002',
    title: 'Payment processing with valid card',
    description: 'Verify payment processes successfully',
    type: 'Integration',
    steps: [
      'Add items to cart',
      'Proceed to checkout',
      'Enter valid card details',
      'Submit payment',
    ],
    expectedResults: [
      'Items are added to cart successfully',
      'Checkout page loads with cart items',
      'Card details form accepts valid input',
      'Payment successful, order confirmation shown',
    ],
    status: 'Fail',
    assignedTo: 'Damilola Ogunlade',
    linkedStory: 'US-102', // Swapped link reference to point to US-102 so it matches payment gateway story
    lastRun: new Date('2026-04-24'),
    executionTime: 120,
    priority: 'High',
  },
  {
    id: 'TC-003',
    title: 'Dashboard loads within 2 seconds',
    description: 'Performance test for dashboard',
    type: 'Performance',
    steps: [
      'Login as user',
      'Measure dashboard load time',
    ],
    expectedResults: [
      'User successfully logs in',
      'Dashboard loads in under 2 seconds',
    ],
    status: 'Pass',
    assignedTo: 'Linda Thompson',
    linkedStory: 'US-101',
    lastRun: new Date('2026-04-23'),
    executionTime: 30,
    priority: 'Medium',
  },
  {
    id: 'TC-004',
    title: 'Profile update validation',
    description: 'Test profile update with invalid data',
    type: 'Functional',
    steps: [
      'Navigate to profile',
      'Enter invalid email format',
      'Click save',
    ],
    expectedResults: [
      'Profile page loads successfully',
      'Invalid email format is entered',
      'Error message shown, profile not updated',
    ],
    status: 'Not Run',
    assignedTo: 'Michael Brown',
    linkedStory: 'US-104', // Matches profile update story
    priority: 'Low',
  },
];

export const defaultBugs: Bug[] = [
  {
    id: 'BUG-001',
    title: 'Payment gateway timeout on high load',
    description: 'Payment processing fails when multiple concurrent transactions',
    severity: 'Critical',
    status: 'In Progress',
    linkedStory: 'US-102', // Points to payment gateway integration
    foundBy: 'Damilola Ogunlade',
    assignedTo: 'Emily Chen',
    assignedDeveloper: 'James Anderson',
    assignedTester: 'Emily Chen',
    createdAt: new Date('2026-04-24'),
    steps: [
      'Initiate 10+ concurrent payment transactions',
      'Wait for processing',
      'Observe timeout errors',
    ],
    expectedBehavior: 'All payments process successfully',
    actualBehavior: 'Timeout error after 30 seconds',
    environment: 'Production',
  },
  {
    id: 'BUG-002',
    title: 'Dashboard analytics widget shows incorrect data',
    description: 'Numbers do not match database query results',
    severity: 'High',
    status: 'Open',
    linkedStory: 'US-103', // Points to dashboard analytics widget
    foundBy: 'Linda Thompson',
    assignedTo: 'David Kumar',
    assignedDeveloper: 'David Martinez',
    assignedTester: 'Linda Thompson',
    createdAt: new Date('2026-04-23'),
    steps: [
      'Login to dashboard',
      'View analytics widget',
      'Compare with direct database query',
    ],
    expectedBehavior: 'Widget shows accurate data matching database',
    actualBehavior: 'Widget shows data from 24 hours ago',
    environment: 'Staging',
  },
  {
    id: 'BUG-003',
    title: 'Search results pagination broken',
    description: 'Page 2 and beyond return empty results',
    severity: 'Medium',
    status: 'Fixed',
    linkedStory: 'US-106', // Points to search functionality
    foundBy: 'Michael Brown',
    assignedTo: 'James Martinez',
    assignedDeveloper: 'Robert Taylor',
    assignedTester: 'Jessica Williams',
    createdAt: new Date('2026-04-22'),
    resolvedAt: new Date('2026-04-25'),
    steps: [
      'Search for common term',
      'Navigate to page 2',
      'Observe no results',
    ],
    expectedBehavior: 'Page 2 shows next set of results',
    actualBehavior: 'Empty results on page 2',
    environment: 'Development',
  },
];
