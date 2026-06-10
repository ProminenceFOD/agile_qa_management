import { useState, useEffect } from 'react';
import { NotificationModal } from './NotificationModal';
import { getData } from '../utils/supabaseStorage';

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
}

interface Bug {
  id: string;
  title: string;
  severity: string;
  status: string;
  linkedStory?: string;
}

interface TestCaseExecuteProps {
  testCase: TestCase;
  onClose: () => void;
  onComplete: (result: TestStatus, notes?: string) => void;
  onCreateBug?: (testCase: TestCase, notes: string) => void;
}

export function TestCaseExecute({ testCase, onClose, onComplete, onCreateBug }: TestCaseExecuteProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(new Array(testCase.steps.length).fill(false));
  const [testResult, setTestResult] = useState<TestStatus>('Not Run');
  const [notes, setNotes] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [linkedBugs, setLinkedBugs] = useState<string[]>([]);
  const [existingBugs, setExistingBugs] = useState<Bug[]>([]);
  const [showBugDropdown, setShowBugDropdown] = useState(false);
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'warning' as const });

  // Load existing bugs
  useEffect(() => {
    const loadBugs = async () => {
      const bugs = await getData('aqms_bugs');
      if (bugs) {
        setExistingBugs(bugs);
      }
    };
    loadBugs();
  }, []);

  const handleSelectBug = (bugId: string) => {
    if (!linkedBugs.includes(bugId)) {
      setLinkedBugs([...linkedBugs, bugId]);
    }
    setShowBugDropdown(false);
  };

  const handleRemoveBug = (bugId: string) => {
    setLinkedBugs(linkedBugs.filter(b => b !== bugId));
  };

  const handleCreateNewBug = () => {
    if (onCreateBug) {
      onCreateBug(testCase, notes);
    }
  };

  // Filter bugs - show open bugs, prioritize those linked to same story
  const availableBugs = existingBugs.filter(bug =>
    !linkedBugs.includes(bug.id) &&
    (bug.status === 'Open' || bug.status === 'In Progress' || bug.status === 'Reopened')
  ).sort((a, b) => {
    // Prioritize bugs linked to the same story
    if (a.linkedStory === testCase.linkedStory && b.linkedStory !== testCase.linkedStory) return -1;
    if (b.linkedStory === testCase.linkedStory && a.linkedStory !== testCase.linkedStory) return 1;
    return 0;
  });

  const handleStepComplete = (index: number) => {
    const newCompleted = [...completedSteps];
    newCompleted[index] = true;
    setCompletedSteps(newCompleted);

    if (index < testCase.steps.length - 1) {
      setCurrentStep(index + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleCompleteAll = () => {
    const allCompleted = new Array(testCase.steps.length).fill(true);
    setCompletedSteps(allCompleted);
    setShowSummary(true);
  };

  const handleSubmit = () => {
    if (testResult === 'Not Run') {
      setNotification({
        isOpen: true,
        title: 'Required Field',
        message: 'Please select a test result (Pass/Fail/Blocked)',
        type: 'warning',
      });
      return;
    }
    setShowSuccess(true);
    setTimeout(() => {
      onComplete(testResult, notes);
    }, 1500);
  };

  const allStepsCompleted = completedSteps.every(step => step);

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[60]"
        onClick={onClose}
      ></div>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 rounded-t-lg flex-shrink-0">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-500">{testCase.id}</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 dark:bg-green-950/45 text-green-800 dark:text-green-200 text-xs">
                  Running Test
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
            {showSuccess ? (
              <div className="text-center py-12">
                <div className="text-green-500 text-7xl mb-6">✓</div>
                <h3 className="text-3xl text-gray-900 dark:text-white mb-3">Test Result Submitted!</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                  Test case <span className="font-medium text-indigo-600 dark:text-indigo-400">{testCase.id}</span> completed with result:{' '}
                  <span className={`font-medium ${
                    testResult === 'Pass' ? 'text-green-600' :
                    testResult === 'Fail' ? 'text-red-600' :
                    'text-orange-600'
                  }`}>
                    {testResult}
                  </span>
                </p>
                <div className="mt-6">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
              </div>
            ) : !showSummary ? (
              <>
                <div>
                  <h3 className="text-lg text-gray-800 dark:text-gray-200 mb-2 font-semibold">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300">{testCase.description}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg text-gray-800 dark:text-gray-200 font-semibold">Test Steps</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {completedSteps.filter(s => s).length} / {testCase.steps.length} completed
                    </div>
                  </div>
                  <div className="space-y-3">
                    {testCase.steps.map((step, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 transition-all ${
                          index === currentStep
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
                            : completedSteps[index]
                            ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                              completedSteps[index]
                                ? 'bg-green-500 text-white'
                                : index === currentStep
                                ? 'bg-indigo-500 text-white'
                                : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {completedSteps[index] ? '✓' : index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900 dark:text-white font-medium mb-2">{step}</p>
                            {testCase.expectedResults[index] && (
                              <div className="mt-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded p-2">
                                <div className="text-xs text-green-800 dark:text-green-300 font-medium mb-1">Expected Result:</div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{testCase.expectedResults[index]}</p>
                              </div>
                            )}
                          </div>
                          {index === currentStep && !completedSteps[index] && (
                            <button
                              onClick={() => handleStepComplete(index)}
                              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm flex-shrink-0 font-medium"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center py-6">
                  <div className="text-green-500 text-6xl mb-4">✓</div>
                  <h3 className="text-2xl text-gray-900 dark:text-white mb-2">All Steps Completed</h3>
                  <p className="text-gray-600 dark:text-gray-400">Please record the test result</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Test Result <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setTestResult('Pass')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                        testResult === 'Pass'
                          ? 'border-green-500 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-200'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-300 dark:hover:border-green-800'
                      }`}
                    >
                      ✓ Pass
                    </button>
                    <button
                      onClick={() => setTestResult('Fail')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                        testResult === 'Fail'
                          ? 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-300 dark:hover:border-red-800'
                      }`}
                    >
                      ✗ Fail
                    </button>
                    <button
                      onClick={() => setTestResult('Blocked')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                        testResult === 'Blocked'
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-800 dark:text-orange-200'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-orange-300 dark:hover:border-orange-800'
                      }`}
                    >
                      ⊘ Blocked
                    </button>
                  </div>
                </div>

                {testResult === 'Fail' && onCreateBug && (
                  <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800/60 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-red-900 dark:text-red-200 mb-1">Test Failed - Create Bug Ticket</h4>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          This test has failed. You can create a bug ticket with pre-filled information from this test case.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (onCreateBug) {
                            onCreateBug(testCase, notes);
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex-shrink-0 flex items-center gap-2 font-medium"
                      >
                        <span>🐛</span>
                        <span>Create Bug</span>
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Link Bugs (Optional)
                  </label>

                  {/* Linked Bugs Display */}
                  {linkedBugs.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {linkedBugs.map(bugId => {
                        const bug = existingBugs.find(b => b.id === bugId);
                        return (
                          <div key={bugId} className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-200 rounded-lg border border-red-200 dark:border-red-900/40">
                            <div>
                              <span className="text-sm font-medium">{bugId}</span>
                              {bug && (
                                <div className="text-xs text-red-700 dark:text-red-300">{bug.title}</div>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveBug(bugId)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-bold ml-2 text-lg"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Bug Action Buttons */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <button
                        type="button"
                        onClick={() => setShowBugDropdown(!showBugDropdown)}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:border-indigo-500 transition-colors flex items-center justify-between"
                      >
                        <span>Select Existing Bug</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{availableBugs.length} available</span>
                      </button>

                      {/* Dropdown */}
                      {showBugDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10 custom-scrollbar">
                          {availableBugs.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                              No available bugs found
                            </div>
                          ) : (
                            availableBugs.map(bug => (
                              <button
                                key={bug.id}
                                type="button"
                                onClick={() => handleSelectBug(bug.id)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-0 transition-colors"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-white">{bug.id}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{bug.title}</div>
                                    {bug.linkedStory === testCase.linkedStory && (
                                      <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                                        📎 Same story ({bug.linkedStory})
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-2">
                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                                      bug.severity === 'Critical' ? 'bg-red-100 dark:bg-red-950/45 text-red-800 dark:text-red-200' :
                                      bug.severity === 'High' ? 'bg-orange-100 dark:bg-orange-950/45 text-orange-800 dark:text-orange-200' :
                                      bug.severity === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-950/45 text-yellow-800 dark:text-yellow-200' :
                                      'bg-green-100 dark:bg-green-950/45 text-green-800 dark:text-green-200'
                                    }`}>
                                      {bug.severity}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    {onCreateBug && (
                      <button
                        type="button"
                        onClick={handleCreateNewBug}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 whitespace-nowrap font-medium"
                      >
                        <span>🐛</span>
                        <span>Create New Bug</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Select from {availableBugs.length} existing bugs or create a new one
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes / Comments (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any observations, issues, or comments about this test run..."
                    rows={4}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
              </>
            )}
          </div>

          {!showSuccess && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between bg-white dark:bg-gray-800 rounded-b-lg flex-shrink-0">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
              {showSummary ? (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  Submit Result
                </button>
              ) : (
                <button
                  onClick={handleCompleteAll}
                  className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium"
                >
                  {allStepsCompleted ? 'Record Result' : 'Complete All Steps'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </>
  );
}
