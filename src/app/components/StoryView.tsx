import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CommentsSection } from './CommentsSection';
import { ActivityLog } from './ActivityLog';
import { getData } from '../utils/supabaseStorage';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { Edit3, ArrowLeft } from 'lucide-react';

type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
  edited?: boolean;
}

interface ActivityLogEntry {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  details?: string;
}

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
  comments?: Comment[];
  activityLog?: ActivityLogEntry[];
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  linkedBugs?: string[];
  status?: string;
  moduleId?: string;
}

interface StoryViewProps {
  story: Story;
  onEdit: () => void;
  onBack: () => void;
  onToggleQA?: () => void;
  onTogglePM?: () => void;
  onAssignDeveloper?: (developer: string) => void;
  onAssignTester?: (tester: string) => void;
  onLinkBug?: (bugId: string) => void;
  onUnlinkBug?: (bugId: string) => void;
  onLinkTestCase?: (testCaseId: string) => void;
  onUnlinkTestCase?: (testCaseId: string) => void;
  onNavigate?: (tab: string, itemId?: string) => void;
  onUpdateComments?: (storyId: string, comments: Comment[], activities: ActivityLogEntry[]) => void;
}

export function StoryView({ story, onEdit, onBack, onToggleQA, onTogglePM, onAssignDeveloper, onAssignTester, onLinkBug, onUnlinkBug, onLinkTestCase, onUnlinkTestCase, onNavigate, onUpdateComments }: StoryViewProps) {
  const { user } = useAuth();
  const { data: modules } = useSupabaseData<any[]>('aqms_modules', []);
  const [comments, setComments] = useState<Comment[]>(story.comments || []);
  const [activities, setActivities] = useState<ActivityLogEntry[]>(story.activityLog || []);
  const [showDeveloperDropdown, setShowDeveloperDropdown] = useState(false);
  const [showTesterDropdown, setShowTesterDropdown] = useState(false);
  const [showBugLinkDropdown, setShowBugLinkDropdown] = useState(false);
  const [showTestCaseLinkDropdown, setShowTestCaseLinkDropdown] = useState(false);
  const [availableBugs, setAvailableBugs] = useState<any[]>([]);
  const [availableTestCases, setAvailableTestCases] = useState<any[]>([]);
  const [linkedTestCases, setLinkedTestCases] = useState<any[]>([]);

  // Sync state when story changes
  useEffect(() => {
    setComments(story.comments || []);
    setActivities(story.activityLog || []);
  }, [story.id]);

  const developers = ['James Martinez', 'David Martinez', 'Emily Chen', 'Maria Rodriguez', 'Robert Taylor'];
  const testers = ['Linda Thompson', 'Emily Chen', 'Jessica Williams', 'Michael Brown'];

  // Load bugs and test cases
  useEffect(() => {
    const loadData = async () => {
      const bugs = await getData('aqms_bugs');
      const testCases = await getData('aqms_test_cases');

      if (bugs) {
        setAvailableBugs(bugs);
      }

      if (testCases) {
        setAvailableTestCases(testCases);
        // Filter test cases linked to this story
        const linked = testCases.filter((tc: any) => tc.linkedStory === story.id);
        setLinkedTestCases(linked);
      }
    };
    loadData();
  }, [story.id]);

  const isReadyForDev = story.acceptanceCriteria && story.qaSignOff && story.pmApproval;

  const handleAddComment = (text: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      author: user?.name || 'Unknown',
      text,
      timestamp: new Date(),
    };
    const updatedComments = [...comments, newComment];
    setComments(updatedComments);

    // Add to activity log
    const activity: ActivityLogEntry = {
      id: `activity-${Date.now()}`,
      action: 'added a comment',
      user: user?.name || 'Unknown',
      timestamp: new Date(),
    };
    const updatedActivities = [activity, ...activities];
    setActivities(updatedActivities);

    if (onUpdateComments) {
      onUpdateComments(story.id, updatedComments, updatedActivities);
    }
  };

  const handleEditComment = (id: string, text: string) => {
    const updatedComments = comments.map(c =>
      c.id === id ? { ...c, text, edited: true } : c
    );
    setComments(updatedComments);
    if (onUpdateComments) {
      onUpdateComments(story.id, updatedComments, activities);
    }
  };

  const handleDeleteComment = (id: string) => {
    const updatedComments = comments.filter(c => c.id !== id);
    setComments(updatedComments);
    if (onUpdateComments) {
      onUpdateComments(story.id, updatedComments, activities);
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border border-green-200';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-indigo-500 hover:text-indigo-600 text-sm md:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </button>
        <button
          onClick={onEdit}
          className="btn btn-primary"
        >
          <Edit3 className="w-4 h-4" />
          Edit Story
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-8">
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <span className="text-sm text-gray-500">{story.id}</span>
              <h1 className="text-2xl md:text-3xl text-gray-900 mt-1">{story.title}</h1>
            </div>
            <div className="flex-shrink-0">
              {isReadyForDev ? (
                <span className="inline-flex items-center px-3 md:px-4 py-2 rounded-full bg-green-500 text-white text-sm md:text-base">
                  ✓ Ready for Dev
                </span>
              ) : (
                <span className="inline-flex items-center px-3 md:px-4 py-2 rounded-full bg-red-500 text-white text-sm md:text-base">
                  🔒 Locked
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-base md:text-lg text-gray-800 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{story.description}</p>
          </div>

          <div>
            <h3 className="text-base md:text-lg text-gray-800 mb-4">Team Assignments</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="text-sm text-gray-600 mb-2">QA Reviewer (Sign-Off)</div>
                {story.assignedQAReviewer ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs">
                      {story.assignedQAReviewer.split(' ').slice(0, 2).map(n => n[0]).join('')}
                    </div>
                    <span className="text-gray-900 text-sm">{story.assignedQAReviewer}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">No reviewer assigned</span>
                )}
              </div>

              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <div className="text-sm text-gray-600 mb-2">Assigned Developer</div>
                {story.assignedDeveloper ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs">
                        {story.assignedDeveloper.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-gray-900 text-sm">{story.assignedDeveloper}</span>
                    </div>
                    {isReadyForDev && onAssignDeveloper && (
                      <button
                        onClick={() => setShowDeveloperDropdown(!showDeveloperDropdown)}
                        className="px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-xs"
                      >
                        Change
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">{!isReadyForDev ? '🔒 Locked' : 'No developer assigned'}</span>
                    {isReadyForDev && onAssignDeveloper && (
                      <button
                        onClick={() => setShowDeveloperDropdown(!showDeveloperDropdown)}
                        className="px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-xs"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                )}
                {showDeveloperDropdown && isReadyForDev && onAssignDeveloper && (
                  <div className="mt-2 bg-white border border-indigo-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {developers.map((dev) => (
                      <div
                        key={dev}
                        onClick={() => {
                          onAssignDeveloper(dev);
                          setShowDeveloperDropdown(false);
                        }}
                        className="px-3 py-2 hover:bg-indigo-100 cursor-pointer text-sm"
                      >
                        {dev}
                      </div>
                    ))}
                    {story.assignedDeveloper && (
                      <div
                        onClick={() => {
                          onAssignDeveloper('');
                          setShowDeveloperDropdown(false);
                        }}
                        className="px-3 py-2 hover:bg-red-100 cursor-pointer text-sm text-red-600 border-t"
                      >
                        Unassign
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-gray-600 mb-2">Assigned Tester</div>
                {story.assignedTester ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">
                        {story.assignedTester.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-gray-900 text-sm">{story.assignedTester}</span>
                    </div>
                    {isReadyForDev && onAssignTester && (
                      <button
                        onClick={() => setShowTesterDropdown(!showTesterDropdown)}
                        className="px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-xs"
                      >
                        Change
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">{!isReadyForDev ? '🔒 Locked' : 'No tester assigned'}</span>
                    {isReadyForDev && onAssignTester && (
                      <button
                        onClick={() => setShowTesterDropdown(!showTesterDropdown)}
                        className="px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-xs"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                )}
                {showTesterDropdown && isReadyForDev && onAssignTester && (
                  <div className="mt-2 bg-white border border-purple-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {testers.map((tester) => (
                      <div
                        key={tester}
                        onClick={() => {
                          onAssignTester(tester);
                          setShowTesterDropdown(false);
                        }}
                        className="px-3 py-2 hover:bg-purple-100 cursor-pointer text-sm"
                      >
                        {tester}
                      </div>
                    ))}
                    {story.assignedTester && (
                      <div
                        onClick={() => {
                          onAssignTester('');
                          setShowTesterDropdown(false);
                        }}
                        className="px-3 py-2 hover:bg-red-100 cursor-pointer text-sm text-red-600 border-t"
                      >
                        Unassign
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {story.criteriaDetails && (
            <div>
              <h3 className="text-base md:text-lg text-gray-800 mb-2">Acceptance Criteria</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <style>{`
                  .criteria-content h1, .criteria-content h2, .criteria-content h3 {
                    font-weight: 600;
                    margin-top: 1rem;
                    margin-bottom: 0.5rem;
                  }
                  .criteria-content h1 { font-size: 1.5rem; }
                  .criteria-content h2 { font-size: 1.25rem; }
                  .criteria-content h3 { font-size: 1.1rem; }
                  .criteria-content p { margin-bottom: 0.75rem; }
                  .criteria-content ul, .criteria-content ol {
                    margin-left: 1.5rem;
                    margin-bottom: 0.75rem;
                  }
                  .criteria-content ul { list-style-type: disc; }
                  .criteria-content ol { list-style-type: decimal; }
                  .criteria-content li { margin-bottom: 0.25rem; }
                  .criteria-content strong { font-weight: 600; }
                  .criteria-content em { font-style: italic; }
                  .criteria-content blockquote {
                    border-left: 4px solid #e5e7eb;
                    padding-left: 1rem;
                    margin: 0.75rem 0;
                    color: #6b7280;
                  }
                  .criteria-content code {
                    background: #f3f4f6;
                    padding: 0.125rem 0.25rem;
                    border-radius: 0.25rem;
                    font-family: monospace;
                    font-size: 0.875em;
                  }
                  .criteria-content pre {
                    background: #1f2937;
                    color: #f9fafb;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    overflow-x: auto;
                    margin: 0.75rem 0;
                  }
                  .criteria-content a {
                    color: #4f46e5;
                    text-decoration: underline;
                  }
                `}</style>
                <div
                  className="criteria-content text-gray-700"
                  dangerouslySetInnerHTML={{ __html: story.criteriaDetails }}
                />
              </div>
            </div>
          )}

          <div>
            <h3 className="text-base md:text-lg text-gray-800 mb-4">Quality Gates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-2">Acceptance Criteria</div>
                {story.acceptanceCriteria ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800">
                    ✓ Complete
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800">
                    ✗ Incomplete
                  </span>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-2">QA Sign-Off</div>
                <div className="flex items-center gap-2">
                  {story.qaSignOff ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800">
                      ✓ Signed
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                      ○ Pending
                    </span>
                  )}
                  {user?.role === 'QA Engineer' && onToggleQA && (
                    <button
                      onClick={onToggleQA}
                      className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
                    >
                      {story.qaSignOff ? 'Revoke' : 'Sign Off'}
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-2">PM Approval</div>
                <div className="flex items-center gap-2">
                  {story.pmApproval ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800">
                      ✓ Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                      ○ Pending
                    </span>
                  )}
                  {user?.role === 'Product Manager' && onTogglePM && (
                    <button
                      onClick={onTogglePM}
                      className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
                    >
                      {story.pmApproval ? 'Revoke' : 'Approve'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Story Metadata */}
          <div>
            <h3 className="text-base md:text-lg text-gray-800 mb-4">Story Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Priority</div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getPriorityColor(story.priority)}`}>
                  {story.priority}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Story Points</div>
                <div className="text-sm text-gray-900">{story.storyPoints || 'Not estimated'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Sprint</div>
                <div className="text-sm text-gray-900">{story.sprint || 'Unassigned'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Risk Module</div>
                <div className="text-sm text-gray-900 truncate" title={modules.find(m => m.id === story.moduleId)?.name || 'None'}>
                  {modules.find(m => m.id === story.moduleId) ? `${story.moduleId} - ${modules.find(m => m.id === story.moduleId)?.name}` : 'None'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Created</div>
                <div className="text-sm text-gray-900">{new Date(story.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Dependencies */}
          {story.dependencies && story.dependencies.length > 0 && (
            <div>
              <h3 className="text-base md:text-lg text-gray-800 mb-2">Dependencies</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-600">⚠️</span>
                  <span className="text-sm text-yellow-800">This story depends on:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {story.dependencies.map(dep => (
                    <span key={dep} className="px-3 py-1 bg-white border border-yellow-300 rounded text-sm text-gray-700">
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Linked Items */}
          <div>
            <h3 className="text-base md:text-lg text-gray-800 mb-4">Linked Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Linked Bugs */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-800">🐛 Linked Bugs ({story.linkedBugs?.length || 0})</h4>
                  {onLinkBug && (
                    <div className="relative">
                      <button
                        onClick={() => setShowBugLinkDropdown(!showBugLinkDropdown)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                      >
                        + Link Bug
                      </button>
                      {showBugLinkDropdown && (
                        <div className="absolute right-0 top-8 z-10 bg-white border border-red-300 rounded-lg shadow-lg max-h-60 overflow-y-auto w-64">
                          {availableBugs.filter(b => !story.linkedBugs?.includes(b.id)).length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500">All bugs are linked</div>
                          ) : (
                            availableBugs.filter(b => !story.linkedBugs?.includes(b.id)).map((bug) => (
                              <div
                                key={bug.id}
                                onClick={() => {
                                  onLinkBug(bug.id);
                                  setShowBugLinkDropdown(false);
                                }}
                                className="px-3 py-2 hover:bg-red-100 cursor-pointer text-sm border-b border-gray-200"
                              >
                                <div className="font-medium text-gray-900">{bug.id}</div>
                                <div className="text-xs text-gray-600 truncate">{bug.title}</div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {story.linkedBugs && story.linkedBugs.length > 0 ? (
                    story.linkedBugs.map(bugId => {
                      const bug = availableBugs.find(b => b.id === bugId);
                      return (
                        <div
                          key={bugId}
                          className="flex items-center justify-between bg-white border border-red-200 rounded p-2"
                        >
                          <div className="flex-1 min-w-0">
                            <button
                              onClick={() => onNavigate?.('bugs', bugId)}
                              className="text-sm font-medium text-indigo-600 hover:underline cursor-pointer"
                            >
                              {bugId}
                            </button>
                            {bug && <div className="text-xs text-gray-600 truncate">{bug.title}</div>}
                          </div>
                          {onUnlinkBug && (
                            <button
                              onClick={() => onUnlinkBug(bugId)}
                              className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs flex-shrink-0"
                            >
                              Unlink
                            </button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-4">No bugs linked</div>
                  )}
                </div>
              </div>

              {/* Linked Test Cases */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-800">🧪 Linked Test Cases ({linkedTestCases.length})</h4>
                  {onLinkTestCase && (
                    <div className="relative">
                      <button
                        onClick={() => setShowTestCaseLinkDropdown(!showTestCaseLinkDropdown)}
                        className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-xs"
                      >
                        + Link Test
                      </button>
                      {showTestCaseLinkDropdown && (
                        <div className="absolute right-0 top-8 z-10 bg-white border border-purple-300 rounded-lg shadow-lg max-h-60 overflow-y-auto w-64">
                          {availableTestCases.filter(tc => tc.linkedStory !== story.id).length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500">All test cases are linked</div>
                          ) : (
                            availableTestCases.filter(tc => tc.linkedStory !== story.id).map((tc) => (
                              <div
                                key={tc.id}
                                onClick={() => {
                                  onLinkTestCase(tc.id);
                                  setShowTestCaseLinkDropdown(false);
                                }}
                                className="px-3 py-2 hover:bg-purple-100 cursor-pointer text-sm border-b border-gray-200"
                              >
                                <div className="font-medium text-gray-900">{tc.id}</div>
                                <div className="text-xs text-gray-600 truncate">{tc.title}</div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {linkedTestCases.length > 0 ? (
                    linkedTestCases.map(tc => (
                      <div
                        key={tc.id}
                        className="flex items-center justify-between bg-white border border-purple-200 rounded p-2"
                      >
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => onNavigate?.('tests', tc.id)}
                            className="text-sm font-medium text-indigo-600 hover:underline cursor-pointer"
                          >
                            {tc.id}
                          </button>
                          <div className="text-xs text-gray-600 truncate">{tc.title}</div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs mt-1 ${
                            tc.status === 'Pass' ? 'bg-green-100 text-green-800' :
                            tc.status === 'Fail' ? 'bg-red-100 text-red-800' :
                            tc.status === 'Blocked' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {tc.status}
                          </span>
                        </div>
                        {onUnlinkTestCase && (
                          <button
                            onClick={() => onUnlinkTestCase(tc.id)}
                            className="ml-2 px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-xs flex-shrink-0"
                          >
                            Unlink
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-4">No test cases linked</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {story.tags && story.tags.length > 0 && (
            <div>
              <h3 className="text-base md:text-lg text-gray-800 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {story.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800 border border-indigo-200"
                  >
                    🏷️ {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="pt-6 border-t border-gray-200">
            <CommentsSection
              comments={comments}
              onAddComment={handleAddComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
            />
          </div>

          {/* Activity Log */}
          <div className="pt-6 border-t border-gray-200">
            <ActivityLog activities={activities} />
          </div>
        </div>
      </div>
    </div>
  );
}
