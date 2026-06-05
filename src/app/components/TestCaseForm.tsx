import { useState, useEffect } from 'react';
import { getData } from '../utils/supabaseStorage';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { toast } from 'sonner';

type TestStatus = 'Pass' | 'Fail' | 'Blocked' | 'Not Run';
type TestType = 'Functional' | 'Regression' | 'Integration' | 'Smoke' | 'Performance';

interface Story {
  id: string;
  title: string;
  qaSignOff: boolean;
  pmApproval: boolean;
}

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

interface TestCaseFormProps {
  onClose: () => void;
  onSubmit: (testCase: Omit<TestCase, 'id' | 'lastRun' | 'executionTime'>) => void;
  testCase?: TestCase;
}

export function TestCaseForm({ onClose, onSubmit, testCase }: TestCaseFormProps) {
  const [formData, setFormData] = useState({
    title: testCase?.title || '',
    description: testCase?.description || '',
    type: testCase?.type || 'Functional' as TestType,
    status: testCase?.status || 'Not Run' as TestStatus,
    assignedTo: testCase?.assignedTo || '',
    linkedStory: testCase?.linkedStory || '',
    priority: testCase?.priority || 'Medium' as 'High' | 'Medium' | 'Low',
  });

  const [steps, setSteps] = useState<string[]>(testCase?.steps || ['']);
  const [expectedResults, setExpectedResults] = useState<string[]>(testCase?.expectedResults || ['']);

  // Default approved stories to show immediately
  const defaultStories = [
    { id: 'US-101', title: 'User Authentication - Login Flow', qaSignOff: true, pmApproval: true },
    { id: 'US-102', title: 'Payment Gateway Integration', qaSignOff: true, pmApproval: true },
    { id: 'US-103', title: 'Dashboard Analytics Widget', qaSignOff: true, pmApproval: true },
    { id: 'US-104', title: 'User Profile Update Feature', qaSignOff: true, pmApproval: true },
    { id: 'US-105', title: 'Email Notification System', qaSignOff: true, pmApproval: true },
    { id: 'US-106', title: 'Search Functionality Enhancement', qaSignOff: true, pmApproval: true },
  ];

  // Use Supabase hook to get all stories, defaulting to approved stories
  const { data: allStories } = useSupabaseData<any[]>('aqms_stories', defaultStories);

  // Filter to show only stories with both QA sign-off and PM approval
  const availableStories = allStories.filter((story: any) =>
    story.qaSignOff === true && story.pmApproval === true
  );

  const handleAddStep = () => {
    setSteps([...steps, '']);
    setExpectedResults([...expectedResults, '']);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
      setExpectedResults(expectedResults.filter((_, i) => i !== index));
    }
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleExpectedResultChange = (index: number, value: string) => {
    const newExpectedResults = [...expectedResults];
    newExpectedResults[index] = value;
    setExpectedResults(newExpectedResults);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a test case title');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter a test case description');
      return;
    }

    const filteredSteps = steps.filter(s => s.trim() !== '');
    if (filteredSteps.length === 0) {
      toast.error('Please add at least one test step');
      return;
    }

    const filteredResults = expectedResults.filter((_, index) => steps[index].trim() !== '');
    if (filteredResults.some(r => !r.trim())) {
      toast.error('Please enter expected result for all test steps');
      return;
    }

    const newTestCase: Omit<TestCase, 'id' | 'lastRun' | 'executionTime'> = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      steps: filteredSteps,
      expectedResults: filteredResults,
      status: formData.status,
      assignedTo: formData.assignedTo || undefined,
      linkedStory: formData.linkedStory || undefined,
      priority: formData.priority,
    };

    onSubmit(newTestCase);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[60]"
        onClick={onClose}
      ></div>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full my-8">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-lg">
            <h2 className="text-2xl text-gray-900">
              {testCase ? 'Edit Test Case' : 'Create Test Case'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Case Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief description of what is being tested"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the test case"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Type, Priority, and Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as TestType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Functional">Functional</option>
                  <option value="Regression">Regression</option>
                  <option value="Integration">Integration</option>
                  <option value="Smoke">Smoke</option>
                  <option value="Performance">Performance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'High' | 'Medium' | 'Low' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TestStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Not Run">Not Run</option>
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
            </div>

            {/* Test Steps with Expected Results */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Steps & Expected Results <span className="text-red-500">*</span>
              </label>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex gap-2 items-start mb-2">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={step}
                          onChange={(e) => handleStepChange(index, e.target.value)}
                          placeholder={`Test Step ${index + 1}`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                        <input
                          type="text"
                          value={expectedResults[index] || ''}
                          onChange={(e) => handleExpectedResultChange(index, e.target.value)}
                          placeholder={`Expected result for step ${index + 1}`}
                          className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-50"
                        />
                      </div>
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-700 flex-shrink-0"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddStep}
                className="mt-2 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700"
              >
                + Add Step
              </button>
            </div>

            {/* Linked Story and Assigned To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Linked Story (Optional)
                </label>
                <select
                  value={formData.linkedStory}
                  onChange={(e) => setFormData({ ...formData, linkedStory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">
                    {availableStories.length === 0
                      ? 'No approved stories available'
                      : 'No Story Linked'}
                  </option>
                  {availableStories.map((story) => (
                    <option key={story.id} value={story.id}>
                      {story.id} - {story.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {availableStories.length === 0
                    ? 'No approved stories found. Stories require both QA sign-off and PM approval.'
                    : `${availableStories.length} approved ${availableStories.length === 1 ? 'story' : 'stories'} available`}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign To (Optional)
                </label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Unassigned</option>
                  <option value="Damilola Ogunlade">Damilola Ogunlade</option>
                  <option value="Emily Chen">Emily Chen</option>
                  <option value="Linda Thompson">Linda Thompson</option>
                  <option value="Michael Brown">Michael Brown</option>
                </select>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm text-indigo-800">
              <strong>Note:</strong> Test cases can be executed from the test case list. Execution time and last run date will be tracked automatically.
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                {testCase ? 'Update Test Case' : 'Create Test Case'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
