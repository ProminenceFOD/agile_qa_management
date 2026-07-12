# AQMS - Agile Quality Management System

## Comprehensive User Documentation

**Version:** 1.0  
**Last Updated:** May 7, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Navigation & Interface](#navigation--interface)
5. [Core Features](#core-features)
6. [Detailed Feature Documentation](#detailed-feature-documentation)
7. [AI-Powered Features](#ai-powered-features)
8. [Data Management](#data-management)
9. [Workflows & Best Practices](#workflows--best-practices)
10. [Keyboard Shortcuts](#keyboard-shortcuts)
11. [Troubleshooting](#troubleshooting)

---

## Overview

AQMS (Agile Quality Management System) is a comprehensive quality assurance and project management platform designed for agile teams. It provides end-to-end test management, bug tracking, sprint planning, and quality analytics.

### Key Capabilities

- **Story Management** - Define, track, and validate user stories with acceptance criteria
- **Test Management** - Create, execute, and track test cases
- **Bug Tracking** - Report, assign, and resolve defects
- **Risk Assessment** - Identify and manage high-risk modules
- **Sprint Planning** - Plan and track sprint progress
- **Analytics & Reporting** - Comprehensive quality metrics and dashboards
- **AI Recommendations** - Automated test recommendations based on project analysis
- **Traceability** - Link stories, tests, and bugs for complete visibility

---

## Getting Started

### Login

1. Navigate to the AQMS login page
2. Enter your email and password
3. Check "Remember Me" to stay logged in for 7 days
4. Click "Login"

**Demo Accounts:**

- QA Engineer: `qa@aqms.com` / `password123`
- Product Manager: `pm@aqms.com` / `password123`
- Scrum Master: `sm@aqms.com` / `password123`

### First-Time Setup

After logging in, you'll see the Dashboard which provides an overview of:

- Total stories, bugs, and test cases
- Test coverage statistics
- Risk assessment summary
- Recent activity
- Sprint breakdown

---

## User Roles & Permissions

### QA Engineer

**Permissions:**

- Create, edit, and execute test cases
- Report and track bugs
- Sign off on story quality (QA Sign-Off)
- View all quality metrics
- Access AI test recommendations

**Key Responsibilities:**

- Ensure acceptance criteria are testable
- Execute test plans
- Validate bug fixes
- Maintain test coverage

### Product Manager

**Permissions:**

- Create and edit user stories
- Approve stories (PM Approval)
- View quality metrics
- Prioritize backlog
- Review sprint readiness

**Key Responsibilities:**

- Define acceptance criteria
- Approve stories for development
- Review test coverage
- Validate features meet requirements

### Scrum Master

**Permissions:**

- Create and manage sprints
- View team performance metrics
- Access all dashboards
- Manage team assignments

**Key Responsibilities:**

- Facilitate sprint planning
- Track velocity and burndown
- Remove blockers
- Monitor team capacity

---

## Navigation & Interface

### Sidebar Navigation

The left sidebar provides access to all AQMS features. Click the **« / »** button in the top-right of the sidebar to collapse/expand for more screen space.

**Sections:**

- **Overview** - Dashboard, Kanban Board
- **Quality Management** - Stories, Test Cases, Bugs, Risk Matrix, Burn-Down
- **Analytics & Reports** - Analytics, Reports, Test History, Team Performance
- **Planning & Workflow** - Sprints, Traceability, Release Readiness, AI Recommendations
- **Administration** - Audit Trail, Bulk Operations, Data Management, Users

### Quick Features

- **Search Pages** - Use the search box at the top of the sidebar
- **Quick Create** - Click the "Quick Create" button for fast story/bug/test creation
- **Favorites** - Star pages for quick access (click star icon on menu items)
- **Recent Pages** - Last 3 visited pages appear at the top

### Header

- **Page Title** - Shows current active page
- **Theme Toggle** - Switch between light/dark mode (Ctrl+Shift+D)
- **User Menu** - Access profile and logout

---

## Core Features

### 1. Dashboard

**Purpose:** High-level overview of project health and quality metrics

**What You See:**

- **Quality Metrics Cards:**
  - Total Stories: All user stories in the system
  - Total Bugs: All reported defects
  - Total Test Cases: All test cases created
  - Test Coverage: Percentage of stories with linked tests
  - Test Pass Rate: Percentage of tests passing

- **Risk Assessment Summary:**
  - High Risk Modules: Critical areas requiring attention
  - Medium Risk Modules: Moderate concern areas
  - Low Risk Modules: Stable areas

- **Sprint Breakdown Table:**
  - Sprint name and goal
  - Status (Planning, Active, Completed, Cancelled)
  - Duration and dates
  - Total stories and completion percentage
  - Actions: View sprint details

**How to Use:**

- Review daily for project health overview
- Click on any metric card to drill down
- Monitor test coverage to ensure quality standards
- Track sprint progress

---

### 2. Kanban Board

**Purpose:** Visual workflow management for stories, bugs, and tasks

**Columns:**

- **Backlog** - Items not yet started
- **In Progress** - Active work
- **In Testing** - Items under QA review
- **Done** - Completed items

**Features:**

- **Drag & Drop** - Move cards between columns to update status
- **Card Details:**
  - ID and title
  - Priority badge (Critical, High, Medium, Low)
  - Assignee initials
  - Story points
  - Linked bugs/tests indicators

**Buttons & Actions:**

- **View All** - See all items in a column
- **Create New** - Add story, bug, or task
- **Card Click** - Open detailed view

**Filters:**

- Filter by type: Stories, Bugs, All
- Search by title or ID

---

### 3. Stories (Criteria Validator)

**Purpose:** Manage user stories and acceptance criteria

#### Story List View

**Columns:**

- ID - Story identifier
- Title - Story name
- Priority - Critical/High/Medium/Low
- Story Points - Effort estimate
- Sprint - Associated sprint
- QA Reviewer - Assigned QA engineer
- Developer - Assigned developer
- Tester - Assigned tester
- Actions - View, Edit, Delete

**Filters:**

- Search by title or ID
- Filter by priority
- Filter by sprint
- Filter by status (Ready/Locked)

**Items Per Page Dropdown:**

- Choose 10, 25, 50, or 100 stories per page
- Located at top-left above the table

**Status Indicators:**

- **Green Row** - Story is ready for development (has QA sign-off and PM approval)
- **Red Row** - Story is locked/not ready (missing sign-offs)
- **🔒 Lock Icon** - Developer/Tester fields are locked until story is approved

#### Story Detail View

Click "View" on any story to see:

**Header Section:**

- Story ID and title
- Priority badge
- Status indicators (✅ Acceptance Criteria, QA Sign-Off, PM Approval)

**Acceptance Criteria:**

- Full criteria details
- Given/When/Then format

**Buttons:**

- **QA Sign-Off** (QA Engineers only) - Approve story quality
- **PM Approval** (Product Managers only) - Approve story for development
- **Edit** - Modify story details
- **Back** - Return to list view

**Assignments Section:**

- **QA Reviewer** - Assign QA engineer
- **Developer** - Assign developer (unlocked after approvals)
- **Tester** - Assign tester (unlocked after approvals)
- Click "Assign" or "Change" to select from dropdown

**Additional Information:**

- Story points
- Sprint
- Tags
- Dependencies
- Created/Updated dates

**Linked Items:**

- **Linked Bugs:**
  - Click bug ID to navigate to bug details
  - Click "+ Link Bug" to associate existing bugs
  - Click "Unlink" to remove association

- **Linked Test Cases:**
  - Click test case ID to navigate to test details
  - Shows test status (Pass/Fail/Blocked/Not Run)
  - Click "+ Link Test" to associate test cases
  - Click "Unlink" to remove association

**Comments & Activity:**

- Add comments for collaboration
- View activity log of all changes

#### Create/Edit Story

**Required Fields:**

- Title
- Description
- Acceptance Criteria (checkbox)

**Optional Fields:**

- Priority (default: Medium)
- Story Points
- Sprint
- Tags
- Dependencies

**Buttons:**

- **Save** - Create or update story
- **Cancel** - Discard changes

---

### 4. Test Cases

**Purpose:** Create, manage, and execute test cases

#### Test Cases List View

**Statistics Cards:**

- Total Tests
- Pass (green)
- Fail (red)
- Blocked (orange)
- Not Run (gray)
- Pass Rate percentage

**Table Columns:**

- Test ID
- Title
- Type (Functional, Regression, Integration, Smoke, Performance)
- Priority (High, Medium, Low)
- Status (Pass, Fail, Blocked, Not Run)
- Assigned - Tester initials
- Story - Linked story ID
- Last Run - Date of last execution
- Actions - Run, View, Edit

**Filters:**

- Search by title or ID
- Filter by status
- Filter by type
- Items per page: 10, 25, 50, 100

**Action Buttons:**

- **Run** (Green) - Execute test case
- **View** (Blue) - See test details
- **Edit** (Gray) - Modify test case

#### Create Test Case

**Button:** Green "Create Test Case" button at top-right

**Required Fields:**

- Title
- Description
- Type (Functional, Regression, etc.)
- Test Steps (add multiple steps)
- Expected Results (for each step)

**Optional Fields:**

- Priority
- Linked Story
- Assigned To

#### Execute Test Case

Click "Run" to execute a test:

**Execution Screen:**

- Test case details
- Step-by-step execution
- For each step:
  - Mark as Pass/Fail/Blocked
  - Add notes
- Overall result selection
- **Complete** - Finish execution
- **Report Bug** - Create bug if test fails
- **Cancel** - Stop without saving

#### Test Case Details

Click "View" to see:

- Full test case information
- Execution history
- Linked story
- Assigned tester
- All test steps and expected results

---

### 5. Bugs (Bug Tracker)

**Purpose:** Report, track, and resolve defects

#### Bug List View

**Statistics Cards:**

- Total Bugs
- Open
- In Progress
- Fixed
- Critical Severity count
- Average Resolution Time

**Table Columns:**

- Bug ID
- Title
- Severity (Critical, High, Medium, Low)
- Status (Open, In Progress, Fixed, Verified, Closed, Reopened)
- Story - Linked story ID
- Assignee - Developer/Tester
- Age - Days since reported
- Actions - View, Edit

**Filters:**

- Search by title or ID
- Filter by severity
- Filter by status
- Filter by linked story
- Items per page: 10, 25, 50, 100

**Color Coding:**

- Red badge - Critical
- Orange badge - High
- Yellow badge - Medium
- Blue badge - Low

#### Report Bug

**Button:** Green "Report Bug" button at top-right

**Required Fields:**

- Title
- Description
- Severity
- Steps to Reproduce (multiple steps)
- Expected Behavior
- Actual Behavior

**Optional Fields:**

- Linked Story
- Environment (browser, OS, etc.)
- Assignee
- Attachments

**Auto-Fill from Test:**
When reporting from a failed test execution, pre-fills:

- Test case information
- Execution notes
- Linked story

#### Bug Detail View

Click "View" to see:

- Bug ID and title
- Severity and status badges
- Full description
- Reproduction steps
- Expected vs Actual behavior
- Environment details
- Assignee information
- Resolution details (if fixed)
- Created/Resolved dates
- Comments and activity log

**Actions:**

- **Edit** - Update bug details
- **Change Status** - Move through workflow
- **Assign** - Assign to developer/tester
- **Link to Story** - Associate with user story

---

### 6. Risk Matrix

**Purpose:** Identify and assess module risk levels

#### Matrix View (Default)

**Visual Scatter Plot:**

- X-axis: Defect Frequency (0-10)
- Y-axis: Business Impact (0-10)
- Each dot represents a module

**Risk Quadrants:**

- Top-Right (Red): High Risk - High defects + High impact
- Top-Left (Yellow): Medium Risk - Low defects + High impact
- Bottom-Right (Orange): Medium Risk - High defects + Low impact
- Bottom-Left (Green): Low Risk - Low defects + Low impact

**Hover over dots to see:**

- Module name
- Risk level
- Testing protocol

**Click dot to view module details**

#### Table View

Click "List View" button to switch to table format

**Columns:**

- Module ID
- Module Name
- Description
- Defect Frequency (with bar chart)
- Business Impact (with bar chart)
- Risk Level (badge)
- Testing Protocol
- Actions - View, Edit

**Testing Protocols:**

- **Full Regression** - High risk modules
- **Focused Functional** - Medium risk
- **Visual/Smoke Check** - Low risk

**Filters:**

- Sort by: Risk, Defect Frequency, Business Impact
- Filter by risk level

#### Create/Edit Module

**Button:** "+ Add Module" button at top-right

**Required Fields:**

- Module Name
- Description
- Defect Frequency (0-10 scale)
- Business Impact (0-10 scale)

**Auto-Calculated:**

- Risk Level (based on frequency + impact)
- Testing Protocol (based on risk level)

**Buttons:**

- **Save** - Create or update module
- **Cancel** - Discard changes

---

### 7. Burn-Down Chart

**Purpose:** Track quality progress over time

**Chart Display:**

- X-axis: Time (sprint days or dates)
- Y-axis: Work remaining
- Blue line: Ideal burn-down
- Red line: Actual progress

**Quality States:**

- **Not Ready** - Missing acceptance criteria, sign-offs
- **Ready** - Approved and ready for dev
- **In Development** - Being worked on
- **In Testing** - Under QA review
- **Done** - Completed

**Story Table:**
Shows all stories with:

- Story ID and title
- Current quality state (color-coded badge)
- Actions to move states

**How It Works:**

- Stories move through quality states
- Chart shows reduction in "not ready" items
- Goal: All stories reach "Done" state by sprint end

---

### 8. Analytics Dashboard

**Purpose:** Comprehensive quality metrics and trends

**Available Charts:**

1. **Test Execution Trends**
   - Line chart showing Pass/Fail/Blocked over time
   - Daily or sprint-based views

2. **Bug Severity Distribution**
   - Pie chart of Critical/High/Medium/Low bugs
   - Click slices to filter

3. **Test Coverage by Module**
   - Bar chart showing coverage percentage per module
   - Identify gaps

4. **Defect Density**
   - Shows bugs per module
   - Helps prioritize testing

5. **Sprint Performance Metrics Table**
   - Planned vs actual velocity
   - Test pass rate per sprint
   - Bug discovery rate
   - Completion percentage

**Date Range Filters:**

- Last 7 days
- Last 30 days
- Last 90 days
- Custom range

**Export Options:**

- Download as CSV
- Download as PDF
- Print report

---

### 9. Sprints Management

**Purpose:** Plan and track sprint execution

#### Sprint List View

**Columns:**

- Sprint name
- Goal/description
- Status (Planning, Active, Completed, Cancelled)
- Duration (start and end dates)
- Total stories
- Completed stories
- Completion percentage
- Actions - View, Edit, Delete

**Sprint Status Colors:**

- Blue - Planning
- Green - Active
- Gray - Completed
- Red - Cancelled

#### Create Sprint

**Button:** "+ Create Sprint" at top-right

**Required Fields:**

- Sprint Name (e.g., "Sprint 12")
- Sprint Goal
- Start Date
- End Date

**Optional Fields:**

- Team capacity
- Story assignments

#### Sprint Detail View

Click "View" on a sprint to see:

**Summary:**

- Sprint goal
- Dates and duration
- Status
- Velocity metrics

**Stories in Sprint:**

- All assigned stories
- Status of each story
- Story points
- Progress indicators

**Burndown Chart:**

- Daily progress tracking
- Ideal vs actual lines

**Actions:**

- **Start Sprint** - Activate sprint
- **Complete Sprint** - Mark as done
- **Add Stories** - Assign stories to sprint
- **Edit** - Modify sprint details

---

### 10. Test Execution History

**Purpose:** View past test executions and results

**Table Columns:**

- Execution Date/Time
- Test Case ID and Title
- Executed By (tester name)
- Result (Pass/Fail/Blocked)
- Duration (execution time in minutes)
- Notes/Comments
- Linked Bug (if test failed)

**Filters:**

- Date range
- Test case
- Executed by
- Result status

**Features:**

- See complete execution history
- Track test stability over time
- Identify flaky tests
- Review execution notes

**Click on execution to see:**

- Full test case details
- Step-by-step results
- Screenshots/attachments
- Related bugs

---

### 11. Traceability Matrix

**Purpose:** Map relationships between requirements, tests, and bugs

**Matrix View:**
Rows = User Stories
Columns = Test Cases
Cells = Linked (✓) or Not Linked (-)

**Features:**

- **Quick Linking** - Click cell to link/unlink
- **Coverage View** - See which stories lack tests
- **Gap Analysis** - Identify untested requirements

**Filters:**

- Filter by sprint
- Filter by priority
- Show only gaps

**Color Coding:**

- Green row - Full coverage (all tests linked)
- Yellow row - Partial coverage
- Red row - No coverage

**Export:**

- Download complete traceability report
- Includes all linkages and gaps

---

### 12. Release Readiness

**Purpose:** Assess readiness for production release

**Readiness Checks:**

1. **Story Completion**
   - % of stories in "Done" state
   - Outstanding stories
   - Blocked stories

2. **Test Coverage**
   - % of stories with tests
   - Coverage by priority
   - Gap analysis

3. **Test Execution**
   - % tests executed
   - Pass rate
   - Critical test status

4. **Bug Status**
   - Open critical bugs
   - Open high bugs
   - Unresolved blockers

5. **Sign-Offs**
   - QA sign-off completion
   - PM approval status
   - Stakeholder approvals

**Overall Readiness Score:**

- 0-60%: Not Ready (Red)
- 61-85%: At Risk (Yellow)
- 86-100%: Ready (Green)

**Blockers Section:**
Lists all items preventing release:

- Critical bugs
- Missing test coverage
- Pending approvals
- Failed tests

**Actions:**

- **Generate Report** - Create release report
- **Export** - Download as PDF
- **Mark Ready** - Approve for release

---

### 13. Team Performance

**Purpose:** Track individual and team metrics

**Individual Metrics:**

- Tests executed
- Bugs found
- Stories completed
- Average quality score

**Team Metrics:**

- Total velocity
- Test coverage trend
- Bug discovery rate
- Resolution time

**Quality Metrics Comparison Table:**
Shows for each team member:

- Tests created
- Tests executed
- Bugs reported
- Test pass rate
- Average defect age

**Productivity Metrics Table:**

- Stories completed
- Story points delivered
- Average cycle time
- Throughput

**Filters:**

- Date range
- Team member
- Sprint

**Charts:**

- Velocity trend
- Quality score over time
- Workload distribution

---

### 14. AI Test Recommendations

**Purpose:** Get automated test suggestions based on project analysis

#### How It Works

The AI analyzes your project data every time you open the page:

- **Stories** without test cases
- **Modules** with high risk or defect frequency
- **Bugs** indicating test gaps
- **Test coverage** patterns

#### Recommendation Types

1. **Coverage Gap**
   - **What:** Stories without any linked test cases
   - **Priority:** High (if story in "In Testing") or Medium
   - **Why:** Untested features pose quality risks
   - **Suggested Tests:** 3-4 specific test cases

2. **Risk-Based Testing**
   - **What:** High-risk modules need regression tests
   - **Priority:** Critical
   - **Why:** High defect frequency + high business impact
   - **Suggested Tests:** Comprehensive regression suite

3. **Bug Pattern Analysis**
   - **What:** Stories with 2+ bugs indicate test gaps
   - **Priority:** Critical (if bugs are critical) or High
   - **Why:** Pattern suggests insufficient testing
   - **Suggested Tests:** Negative tests, edge cases, exploratory tests

4. **Regression Testing**
   - **What:** Recently resolved bugs need regression tests
   - **Priority:** High
   - **Why:** Prevent bug regression
   - **Suggested Tests:** Bug reproduction tests

5. **New Feature Testing**
   - **What:** Stories in "Ready for Dev" or "In Testing"
   - **Priority:** High
   - **Why:** New features need immediate test coverage
   - **Suggested Tests:** Feature-specific test cases

6. **Smoke Testing**
   - **What:** Critical modules (business impact ≥ 8/10)
   - **Priority:** High
   - **Why:** Fast validation of critical paths
   - **Suggested Tests:** Basic health checks

#### Recommendation Card

Each recommendation shows:

- **Recommendation ID** (e.g., REC-001)
- **Priority Badge** (Critical/High/Medium/Low)
- **Type Badge** (Coverage Gap, Risk-Based, etc.)
- **🤖 AI Generated** badge
- **Linked Story/Module** (clickable to navigate)
- **Reason** - Why this recommendation exists
- **Suggested Test Cases** - 3-4 specific tests to create
- **Estimated Effort** - Time to complete (e.g., "2-4 hours")

#### Actions

**Create Test Cases Button:**

- Automatically creates test cases from all suggested tests
- Sets appropriate type (Functional, Regression, Integration)
- Links to the associated story
- Creates as "Draft" status
- Shows success toast with count

**View Details Button:**

- Expands to show:
  - Recommendation ID
  - Auto-generated status
  - Linked story/module IDs
  - Number of test cases to create
- Click again to collapse

**Dismiss Button:**

- Removes recommendation from current view
- Toast confirmation shown
- Recommendation returns after page refresh

#### Filters

**Priority Filter:**

- All Priorities
- Critical only
- High only
- Medium only
- Low only

**Type Filter:**

- All Types
- Coverage Gaps
- Risk-Based
- Regression
- New Features
- Bug Patterns

**Auto-Generated Only Checkbox:**

- When checked: Shows only AI-generated recommendations
- When unchecked: Shows all (currently all are AI-generated)

**Result Count:**
Shows "Showing X of Y recommendations"

#### Best Practices

- Review recommendations daily
- Prioritize Critical and High recommendations
- Click linked stories/modules to understand context
- Create test cases in batches
- Dismiss only after addressing the recommendation

---

### 15. Audit Trail

**Purpose:** Track all system changes for compliance and debugging

**Log Entries Show:**

- Timestamp (date and time)
- User who made the change
- Action type (Create, Update, Delete, Execute, etc.)
- Entity affected (Story, Bug, Test Case, etc.)
- Entity ID
- Change details
- IP address (optional)

**Filters:**

- Date range
- User
- Action type
- Entity type
- Search by entity ID

**Use Cases:**

- Track who changed what and when
- Compliance auditing
- Debug data issues
- Review user activity

**Export:**

- Download audit log as CSV
- Includes all filtered entries

---

### 16. Bulk Operations

**Purpose:** Perform actions on multiple items simultaneously

**Supported Operations:**

1. **Bulk Status Update**
   - Select multiple stories/bugs/tests
   - Change status for all at once

2. **Bulk Assignment**
   - Assign multiple items to same person
   - Reassign work quickly

3. **Bulk Link**
   - Link multiple tests to a story
   - Link multiple bugs to a story

4. **Bulk Delete**
   - Delete multiple items (with confirmation)
   - Clean up test data

5. **Bulk Tag**
   - Add tags to multiple items
   - Organize by category

6. **Bulk Export**
   - Export selected items to CSV/Excel
   - Create custom reports

**How to Use:**

1. Select item type (Stories, Bugs, or Tests)
2. Use checkboxes to select items
3. Choose operation from dropdown
4. Configure operation parameters
5. Click "Execute" to perform
6. Review confirmation and results

**Safety Features:**

- Confirmation dialog for destructive operations
- Preview changes before applying
- Undo option (where supported)
- Audit trail of all bulk operations

---

### 17. Data Management

**Purpose:** Import, export, and manage system data

**Features:**

1. **Import Data**
   - Upload CSV files
   - Supported: Stories, Bugs, Test Cases
   - Template download available
   - Validation before import
   - Error report for failed rows

2. **Export Data**
   - Download all data as CSV/Excel
   - Select entities to export
   - Include relationships
   - Schedule recurring exports

3. **Backup/Restore**
   - Create full system backup
   - Restore from backup file
   - Point-in-time recovery

4. **Data Cleanup**
   - Delete old/archived data
   - Remove orphaned records
   - Optimize database

**Import Process:**

1. Download template
2. Fill in data
3. Upload file
4. Review validation results
5. Confirm import
6. Review import log

**Export Process:**

1. Select entities
2. Choose format (CSV/Excel/JSON)
3. Apply filters (optional)
4. Download file

---

### 18. User Management

**Purpose:** Manage team members and permissions

#### Users Tab

**Table Columns:**

- User name and email
- Role (QA Engineer, Product Manager, Scrum Master)
- Title/Position
- Authority level (Can sign off QA/PM)
- Status (Active/Inactive)
- Join Date
- Actions - Edit, Deactivate

**Add User:**

1. Click "+ Invite User"
2. Enter email
3. Select role
4. Set permissions
5. Send invitation

**Edit User:**

- Update role
- Change permissions
- Modify authority levels
- Deactivate account

#### Invitations Tab

**Pending Invitations:**

- Email address
- Role
- Sent by
- Status (Pending/Accepted/Expired)
- Sent date
- Actions - Resend, Revoke

**Invitation Process:**

1. User receives email
2. Clicks invitation link
3. Sets password
4. Account activated

---

### 19. Reports

**Purpose:** Generate custom quality reports

**Available Reports:**

1. **Test Coverage Report**
   - Coverage by story
   - Coverage by module
   - Coverage by priority
   - Gap analysis

2. **Bug Report**
   - Open bugs by severity
   - Resolution time analysis
   - Bug trends
   - Top bug producers/fixers

3. **Sprint Report**
   - Velocity tracking
   - Burndown analysis
   - Completion rate
   - Quality metrics

4. **Quality Summary**
   - Overall quality score
   - Test pass rate
   - Bug density
   - Risk assessment

5. **Custom Report Builder**
   - Select metrics
   - Choose date range
   - Apply filters
   - Save templates

**Report Features:**

- Interactive charts
- Drill-down capability
- Export to PDF/Excel
- Schedule email delivery
- Share with stakeholders

---

## AI-Powered Features

### AI Test Recommendations

**Technology:** Pattern recognition and risk analysis algorithms

**Data Sources:**

- Story status and metadata
- Test case coverage
- Bug history and patterns
- Module risk scores
- Sprint progress

**Analysis Process:**

1. **Coverage Analysis**
   - Identifies stories without tests
   - Calculates coverage gaps by priority

2. **Risk Assessment**
   - Analyzes module defect frequency
   - Weighs business impact
   - Recommends regression testing

3. **Pattern Detection**
   - Finds stories with multiple bugs
   - Identifies testing weaknesses
   - Suggests targeted tests

4. **Regression Planning**
   - Tracks resolved bugs
   - Recommends regression tests
   - Prevents bug recurrence

5. **Feature Analysis**
   - Monitors new features
   - Suggests appropriate test types
   - Estimates effort

6. **Critical Path Testing**
   - Identifies critical modules
   - Recommends smoke tests
   - Ensures rapid validation

**Recommendation Quality:**

- Updates in real-time as data changes
- Learns from your test patterns
- Prioritizes based on risk
- Provides specific, actionable suggestions

---

## Data Management

### Data Storage

**Backend:** Supabase (PostgreSQL database)
**Local Caching:** Browser localStorage for performance
**Session Management:** Cookie-based with 7-day expiry

### Key-Value Store

**Table:** `kv_store_5a760dac`
**Structure:**

- Key: Unique identifier (e.g., "aqms_stories")
- Value: JSON data
- Updated: Timestamp

**Stored Data:**

- `aqms_stories` - User stories
- `aqms_bugs` - Bug reports
- `aqms_test_cases` - Test cases
- `aqms_modules` - Risk modules
- `aqms_users` - User accounts
- `aqms_sprints` - Sprint data

### Data Synchronization

**How It Works:**

1. Browser loads data from Supabase on page load
2. Local cache stores copy for fast access
3. Changes saved to both cache and Supabase
4. Cache expires after timeout or page refresh
5. Multi-user updates sync via polling (2-second interval)

**Offline Mode:**

- Reads from cache when server unavailable
- Shows toast warning: "Cannot reach server"
- Writes queued until connection restored

**Session Persistence:**

- Login state cached for 7 days
- Session validated on each page load
- Expired sessions redirect to login

### Data Backup

**Automatic:**

- Supabase performs daily backups
- Point-in-time recovery available

**Manual:**

- Export all data via Data Management page
- Download as CSV/JSON
- Store backups externally

---

## Workflows & Best Practices

### Story Development Workflow

1. **Product Manager Creates Story**
   - Write clear title and description
   - Define acceptance criteria
   - Set priority and story points
   - Add to sprint (optional)

2. **QA Engineer Reviews**
   - Verify acceptance criteria are testable
   - Request clarifications if needed
   - Provide QA Sign-Off when satisfied

3. **Product Manager Approves**
   - Review finalized story
   - Provide PM Approval
   - Story unlocks for development

4. **Assignments Made**
   - Assign developer
   - Assign tester
   - Set due dates

5. **Development**
   - Developer implements feature
   - Updates story status
   - Links commits/PRs

6. **Testing**
   - Tester executes test cases
   - Reports bugs if found
   - Validates acceptance criteria

7. **Completion**
   - All tests pass
   - No open bugs
   - Story marked "Done"

### Test Case Creation Workflow

1. **Review Story**
   - Read acceptance criteria
   - Understand requirements
   - Identify test scenarios

2. **Create Test Case**
   - Write descriptive title
   - Select appropriate type
   - Define clear steps
   - Specify expected results
   - Link to story

3. **Review Test Case**
   - Peer review for completeness
   - Validate against criteria
   - Ensure reproducibility

4. **Execute Test**
   - Follow steps exactly
   - Record actual results
   - Note any deviations
   - Report bugs if needed

5. **Maintain Tests**
   - Update when requirements change
   - Retire obsolete tests
   - Refactor for clarity

### Bug Reporting Workflow

1. **Discover Bug**
   - During test execution or ad-hoc testing
   - Document immediately

2. **Report Bug**
   - Clear, specific title
   - Detailed description
   - Exact reproduction steps
   - Expected vs actual behavior
   - Environment details
   - Screenshots/logs

3. **Triage**
   - Assign severity
   - Link to story
   - Assign to developer
   - Set priority

4. **Development**
   - Developer reproduces
   - Fixes issue
   - Updates status to "Fixed"
   - Links commit

5. **Verification**
   - Tester re-executes test
   - Confirms fix
   - Marks "Verified"

6. **Closure**
   - Final review
   - Mark "Closed"
   - Document in release notes

### Sprint Planning Workflow

1. **Pre-Planning**
   - Review backlog
   - Groom stories
   - Estimate story points

2. **Sprint Creation**
   - Create sprint
   - Set goal and dates
   - Set team capacity

3. **Story Selection**
   - Choose high-priority stories
   - Ensure total points ≤ capacity
   - Verify all stories approved

4. **Test Planning**
   - Review AI test recommendations
   - Create necessary test cases
   - Assign testers

5. **Sprint Execution**
   - Daily standup
   - Update progress
   - Monitor burndown

6. **Sprint Closure**
   - Complete remaining tests
   - Verify all done items
   - Generate sprint report
   - Hold retrospective

---

## Keyboard Shortcuts

**Navigation:**

- `Ctrl + 1` - Dashboard
- `Ctrl + 2` - Kanban Board
- `Ctrl + 3` - Stories
- `Ctrl + 4` - Risk Matrix
- `Ctrl + 5` - Burn-Down Chart
- `Ctrl + 6` - Test Cases
- `Ctrl + 7` - Bugs
- `Ctrl + 8` - Analytics
- `Ctrl + 9` - Sprints
- `Ctrl + 0` - Users

**Additional Pages:**

- `Ctrl + O` - Reports
- `Ctrl + U` - Test History
- `Ctrl + M` - Team Performance
- `Ctrl + G` - Traceability Matrix
- `Ctrl + K` - Release Readiness
- `Ctrl + I` - AI Recommendations
- `Ctrl + A` - Audit Trail
- `Ctrl + B` - Bulk Operations
- `Ctrl + E` - Data Management

**System:**

- `Ctrl + Shift + D` - Toggle Dark Mode
- `Ctrl + /` - Show Keyboard Shortcuts

**Tips:**

- Shortcuts work from any page
- Combine with sidebar collapse for maximum efficiency
- All shortcuts shown in tooltip on hover

---

## Troubleshooting

### Login Issues

**Problem:** Can't log in
**Solutions:**

1. Verify email and password are correct
2. Check Caps Lock is off
3. Clear browser cache and cookies
4. Try different browser
5. Contact admin for password reset

**Problem:** Session expires too quickly
**Solutions:**

1. Check "Remember Me" on login
2. Verify cookies are enabled
3. Check browser privacy settings
4. Session lasts 7 days with Remember Me

### Data Not Loading

**Problem:** Tables show "No data" or loading spinner
**Solutions:**

1. Refresh page
2. Check internet connection
3. Check browser console for errors
4. Clear localStorage and reload
5. Try different browser

**Problem:** Changes not saving
**Solutions:**

1. Check internet connection
2. Wait for "Saved" toast notification
3. Verify permissions for that action
4. Check browser console for errors
5. Try again or refresh page

### Performance Issues

**Problem:** Page is slow
**Solutions:**

1. Collapse sidebar for more space
2. Reduce items per page (use 10 or 25)
3. Apply filters to reduce data
4. Clear browser cache
5. Close unused browser tabs
6. Check internet speed

**Problem:** Table scrolling is laggy
**Solutions:**

1. Reduce items per page
2. Apply filters to show less data
3. Update browser to latest version
4. Disable browser extensions
5. Try different browser

### Feature Issues

**Problem:** Can't sign off story (QA/PM)
**Solutions:**

1. Verify you have correct role
2. Check story has acceptance criteria
3. Refresh page
4. Contact admin if role is incorrect

**Problem:** Can't assign developer/tester to story
**Solutions:**

1. Story must have QA sign-off and PM approval first
2. Verify story status is "Ready"
3. Unlock happens after both approvals

**Problem:** Test recommendations not showing
**Solutions:**

1. Ensure you have stories and test cases
2. Create some stories without tests
3. Add modules with risk scores
4. Recommendations generate automatically on page load

**Problem:** Action buttons not visible in tables
**Solutions:**

1. Scroll table horizontally (horizontal scrollbar appears if needed)
2. Expand browser window
3. Collapse sidebar for more space
4. Reduce browser zoom (Ctrl + 0)

### Browser Compatibility

**Supported Browsers:**

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Not Supported:**

- Internet Explorer (any version)
- Browsers with JavaScript disabled
- Very old browser versions

**Mobile Support:**

- Responsive design works on tablets
- Some features limited on phones
- Recommend desktop for full experience

---

## Tips & Tricks

### Productivity Tips

1. **Use Favorites**
   - Star frequently used pages
   - Appears at top of sidebar
   - Quick access to main workflow

2. **Collapse Sidebar**
   - Click « button for more screen space
   - Great for wide tables
   - Sidebar still accessible

3. **Keyboard Shortcuts**
   - Learn top 5 pages you use
   - Navigate without mouse
   - Much faster than clicking

4. **Quick Create**
   - Use Quick Create button in sidebar
   - Faster than navigating to page
   - Creates story, bug, test, or sprint

5. **Search Pages**
   - Use search box in sidebar
   - Find page quickly
   - Filters as you type

### Quality Best Practices

1. **Write Testable Criteria**
   - Use Given/When/Then format
   - Be specific and measurable
   - Avoid ambiguous language

2. **Link Everything**
   - Link tests to stories
   - Link bugs to stories
   - Link bugs to tests
   - Enables traceability

3. **Prioritize Critical Tests**
   - High-risk modules get regression tests
   - Critical bugs get priority
   - Focus on business impact

4. **Review AI Recommendations Daily**
   - Catches coverage gaps early
   - Prevents last-minute test creation
   - Improves overall quality

5. **Use Risk Matrix**
   - Identify high-risk modules
   - Allocate testing resources
   - Focus on what matters most

### Team Collaboration

1. **Add Comments**
   - Use story/bug comments for discussion
   - Document decisions
   - @mention team members

2. **Update Status Regularly**
   - Keep Kanban board current
   - Update test execution results
   - Change bug status as work progresses

3. **Review Team Performance**
   - Check Team Performance page weekly
   - Identify bottlenecks
   - Balance workload

4. **Use Sprints**
   - Plan in sprints even if not scrum
   - Provides structure
   - Enables velocity tracking

5. **Regular Reports**
   - Generate sprint reports
   - Share with stakeholders
   - Track quality trends

---

## Glossary

**Acceptance Criteria** - Specific conditions that must be met for a story to be considered complete

**Burn-Down Chart** - Graph showing work remaining over time

**Coverage** - Percentage of requirements/code that have tests

**Defect Density** - Number of bugs per module or per line of code

**KPI** - Key Performance Indicator, measurable value showing effectiveness

**QA Sign-Off** - QA engineer approval that acceptance criteria are testable

**PM Approval** - Product manager approval that story is ready for development

**Regression Test** - Test to ensure previously working functionality still works

**Risk Level** - Assessment of potential impact and likelihood of issues

**Severity** - Degree of impact a bug has on the system

**Smoke Test** - Basic test to verify critical functionality works

**Sprint** - Fixed time period (usually 2 weeks) for completing work

**Story Points** - Relative measure of effort/complexity

**Traceability** - Ability to link requirements to tests to bugs

**Velocity** - Amount of work completed in a sprint

---

## Support & Contact

**Documentation:** This file (AQMS_Documentation.md)

**In-App Help:** Click "?" icon or press Ctrl+/ for keyboard shortcuts

**Report Issues:** Use feedback form in app or contact admin

**Feature Requests:** Submit via in-app feedback or to product team

**Training:** Contact admin for team training sessions

**Version:** 1.0 (May 2026)

---

_This documentation covers all features as of version 1.0. Some features may be added or changed in future versions._
