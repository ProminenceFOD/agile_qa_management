import { useState, useEffect } from 'react';
import { getData } from '../utils/supabaseStorage';
import { RichTextEditor } from './RichTextEditor';
import { toast } from 'sonner';

type BugSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

interface Story {
  id: string;
  title: string;
  qaSignOff: boolean;
  pmApproval: boolean;
}

interface Bug {
  id: string;
  title: string;
  description: string;
  severity: BugSeverity;
  status: 'Open' | 'In Progress' | 'Fixed' | 'Verified' | 'Closed' | 'Reopened';
  linkedStory?: string;
  foundBy: string;
  assignedTo?: string;
  createdAt: Date;
  resolvedAt?: Date;
  steps: string[];
  expectedBehavior: string;
  actualBehavior: string;
  environment?: string;
  attachments?: string[];
}

interface BugReportFormProps {
  onClose: () => void;
  onSubmit: (bug: Omit<Bug, 'id' | 'createdAt'>) => void;
  currentUser: string;
}

export function BugReportForm({ onClose, onSubmit, currentUser }: BugReportFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'Medium' as BugSeverity,
    linkedStory: '',
    assignedTo: '',
    assignedDeveloper: '',
    assignedTester: '',
    expectedBehavior: '',
    actualBehavior: '',
    environment: '',
  });

  const [steps, setSteps] = useState(['']);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [availableStories, setAvailableStories] = useState<Story[]>([]);

  useEffect(() => {
    // Load stories from Supabase
    const loadStories = async () => {
      const allStories = await getData('aqms_stories');
      if (allStories) {
        try {
          // Filter to show only stories that are ready (QA sign-off + PM approval)
          const readyStories = allStories.filter((story: any) =>
            story.qaSignOff === true && story.pmApproval === true
          );
          setAvailableStories(readyStories);
        } catch (e) {
          console.error('Error loading stories:', e);
        }
      }
    };

    loadStories();
  }, []);

  const handleAddStep = () => {
    setSteps([...steps, '']);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map(file => file.name);
      setAttachments([...attachments, ...fileNames]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a bug title');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter a bug description');
      return;
    }

    if (!formData.expectedBehavior.trim()) {
      toast.error('Please enter expected behavior');
      return;
    }

    if (!formData.actualBehavior.trim()) {
      toast.error('Please enter actual behavior');
      return;
    }

    const filteredSteps = steps.filter(s => s.trim() !== '');
    if (filteredSteps.length === 0) {
      toast.error('Please add at least one step to reproduce');
      return;
    }

    const bug: Omit<Bug, 'id' | 'createdAt'> = {
      title: formData.title,
      description: formData.description,
      severity: formData.severity,
      status: 'Open',
      linkedStory: formData.linkedStory || undefined,
      foundBy: currentUser,
      assignedTo: formData.assignedTo || undefined,
      assignedDeveloper: formData.assignedDeveloper || undefined,
      assignedTester: formData.assignedTester || undefined,
      steps: filteredSteps,
      expectedBehavior: formData.expectedBehavior,
      actualBehavior: formData.actualBehavior,
      environment: formData.environment || undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    onSubmit(bug);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 rounded-t-lg flex-shrink-0">
            <h2 className="text-2xl text-gray-900 dark:text-white">Report Bug</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl flex-shrink-0"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bug Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief description of the bug"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Detailed description of the bug - what's wrong and what's the impact?"
                minHeight="120px"
              />
            </div>

            {/* Severity and Linked Story */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as BugSeverity })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

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
                    ? 'Visit Stories tab to see approved stories'
                    : `${availableStories.length} approved ${availableStories.length === 1 ? 'story' : 'stories'} available`}
                </p>
              </div>
            </div>

            {/* Steps to Reproduce */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Steps to Reproduce <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-shrink-0 w-8 pt-2 text-sm text-gray-600">
                      {index + 1}.
                    </div>
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => handleStepChange(index, e.target.value)}
                      placeholder={`Step ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-700"
                      >
                        ✕
                      </button>
                    )}
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

            {/* Expected vs Actual Behavior */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Behavior <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.expectedBehavior}
                  onChange={(e) => setFormData({ ...formData, expectedBehavior: e.target.value })}
                  placeholder="What should happen?"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actual Behavior <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.actualBehavior}
                  onChange={(e) => setFormData({ ...formData, actualBehavior: e.target.value })}
                  placeholder="What actually happens?"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Environment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Environment (Optional)
              </label>
              <input
                type="text"
                value={formData.environment}
                onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                placeholder="e.g., Production, Staging, Chrome 120"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments / Evidence (Optional)
              </label>
              <div className="space-y-2">
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                        <span className="text-sm text-gray-700 flex-1">📎 {attachment}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <p className="text-xs text-gray-500">Upload screenshots, logs, or other evidence (images, PDFs, documents)</p>
              </div>
            </div>

            {/* Team Assignments */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Team Assignments (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Assign Developer
                  </label>
                  <select
                    value={formData.assignedDeveloper}
                    onChange={(e) => setFormData({ ...formData, assignedDeveloper: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">Unassigned</option>
                    <option value="James Anderson">James Anderson</option>
                    <option value="David Martinez">David Martinez</option>
                    <option value="Robert Taylor">Robert Taylor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Assign Tester
                  </label>
                  <select
                    value={formData.assignedTester}
                    onChange={(e) => setFormData({ ...formData, assignedTester: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">Unassigned</option>
                    <option value="Emily Chen">Emily Chen</option>
                    <option value="Jessica Williams">Jessica Williams</option>
                    <option value="Linda Thompson">Linda Thompson</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm text-indigo-800">
              <strong>Note:</strong> All bugs are created with "Open" status. You can update the status later from the bug tracker.
            </div>

            </div>

            {/* Form Actions */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-white dark:bg-gray-800 rounded-b-lg flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Report Bug
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
