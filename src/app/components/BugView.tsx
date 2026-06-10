import { useState, useEffect } from 'react';
import { Edit3, ArrowLeft, X } from 'lucide-react';
import { CommentsSection } from './CommentsSection';
import { useAuth } from '../contexts/AuthContext';

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
  tags?: string[];
  comments?: Comment[];
}

interface BugViewProps {
  bug: Bug;
  onBack: () => void;
  onEdit?: () => void;
  onAssignDeveloper?: (developer: string) => void;
  onAssignTester?: (tester: string) => void;
  onUpdateComments?: (bugId: string, comments: Comment[]) => void;
}

export function BugView({ bug, onBack, onEdit, onAssignDeveloper, onAssignTester, onUpdateComments }: BugViewProps) {
  const { user } = useAuth();
  const [showDeveloperDropdown, setShowDeveloperDropdown] = useState(false);
  const [showTesterDropdown, setShowTesterDropdown] = useState(false);
  const [comments, setComments] = useState<Comment[]>(bug.comments || []);

  useEffect(() => {
    setComments(bug.comments || []);
  }, [bug.id, bug.comments]);

  const handleAddComment = (text: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      author: user?.name || 'Unknown',
      text,
      timestamp: new Date(),
    };
    const updated = [...comments, newComment];
    setComments(updated);
    if (onUpdateComments) {
      onUpdateComments(bug.id, updated);
    }
  };

  const handleEditComment = (id: string, text: string) => {
    const updated = comments.map(c =>
      c.id === id ? { ...c, text, edited: true } : c
    );
    setComments(updated);
    if (onUpdateComments) {
      onUpdateComments(bug.id, updated);
    }
  };

  const handleDeleteComment = (id: string) => {
    const updated = comments.filter(c => c.id !== id);
    setComments(updated);
    if (onUpdateComments) {
      onUpdateComments(bug.id, updated);
    }
  };

  const developers = ['James Martinez', 'David Martinez', 'Emily Chen', 'Maria Rodriguez', 'Robert Taylor'];
  const testers = ['Linda Thompson', 'Emily Chen', 'Jessica Williams', 'Michael Brown'];

  const getSeverityColor = (severity: Bug['severity']) => {
    switch (severity) {
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

  const getStatusColor = (status: Bug['status']) => {
    switch (status) {
      case 'Open':
        return 'bg-red-100 text-red-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Fixed':
        return 'bg-indigo-100 text-indigo-800';
      case 'Verified':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-600';
      case 'Reopened':
        return 'bg-orange-100 text-orange-800';
    }
  };

  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-gray-800 rounded-t-lg flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-indigo-500 hover:text-indigo-600 text-sm md:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </button>
        <div className="flex items-center gap-3">
          {onEdit && (
            <button
              onClick={onEdit}
              className="btn btn-primary"
            >
              <Edit3 className="w-4 h-4" />
              Edit Bug
            </button>
          )}
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="p-4 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <span className="text-sm text-gray-500">{bug.id}</span>
              <h1 className="text-2xl md:text-3xl text-gray-900 mt-1">{bug.title}</h1>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <span
                className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs md:text-sm border ${getSeverityColor(
                  bug.severity
                )}`}
              >
                {bug.severity}
              </span>
              <span
                className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs md:text-sm ${getStatusColor(
                  bug.status
                )}`}
              >
                {bug.status}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-base md:text-lg text-gray-800 mb-2">Description</h3>
            <style>{`
              .bug-description h1, .bug-description h2, .bug-description h3 {
                font-weight: 600;
                margin-top: 1rem;
                margin-bottom: 0.5rem;
              }
              .bug-description h1 { font-size: 1.5rem; }
              .bug-description h2 { font-size: 1.25rem; }
              .bug-description h3 { font-size: 1.1rem; }
              .bug-description p { margin-bottom: 0.75rem; }
              .bug-description ul, .bug-description ol {
                margin-left: 1.5rem;
                margin-bottom: 0.75rem;
              }
              .bug-description ul { list-style-type: disc; }
              .bug-description ol { list-style-type: decimal; }
              .bug-description li { margin-bottom: 0.25rem; }
              .bug-description strong { font-weight: 600; }
              .bug-description em { font-style: italic; }
              .bug-description blockquote {
                border-left: 4px solid #e5e7eb;
                padding-left: 1rem;
                margin: 0.75rem 0;
                color: #6b7280;
              }
              .bug-description code {
                background: #f3f4f6;
                padding: 0.125rem 0.25rem;
                border-radius: 0.25rem;
                font-family: monospace;
                font-size: 0.875em;
              }
              .bug-description pre {
                background: #1f2937;
                color: #f9fafb;
                padding: 1rem;
                border-radius: 0.5rem;
                overflow-x: auto;
                margin: 0.75rem 0;
              }
              .bug-description a {
                color: #4f46e5;
                text-decoration: underline;
              }
            `}</style>
            <div
              className="bug-description text-gray-700"
              dangerouslySetInnerHTML={{ __html: bug.description }}
            />
          </div>

          {bug.linkedStory && (
            <div>
              <h3 className="text-base md:text-lg text-gray-800 mb-2">Linked Story</h3>
              <div className="inline-flex items-center px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg">
                <span className="text-indigo-800 font-medium">{bug.linkedStory}</span>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-base md:text-lg text-gray-800 mb-4">Team Assignments</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-2">Found By</div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-500 text-white flex items-center justify-center text-xs">
                    {bug.foundBy.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-gray-900 text-sm">{bug.foundBy}</span>
                </div>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <div className="text-sm text-gray-600 mb-2">Assigned Developer</div>
                {bug.assignedDeveloper ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs">
                        {bug.assignedDeveloper.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-gray-900 text-sm">{bug.assignedDeveloper}</span>
                    </div>
                    {onAssignDeveloper && (
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
                    <span className="text-gray-400 text-sm">No developer assigned</span>
                    {onAssignDeveloper && (
                      <button
                        onClick={() => setShowDeveloperDropdown(!showDeveloperDropdown)}
                        className="px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-xs"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                )}
                {showDeveloperDropdown && onAssignDeveloper && (
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
                    {bug.assignedDeveloper && (
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
                {bug.assignedTester ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">
                        {bug.assignedTester.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-gray-900 text-sm">{bug.assignedTester}</span>
                    </div>
                    {onAssignTester && (
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
                    <span className="text-gray-400 text-sm">No tester assigned</span>
                    {onAssignTester && (
                      <button
                        onClick={() => setShowTesterDropdown(!showTesterDropdown)}
                        className="px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-xs"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                )}
                {showTesterDropdown && onAssignTester && (
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
                    {bug.assignedTester && (
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

          <div>
            <h3 className="text-base md:text-lg text-gray-800 mb-2">Steps to Reproduce</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              {bug.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base md:text-lg text-gray-800 mb-2">Expected Behavior</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-gray-700">{bug.expectedBehavior}</p>
              </div>
            </div>
            <div>
              <h3 className="text-base md:text-lg text-gray-800 mb-2">Actual Behavior</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-gray-700">{bug.actualBehavior}</p>
              </div>
            </div>
          </div>

          {bug.environment && (
            <div>
              <h3 className="text-base md:text-lg text-gray-800 mb-2">Environment</h3>
              <p className="text-gray-700">{bug.environment}</p>
            </div>
          )}

          {bug.attachments && bug.attachments.length > 0 && (
            <div>
              <h3 className="text-base md:text-lg text-gray-800 mb-2">Attachments</h3>
              <div className="space-y-2">
                {bug.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-700">📎 {attachment}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {bug.tags && bug.tags.length > 0 && (
            <div>
              <h3 className="text-base md:text-lg text-gray-800 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {bug.tags.map((tag, idx) => (
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base md:text-lg text-gray-800 mb-2">Created</h3>
              <p className="text-gray-700">{new Date(bug.createdAt).toLocaleString()}</p>
            </div>
            {bug.resolvedAt && (
              <div>
                <h3 className="text-base md:text-lg text-gray-800 mb-2">Resolved</h3>
                <p className="text-gray-700">{new Date(bug.resolvedAt).toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="pt-6 border-t border-gray-200 mt-6">
            <CommentsSection
              comments={comments}
              onAddComment={handleAddComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
