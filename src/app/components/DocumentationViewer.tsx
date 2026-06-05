import { useState } from 'react';
import { X, ChevronDown, ChevronRight, FileText } from 'lucide-react';

interface DocumentationViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentationViewer({ isOpen, onClose }: DocumentationViewerProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const documentation = {
    "System Overview": {
      content: `AQMS (Agile Quality Management System) is a comprehensive quality assurance platform designed for agile development teams.

**Technology Stack:**
- Frontend: React 18.2.0 with TypeScript
- Styling: Tailwind CSS v4.0 with dark mode
- Design: Modern, clean UI with indigo accent color
- Icons: Lucide React icon library
- State Management: React Hooks with localStorage caching
- Backend: Supabase PostgreSQL
- Real-time Updates: Persistent data synchronization

**Key Features:**
- User Story Management with enforced quality gates
- Comprehensive Test Case Management
- Bug Tracking and Resolution
- Risk Assessment Matrix (3 visualization modes)
- Sprint Planning and Tracking
- Analytics and Reporting
- Quick Create menu for rapid item creation
- Advanced filtering (by assignee, status, priority)
- Pagination controls (10/25/50/100 items)
- Clear Filters functionality
- AI-Powered Test Recommendations
- Audit Trail and Compliance
- Team Performance Metrics

**Modern Design Elements:**
- Indigo primary color theme
- Clean, minimalist interface
- Outlined action buttons with icons
- Gradient info banners
- Smooth transitions and hover effects
- Responsive grid layouts
- Dark mode support
- Professional data visualization`
    },
    "Dashboard": {
      content: `**Dashboard Overview**

The Dashboard is your command center showing real-time quality metrics.

**Metrics Cards (5 cards):**
1. Total Stories - Count of all user stories
2. Total Bugs - Count of all defects (color-coded by severity)
3. Total Test Cases - Count of all tests
4. Test Coverage - Percentage of stories with tests (Target: 80%+)
5. Test Pass Rate - Percentage of passing tests (Target: 90%+)

**Risk Assessment Section:**
Shows modules by risk level:
- High Risk (Red) - Defect frequency ≥7 OR Business impact ≥8
- Medium Risk (Yellow) - Moderate defect frequency (4-6)
- Low Risk (Green) - Low defect frequency (<4)

**Sprint Breakdown Table:**
Shows all sprints with:
- Sprint name and goal
- Status (Planning/Active/Completed/Cancelled)
- Date range and duration
- Story completion count and percentage
- Progress bar visualization`
    },
    "Stories Management": {
      content: `**Stories Management (Criteria Validator)**

Central hub for requirement management with enforced quality gates.

**Quality Gates (BOTH required to unlock developer assignment):**
1. QA Sign-Off - QA Engineer validates testability
   - Requires complete Acceptance Criteria (min 20 chars)
   - Must follow Given/When/Then format
   - Cannot contain TODO or TBD placeholders
2. PM Approval - Product Manager approves business value
   - Requires QA Sign-Off first
   - Validates title (min 10 chars) and description (min 20 chars)

**Filters & Search:**
- Search by ID, title, or description
- Filter by Priority (Critical/High/Medium/Low)
- Filter by Sprint
- Filter by Status (All/Ready for Dev/Locked)
- Filter by Assigned Developer
- Filter by Assigned Tester
- Clear Filters button to reset all filters

**Table Columns (9 columns):**
- ID: Story identifier (e.g., "US-101")
- Title: Story summary
- Priority: Critical/High/Medium/Low badges
- Story Points: Effort estimate (Fibonacci: 1,2,3,5,8,13)
- Sprint: Assigned sprint
- QA Reviewer: Assigned QA engineer
- Developer: 🔒 Locked until both approvals
- Tester: 🔒 Locked until both approvals
- Actions: View/Edit/Delete buttons

**Create Story Form Fields:**
1. Title* (10-200 chars, required)
2. Description* (20-2000 chars, required)
3. Acceptance Criteria Checkbox* (required)
4. Acceptance Criteria Details* (Given/When/Then format)
5. Priority* (Critical/High/Medium/Low)
6. Story Points (1,2,3,5,8,13,21)
7. Sprint Assignment
8. Tags (max 10)
9. Dependencies (other story IDs)
10. Attachments (images, docs)

**Approval Workflow:**
Step 1: Create story with criteria
Step 2: QA Engineer provides QA Sign-Off
Step 3: Product Manager provides PM Approval
Step 4: Developer and Tester can now be assigned
Step 5: Story ready for sprint`
    },
    "Test Cases Management": {
      content: `**Test Cases Management**

Comprehensive test management with execution tracking.

**Filters & Search:**
- Search by test case ID or title
- Filter by Status (Pass/Fail/Blocked/Not Run)
- Filter by Test Type
- Filter by Assigned Tester
- Pagination (10/25/50/100 items per page)
- Clear Filters button to reset all filters

**Test Types (8 types):**
1. Functional - Verify feature works as designed
2. Regression - Ensure old features still work
3. Integration - Test components working together
4. Smoke - Quick sanity check of critical paths
5. Performance - Verify speed and scalability
6. Security - Find vulnerabilities
7. Usability - Ensure user-friendly experience
8. API - Test backend endpoints

**Create Test Form Fields:**
1. Title* (10-200 chars)
2. Description* (purpose and scope)
3. Test Type* (dropdown of 8 types)
4. Priority* (Critical/High/Medium/Low)
5. Preconditions (state required before test)
6. Test Steps* (numbered, min 2 steps)
7. Expected Results* (specific outcomes)
8. Link to Story
9. Assign To (QA engineer)
10. Tags
11. Estimated Duration (minutes)
12. Automation Status (Manual/Automated/Candidate/Not Feasible)
13. Test Data

**Execute Test Modal:**
- Verify preconditions checkbox
- Step-by-step execution
- For each step, mark: Pass ✅ / Fail ❌ / Blocked ⚠️ / N/A ➖
- Add execution notes
- Upload screenshots/logs
- If fail: Create bug directly
- Overall result calculated automatically`
    },
    "Bug Tracker": {
      content: `**Bug Tracker**

Complete defect management and tracking.

**Filters & Search:**
- Search by bug ID or title
- Filter by Severity (Critical/High/Medium/Low)
- Filter by Status (Open/In Progress/Fixed/Verified/Closed/Reopened)
- Filter by Assigned Developer
- Filter by Assigned Tester
- Pagination (10/25/50/100 items per page)
- Clear Filters button to reset all filters

**Bug Lifecycle (6 states):**
1. Open (Red) - Bug reported, awaiting assignment
2. In Progress (Yellow) - Developer fixing
3. Fixed (Green) - Fix complete, awaiting verification
4. Verified (Dark Green) - QA confirmed fix works
5. Closed (Gray) - Bug resolved
6. Reopened (Orange) - Bug returned after closing

**Report Bug Form Fields:**
1. Title* (10-200 chars)
2. Description* (what's wrong and impact)
3. Steps to Reproduce* (numbered, min 2 steps)
4. Expected Behavior* (what should happen)
5. Actual Behavior* (what actually happens)
6. Severity* (Critical/High/Medium/Low)
7. Priority* (Critical/High/Medium/Low)
8. Environment (Production/Staging/QA/Dev)
9. Browser/Device (multi-select)
10. Link to Story
11. Link to Test Case
12. Assign To (developer)
13. Screenshots/Recordings (highly recommended)
14. Console Errors (paste error logs)
15. Tags

**Bug Table Columns:**
- Bug ID (e.g., "BUG-001")
- Title
- Severity badge (color-coded, pulsing if critical)
- Priority badge
- Status badge (6 states)
- Linked Story
- Assigned Developer
- Reported Date
- Actions (View/Edit/Delete)`
    },
    "Risk Matrix": {
      content: `**Risk-Prioritisation Matrix**

Assess module risk and prioritize testing efforts with three visualization modes.

**Risk Calculation Formula:**
Risk Level = f(Defect Frequency, Business Impact)

Scores range 0-10:
- Defect Frequency: How often bugs occur (0-10)
- Business Impact: How critical the module is (0-10)

**Risk Categories:**
- High Risk: Defect ≥7 OR Impact ≥9 → Full Regression Testing
- Medium Risk: Defect 4-6 OR Impact 5-8 → Focused Functional Testing
- Low Risk: Defect ≤3 AND Impact ≤4 → Visual/Smoke Check

**Three Visualization Modes:**

1. SCATTER PLOT (Default - Industry Standard)
   - 2D matrix with colored dots representing modules
   - X-axis: Defect Frequency (0-10)
   - Y-axis: Business Impact (0-10)
   - Dot colors: Green (Low), Orange (Medium), Red (High)
   - Hover dots for details, click to view full module info
   - Background zones show risk areas
   - Best for: Understanding overall risk distribution

2. HEAT MAP GRID (Traditional Matrix)
   - 3×3 grid dividing modules by ranges
   - Columns: Low (0-3), Medium (4-6), High (7-10) Defect Frequency
   - Rows: Low (0-4), Medium (5-8), High (9-10) Business Impact
   - Each cell shows modules in that range
   - Color-coded cells indicate risk level
   - Click modules directly within cells
   - Best for: Seeing which modules fall into each category

3. TABLE VIEW (Detailed List)
   - Complete module data in sortable columns
   - Sort by: Risk Level, Defect Frequency, Business Impact
   - Filter by: Risk Level (All/High/Medium/Low)
   - Progress bars for metrics
   - Best for: Detailed analysis and comparison

**Module Table Columns:**
- Module ID & Name
- Description
- Defect Frequency (0-10 with progress bar)
- Business Impact (0-10 with progress bar)
- Risk Level badge (High/Medium/Low)
- Testing Protocol recommendation
- Actions (View/Edit)`
    },
    "Analytics": {
      content: `**Analytics Dashboard**

Comprehensive quality metrics and workflow diagnostics with 6 specialized views.

**Navigation Tabs:**
1. Overview
2. Sprint Analysis
3. Quality Gates
4. Bottlenecks
5. **Workflow Diagnostics** (NEW)
6. Risk Trends

---

**1. Overview Tab**

**Primary Metrics (4 cards):**
- Avg Sprint Velocity: Story points completed per sprint
- Test Pass Rate: (Passed / Total tests) × 100
- Quality Approval Rate: Stories with QA & PM sign-off
- Active Bugs: Open/In Progress bugs with Critical count

**Workflow Health Summary (3 metrics):**
- Cycle Time: Average days across all workflow stages
  - ✅ Excellent: ≤7 days | ⚠️ Moderate: 8-14 days | ❌ High: >14 days
- Flow Efficiency: (Value-add time / Total time) × 100
  - ✅ Excellent: ≥60% | ⚠️ Acceptable: 40-59% | ❌ Low: <40%
- WIP Status: Total active work in progress
  - ✅ Within limits | ❌ Violations detected

**Bottleneck Alerts:**
- Real-time detection of stages with >20% work accumulation
- Impact analysis (cycle time, throughput)
- Direct link to Workflow Diagnostics for detailed analysis

**Charts:**
- Sprint Velocity Trend: Line chart (completed vs planned)
- Defect Distribution: Pie chart by severity (Critical/High/Medium/Low)

---

**2. Sprint Analysis Tab**

**Sprint Velocity & Completion Trends:**
- Bar chart showing Planned/Completed/Bugs per sprint

**Sprint Performance Table:**
- Columns: Sprint, Stories, Planned, Completed, Velocity, Bugs, Completion %
- Visual progress bars for completion rate
- Color-coded bug counts (green <5, red ≥5)

**Predictive Insights:**
- Velocity trend analysis (↗️ improving / ↘️ declining)
- Bug pattern detection (stable vs increasing)
- Average metrics across all sprints

---

**3. Quality Gates Tab**

**Key Metrics (3 cards):**
- Approval Rate: Stories with QA & PM sign-off
- Test Coverage: Stories with test cases
- Defect Density: Stories with linked bugs

**Charts:**
- Approval Status Distribution: Pie chart (Fully Approved, QA Only, PM Only, Unapproved)
- Test Execution Status: Bar chart (Pass/Fail/Blocked/Not Run)

**Quality Gate Impact Stats:**
- Number of stories blocked by missing approvals
- Test pass rate health indicator
- Average test execution time

---

**4. Bottlenecks Tab**

**Work Distribution by Status:**
- Horizontal bar chart showing story count per status

**Identified Bottlenecks:**
- Stages with >20% work accumulation
- Percentage of total work
- Specific recommendations per bottleneck type:
  - In Testing: Review capacity, check blocked tests, prioritize high-risk modules
  - Bugs Found: Allocate developer capacity, review defect patterns, root cause analysis
  - In Development: Check blockers, review story complexity, ensure clear requirements
  - Ready for Dev: Review capacity, split large stories, check dependencies

**Historical Patterns:**
- Most common status
- Total stories in non-terminal states

---

**5. Workflow Diagnostics Tab (NEW - Comprehensive Bottleneck Analysis)**

**Key Workflow Metrics (4 cards):**
- **Avg Lead Time:** Days from story creation to completion
- **Avg Cycle Time:** Days across all workflow stages
- **Throughput:** Stories completed per sprint
- **Flow Efficiency:** Value-add time / total time percentage

**Cycle Time Breakdown by Stage:**
- Bar chart showing average days per stage (Ready for Dev, In Development, In Testing, In Review, Done)
- Color-coded by stage
- Insights:
  - Identifies longest stage (primary cycle time driver)
  - Flow efficiency assessment with recommendations
  - Targets: <40% (reduce wait times), 40-60% (acceptable), ≥60% (excellent)

**WIP (Work in Progress) Analysis:**
- Recommended WIP limit: ≤10 stories per stage
- **WIP Violations Detection:**
  - Stages exceeding limit highlighted in red
  - Impact: Increased cycle time, reduced focus, context switching
  - Action: Limit new work, focus on completing existing stories
- **Current WIP by Stage:**
  - Visual progress bars showing WIP level vs limit
  - Green (within limit) / Red (over limit) indicators

**Lead Time Distribution:**
- Area chart showing lead time spread across completed stories
- Min / Avg / Max lead time metrics
- Helps identify outliers and predictability

**Delivery Bottleneck Diagnostic Summary:**
1. **Cycle Time Analysis:**
   - Average cycle time assessment (high/moderate/excellent)
   - Primary bottleneck stage identification
2. **WIP Management:**
   - Status: Healthy flow vs congestion risk
   - Total active WIP count
3. **Flow Efficiency:**
   - Current efficiency percentage
   - Non-value-add time (waiting, handoffs, rework)
4. **Throughput:**
   - Average stories delivered per sprint
   - Lead time categorization (<2 weeks: good, 2-3 weeks: moderate, >3 weeks: high)

**Recommended Actions:**
- Implement WIP limits (if violations detected)
- Reduce wait times (if flow efficiency <40%)
- Break down large stories (if cycle time >14 days)
- Investigate delays (if lead time >21 days)
- Weekly monitoring guidance

---

**6. Risk Trends Tab**

**Risk Level Distribution:**
- Pie chart (High/Medium/Low risk modules)

**Top 5 Risky Modules:**
- Ranked by risk score (defect frequency + business impact)
- Shows: Risk level, defect frequency (/10), business impact (/10), total risk score (/20)

**Risk Analysis & Recommendations:**
- High Risk: Full regression testing, close monitoring, architectural refactoring consideration
- Medium Risk: Focused functional testing, defect pattern monitoring
- Low Risk: Visual/smoke testing, maintain standards

**Predictive Risk Indicators:**
- Count of high-risk modules
- Top risky module with score
- Test automation recommendations (defect frequency ≥7)

---

**Export Options:**
- JSON report with all metrics
- Timestamp and date range included`
    },
    "Sprints": {
      content: `**Sprint Management**

Plan and track agile sprints.

**Create Sprint:**
1. Sprint Name* (e.g., "Sprint 13")
2. Sprint Goal* (200 char objective)
3. Start Date* (cannot be past)
4. End Date* (recommended 1-4 weeks)
5. Team Capacity (story points)
6. Assign Stories (from backlog)

**Sprint Detail View:**
- Sprint info header with status
- Kanban board with 4 columns:
  - To Do
  - In Progress (WIP limit indicator)
  - In Testing
  - Done
- Drag-drop stories between columns
- Metrics panel:
  - Progress: "32/50 points (64%)"
  - Velocity: Points/day
  - Scope changes count
  - Team workload per person
  - Days remaining
  - Risk indicators

**Complete Sprint:**
- Review incomplete stories
- Options: Mark complete, Move to backlog, Move to next sprint
- Calculate final velocity
- Archive as completed

**Sprint Retrospective:**
- What went well
- What could improve
- Action items with owners
- Metrics review`
    },
    "AI Recommendations": {
      content: `**AI Test Recommendations**

Automated test gap analysis and suggestions.

**How It Works:**
AI analyzes:
1. Stories with 0 tests (critical gaps)
2. Stories with <3 tests (under-tested)
3. Missing test types (e.g., no security tests)
4. Bug patterns (frequent bugs = need tests)
5. High-risk modules (need more coverage)
6. Acceptance criteria (generates tests from criteria)

**Recommendation Card Shows:**
- Priority badge (Critical/High/Medium/Low)
- Title (e.g., "Add security tests for auth module")
- Description (why recommended)
- Affected story link
- Current coverage
- Recommended test count and types
- Estimated effort (hours)
- Impact level
- Evidence (bug count, risk score)

**Actions:**
- Create Tests (pre-fills form)
- Accept Recommendation
- Dismiss
- View Story

**Recommendation Types:**
1. Coverage Gaps - Stories with 0 tests
2. Under-Tested - Stories with <3 tests
3. Missing Test Types - Specific gaps
4. Bug Pattern Tests - Prevent recurrence
5. Acceptance Criteria Tests - Generated from criteria
6. High-Risk Module Tests - Risk score ≥7

**Filters:**
- By Priority
- By Type
- By Module
- By Story`
    },
    "Release Readiness": {
      content: `**Release Readiness Dashboard**

Production deployment checklist and quality gates.

**Overall Readiness Score (0-100%):**
- 81-100%: Green "READY TO RELEASE"
- 61-80%: Yellow "RELEASE AT RISK"
- 0-60%: Red "DO NOT RELEASE"

**Quality Gates (8 gates, all must pass):**

1. Test Coverage ≥80%
   - Pass: ≥80% (green)
   - Warning: 70-79% (yellow)
   - Fail: <70% (red)

2. Test Pass Rate ≥95%
   - Pass: ≥95%
   - Warning: 90-94%
   - Fail: <90%

3. Critical Bugs = 0
   - Pass: 0 critical bugs
   - Fail: Any critical bugs
   - BLOCKER: Cannot release with critical bugs

4. High Priority Bugs <3
   - Pass: ≤2
   - Warning: 3-5
   - Fail: >5

5. Code Review: All PRs merged
   - Pass: 0 pending
   - Warning: 1-2 pending
   - Fail: >2 pending

6. Regression Testing: 100% pass
   - Pass: 100%
   - Fail: <100%

7. Performance Testing: Meet SLAs
   - Page load <2s
   - API response <200ms
   - 1000 concurrent users

8. Security Testing: No high/critical vulnerabilities
   - Pass: 0 high/critical
   - Warning: Low/medium only
   - Fail: High or critical found

**Environment Checklist:**
☐ Development ☐ QA ☐ Staging ☐ Performance ☐ Security ☐ UAT

**Required Sign-Offs:**
- QA Lead
- Product Manager
- Development Lead
- Security Engineer

**Actions:**
- Schedule Release (date/time picker)
- Deploy Now
- Export Release Report (PDF)`
    },
    "User Management": {
      content: `**User Management**

Manage team members and permissions.

**Default Team Members:**

QA Engineers (3):
- Damilola Ogunlade (Head of QA)
- Linda Thompson
- Michael Brown
- Jennifer Lee

Developers (5):
- James Martinez
- Emily Chen
- David Kumar
- Maria Rodriguez
- Robert Taylor

Product Manager:
- Sarah Johnson

Scrum Master:
- John Smith

**Roles & Permissions:**

1. Admin - Full system access
   - Create/edit/delete all items
   - Manage users
   - Bulk operations
   - Export data
   - All permissions

2. Product Manager
   - Create/edit stories
   - Provide PM Approval (quality gate)
   - Create sprints
   - View reports
   - Export data

3. Developer
   - View assigned work
   - Fix bugs (mark as Fixed)
   - Comment on items
   - View reports

4. QA Engineer
   - Create/execute tests
   - Report bugs
   - Provide QA Sign-Off (quality gate)
   - View reports

5. Scrum Master
   - Create/manage sprints
   - View all metrics
   - Generate reports
   - Team performance

6. Viewer
   - Read-only access
   - View reports
   - Cannot create/edit

**Add User:**
1. Email* (send invitation)
2. First Name*
3. Last Name*
4. Role* (dropdown)
5. Teams (multi-select)
6. Send Welcome Email (checkbox)
7. Set as Active (checkbox)

**User Table:**
- Avatar + Name + Email
- Role badge
- Status (Active/Inactive/Pending/Locked)
- Last Login
- Current Workload
- Created Date
- Teams
- Actions (View/Edit/Deactivate/Delete)`
    },
    "Quick Create": {
      content: `**Quick Create Menu**

Rapidly create new items from anywhere in the application.

**How to Access:**
- Click the "Quick Create" button in the sidebar
- Dropdown menu appears with 4 options

**Quick Create Options:**

1. New Story
   - Opens Criteria Validator in create mode
   - Pre-fills default values
   - Immediately ready for data entry

2. New Bug
   - Opens Bug Tracker in report mode
   - Pre-fills reporter as current user
   - Ready to document defect

3. New Test Case
   - Opens Test Cases in create mode
   - Pre-fills default test type
   - Ready to define test steps

4. New Sprint
   - Opens Sprint Management in create mode
   - Pre-fills dates with recommended ranges
   - Ready to configure sprint details

**Features:**
- Modern indigo-colored button
- Closes automatically after selection
- Navigates to correct page automatically
- Opens create form immediately
- No extra clicks needed

**Design:**
- Clean dropdown interface
- Hover states for better UX
- Smooth animations
- Mobile-friendly`
    },
    "Accessing Documentation": {
      content: `**How to Access Documentation**

The documentation is always available from the top header.

**Location:**
- Click the 📖 (book) icon in the top-right header
- Located next to the keyboard shortcuts icon
- Modern, minimalist button design

**Features:**
- Modal viewer with expandable sections
- Click section headers to expand/collapse
- Organized by feature area
- Searchable content (Ctrl+F in browser)
- Dark mode support
- Easy to close (X button or Escape key)

**All Documentation Sections:**
1. System Overview
2. Dashboard
3. Stories Management
4. Test Cases Management
5. Bug Tracker
6. Risk Matrix
7. Analytics
8. Sprints
9. AI Recommendations
10. Release Readiness
11. User Management
12. Quick Create
13. Accessing Documentation
14. Keyboard Shortcuts

**Tips:**
- Expand multiple sections simultaneously
- Use browser search (Ctrl+F) to find specific terms
- Documentation updates automatically with new features`
    },
    "CSV Import & REST API": {
      content: `**CSV Import & REST API Documentation**

**CSV Import (Historical Data)**

Import historical defect records via Data Management page:

1. Navigate to Settings > Data Management
2. Scroll to "Import Historical Data (CSV)"
3. Click "Download CSV Template" for defect records
4. Fill in your data:
   - **Required:** title, severity
   - **Optional:** bug_id, status, created_date, resolved_date, linked_story, module
5. Click "Import Defect CSV"
6. Data is merged with existing bugs

**CSV Format Example:**
\`\`\`
bug_id,title,severity,status,created_date,linked_story,module
BUG-001,Login fails,Critical,Fixed,2026-01-15,US-101,Auth
BUG-002,Slow loading,Medium,Open,2026-02-01,US-103,Dashboard
\`\`\`

**REST API Endpoints**

Base URL: \`https://{projectId}.supabase.co/functions/v1/make-server-5a760dac\`

Authentication: All requests require Bearer token
\`\`\`
Authorization: Bearer {publicAnonKey}
\`\`\`

**Key Endpoints:**

Stories:
- GET /stories - List all stories
- POST /stories - Create story
- POST /stories/:id/qa-signoff - Toggle QA sign-off
- POST /stories/:id/pm-approval - Toggle PM approval

Bugs:
- GET /bugs - List all bugs
- POST /bugs - Create bug
- PUT /bugs/:id - Update bug

Analytics:
- GET /analytics/workflow-metrics - Get workflow diagnostics
- GET /analytics/quality-metrics - Get quality gate metrics

Data Import:
- POST /import/csv/defects - Import defect CSV (multipart/form-data)

**Integration Example:**
\`\`\`javascript
const response = await fetch(
  'https://PROJECT_ID.supabase.co/functions/v1/make-server-5a760dac/bugs',
  {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_ANON_KEY'
    }
  }
);
\`\`\`

**System Architecture**

**3-Tier Architecture:**
1. Presentation: React + TypeScript + Tailwind CSS
2. Application: Business logic, RBAC, Quality gates
3. Backend: Supabase (PostgreSQL + Auth + Storage)

**Core Modules:**
- Criteria Validator: QA/PM sign-off enforcement with Given/When/Then validation
- Risk Matrix: Auto-score modules (defectFrequency + businessImpact) with CSV import
- Quality Burn-Down: Sprint trajectory tracking with 4 health states (On Track, At Risk, Behind Schedule, Critical) and velocity-based deadline prediction

**Security:**
- Supabase Auth for authentication
- RBAC with 5 roles
- Row-level security
- Service role key never exposed to frontend`
    },
    "Keyboard Shortcuts": {
      content: `**Keyboard Shortcuts**

**Navigation:**
- Ctrl+1: Dashboard
- Ctrl+2: Kanban Board
- Ctrl+3: Stories
- Ctrl+4: Risk Matrix
- Ctrl+5: Burn-Down
- Ctrl+6: Test Cases
- Ctrl+7: Bugs
- Ctrl+8: Analytics
- Ctrl+9: Sprints
- Ctrl+0: Users
- Ctrl+H: Help

**Actions:**
- Ctrl+Shift+S: Create Story
- Ctrl+Shift+T: Create Test
- Ctrl+Shift+B: Create Bug
- Ctrl+Shift+P: Create Sprint
- Ctrl+Shift+D: Toggle Dark Mode
- Ctrl+B: Collapse Sidebar
- Ctrl+K: Search
- Escape: Close Modal/Dialog

**Quick Create:**
- Alt+S: Quick Create Story
- Alt+T: Quick Create Test
- Alt+B: Quick Create Bug`
    }
  };

  return (
    <>
      {/* Documentation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-indigo-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    AQMS Documentation
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Complete guide to all features
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {Object.entries(documentation).map(([title, { content }]) => (
                  <div
                    key={title}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(title)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        {expandedSections.has(title) ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                        {title}
                      </h3>
                    </button>

                    {/* Section Content */}
                    {expandedSections.has(title) && (
                      <div className="p-4 bg-white dark:bg-gray-800">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          {content.split('\n').map((line, idx) => {
                            if (line.startsWith('**') && line.endsWith('**')) {
                              return (
                                <h4 key={idx} className="font-bold text-gray-900 dark:text-white mt-4 mb-2">
                                  {line.replace(/\*\*/g, '')}
                                </h4>
                              );
                            } else if (line.startsWith('- ')) {
                              return (
                                <li key={idx} className="ml-4 text-gray-700 dark:text-gray-300">
                                  {line.substring(2)}
                                </li>
                              );
                            } else if (line.trim()) {
                              return (
                                <p key={idx} className="text-gray-700 dark:text-gray-300 mb-2">
                                  {line}
                                </p>
                              );
                            }
                            return <br key={idx} />;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
