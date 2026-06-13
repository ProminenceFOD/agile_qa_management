import { useState, useEffect, useRef } from 'react';
import { getData, setData } from '../utils/supabaseStorage';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { RichTextEditor } from './RichTextEditor';

type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

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
  tags?: string[];
  linkedBugs?: string[];
  status?: string;
  moduleId?: string;
}

interface Bug {
  id: string;
  title: string;
  description?: string;
  severity?: string;
  status?: string;
  linkedStory?: string;
}

interface TestCase {
  id: string;
  title: string;
  status?: string;
  linkedStory?: string;
}

interface StoryFormProps {
  story?: Story;
  onSave: (story: Story) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
  existingStories?: Story[];
}

// QA Reviewers with sign-off authority (pulled from User Management)
const QA_REVIEWERS = [
  'Damilola Ogunlade (Head of QA)',
  // Additional QA reviewers are configured in User Management
  // Only users with "canSignOffQA" permission appear here
];

const DEVELOPERS = [
  'James Martinez',
  'Emily Chen',
  'David Kumar',
  'Maria Rodriguez',
  'Robert Taylor',
];

const TESTERS = [
  'Damilola Ogunlade',
  'Linda Thompson',
  'Michael Brown',
  'Jennifer Lee',
];

const SPRINTS = ['Sprint 12', 'Sprint 13', 'Sprint 14', 'Backlog'];

export function StoryForm({ story, onSave, onCancel, mode, existingStories = [] }: StoryFormProps) {
  // Generate next Story ID for create mode
  const generateStoryId = () => {
    if (mode === 'edit' && story?.id) {
      return story.id;
    }

    // Find the highest existing US-XXX number
    const existingNumbers = existingStories
      .map(s => {
        const match = s.id.match(/^US-(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(n => n > 0);

    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    const nextNumber = maxNumber + 1;

    return `US-${String(nextNumber).padStart(3, '0')}`;
  };

  const { data: modules } = useSupabaseData<any[]>('aqms_modules', []);

  const [formData, setFormData] = useState<Story>({
    id: generateStoryId(),
    title: story?.title || '',
    description: story?.description || '',
    acceptanceCriteria: story?.acceptanceCriteria || false,
    qaSignOff: story?.qaSignOff || false,
    pmApproval: story?.pmApproval || false,
    criteriaDetails: story?.criteriaDetails || '',
    assignedQAReviewer: story?.assignedQAReviewer || '',
    assignedDeveloper: story?.assignedDeveloper || '',
    assignedTester: story?.assignedTester || '',
    priority: story?.priority || 'Medium',
    storyPoints: story?.storyPoints || undefined,
    sprint: story?.sprint || '',
    dependencies: story?.dependencies || [],
    comments: story?.comments || [],
    activityLog: story?.activityLog || [],
    createdAt: story?.createdAt || new Date(),
    updatedAt: new Date(),
    tags: story?.tags || [],
    linkedBugs: story?.linkedBugs || [],
    moduleId: story?.moduleId || '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedTags, setSelectedTags] = useState<string[]>(story?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [allTags, setAllTags] = useState<string[]>([]);

  // Bugs & Test Cases state
  const [availableBugs, setAvailableBugs] = useState<Bug[]>([]);
  const [allTestCases, setAllTestCases] = useState<TestCase[]>([]);
  const [linkedTestCaseIds, setLinkedTestCaseIds] = useState<string[]>([]);
  const [showBugDropdown, setShowBugDropdown] = useState(false);
  const [showTestCaseDropdown, setShowTestCaseDropdown] = useState(false);
  const [showCreateBugForm, setShowCreateBugForm] = useState(false);
  const [newBugTitle, setNewBugTitle] = useState('');
  const [newBugSeverity, setNewBugSeverity] = useState('Medium');
  const [newBugDescription, setNewBugDescription] = useState('');
  const [bugSearchTerm, setBugSearchTerm] = useState('');
  const [testCaseSearchTerm, setTestCaseSearchTerm] = useState('');
  const bugDropdownRef = useRef<HTMLDivElement>(null);
  const testDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bugDropdownRef.current && !bugDropdownRef.current.contains(e.target as Node)) {
        setShowBugDropdown(false);
      }
      if (testDropdownRef.current && !testDropdownRef.current.contains(e.target as Node)) {
        setShowTestCaseDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      // Load tags
      const tags = new Set<string>();
      try {
        const stories = await getData('aqms_stories');
        if (stories) stories.forEach((s: any) => s.tags?.forEach((t: string) => tags.add(t)));
        const bugs = await getData('aqms_bugs');
        if (bugs) {
          bugs.forEach((b: any) => b.tags?.forEach((t: string) => tags.add(t)));
          setAvailableBugs(bugs);
        }
        const testCases = await getData('aqms_test_cases');
        if (testCases) {
          setAllTestCases(testCases);
          const storyId = formData.id;
          setLinkedTestCaseIds(
            testCases.filter((tc: any) => tc.linkedStory === storyId).map((tc: any) => tc.id)
          );
        }
      } catch (e) {
        console.error('[StoryForm] Error loading data:', e);
      }
      setAllTags(Array.from(tags).sort());
    };
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Bug helpers ──────────────────────────────────────────────────────────────
  const handleLinkBug = (bugId: string) => {
    if (!formData.linkedBugs?.includes(bugId)) {
      setFormData(prev => ({ ...prev, linkedBugs: [...(prev.linkedBugs || []), bugId] }));
    }
    setShowBugDropdown(false);
  };

  const handleUnlinkBug = (bugId: string) => {
    setFormData(prev => ({ ...prev, linkedBugs: (prev.linkedBugs || []).filter(id => id !== bugId) }));
  };

  const handleCreateBug = async () => {
    if (!newBugTitle.trim()) return;
    try {
      const bugs = (await getData('aqms_bugs')) || [];
      const nums = bugs.map((b: any) => {
        const m = b.id?.match(/^BUG-(\d+)$/);
        return m ? parseInt(m[1]) : 0;
      });
      const nextId = `BUG-${String(Math.max(0, ...nums) + 1).padStart(3, '0')}`;
      const newBug: Bug = {
        id: nextId,
        title: newBugTitle.trim(),
        description: newBugDescription.trim(),
        severity: newBugSeverity,
        status: 'Open',
        linkedStory: formData.id,
      };
      bugs.push(newBug);
      await setData('aqms_bugs', bugs);
      setAvailableBugs(bugs);
      setFormData(prev => ({ ...prev, linkedBugs: [...(prev.linkedBugs || []), nextId] }));
      setNewBugTitle('');
      setNewBugDescription('');
      setNewBugSeverity('Medium');
      setShowCreateBugForm(false);
    } catch (e) {
      console.error('[StoryForm] Error creating bug:', e);
    }
  };

  // ── Test Case helpers ────────────────────────────────────────────────────────
  const handleLinkTestCase = async (tcId: string) => {
    try {
      const tcs = (await getData('aqms_test_cases')) || [];
      const updated = tcs.map((tc: any) => tc.id === tcId ? { ...tc, linkedStory: formData.id } : tc);
      await setData('aqms_test_cases', updated);
      setAllTestCases(updated);
      setLinkedTestCaseIds(prev => [...prev, tcId]);
    } catch (e) {
      console.error('[StoryForm] Error linking test case:', e);
    }
    setShowTestCaseDropdown(false);
  };

  const handleUnlinkTestCase = async (tcId: string) => {
    try {
      const tcs = (await getData('aqms_test_cases')) || [];
      const updated = tcs.map((tc: any) => tc.id === tcId ? { ...tc, linkedStory: undefined } : tc);
      await setData('aqms_test_cases', updated);
      setAllTestCases(updated);
      setLinkedTestCaseIds(prev => prev.filter(id => id !== tcId));
    } catch (e) {
      console.error('[StoryForm] Error unlinking test case:', e);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters (required for PM approval)';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters (required for PM approval)';
    }

    // Validate acceptance criteria if checkbox is checked
    if (formData.acceptanceCriteria) {
      // Strip HTML tags for validation
      const plainText = formData.criteriaDetails.replace(/<[^>]*>/g, '').trim();
      if (!plainText || plainText.length < 20) {
        newErrors.criteriaDetails = 'Acceptance Criteria details must be at least 20 characters (required for QA/PM sign-off)';
      } else {
        const lowerCriteria = plainText.toLowerCase();
        if (lowerCriteria.includes('todo') || lowerCriteria.includes('tbd')) {
          newErrors.criteriaDetails = 'Please replace TODO/TBD placeholder text with actual criteria';
        } else if (!lowerCriteria.includes('given') || !lowerCriteria.includes('when') || !lowerCriteria.includes('then')) {
          newErrors.criteriaDetails = 'Acceptance Criteria must follow Given/When/Then format (required for QA/PM sign-off)';
        }
      }
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;

    if (!isValid) {
      console.log('[StoryForm] Validation errors:', newErrors);
    }

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[StoryForm] Form submitted, starting validation...');

    if (!validateForm()) {
      console.log('[StoryForm] Validation failed');
      // Scroll to first error
      const firstErrorField = document.querySelector('.text-red-600');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    console.log('[StoryForm] Validation passed, preparing to save...');

    // Enforce quality gate: clear assignments if QA/PM approval not complete
    const cleanedData = { ...formData, tags: selectedTags, linkedBugs: formData.linkedBugs || [] };

    console.log('[StoryForm] Original story props:', {
      id: story?.id,
      qaSignOff: story?.qaSignOff,
      pmApproval: story?.pmApproval,
      acceptanceCriteria: story?.acceptanceCriteria,
    });

    console.log('[StoryForm] Form data before save:', {
      id: formData.id,
      qaSignOff: formData.qaSignOff,
      pmApproval: formData.pmApproval,
      acceptanceCriteria: formData.acceptanceCriteria,
    });

    console.log('[StoryForm] Cleaned data to be saved:', {
      id: cleanedData.id,
      qaSignOff: cleanedData.qaSignOff,
      pmApproval: cleanedData.pmApproval,
      acceptanceCriteria: cleanedData.acceptanceCriteria,
    });

    if (!formData.qaSignOff || !formData.pmApproval) {
      cleanedData.assignedDeveloper = '';
      cleanedData.assignedTester = '';
    }

    console.log('[StoryForm] Calling onSave with:', cleanedData);
    onSave(cleanedData);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-6">
          <h1 className="text-3xl mb-2">
            {mode === 'create' ? 'Create New Story' : 'Edit Story'}
          </h1>
          <p className="text-gray-600">
            {mode === 'create'
              ? 'Add a new user story to the sprint backlog'
              : 'Update story details and criteria'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">
              Story ID
            </label>
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-mono font-semibold">
              {formData.id}
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-gray-700 mb-2">
              Story Title * <span className="text-xs text-gray-500">(min 10 chars)</span>
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="User Authentication - Login Flow"
            />
            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-gray-700 mb-2">
              Description * <span className="text-xs text-gray-500">(min 20 chars)</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="As a user, I want to..."
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label htmlFor="criteriaDetails" className="block text-gray-700 mb-2">
              Acceptance Criteria Details *
            </label>
            <RichTextEditor
              value={formData.criteriaDetails}
              onChange={(value) => setFormData({ ...formData, criteriaDetails: value })}
              placeholder="Given a valid user account
When I enter correct credentials
Then I should be redirected to the dashboard
And my session should be maintained"
              minHeight="180px"
            />
            {errors.criteriaDetails && (
              <p className="text-red-600 text-sm mt-1">{errors.criteriaDetails}</p>
            )}
            <p className="text-xs text-gray-600 mt-1">
              ⚠️ Required for QA/PM sign-off: Must be 20+ characters, follow Given/When/Then format, and contain no placeholders (TODO/TBD)
            </p>
          </div>

          {/* Quality Gate Warning */}
          {(!formData.qaSignOff || !formData.pmApproval) && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Quality Gate Enforcement:</strong> Developer and Tester assignment is blocked until BOTH QA sign-off (by assigned QA Reviewer) and PM approval are completed.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="assignedDeveloper" className="block text-gray-700 mb-2">
                Assign Developer {(!formData.qaSignOff || !formData.pmApproval) && <span className="text-red-600">🔒</span>}
              </label>
              <select
                id="assignedDeveloper"
                value={formData.assignedDeveloper}
                onChange={(e) =>
                  setFormData({ ...formData, assignedDeveloper: e.target.value })
                }
                disabled={!formData.qaSignOff || !formData.pmApproval}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Unassigned</option>
                {DEVELOPERS.map((dev) => (
                  <option key={dev} value={dev}>
                    {dev}
                  </option>
                ))}
              </select>
              {(!formData.qaSignOff || !formData.pmApproval) && (
                <p className="text-xs text-red-600 mt-1">
                  Requires QA sign-off and PM approval first
                </p>
              )}
            </div>

            <div>
              <label htmlFor="assignedTester" className="block text-gray-700 mb-2">
                Assign Tester {(!formData.qaSignOff || !formData.pmApproval) && <span className="text-red-600">🔒</span>}
              </label>
              <select
                id="assignedTester"
                value={formData.assignedTester}
                onChange={(e) =>
                  setFormData({ ...formData, assignedTester: e.target.value })
                }
                disabled={!formData.qaSignOff || !formData.pmApproval}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Unassigned</option>
                {TESTERS.map((tester) => (
                  <option key={tester} value={tester}>
                    {tester}
                  </option>
                ))}
              </select>
              {(!formData.qaSignOff || !formData.pmApproval) && (
                <p className="text-xs text-red-600 mt-1">
                  Requires QA sign-off and PM approval first
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="priority" className="block text-gray-700 mb-2">
                Priority *
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as Priority })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label htmlFor="storyPoints" className="block text-gray-700 mb-2">
                Story Points
              </label>
              <select
                id="storyPoints"
                value={formData.storyPoints || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    storyPoints: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Not Estimated</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="8">8</option>
                <option value="13">13</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="sprint" className="block text-gray-700 mb-2">
                Sprint
              </label>
              <select
                id="sprint"
                value={formData.sprint}
                onChange={(e) => setFormData({ ...formData, sprint: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Unassigned</option>
                {SPRINTS.map((sprint) => (
                  <option key={sprint} value={sprint}>
                    {sprint}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="moduleId" className="block text-gray-700 mb-2">
                Risk Module
              </label>
              <select
                id="moduleId"
                value={formData.moduleId || ''}
                onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">No Module Linked</option>
                {modules.map((mod: any) => (
                  <option key={mod.id} value={mod.id}>
                    {mod.id} - {mod.name} ({mod.riskLevel} Risk)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Tags</label>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800 border border-indigo-200"
                  >
                    🏷️ {tag}
                    <button
                      type="button"
                      onClick={() => setSelectedTags(selectedTags.filter((_, i) => i !== idx))}
                      className="ml-1 text-indigo-600 hover:text-indigo-800"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Select existing...</option>
                {allTags.filter(tag => !selectedTags.includes(tag)).map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="acceptanceCriteria"
              type="checkbox"
              checked={formData.acceptanceCriteria}
              onChange={(e) =>
                setFormData({ ...formData, acceptanceCriteria: e.target.checked })
              }
              className="w-5 h-5 text-indigo-500 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="acceptanceCriteria" className="text-gray-700">
              Acceptance criteria complete
            </label>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quality Gate Assignment</h3>
            <div>
              <label htmlFor="assignedQAReviewer" className="block text-gray-700 mb-2">
                Assign QA Reviewer (for Sign-Off) *
              </label>
              <select
                id="assignedQAReviewer"
                value={formData.assignedQAReviewer}
                onChange={(e) =>
                  setFormData({ ...formData, assignedQAReviewer: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Select QA Reviewer</option>
                {QA_REVIEWERS.map((reviewer) => (
                  <option key={reviewer} value={reviewer}>
                    {reviewer}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Only the assigned QA Reviewer can provide QA sign-off on acceptance criteria
              </p>
            </div>
          </div>

          {/* ── Linked Items (Bugs & Test Cases) ──────────────────────── */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Linked Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Linked Bugs */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800">
                  🐛 Linked Bugs ({formData.linkedBugs?.length || 0})
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowCreateBugForm(true); setShowBugDropdown(false); }}
                    className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                  >
                    + Create Bug Ticket
                  </button>
                  <div className="relative" ref={bugDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowBugDropdown(v => !v)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                    >
                      + Link Existing
                    </button>
                    {showBugDropdown && (
                      <div className="absolute right-0 top-8 z-20 bg-white border border-red-200 rounded-lg shadow-lg max-h-56 overflow-y-auto w-72">
                        <input
                          type="text"
                          value={bugSearchTerm}
                          onChange={e => setBugSearchTerm(e.target.value)}
                          placeholder="Search bugs..."
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                        />
                        {availableBugs.filter(b => !formData.linkedBugs?.includes(b.id) && b.title.toLowerCase().includes(bugSearchTerm.toLowerCase())).length === 0 ? (
                          <div className="px-3 py-3 text-sm text-gray-500">All bugs are already linked</div>
                        ) : (
                          availableBugs
                            .filter(b => !formData.linkedBugs?.includes(b.id) && b.title.toLowerCase().includes(bugSearchTerm.toLowerCase()))
                            .map(bug => (
                              <div
                                key={bug.id}
                                onClick={() => handleLinkBug(bug.id)}
                                className="px-3 py-2 hover:bg-red-50 cursor-pointer text-sm border-b border-gray-100 last:border-0"
                              >
                                <span className="font-medium text-gray-900">{bug.id}</span>
                                <span className="text-gray-500"> — </span>
                                <span className="text-gray-700 truncate">{bug.title}</span>
                              </div>
                            ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick create bug form */}
              {showCreateBugForm && (
                <div className="mb-4 bg-white border border-red-200 rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800">New Bug Ticket</h4>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Title *</label>
                    <input
                      type="text"
                      value={newBugTitle}
                      onChange={e => setNewBugTitle(e.target.value)}
                      placeholder="Brief description of the bug"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Severity</label>
                      <select
                        value={newBugSeverity}
                        onChange={e => setNewBugSeverity(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                      >
                        <option>Critical</option>
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                    </div>
                    <div className="flex items-end gap-2">
                      <button
                        type="button"
                        onClick={handleCreateBug}
                        disabled={!newBugTitle.trim()}
                        className="flex-1 px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
                      >
                        Create &amp; Link
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowCreateBugForm(false); setNewBugTitle(''); setNewBugDescription(''); }}
                        className="px-3 py-2 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Description (optional)</label>
                    <textarea
                      rows={2}
                      value={newBugDescription}
                      onChange={e => setNewBugDescription(e.target.value)}
                      placeholder="Steps to reproduce, expected vs actual..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                </div>
              )}

              {/* Linked bugs list */}
              <div className="space-y-2">
                {(formData.linkedBugs || []).length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-3">No bugs linked to this story</div>
                ) : (
                  (formData.linkedBugs || []).map(bugId => {
                    const bug = availableBugs.find(b => b.id === bugId);
                    return (
                      <div key={bugId} className="flex items-center justify-between bg-white border border-red-200 rounded p-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-red-700">{bugId}</span>
                          {bug && <span className="text-xs text-gray-600 ml-2 truncate">{bug.title}</span>}
                          {bug?.severity && (
                            <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs ${
                              bug.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                              bug.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                              bug.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-600'
                            }`}>{bug.severity}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUnlinkBug(bugId)}
                          className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded"
                        >
                          Unlink
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

              {/* Linked Test Cases */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800">
                  🧪 Linked Test Cases ({linkedTestCaseIds.length})
                </h3>
                <div className="relative" ref={testDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowTestCaseDropdown(v => !v)}
                    className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
                  >
                    + Link Test Case
                  </button>
                  {showTestCaseDropdown && (
                    <div className="absolute right-0 top-8 z-20 bg-white border border-purple-200 rounded-lg shadow-lg max-h-56 overflow-y-auto w-72">
                      <input
                        type="text"
                        value={testCaseSearchTerm}
                        onChange={e => setTestCaseSearchTerm(e.target.value)}
                        placeholder="Search test cases..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                      {allTestCases.filter(tc => !linkedTestCaseIds.includes(tc.id) && tc.title.toLowerCase().includes(testCaseSearchTerm.toLowerCase())).length === 0 ? (
                        <div className="px-3 py-3 text-sm text-gray-500">No unlinked test cases available</div>
                      ) : (
                        allTestCases
                          .filter(tc => !linkedTestCaseIds.includes(tc.id) && tc.title.toLowerCase().includes(testCaseSearchTerm.toLowerCase()))
                          .map(tc => (
                            <div
                              key={tc.id}
                              onClick={() => handleLinkTestCase(tc.id)}
                              className="px-3 py-2 hover:bg-purple-50 cursor-pointer text-sm border-b border-gray-100 last:border-0"
                            >
                              <span className="font-medium text-gray-900">{tc.id}</span>
                              <span className="text-gray-500"> — </span>
                              <span className="text-gray-700 truncate">{tc.title}</span>
                            </div>
                          ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {linkedTestCaseIds.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-3">No test cases linked to this story</div>
                ) : (
                  linkedTestCaseIds.map(tcId => {
                    const tc = allTestCases.find(t => t.id === tcId);
                    return (
                      <div key={tcId} className="flex items-center justify-between bg-white border border-purple-200 rounded p-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-purple-700">{tcId}</span>
                          {tc && <span className="text-xs text-gray-600 ml-2 truncate">{tc.title}</span>}
                          {tc?.status && (
                            <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs ${
                              tc.status === 'Pass' ? 'bg-green-100 text-green-800' :
                              tc.status === 'Fail' ? 'bg-red-100 text-red-800' :
                              tc.status === 'Blocked' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-600'
                            }`}>{tc.status}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUnlinkTestCase(tcId)}
                          className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 rounded"
                        >
                          Unlink
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              {mode === 'create' ? 'Create Story' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}