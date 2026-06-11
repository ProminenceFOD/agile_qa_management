import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { StoryView } from './StoryView';
import { BugView } from './BugView';
import { NotificationModal } from './NotificationModal';
import { TestCaseView } from './TestCaseView';
import { TestCaseForm } from './TestCaseForm';
import { TestCaseExecute } from './TestCaseExecute';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { getData, setData } from '../utils/supabaseStorage';

type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
type StoryStatus = 'Backlog' | 'Ready for Dev' | 'In Development' | 'In Testing' | 'Bugs Found' | 'Done';
type BugStatus = 'Open' | 'In Progress' | 'Fixed' | 'Verified' | 'Closed';

interface Story {
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
  priority: Priority;
  storyPoints?: number;
  sprint?: string;
  dependencies?: string[];
  comments?: any[];
  activityLog?: any[];
  createdAt: Date;
  updatedAt: Date;
  status: StoryStatus;
  linkedBugs?: string[];
  tags?: string[];
}

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: Date | string;
  edited?: boolean;
}

interface Bug {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: BugStatus;
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
  tags?: string[];
  comments?: Comment[];
}

const ItemTypes = {
  CARD: 'card',
};

interface DraggableCardProps {
  item: Story | Bug;
  onView: (item: Story | Bug) => void;
  linkedTestCases?: { id: string; title: string; status: string }[];
  onAssignDeveloper?: (itemId: string, developer: string) => void;
  onAssignTester?: (itemId: string, tester: string) => void;
  onTestCaseClick?: (testCaseId: string) => void;
}

function DraggableCard({ item, onView, linkedTestCases = [], onAssignDeveloper, onAssignTester, onTestCaseClick }: DraggableCardProps) {
  const [showDeveloperDropdown, setShowDeveloperDropdown] = useState(false);
  const [showTesterDropdown, setShowTesterDropdown] = useState(false);
  const [showTestCases, setShowTestCases] = useState(false);
  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: () => {
      return { id: item.id, item };
    },
    canDrag: true,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [item]);

  const isStory = (item: Story | Bug): item is Story => {
    return 'storyPoints' in item;
  };

  const story = isStory(item) ? item : null;
  const bug = !isStory(item) ? item : null;

  const developers = ['James Martinez', 'David Martinez', 'Emily Chen', 'Maria Rodriguez', 'Robert Taylor'];
  const testers = ['Linda Thompson', 'Emily Chen', 'Jessica Williams', 'Michael Brown'];

  // Calculate quality/health status
  const getQualityStatus = () => {
    if (!story) return null;

    const hasBlockingBugs = story.linkedBugs && story.linkedBugs.length > 0;
    const failedTests = linkedTestCases.filter(tc => tc.status === 'Fail').length;
    const blockedTests = linkedTestCases.filter(tc => tc.status === 'Blocked').length;
    const totalTests = linkedTestCases.length;
    const passedTests = linkedTestCases.filter(tc => tc.status === 'Pass').length;
    const noTests = totalTests === 0 && (story.status === 'In Testing' || story.status === 'Bugs Found');

    if (hasBlockingBugs) {
      return {
        type: 'critical',
        label: '🐛 Bugs Found',
        color: 'bg-red-500',
        textColor: 'text-white',
        count: story.linkedBugs.length
      };
    }

    if (blockedTests > 0) {
      return {
        type: 'blocked',
        label: '⚠️ Testing Blocked',
        color: 'bg-orange-500',
        textColor: 'text-white',
        count: blockedTests
      };
    }

    if (failedTests > 0) {
      return {
        type: 'failed',
        label: '❌ Tests Failing',
        color: 'bg-yellow-500',
        textColor: 'text-white',
        count: failedTests
      };
    }

    if (noTests) {
      return {
        type: 'no-coverage',
        label: '⚡ No Test Coverage',
        color: 'bg-purple-500',
        textColor: 'text-white',
        count: 0
      };
    }

    if (totalTests > 0 && passedTests === totalTests) {
      return {
        type: 'healthy',
        label: '✅ All Tests Passing',
        color: 'bg-green-500',
        textColor: 'text-white',
        count: totalTests
      };
    }

    return null;
  };

  const qualityStatus = getQualityStatus();

  const getPriorityColor = (priority: Priority | 'Critical' | 'High' | 'Medium' | 'Low') => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getTestStatusColor = (status: string) => {
    switch (status) {
      case 'Pass':
        return 'bg-green-100 text-green-800';
      case 'Fail':
        return 'bg-red-100 text-red-800';
      case 'Blocked':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div
      ref={drag}
      onClick={(e) => {
        // Only open on click if not dragging and not clicking interactive elements
        if (!isDragging && !(e.target as HTMLElement).closest('button, select, input, a')) {
          onView(item);
        }
      }}
      style={{ opacity: isDragging ? 0.5 : 1, cursor: isDragging ? 'grabbing' : 'grab' }}
      className={`group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all select-none relative border-2 cursor-pointer
        ${qualityStatus ? `border-l-4 ${qualityStatus.color.replace('bg-', 'border-')} border-t-gray-200 border-r-gray-200 border-b-gray-200` : 'border-gray-200 hover:border-indigo-300'}
      `}
    >
      {/* Quality Status Banner */}
      {qualityStatus && (
        <div className={`${qualityStatus.color} ${qualityStatus.textColor} px-2 py-1 text-[10px] font-semibold flex items-center justify-between`}>
          <span className="truncate">{qualityStatus.label}</span>
          {qualityStatus.count > 0 && (
            <span className="bg-white bg-opacity-30 px-1.5 py-0.5 rounded-full text-[9px] font-bold ml-1">
              {qualityStatus.count}
            </span>
          )}
        </div>
      )}

      <div className="p-3">
        {/* Drag Handle */}
        <div className="absolute top-1 right-1 text-gray-300 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
          ⋮⋮
        </div>

        <div className="flex items-start justify-between mb-1.5 gap-2">
          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{item.id}</span>
        {story && (
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded shrink-0">{story.storyPoints}pts</span>
        )}
        {bug && (
          <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-bold shrink-0">
            BUG
          </span>
        )}
      </div>

      <h4 className="text-xs font-semibold text-gray-900 mb-1.5 line-clamp-2 leading-tight">{item.title}</h4>

      <div className="flex flex-wrap gap-1 mb-2">
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${getPriorityColor(
            story ? story.priority : bug!.severity
          )}`}
        >
          {story ? story.priority : bug!.severity}
        </span>
        {item.tags && item.tags.length > 0 && (
          <>
            {item.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 2 && (
              <span className="text-[10px] text-gray-500">+{item.tags.length - 2}</span>
            )}
          </>
        )}
      </div>

      {story && story.linkedBugs && story.linkedBugs.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-600 mb-1">
            🐛 Linked Bugs ({story.linkedBugs.length})
          </div>
          <div className="flex flex-wrap gap-1">
            {story.linkedBugs.map(bugId => (
              <span
                key={bugId}
                className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs"
              >
                {bugId}
              </span>
            ))}
          </div>
        </div>
      )}

      {bug && bug.linkedStory && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-600 mb-1">📋 Linked Story</div>
          <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs">
            {bug.linkedStory}
          </span>
        </div>
      )}

      {linkedTestCases.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTestCases(!showTestCases);
            }}
            className="w-full text-left text-xs text-gray-600 mb-1 font-medium hover:text-indigo-600 transition-colors flex items-center justify-between"
          >
            <span>🧪 Test Cases ({linkedTestCases.length})</span>
            <span className="text-gray-400">{showTestCases ? '▼' : '▶'}</span>
          </button>
          {showTestCases && (
            <div className="space-y-1 mt-2">
              {linkedTestCases.map(tc => (
                <div
                  key={tc.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onTestCaseClick) {
                      onTestCaseClick(tc.id);
                    }
                  }}
                  className="flex items-center justify-between text-xs p-2 rounded hover:bg-indigo-50 cursor-pointer border border-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-700 truncate">{tc.title}</div>
                    <div className="text-gray-500 text-[10px]">{tc.id}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs ml-2 flex-shrink-0 ${getTestStatusColor(tc.status)}`}>
                    {tc.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {story && (
        <div className="mt-2 pt-2 border-t border-gray-200 space-y-2">
          {/* Developer Assignment */}
          <div className="relative">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">👨‍💻 Developer:</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeveloperDropdown(!showDeveloperDropdown);
                  setShowTesterDropdown(false);
                }}
                className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 transition-colors max-w-[120px] truncate"
              >
                {story.assignedDeveloper || 'Assign'}
              </button>
            </div>
            {showDeveloperDropdown && (
              <div className="absolute right-0 top-6 z-10 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto w-48">
                {developers.map(dev => (
                  <div
                    key={dev}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAssignDeveloper?.(item.id, dev);
                      setShowDeveloperDropdown(false);
                    }}
                    className="px-3 py-2 hover:bg-indigo-100 cursor-pointer text-xs text-gray-900"
                  >
                    {dev}
                  </div>
                ))}
                {story.assignedDeveloper && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onAssignDeveloper?.(item.id, '');
                      setShowDeveloperDropdown(false);
                    }}
                    className="px-3 py-2 hover:bg-red-100 cursor-pointer text-xs text-red-600 border-t"
                  >
                    Unassign
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tester Assignment */}
          <div className="relative">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">🧪 Tester:</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTesterDropdown(!showTesterDropdown);
                  setShowDeveloperDropdown(false);
                }}
                className="px-2 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition-colors max-w-[120px] truncate"
              >
                {story.assignedTester || 'Assign'}
              </button>
            </div>
            {showTesterDropdown && (
              <div className="absolute right-0 top-6 z-10 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto w-48">
                {testers.map(tester => (
                  <div
                    key={tester}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAssignTester?.(item.id, tester);
                      setShowTesterDropdown(false);
                    }}
                    className="px-3 py-2 hover:bg-purple-100 cursor-pointer text-xs text-gray-900"
                  >
                    {tester}
                  </div>
                ))}
                {story.assignedTester && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onAssignTester?.(item.id, '');
                      setShowTesterDropdown(false);
                    }}
                    className="px-3 py-2 hover:bg-red-100 cursor-pointer text-xs text-red-600 border-t"
                  >
                    Unassign
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {bug && (
        <div className="mt-2 pt-2 border-t border-gray-200 space-y-2">
          {/* Developer Assignment for Bug */}
          <div className="relative">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">👨‍💻 Developer:</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeveloperDropdown(!showDeveloperDropdown);
                  setShowTesterDropdown(false);
                }}
                className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 transition-colors max-w-[120px] truncate"
              >
                {bug.assignedDeveloper || bug.assignedTo || 'Assign'}
              </button>
            </div>
            {showDeveloperDropdown && (
              <div className="absolute right-0 top-6 z-10 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto w-48">
                {developers.map(dev => (
                  <div
                    key={dev}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAssignDeveloper?.(item.id, dev);
                      setShowDeveloperDropdown(false);
                    }}
                    className="px-3 py-2 hover:bg-indigo-100 cursor-pointer text-xs text-gray-900"
                  >
                    {dev}
                  </div>
                ))}
                {(bug.assignedDeveloper || bug.assignedTo) && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onAssignDeveloper?.(item.id, '');
                      setShowDeveloperDropdown(false);
                    }}
                    className="px-3 py-2 hover:bg-red-100 cursor-pointer text-xs text-red-600 border-t"
                  >
                    Unassign
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tester Assignment for Bug */}
          <div className="relative">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">🧪 Tester:</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTesterDropdown(!showTesterDropdown);
                  setShowDeveloperDropdown(false);
                }}
                className="px-2 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition-colors max-w-[120px] truncate"
              >
                {bug.assignedTester || 'Assign'}
              </button>
            </div>
            {showTesterDropdown && (
              <div className="absolute right-0 top-6 z-10 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto w-48">
                {testers.map(tester => (
                  <div
                    key={tester}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAssignTester?.(item.id, tester);
                      setShowTesterDropdown(false);
                    }}
                    className="px-3 py-2 hover:bg-purple-100 cursor-pointer text-xs text-gray-900"
                  >
                    {tester}
                  </div>
                ))}
                {bug.assignedTester && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onAssignTester?.(item.id, '');
                      setShowTesterDropdown(false);
                    }}
                    className="px-3 py-2 hover:bg-red-100 cursor-pointer text-xs text-red-600 border-t"
                  >
                    Unassign
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

interface DroppableColumnProps {
  columnName: StoryStatus | BugStatus;
  color: string;
  items: (Story | Bug)[];
  onDrop: (item: Story | Bug, newStatus: string) => void;
  onView: (item: Story | Bug) => void;
  testCasesByStory: Record<string, { id: string; title: string; status: string }[]>;
  onAssignDeveloper?: (itemId: string, developer: string) => void;
  onAssignTester?: (itemId: string, tester: string) => void;
  onTestCaseClick?: (testCaseId: string) => void;
}

function DroppableColumn({ columnName, color, items, onDrop, onView, testCasesByStory, onAssignDeveloper, onAssignTester, onTestCaseClick }: DroppableColumnProps) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (draggedItem: { id: string; item: Story | Bug }) => {
      onDrop(draggedItem.item, columnName);
    },
    canDrop: () => true,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [columnName, onDrop]);

  return (
    <div ref={drop} className="flex-1 min-w-[280px] max-w-[400px]">
      <div className={`h-full flex flex-col transition-all ${
          isOver && canDrop ? 'scale-[1.02]' : ''
        }`}>
        {/* Sticky Column Header */}
        <div className={`rounded-t-lg border-2 ${color} p-3 bg-white sticky top-0 z-20 shadow-sm`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">{columnName}</h3>
            <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-bold text-gray-600">
              {items.length}
            </span>
          </div>
        </div>

        {/* Scrollable Column Body */}
        <div
        className={`rounded-b-lg border-l-2 border-r-2 border-b-2 ${color} p-3 flex-1 overflow-y-auto bg-gray-50 transition-all ${
          isOver && canDrop ? 'ring-4 ring-indigo-400 bg-indigo-50' : ''
        } ${canDrop && !isOver ? 'ring-2 ring-gray-300' : ''}`}
        style={{ maxHeight: 'calc(100vh - 350px)', minHeight: '500px' }}
      >

        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm flex flex-col items-center gap-2">
              <div className="text-3xl opacity-30">📋</div>
              <div>No items</div>
            </div>
          ) : (
            items.map(item => {
              const isStoryItem = 'storyPoints' in item;
              const linkedTestCases = isStoryItem ? (testCasesByStory[item.id] || []) : [];
              return (
                <DraggableCard
                  key={item.id}
                  item={item}
                  onView={onView}
                  linkedTestCases={linkedTestCases}
                  onAssignDeveloper={onAssignDeveloper}
                  onAssignTester={onAssignTester}
                  onTestCaseClick={onTestCaseClick}
                />
              );
            })
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<'all' | 'stories' | 'bugs'>('all');
  const [filterDeveloper, setFilterDeveloper] = useState<string>('');
  const [filterTester, setFilterTester] = useState<string>('');
  const [filterTag, setFilterTag] = useState<string>('');
  const [viewMode, setViewMode] = useState<'board' | 'storyView' | 'bugView'>('board');
  const [selectedItem, setSelectedItem] = useState<Story | Bug | null>(null);
  const [testCasesByStory, setTestCasesByStory] = useState<Record<string, { id: string; title: string; status: string }[]>>({});
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState<'story' | 'bug' | 'test' | null>(null);
  const [editingItem, setEditingItem] = useState<Story | Bug | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showNewSprintInput, setShowNewSprintInput] = useState(false);
  const [newSprintName, setNewSprintName] = useState('');
  const [showNewStoryFromBug, setShowNewStoryFromBug] = useState(false);
  const [notification, setNotification] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });
  const [selectedTestCase, setSelectedTestCase] = useState<any | null>(null);
  const [editingTestCase, setEditingTestCase] = useState<any | null>(null);
  const [executingTestCase, setExecutingTestCase] = useState<any | null>(null);

  // Default stories (Supabase will load actual data if available)
  const getInitialStories = (): Story[] => {
    return [
    {
      id: 'US-101',
      title: 'User Authentication - Login Flow',
      description: 'As a user, I want to securely log into the system using my email and password.',
      acceptanceCriteria: true,
      qaSignOff: true,
      pmApproval: true,
      criteriaDetails: 'Given a valid user account\nWhen I enter correct credentials\nThen I should be redirected to the dashboard',
      assignedQAReviewer: 'Damilola Ogunlade (Head of QA)',
      assignedDeveloper: 'James Martinez',
      assignedTester: 'Linda Thompson',
      priority: 'Critical',
      storyPoints: 8,
      sprint: 'Sprint 12',
      dependencies: [],
      comments: [],
      activityLog: [],
      createdAt: new Date('2026-04-15'),
      updatedAt: new Date('2026-04-20'),
      status: 'Done',
      linkedBugs: [],
      tags: ['authentication', 'security'],
    },
    {
      id: 'US-102',
      title: 'Payment Gateway Integration',
      description: 'As a user, I want to make payments through Stripe for my purchases.',
      acceptanceCriteria: true,
      qaSignOff: true,
      pmApproval: true,
      criteriaDetails: 'Given I have items in cart\nWhen I proceed to checkout\nThen I should see Stripe payment form',
      assignedQAReviewer: 'Damilola Ogunlade (Head of QA)',
      assignedDeveloper: 'Emily Chen',
      assignedTester: 'Linda Thompson',
      priority: 'Critical',
      storyPoints: 13,
      sprint: 'Sprint 12',
      dependencies: [],
      comments: [],
      activityLog: [],
      createdAt: new Date('2026-04-16'),
      updatedAt: new Date('2026-04-22'),
      status: 'Bugs Found',
      linkedBugs: ['BUG-002', 'BUG-004'],
      tags: ['payment', 'stripe', 'backend'],
    },
    {
      id: 'US-103',
      title: 'Dashboard Analytics Widget',
      description: 'As an admin, I want to view real-time analytics on my dashboard.',
      acceptanceCriteria: true,
      qaSignOff: true,
      pmApproval: true,
      criteriaDetails: 'Given I am logged in as admin\nWhen I access the dashboard\nThen I should see analytics widgets',
      assignedQAReviewer: 'Damilola Ogunlade (Head of QA)',
      assignedDeveloper: 'David Kumar',
      assignedTester: 'Michael Brown',
      priority: 'High',
      storyPoints: 5,
      sprint: 'Sprint 12',
      dependencies: ['US-101'],
      comments: [],
      activityLog: [],
      createdAt: new Date('2026-04-14'),
      updatedAt: new Date('2026-04-21'),
      status: 'In Testing',
      linkedBugs: [],
    },
    {
      id: 'US-104',
      title: 'User Profile Update Feature',
      description: 'As a user, I want to update my profile information.',
      acceptanceCriteria: true,
      qaSignOff: true,
      pmApproval: true,
      criteriaDetails: 'Given I am on my profile page\nWhen I update my information\nThen changes should be saved',
      assignedQAReviewer: 'Damilola Ogunlade (Head of QA)',
      assignedDeveloper: 'Maria Rodriguez',
      assignedTester: 'Linda Thompson',
      priority: 'Medium',
      storyPoints: 3,
      sprint: 'Sprint 13',
      dependencies: [],
      comments: [],
      activityLog: [],
      createdAt: new Date('2026-04-18'),
      updatedAt: new Date('2026-04-18'),
      status: 'In Development',
      linkedBugs: [],
    },
    {
      id: 'US-105',
      title: 'Email Notification System',
      description: 'As a user, I want to receive email notifications.',
      acceptanceCriteria: true,
      qaSignOff: true,
      pmApproval: true,
      criteriaDetails: 'Given an important event occurs\nWhen triggered\nThen I receive an email notification',
      assignedQAReviewer: 'Damilola Ogunlade (Head of QA)',
      assignedDeveloper: 'James Martinez',
      assignedTester: 'Emily Chen',
      priority: 'High',
      storyPoints: 8,
      sprint: 'Sprint 12',
      dependencies: [],
      comments: [],
      activityLog: [],
      createdAt: new Date('2026-04-13'),
      updatedAt: new Date('2026-04-23'),
      status: 'Done',
      linkedBugs: [],
    },
    {
      id: 'US-106',
      title: 'Search Functionality Enhancement',
      description: 'As a user, I want improved search with filters.',
      acceptanceCriteria: true,
      qaSignOff: true,
      pmApproval: true,
      criteriaDetails: 'Given I am on search page\nWhen I enter query\nThen results are filtered',
      assignedQAReviewer: 'Damilola Ogunlade (Head of QA)',
      priority: 'Low',
      storyPoints: 2,
      sprint: 'Sprint 13',
      dependencies: [],
      comments: [],
      activityLog: [],
      createdAt: new Date('2026-04-19'),
      updatedAt: new Date('2026-04-19'),
      status: 'Ready for Dev',
      linkedBugs: [],
    },
    {
      id: 'US-107',
      title: 'Two-Factor Authentication',
      description: 'As a user, I want 2FA for enhanced security.',
      acceptanceCriteria: false,
      qaSignOff: false,
      pmApproval: false,
      criteriaDetails: '',
      priority: 'Critical',
      storyPoints: 13,
      sprint: 'Backlog',
      dependencies: [],
      comments: [],
      activityLog: [],
      createdAt: new Date('2026-04-20'),
      updatedAt: new Date('2026-04-20'),
      status: 'Backlog',
      linkedBugs: [],
    },
  ];
  };

  const getInitialBugs = (): Bug[] => {
    // Default bugs (Supabase will load actual data if available)
    return [
    {
      id: 'BUG-001',
      title: 'Login page rendering issue on mobile',
      description: 'Login page UI is broken on mobile devices',
      severity: 'High',
      status: 'Closed',
      linkedStory: 'US-101',
      foundBy: 'Damilola Ogunlade',
      assignedTo: 'James Martinez',
      createdAt: new Date('2026-04-18'),
      resolvedAt: new Date('2026-04-20'),
      steps: ['Open app on mobile device', 'Navigate to login', 'Observe broken UI'],
      expectedBehavior: 'Login page should render correctly',
      actualBehavior: 'UI elements overlap and are unreadable',
      environment: 'Production - Mobile Safari',
    },
    {
      id: 'BUG-002',
      title: 'Payment fails with special characters',
      description: 'Payment processing fails when user input contains special characters',
      severity: 'Critical',
      status: 'In Progress',
      linkedStory: 'US-102',
      foundBy: 'Linda Thompson',
      assignedTo: 'Emily Chen',
      createdAt: new Date('2026-04-24'),
      steps: ['Enter card with name containing special chars', 'Submit payment', 'Observe failure'],
      expectedBehavior: 'Payment processes successfully',
      actualBehavior: 'Payment fails with validation error',
      environment: 'Production',
      tags: ['critical', 'payment', 'validation'],
    },
    {
      id: 'BUG-003',
      title: 'Dashboard chart not loading data',
      description: 'Analytics chart shows loading spinner indefinitely',
      severity: 'Medium',
      status: 'Verified',
      linkedStory: 'US-103',
      foundBy: 'Michael Brown',
      assignedTo: 'David Kumar',
      createdAt: new Date('2026-04-23'),
      resolvedAt: new Date('2026-04-25'),
      steps: ['Login to dashboard', 'Navigate to analytics', 'Wait for chart'],
      expectedBehavior: 'Chart displays data',
      actualBehavior: 'Infinite loading spinner',
      environment: 'Staging',
    },
    {
      id: 'BUG-004',
      title: 'Stripe webhook timeout',
      description: 'Webhook handler times out on payment completion',
      severity: 'Critical',
      status: 'Open',
      linkedStory: 'US-102',
      foundBy: 'Emily Chen',
      assignedTo: 'Emily Chen',
      createdAt: new Date('2026-04-25'),
      steps: ['Complete payment', 'Trigger webhook', 'Observe timeout'],
      expectedBehavior: 'Webhook processes within 5 seconds',
      actualBehavior: 'Webhook times out after 30 seconds',
      environment: 'Production',
    },
    {
      id: 'BUG-005',
      title: 'Email template formatting broken',
      description: 'Email notifications have broken HTML formatting',
      severity: 'Low',
      status: 'Fixed',
      linkedStory: 'US-105',
      foundBy: 'Damilola Ogunlade',
      assignedTo: 'James Martinez',
      createdAt: new Date('2026-04-22'),
      resolvedAt: new Date('2026-04-24'),
      steps: ['Trigger email notification', 'Check inbox', 'View email'],
      expectedBehavior: 'Email renders properly formatted',
      actualBehavior: 'Email shows raw HTML tags',
      environment: 'Production',
    },
  ];
  };

  // Use Supabase for persistent storage (shares data with CriteriaValidator)
  const { data: stories, setData: setStories, loading: storiesLoading } = useSupabaseData<Story[]>('aqms_stories', getInitialStories());
  const { data: bugs, setData: setBugs, loading: bugsLoading } = useSupabaseData<Bug[]>('aqms_bugs', getInitialBugs());

  // Fix corrupted data ONCE by checking and updating if needed
  useEffect(() => {
    const needsFix = stories.some(s => !s.status);
    if (needsFix) {
      const fixed = stories.map(s => ({
        ...s,
        status: s.status || 'Backlog' as StoryStatus,
      }));
      setStories(fixed);
    }
  }, []);

  useEffect(() => {
    const needsFix = bugs.some(b => !b.status);
    if (needsFix) {
      const fixed = bugs.map(b => ({
        ...b,
        status: b.status || 'Open' as BugStatus,
      }));
      setBugs(fixed);
    }
  }, []);


  // Show loading state immediately if data isn't ready
  if (storiesLoading || bugsLoading || !stories || !bugs) {
    return (
      <div className="w-full h-full p-4 md:p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-green-500 mb-4"></div>
          <p className="text-gray-600">Loading board data from database...</p>
        </div>
      </div>
    );
  }

  // Load test cases from Supabase
  useEffect(() => {
    const loadTestCases = async () => {
      const testCases = await getData('aqms_test_cases');
      if (testCases) {
        const mapping: Record<string, { id: string; title: string; status: string }[]> = {};

        testCases.forEach((tc: any) => {
          if (tc.linkedStory) {
            if (!mapping[tc.linkedStory]) {
              mapping[tc.linkedStory] = [];
            }
            mapping[tc.linkedStory].push({
              id: tc.id,
              title: tc.title,
              status: tc.status,
            });
          }
        });

        setTestCasesByStory(mapping);
      }
    };
    loadTestCases();
  }, []);

  // Apply assignment and tag filters
  const filterByAssignment = (item: Story | Bug) => {
    let match = true;
    if (filterDeveloper) {
      const itemDev = 'assignedDeveloper' in item ? item.assignedDeveloper : ('assignedTo' in item ? item.assignedTo : undefined);
      match = match && itemDev === filterDeveloper;
    }
    if (filterTester) {
      const itemTester = 'assignedTester' in item ? item.assignedTester : undefined;
      match = match && itemTester === filterTester;
    }
    if (filterTag) {
      match = match && (item.tags?.includes(filterTag) || false);
    }
    return match;
  };

  // Filter to show only approved stories (QA sign-off + PM approval)
  const isApprovedStory = (item: Story | Bug): boolean => {
    if ('storyPoints' in item) {
      // This is a story - check approval status
      return item.qaSignOff === true && item.pmApproval === true;
    }
    // This is a bug - always show bugs
    return true;
  };

  const columns: { name: StoryStatus | BugStatus; color: string; items: (Story | Bug)[] }[] = [
    {
      name: 'Backlog',
      color: 'bg-gray-100 border-gray-300',
      items: [
        ...stories.filter(s => s.status === 'Backlog' && isApprovedStory(s) && filterByAssignment(s)),
        ...(filterType !== 'stories' ? bugs.filter(b => b.status === 'Open' && filterByAssignment(b)) : []),
      ],
    },
    {
      name: 'Ready for Dev',
      color: 'bg-indigo-50 border-indigo-300',
      items: stories.filter(s => s.status === 'Ready for Dev' && isApprovedStory(s) && filterByAssignment(s)),
    },
    {
      name: 'In Development',
      color: 'bg-yellow-50 border-yellow-300',
      items: [
        ...stories.filter(s => s.status === 'In Development' && isApprovedStory(s) && filterByAssignment(s)),
        ...(filterType !== 'stories' ? bugs.filter(b => b.status === 'In Progress' && filterByAssignment(b)) : []),
      ],
    },
    {
      name: 'In Testing',
      color: 'bg-purple-50 border-purple-300',
      items: stories.filter(s => s.status === 'In Testing' && isApprovedStory(s) && filterByAssignment(s)),
    },
    {
      name: 'Bugs Found',
      color: 'bg-red-50 border-red-300',
      items: stories.filter(s => s.status === 'Bugs Found' && isApprovedStory(s) && filterByAssignment(s)),
    },
    {
      name: 'Done',
      color: 'bg-green-50 border-green-300',
      items: [
        ...stories.filter(s => s.status === 'Done' && isApprovedStory(s) && filterByAssignment(s)),
        ...(filterType !== 'stories' ? bugs.filter(b => (b.status === 'Verified' || b.status === 'Closed' || b.status === 'Fixed') && filterByAssignment(b)) : []),
      ],
    },
  ];

  const isStory = (item: Story | Bug): item is Story => {
    return 'storyPoints' in item;
  };

  const handleViewItem = (item: Story | Bug) => {
    setSelectedItem(item);
    if (isStory(item)) {
      setViewMode('storyView');
    } else {
      setViewMode('bugView');
    }
  };

  const handleBackToBoard = () => {
    setViewMode('board');
    setSelectedItem(null);
  };

  const handleDrop = (item: Story | Bug, newColumnStatus: string) => {
    if (isStory(item)) {
      // Map column name to story status
      let newStatus: StoryStatus = item.status;
      if (newColumnStatus === 'Backlog') newStatus = 'Backlog';
      else if (newColumnStatus === 'Ready for Dev') newStatus = 'Ready for Dev';
      else if (newColumnStatus === 'In Development') newStatus = 'In Development';
      else if (newColumnStatus === 'In Testing') newStatus = 'In Testing';
      else if (newColumnStatus === 'Bugs Found') newStatus = 'Bugs Found';
      else if (newColumnStatus === 'Done') newStatus = 'Done';

      setStories(stories.map(s => (s.id === item.id ? { ...s, status: newStatus } : s)));
    } else {
      // Map column name to bug status
      let newStatus: BugStatus = item.status;
      if (newColumnStatus === 'Backlog') newStatus = 'Open';
      else if (newColumnStatus === 'In Development') newStatus = 'In Progress';
      else if (newColumnStatus === 'Done') newStatus = 'Fixed';

      setBugs(bugs.map(b => (b.id === item.id ? { ...b, status: newStatus } : b)));
    }
  };

  const handleAssignDeveloper = (developer: string) => {
    if (selectedItem && isStory(selectedItem)) {
      const updatedStory = { ...selectedItem, assignedDeveloper: developer || undefined };
      setStories(stories.map(s => s.id === selectedItem.id ? updatedStory : s));
      setSelectedItem(updatedStory);
    }
  };

  const handleAssignTester = (tester: string) => {
    if (selectedItem && isStory(selectedItem)) {
      const updatedStory = { ...selectedItem, assignedTester: tester || undefined };
      setStories(stories.map(s => s.id === selectedItem.id ? updatedStory : s));
      setSelectedItem(updatedStory);
    }
  };

  const handleAssignBugDeveloper = (developer: string) => {
    if (selectedItem && !isStory(selectedItem)) {
      const updatedBug = { ...selectedItem, assignedDeveloper: developer || undefined };
      setBugs(bugs.map(b => b.id === selectedItem.id ? updatedBug : b));
      setSelectedItem(updatedBug);
    }
  };

  const handleAssignBugTester = (tester: string) => {
    if (selectedItem && !isStory(selectedItem)) {
      const updatedBug = { ...selectedItem, assignedTester: tester || undefined };
      setBugs(bugs.map(b => b.id === selectedItem.id ? updatedBug : b));
      setSelectedItem(updatedBug);
    }
  };

  // Assignment handlers for kanban cards
  const handleCardAssignDeveloper = (itemId: string, developer: string) => {
    // Check if it's a story or bug
    const story = stories.find(s => s.id === itemId);
    const bug = bugs.find(b => b.id === itemId);

    if (story) {
      setStories(stories.map(s =>
        s.id === itemId ? { ...s, assignedDeveloper: developer || undefined } : s
      ));
    } else if (bug) {
      setBugs(bugs.map(b =>
        b.id === itemId ? { ...b, assignedDeveloper: developer || undefined, assignedTo: developer || undefined } : b
      ));
    }
  };

  const handleCardAssignTester = (itemId: string, tester: string) => {
    // Check if it's a story or bug
    const story = stories.find(s => s.id === itemId);
    const bug = bugs.find(b => b.id === itemId);

    if (story) {
      setStories(stories.map(s =>
        s.id === itemId ? { ...s, assignedTester: tester || undefined } : s
      ));
    } else if (bug) {
      setBugs(bugs.map(b =>
        b.id === itemId ? { ...b, assignedTester: tester || undefined } : b
      ));
    }
  };

  const handleEditStory = () => {
    if (selectedItem && isStory(selectedItem)) {
      setEditingItem(selectedItem);
      setSelectedTags(selectedItem.tags || []);
      setViewMode('board'); // Switch back to board view to show modal
      setShowCreateModal('story');
    }
  };

  const handleEditBug = () => {
    if (selectedItem && !isStory(selectedItem)) {
      setEditingItem(selectedItem);
      setSelectedTags(selectedItem.tags || []);
      setViewMode('board'); // Switch back to board view to show modal
      setShowCreateModal('bug');
    }
  };

  const handleLinkBug = (bugId: string) => {
    if (selectedItem && isStory(selectedItem)) {
      const updatedStory = {
        ...selectedItem,
        linkedBugs: [...(selectedItem.linkedBugs || []), bugId]
      };
      setStories(stories.map(s => s.id === selectedItem.id ? updatedStory : s));
      setSelectedItem(updatedStory);

      // Also update the bug to link back to the story
      setBugs(bugs.map(b => b.id === bugId ? { ...b, linkedStory: selectedItem.id } : b));
    }
  };

  const handleUnlinkBug = (bugId: string) => {
    if (selectedItem && isStory(selectedItem)) {
      const updatedStory = {
        ...selectedItem,
        linkedBugs: (selectedItem.linkedBugs || []).filter(id => id !== bugId)
      };
      setStories(stories.map(s => s.id === selectedItem.id ? updatedStory : s));
      setSelectedItem(updatedStory);

      // Also update the bug to remove the story link
      setBugs(bugs.map(b => b.id === bugId ? { ...b, linkedStory: undefined } : b));
    }
  };

  const handleLinkTestCase = async (testCaseId: string) => {
    if (selectedItem && isStory(selectedItem)) {
      // Update the test case to link to this story
      const testCases = await getData('aqms_test_cases');
      if (testCases) {
        const updatedTestCases = testCases.map((tc: any) =>
          tc.id === testCaseId ? { ...tc, linkedStory: selectedItem.id } : tc
        );
        await setData('aqms_test_cases', updatedTestCases);

        // Reload test cases mapping
        const mapping: Record<string, { id: string; title: string; status: string }[]> = {};
        updatedTestCases.forEach((tc: any) => {
          if (tc.linkedStory) {
            if (!mapping[tc.linkedStory]) {
              mapping[tc.linkedStory] = [];
            }
            mapping[tc.linkedStory].push({
              id: tc.id,
              title: tc.title,
              status: tc.status,
            });
          }
        });
        setTestCasesByStory(mapping);
      }
    }
  };

  const handleUnlinkTestCase = async (testCaseId: string) => {
    if (selectedItem && isStory(selectedItem)) {
      // Update the test case to remove the story link
      const testCases = await getData('aqms_test_cases');
      if (testCases) {
        const updatedTestCases = testCases.map((tc: any) =>
          tc.id === testCaseId ? { ...tc, linkedStory: undefined } : tc
        );
        await setData('aqms_test_cases', updatedTestCases);

        // Reload test cases mapping
        const mapping: Record<string, { id: string; title: string; status: string }[]> = {};
        updatedTestCases.forEach((tc: any) => {
          if (tc.linkedStory) {
            if (!mapping[tc.linkedStory]) {
              mapping[tc.linkedStory] = [];
            }
            mapping[tc.linkedStory].push({
              id: tc.id,
              title: tc.title,
              status: tc.status,
            });
          }
        });
        setTestCasesByStory(mapping);
      }
    }
  };

  const handleUpdateStoryComments = (storyId: string, updatedComments: any[], updatedActivities: any[]) => {
    if (selectedItem && isStory(selectedItem) && selectedItem.id === storyId) {
      const updatedStory = {
        ...selectedItem,
        comments: updatedComments,
        activityLog: updatedActivities,
      };
      setStories(stories.map(s => s.id === storyId ? updatedStory : s));
      setSelectedItem(updatedStory);
    }
  };

  const handleUpdateBugComments = (bugId: string, updatedComments: any[]) => {
    if (selectedItem && !isStory(selectedItem) && selectedItem.id === bugId) {
      const updatedBug = {
        ...selectedItem,
        comments: updatedComments,
      };
      setBugs(bugs.map(b => b.id === bugId ? updatedBug : b));
      setSelectedItem(updatedBug);
    }
  };

  // Story View
  if (viewMode === 'storyView' && selectedItem && isStory(selectedItem)) {
    return (
      <StoryView
        story={selectedItem as any}
        onBack={handleBackToBoard}
        onEdit={handleEditStory}
        onAssignDeveloper={handleAssignDeveloper}
        onAssignTester={handleAssignTester}
        onLinkBug={handleLinkBug}
        onUnlinkBug={handleUnlinkBug}
        onLinkTestCase={handleLinkTestCase}
        onUnlinkTestCase={handleUnlinkTestCase}
        onUpdateComments={handleUpdateStoryComments}
      />
    );
  }

  // Bug View
  if (viewMode === 'bugView' && selectedItem && !isStory(selectedItem)) {
    return (
      <BugView
        bug={selectedItem as any}
        onBack={handleBackToBoard}
        onEdit={handleEditBug}
        onAssignDeveloper={handleAssignBugDeveloper}
        onAssignTester={handleAssignBugTester}
        onUpdateComments={handleUpdateBugComments}
      />
    );
  }

  const developers = ['James Martinez', 'David Martinez', 'Emily Chen', 'Maria Rodriguez', 'Robert Taylor'];
  const testers = ['Linda Thompson', 'Emily Chen', 'Jessica Williams', 'Michael Brown'];

  // Get unique developers and testers from current data
  const allDevelopers = Array.from(new Set([
    ...stories.map(s => s.assignedDeveloper).filter(Boolean),
    ...bugs.map(b => b.assignedDeveloper || b.assignedTo).filter(Boolean),
  ])) as string[];

  const allTesters = Array.from(new Set([
    ...stories.map(s => s.assignedTester).filter(Boolean),
    ...bugs.map(b => b.assignedTester).filter(Boolean),
  ])) as string[];

  // Get unique sprints from all stories
  const allSprints = Array.from(new Set([
    'Backlog',
    ...stories.map(s => s.sprint).filter(Boolean)
  ])).sort();

  // Get unique tags from all stories and bugs
  const allTags = Array.from(new Set([
    ...stories.flatMap(s => s.tags || []),
    ...bugs.flatMap(b => b.tags || []),
  ])).sort();

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full h-full p-4 md:p-6">
      <div className="mb-6">
        {stories.length === 0 && bugs.length === 0 && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-lg text-gray-900 mb-1">No Data Loaded</h3>
                <p className="text-sm text-gray-700">
                  No stories or bugs found. The database may not be accessible. Default data should load automatically.
                </p>
              </div>
            </div>
          </div>
        )}

        {stories.length > 0 && stories.filter(s => s.qaSignOff && s.pmApproval).length === 0 && (
          <div className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="text-lg text-gray-900 mb-1">No Approved Stories</h3>
                <p className="text-sm text-gray-700">
                  {stories.length} {stories.length === 1 ? 'story' : 'stories'} found, but none have both QA sign-off and PM approval.
                  Stories need both approvals to appear on the Kanban board.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl mb-2">Kanban Board</h1>
            <p className="text-gray-600 text-sm md:text-base">
              Real-time quality visibility - {stories.filter(s => s.qaSignOff && s.pmApproval).length} approved stories (of {stories.length} total), {bugs.length} bugs
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              className="w-full md:w-auto px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-sm"
            >
              + Create New
            </button>
            {showCreateMenu && (
              <div className="absolute right-0 top-12 z-20 bg-white border border-gray-300 rounded-lg shadow-xl w-48">
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setSelectedTags([]);
                    setTagInput('');
                    setShowCreateModal('story');
                    setShowCreateMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors text-gray-800 border-b border-gray-200"
                >
                  📋 User Story
                </button>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setSelectedTags([]);
                    setTagInput('');
                    setShowCreateModal('bug');
                    setShowCreateMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors text-gray-800 border-b border-gray-200"
                >
                  🐛 Bug Report
                </button>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setSelectedTags([]);
                    setTagInput('');
                    setShowCreateModal('test');
                    setShowCreateMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors text-gray-800"
                >
                  🧪 Test Case
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quality Status Legend */}
        <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">📊 Real-Time Quality Indicators</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-700">🐛 Bugs Found</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-gray-700">⚠️ Testing Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-gray-700">❌ Tests Failing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-gray-700">⚡ No Test Coverage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-700">✅ All Tests Pass</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3 italic">
            Cards show quality states in real-time, exposing issues like bugs, blocked tests, and coverage gaps before sprint deadlines.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base ${
                filterType === 'all'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setFilterType('stories')}
              className={`px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base ${
                filterType === 'stories'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Stories Only
            </button>
            <button
              onClick={() => setFilterType('bugs')}
              className={`px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base ${
                filterType === 'bugs'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Bugs Only
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">Developer:</label>
              <select
                value={filterDeveloper}
                onChange={(e) => setFilterDeveloper(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Developers</option>
                {allDevelopers.map(dev => (
                  <option key={dev} value={dev}>{dev}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">Tester:</label>
              <select
                value={filterTester}
                onChange={(e) => setFilterTester(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Testers</option>
                {allTesters.map(tester => (
                  <option key={tester} value={tester}>{tester}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">Tag:</label>
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>

          {(filterDeveloper || filterTester || filterTag || filterType !== 'all') && (
            <div className="flex items-center justify-between mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
              <div className="text-sm text-gray-700">
                <div className="font-medium mb-1">Filters Active:</div>
                <div className="flex flex-wrap gap-2">
                  {filterType !== 'all' && (
                    <span className="px-2 py-1 bg-white rounded border border-indigo-300">
                      Type: {filterType === 'stories' ? 'Stories Only' : 'Bugs Only'}
                    </span>
                  )}
                  {filterDeveloper && (
                    <span className="px-2 py-1 bg-white rounded border border-indigo-300">
                      Developer: {filterDeveloper}
                    </span>
                  )}
                  {filterTester && (
                    <span className="px-2 py-1 bg-white rounded border border-indigo-300">
                      Tester: {filterTester}
                    </span>
                  )}
                  {filterTag && (
                    <span className="px-2 py-1 bg-white rounded border border-indigo-300">
                      Tag: {filterTag}
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  Showing {columns.reduce((sum, col) => sum + col.items.length, 0)} of {stories.filter(s => s.qaSignOff && s.pmApproval).length + bugs.length} available items
                </div>
              </div>
              <button
                onClick={() => {
                  setFilterType('all');
                  setFilterDeveloper('');
                  setFilterTester('');
                  setFilterTag('');
                }}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm flex-shrink-0"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex flex-col md:flex-row gap-3 md:overflow-x-auto pb-4 items-stretch">
        {columns.map(column => {
          let visibleItems = column.items;

          if (filterType === 'stories') {
            visibleItems = column.items.filter(item => isStory(item));
          } else if (filterType === 'bugs') {
            visibleItems = column.items.filter(item => !isStory(item));
          }

          return (
            <DroppableColumn
              key={column.name}
              columnName={column.name}
              color={column.color}
              items={visibleItems}
              onDrop={handleDrop}
              onView={handleViewItem}
              testCasesByStory={testCasesByStory}
              onAssignDeveloper={handleCardAssignDeveloper}
              onAssignTester={handleCardAssignTester}
              onTestCaseClick={async (testCaseId) => {
                // Load test case details
                const testCases = await getData('aqms_test_cases');
                const testCase = testCases?.find((tc: any) => tc.id === testCaseId);
                if (testCase) {
                  // Ensure test case has required arrays
                  setSelectedTestCase({
                    ...testCase,
                    steps: testCase.steps || [],
                    expectedResults: testCase.expectedResults || [],
                  });
                } else {
                  setNotification({
                    isOpen: true,
                    title: 'Test Case Not Found',
                    message: `Could not find test case ${testCaseId}`,
                    type: 'error',
                  });
                }
              }}
            />
          );
        })}
      </div>

      {/* Create/Edit Story Modal */}
      {showCreateModal === 'story' && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => {
              setShowCreateModal(null);
              setEditingItem(null);
              setSelectedTags([]);
              setTagInput('');
              setShowNewSprintInput(false);
              setNewSprintName('');
              setShowNewStoryFromBug(false);
            }}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 rounded-t-lg flex-shrink-0">
                <h2 className="text-xl md:text-2xl text-gray-900 dark:text-white font-semibold">
                  {editingItem && isStory(editingItem) ? 'Edit User Story' : 'Create New User Story'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(null);
                    setEditingItem(null);
                    setSelectedTags([]);
                    setTagInput('');
                    setShowNewSprintInput(false);
                    setNewSprintName('');
                    setShowNewStoryFromBug(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);

                  if (editingItem && isStory(editingItem)) {
                    // Update existing story
                    const updatedStory: Story = {
                      ...editingItem,
                      title: formData.get('title') as string,
                      description: formData.get('description') as string,
                      criteriaDetails: formData.get('criteria') as string,
                      priority: formData.get('priority') as Priority,
                      storyPoints: parseInt(formData.get('points') as string) || 0,
                      sprint: formData.get('sprint') as string || 'Backlog',
                      updatedAt: new Date(),
                      tags: selectedTags,
                    };
                    setStories(stories.map(s => s.id === editingItem.id ? updatedStory : s));
                    setSelectedItem(updatedStory);
                    setNotification({
                      isOpen: true,
                      title: 'Success',
                      message: `Story ${updatedStory.id} updated successfully!`,
                      type: 'success',
                    });
                  } else {
                    // Create new story
                    const newStory: Story = {
                      id: `US-${stories.length + 101}`,
                      title: formData.get('title') as string,
                      description: formData.get('description') as string,
                      acceptanceCriteria: false,
                      qaSignOff: false,
                      pmApproval: false,
                      criteriaDetails: formData.get('criteria') as string,
                      priority: formData.get('priority') as Priority,
                      storyPoints: parseInt(formData.get('points') as string) || 0,
                      sprint: formData.get('sprint') as string || 'Backlog',
                      status: 'Backlog',
                      dependencies: [],
                      comments: [],
                      activityLog: [],
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      linkedBugs: [],
                      tags: selectedTags,
                    };
                    setStories([...stories, newStory]);
                    setNotification({
                      isOpen: true,
                      title: 'Success',
                      message: `Story ${newStory.id} created successfully!`,
                      type: 'success',
                    });
                  }
                  setShowCreateModal(null);
                  setEditingItem(null);
                  setSelectedTags([]);
                  setTagInput('');
                  setShowNewSprintInput(false);
                  setNewSprintName('');
                  setShowNewStoryFromBug(false);
                }}
                className="flex flex-col flex-1 overflow-hidden"
              >
                <div className="p-4 md:p-6 space-y-4 flex-grow overflow-y-auto custom-scrollbar">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base">Title *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      defaultValue={editingItem && isStory(editingItem) ? editingItem.title : ''}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                      placeholder="User story title"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base">Description *</label>
                    <textarea
                      name="description"
                      required
                      rows={3}
                      defaultValue={editingItem && isStory(editingItem) ? editingItem.description : ''}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                      placeholder="As a user, I want to..."
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base">Acceptance Criteria</label>
                    <textarea
                      name="criteria"
                      rows={3}
                      defaultValue={editingItem && isStory(editingItem) ? editingItem.criteriaDetails : ''}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                      placeholder="Given... When... Then..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base">Priority *</label>
                      <select
                        name="priority"
                        required
                        defaultValue={editingItem && isStory(editingItem) ? editingItem.priority : 'Medium'}
                        className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base">Story Points</label>
                      <input
                        type="number"
                        name="points"
                        min="0"
                        defaultValue={editingItem && isStory(editingItem) ? editingItem.storyPoints : 0}
                        className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base">Sprint</label>
                    {!showNewSprintInput ? (
                      <div className="flex gap-2">
                        <select
                          name="sprint"
                          defaultValue={editingItem && isStory(editingItem) ? editingItem.sprint : 'Backlog'}
                          className="flex-1 px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          {allSprints.map(sprint => (
                            <option key={sprint} value={sprint}>{sprint}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowNewSprintInput(true)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm whitespace-nowrap"
                        >
                          + New Sprint
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="sprint"
                          value={newSprintName}
                          onChange={(e) => setNewSprintName(e.target.value)}
                          className="flex-1 px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                          placeholder="e.g., Sprint 14"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewSprintInput(false);
                            setNewSprintName('');
                          }}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base">Tags</label>

                    {/* Selected Tags */}
                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedTags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900"
                          >
                            🏷️ {tag}
                            <button
                              type="button"
                              onClick={() => setSelectedTags(selectedTags.filter((_, i) => i !== idx))}
                              className="ml-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Tag Input */}
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
                                setSelectedTags([...selectedTags, tagInput.trim()]);
                                setTagInput('');
                              }
                            }
                          }}
                          className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                          placeholder="Type new tag and press Enter"
                        />
                      </div>
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value && !selectedTags.includes(e.target.value)) {
                            setSelectedTags([...selectedTags, e.target.value]);
                          }
                        }}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                      >
                        <option value="">Select existing...</option>
                        {allTags.filter(tag => !selectedTags.includes(tag)).map(tag => (
                          <option key={tag} value={tag}>{tag}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(null);
                      setEditingItem(null);
                      setSelectedTags([]);
                      setTagInput('');
                      setShowNewSprintInput(false);
                      setNewSprintName('');
                      setShowNewStoryFromBug(false);
                    }}
                    className="px-4 py-2 text-gray-750 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm md:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm md:text-base font-semibold"
                  >
                    {editingItem && isStory(editingItem) ? 'Update Story' : 'Create Story'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Create/Edit Bug Modal */}
      {showCreateModal === 'bug' && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => {
              setShowCreateModal(null);
              setEditingItem(null);
              setSelectedTags([]);
              setTagInput('');
              setShowNewSprintInput(false);
              setNewSprintName('');
              setShowNewStoryFromBug(false);
            }}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 rounded-t-lg flex-shrink-0">
                <h2 className="text-xl md:text-2xl text-gray-900 dark:text-white font-semibold">
                  {editingItem && !isStory(editingItem) ? 'Edit Bug Report' : 'Create New Bug Report'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(null);
                    setEditingItem(null);
                    setSelectedTags([]);
                    setTagInput('');
                    setShowNewSprintInput(false);
                    setNewSprintName('');
                    setShowNewStoryFromBug(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);

                  if (editingItem && !isStory(editingItem)) {
                    // Update existing bug
                    const updatedBug: Bug = {
                      ...editingItem,
                      title: formData.get('title') as string,
                      description: formData.get('description') as string,
                      severity: formData.get('severity') as 'Critical' | 'High' | 'Medium' | 'Low',
                      linkedStory: formData.get('linkedStory') as string || undefined,
                      steps: (formData.get('steps') as string).split('\n').filter(Boolean),
                      expectedBehavior: formData.get('expected') as string,
                      actualBehavior: formData.get('actual') as string,
                      environment: formData.get('environment') as string || undefined,
                      tags: selectedTags,
                    };
                    setBugs(bugs.map(b => b.id === editingItem.id ? updatedBug : b));
                    setSelectedItem(updatedBug);
                    setNotification({
                      isOpen: true,
                      title: 'Success',
                      message: `Bug ${updatedBug.id} updated successfully!`,
                      type: 'success',
                    });
                  } else {
                    // Create new bug
                    const newBug: Bug = {
                      id: `BUG-${bugs.length + 1}`.padStart(7, '0'),
                      title: formData.get('title') as string,
                      description: formData.get('description') as string,
                      severity: formData.get('severity') as 'Critical' | 'High' | 'Medium' | 'Low',
                      status: 'Open',
                      foundBy: user?.name || 'Unknown',
                      linkedStory: formData.get('linkedStory') as string || undefined,
                      steps: (formData.get('steps') as string).split('\n').filter(Boolean),
                      expectedBehavior: formData.get('expected') as string,
                      actualBehavior: formData.get('actual') as string,
                      environment: formData.get('environment') as string || undefined,
                      createdAt: new Date(),
                      tags: selectedTags,
                    };
                    setBugs([...bugs, newBug]);
                    setNotification({
                      isOpen: true,
                      title: 'Success',
                      message: `Bug ${newBug.id} created successfully!`,
                      type: 'success',
                    });
                  }
                  setShowCreateModal(null);
                  setEditingItem(null);
                  setSelectedTags([]);
                  setTagInput('');
                  setShowNewSprintInput(false);
                  setNewSprintName('');
                  setShowNewStoryFromBug(false);
                }}
                className="flex flex-col flex-1 overflow-hidden"
              >
                <div className="p-4 md:p-6 space-y-4 flex-grow overflow-y-auto custom-scrollbar">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base">Title *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      defaultValue={editingItem && !isStory(editingItem) ? editingItem.title : ''}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                      placeholder="Brief bug description"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base">Description *</label>
                    <textarea
                      name="description"
                      required
                      rows={3}
                      defaultValue={editingItem && !isStory(editingItem) ? editingItem.description : ''}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                      placeholder="Detailed bug description"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base">Severity *</label>
                      <select
                        name="severity"
                        required
                        defaultValue={editingItem && !isStory(editingItem) ? editingItem.severity : 'Medium'}
                        className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base">Linked Story</label>
                      {!showNewStoryFromBug ? (
                        <div className="flex gap-2">
                          <select
                            name="linkedStory"
                            defaultValue={editingItem && !isStory(editingItem) ? editingItem.linkedStory : ''}
                            className="flex-1 px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                          >
                            <option value="">-- No Story Linked --</option>
                            {stories.filter(s => s.qaSignOff && s.pmApproval).map(story => (
                              <option key={story.id} value={story.id}>
                                {story.id} - {story.title}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setShowNewStoryFromBug(true)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm whitespace-nowrap"
                          >
                            + New Story
                          </button>
                        </div>
                      ) : (
                        <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 rounded-lg p-3">
                          <p className="text-sm text-indigo-800 dark:text-indigo-350 mb-2">
                            To create a new story, please close this form and use the "+ Create New" button, then link the bug from the story view.
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowNewStoryFromBug(false)}
                            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm"
                          >
                            Back to Dropdown
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base">Steps to Reproduce (one per line) *</label>
                    <textarea
                      name="steps"
                      required
                      rows={4}
                      defaultValue={editingItem && !isStory(editingItem) ? editingItem.steps.join('\n') : ''}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                      placeholder="Step 1&#10;Step 2&#10;Step 3"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base">Expected Behavior *</label>
                    <textarea
                      name="expected"
                      required
                      rows={2}
                      defaultValue={editingItem && !isStory(editingItem) ? editingItem.expectedBehavior : ''}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                      placeholder="What should happen"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base">Actual Behavior *</label>
                    <textarea
                      name="actual"
                      required
                      rows={2}
                      defaultValue={editingItem && !isStory(editingItem) ? editingItem.actualBehavior : ''}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                      placeholder="What actually happens"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base">Environment</label>
                    <input
                      type="text"
                      name="environment"
                      defaultValue={editingItem && !isStory(editingItem) ? editingItem.environment : ''}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                      placeholder="Production - Chrome 120"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base">Tags</label>

                    {/* Selected Tags */}
                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedTags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900"
                          >
                            🏷️ {tag}
                            <button
                              type="button"
                              onClick={() => setSelectedTags(selectedTags.filter((_, i) => i !== idx))}
                              className="ml-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Tag Input */}
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
                                setSelectedTags([...selectedTags, tagInput.trim()]);
                                setTagInput('');
                              }
                            }
                          }}
                          className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                          placeholder="Type new tag and press Enter"
                        />
                      </div>
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value && !selectedTags.includes(e.target.value)) {
                            setSelectedTags([...selectedTags, e.target.value]);
                          }
                        }}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                      >
                        <option value="">Select existing...</option>
                        {allTags.filter(tag => !selectedTags.includes(tag)).map(tag => (
                          <option key={tag} value={tag}>{tag}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(null);
                      setEditingItem(null);
                      setSelectedTags([]);
                      setTagInput('');
                      setShowNewSprintInput(false);
                      setNewSprintName('');
                      setShowNewStoryFromBug(false);
                    }}
                    className="px-4 py-2 text-gray-750 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm md:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm md:text-base font-semibold"
                  >
                    {editingItem && !isStory(editingItem) ? 'Update Bug' : 'Create Bug'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Create Test Case Modal */}
      {showCreateModal === 'test' && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-45"
            onClick={() => setShowCreateModal(null)}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 rounded-t-lg flex-shrink-0">
                <h2 className="text-xl md:text-2xl text-gray-900 dark:text-white font-semibold">Create New Test Case</h2>
                <button
                  onClick={() => setShowCreateModal(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);

                  // Get existing test cases from Supabase
                  const existingTestCases = await getData('aqms_test_cases') || [];

                  const newTestCase = {
                    id: `TC-${existingTestCases.length + 1}`.padStart(6, '0'),
                    title: formData.get('title') as string,
                    description: formData.get('description') as string,
                    linkedStory: formData.get('linkedStory') as string || undefined,
                    priority: formData.get('priority') as string,
                    status: 'Not Run',
                    steps: (formData.get('steps') as string).split('\n').filter(Boolean),
                    expectedResult: formData.get('expected') as string,
                    preconditions: formData.get('preconditions') as string || undefined,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };

                  // Save to Supabase
                  await setData('aqms_test_cases', [...existingTestCases, newTestCase]);

                  // Reload test cases
                  const testCases = await getData('aqms_test_cases') || [];
                  const mapping: Record<string, { id: string; title: string; status: string }[]> = {};
                  testCases.forEach((tc: any) => {
                    if (tc.linkedStory) {
                      if (!mapping[tc.linkedStory]) {
                        mapping[tc.linkedStory] = [];
                      }
                      mapping[tc.linkedStory].push({
                        id: tc.id,
                        title: tc.title,
                        status: tc.status,
                      });
                    }
                  });
                  setTestCasesByStory(mapping);

                  setShowCreateModal(null);
                  setNotification({
                    isOpen: true,
                    title: 'Success',
                    message: `Test Case ${newTestCase.id} created successfully!`,
                    type: 'success',
                  });
                }}
                className="flex flex-col flex-1 overflow-hidden"
              >
                <div className="p-4 md:p-6 space-y-4 flex-grow overflow-y-auto custom-scrollbar">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base">Title *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                      placeholder="Test case title"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base">Description *</label>
                    <textarea
                      name="description"
                      required
                      rows={2}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                      placeholder="What this test verifies"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base">Linked Story</label>
                      <select
                        name="linkedStory"
                        className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                      >
                        <option value="">-- No Story Linked --</option>
                        {stories.filter(s => s.qaSignOff && s.pmApproval).map(story => (
                          <option key={story.id} value={story.id}>
                            {story.id} - {story.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base">Priority *</label>
                      <select
                        name="priority"
                        required
                        className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base">Preconditions</label>
                    <textarea
                      name="preconditions"
                      rows={2}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                      placeholder="Conditions required before running test"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base">Test Steps (one per line) *</label>
                    <textarea
                      name="steps"
                      required
                      rows={4}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                      placeholder="Step 1&#10;Step 2&#10;Step 3"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base">Expected Result *</label>
                    <textarea
                      name="expected"
                      required
                      rows={2}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
                      placeholder="What should happen when test passes"
                    />
                  </div>
                </div>

                <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(null)}
                    className="px-4 py-2 text-gray-750 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm md:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm md:text-base font-semibold"
                  >
                    Create Test Case
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      {/* Test Case View Modal */}
      {selectedTestCase && !executingTestCase && (
        <TestCaseView
          testCase={selectedTestCase}
          onClose={() => setSelectedTestCase(null)}
          onExecute={() => {
            setExecutingTestCase(selectedTestCase);
            setSelectedTestCase(null);
          }}
          onEdit={() => {
            setEditingTestCase(selectedTestCase);
            setSelectedTestCase(null);
          }}
        />
      )}

      {/* Test Case Execute Modal */}
      {executingTestCase && (
        <TestCaseExecute
          testCase={executingTestCase}
          onClose={() => setExecutingTestCase(null)}
          onComplete={async (result, notes) => {
            // Update the test case with result
            const existingTestCases = await getData('aqms_test_cases') || [];
            const updatedTestCases = existingTestCases.map((tc: any) =>
              tc.id === executingTestCase.id
                ? {
                    ...tc,
                    status: result,
                    lastRun: new Date(),
                    executionTime: Math.floor(Math.random() * 120) + 30,
                  }
                : tc
            );
            await setData('aqms_test_cases', updatedTestCases);

            // Reload test cases mapping
            const mapping: Record<string, { id: string; title: string; status: string }[]> = {};
            updatedTestCases.forEach((tc: any) => {
              if (tc.linkedStory) {
                if (!mapping[tc.linkedStory]) {
                  mapping[tc.linkedStory] = [];
                }
                mapping[tc.linkedStory].push({
                  id: tc.id,
                  title: tc.title,
                  status: tc.status,
                });
              }
            });
            setTestCasesByStory(mapping);

            // Close and show notification
            setExecutingTestCase(null);
            setNotification({
              isOpen: true,
              title: 'Test Case Completed',
              message: `Test case ${executingTestCase.id} completed with result: ${result}`,
              type: 'success',
            });
          }}
          onCreateBug={(testCase, notes) => {
            // For now, just show a notification
            // You can implement bug creation here if needed
            setNotification({
              isOpen: true,
              title: 'Create Bug',
              message: 'Bug creation from Kanban board will be available soon. Please use the Test Cases tab (Ctrl+6) to create bugs from failed tests.',
              type: 'info',
            });
          }}
        />
      )}

      {/* Edit Test Case Form */}
      {editingTestCase && (
        <TestCaseForm
          onClose={() => setEditingTestCase(null)}
          onSubmit={async (testCase) => {
            // Get existing test cases
            const existingTestCases = await getData('aqms_test_cases') || [];

            // Update the test case
            const updatedTestCases = existingTestCases.map((tc: any) =>
              tc.id === editingTestCase.id
                ? { ...tc, ...testCase, id: editingTestCase.id, lastRun: editingTestCase.lastRun, executionTime: editingTestCase.executionTime }
                : tc
            );

            // Save to Supabase
            await setData('aqms_test_cases', updatedTestCases);

            // Reload test cases mapping
            const mapping: Record<string, { id: string; title: string; status: string }[]> = {};
            updatedTestCases.forEach((tc: any) => {
              if (tc.linkedStory) {
                if (!mapping[tc.linkedStory]) {
                  mapping[tc.linkedStory] = [];
                }
                mapping[tc.linkedStory].push({
                  id: tc.id,
                  title: tc.title,
                  status: tc.status,
                });
              }
            });
            setTestCasesByStory(mapping);

            // Close the form and show notification
            setEditingTestCase(null);
            setNotification({
              isOpen: true,
              title: 'Test Case Updated',
              message: `Test case ${editingTestCase.id} has been updated successfully`,
              type: 'success',
            });
          }}
          testCase={editingTestCase}
        />
      )}
      </div>
    </DndProvider>
  );
}
