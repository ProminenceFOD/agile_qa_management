import { Play } from 'lucide-react';

type TestStatus = 'Pass' | 'Fail' | 'Blocked' | 'Not Run';
type TestType = 'Functional' | 'Regression' | 'Integration' | 'Smoke' | 'Performance';

interface TestCase {
  id: string;
  title: string;
  description: string;
  type: TestType;
  steps: string[];
  expectedResults: string[];
  status: TestStatus;
  assignedTo?: string;
  linkedStory?: string;
  lastRun?: Date;
  executionTime?: number;
  priority: 'High' | 'Medium' | 'Low';
  isDraft?: boolean;
}

interface TestCaseViewProps {
  testCase: TestCase;
  onClose: () => void;
  onExecute: () => void;
  onEdit: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

export function TestCaseView({ testCase, onClose, onExecute, onEdit, onApprove, onReject }: TestCaseViewProps) {
  const getStatusColor = (status: TestStatus) => {
    switch (status) {
      case 'Pass':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Fail':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Blocked':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Not Run':
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getTypeColor = (type: TestType) => {
    switch (type) {
      case 'Functional':
        return 'bg-indigo-100 text-indigo-800';
      case 'Regression':
        return 'bg-purple-100 text-purple-800';
      case 'Integration':
        return 'bg-indigo-100 text-indigo-800';
      case 'Smoke':
        return 'bg-gray-100 text-gray-800';
      case 'Performance':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[60]"
        onClick={onClose}
      ></div>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 rounded-t-lg flex-shrink-0">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-500">{testCase.id}</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getTypeColor(testCase.type)}`}>
                  {testCase.type}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full border text-xs ${
                  testCase.isDraft
                    ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-200'
                    : getStatusColor(testCase.status)
                }`}>
                  {testCase.isDraft ? 'AI Sug.' : testCase.status}
                </span>
              </div>
              <h2 className="text-2xl text-gray-900 dark:text-white">{testCase.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl flex-shrink-0"
            >
              ×
            </button>
          </div>

          <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
              <div>
                <h3 className="text-lg text-gray-800 mb-2">Description</h3>
                <p className="text-gray-700">{testCase.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Priority</div>
                  <div className="text-gray-900">{testCase.priority}</div>
                </div>
                {testCase.assignedTo && (
                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                    <div className="text-sm text-gray-600 mb-1">Assigned To</div>
                    <div className="text-gray-900">{testCase.assignedTo}</div>
                  </div>
                )}
                {testCase.linkedStory && (
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="text-sm text-gray-600 mb-1">Linked Story</div>
                    <div className="text-indigo-600 font-medium">{testCase.linkedStory}</div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg text-gray-800 mb-3">Test Steps & Expected Results</h3>
                <div className="space-y-3">
                  {(testCase.steps || []).map((step, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex gap-3 items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="text-gray-900 font-medium">{step}</p>
                          {testCase.expectedResults && testCase.expectedResults[index] && (
                            <div className="bg-green-50 border border-green-200 rounded p-2">
                              <div className="text-xs text-green-800 font-medium mb-1">Expected Result:</div>
                              <p className="text-sm text-gray-700">{testCase.expectedResults[index]}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {testCase.lastRun && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg text-gray-800 mb-2">Last Run</h3>
                    <p className="text-gray-700">{new Date(testCase.lastRun).toLocaleString()}</p>
                  </div>
                  {testCase.executionTime && (
                    <div>
                      <h3 className="text-lg text-gray-800 mb-2">Execution Time</h3>
                      <p className="text-gray-700">{testCase.executionTime}s</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-white dark:bg-gray-800 rounded-b-lg flex-shrink-0">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              <button
                onClick={onEdit}
                className="btn btn-secondary btn-lg"
              >
                Edit
              </button>
              {testCase.isDraft ? (
                <>
                  <button
                    onClick={onReject}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-750 transition-colors font-medium flex items-center gap-1 animate-pulse"
                  >
                    ✕ Reject Suggestion
                  </button>
                  <button
                    onClick={onApprove}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-1"
                  >
                    ✓ Approve & Save
                  </button>
                </>
              ) : (
                <button
                  onClick={onExecute}
                  className="btn btn-success btn-lg"
                >
                  <Play className="w-4 h-4" />
                  Run Test
                </button>
              )}
            </div>
          </div>
        </div>
      </>
  );
}
