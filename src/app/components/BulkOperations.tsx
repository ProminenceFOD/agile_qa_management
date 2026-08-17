import { useState } from 'react';
import { Modal } from './Modal';
import { useModal } from '../hooks/useModal';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { defaultStories, defaultBugs, defaultTestCases } from '../utils/defaultData';

type EntityType = 'stories' | 'bugs' | 'testcases';
type BulkAction = 'assign' | 'status' | 'priority' | 'sprint' | 'delete';

interface Story {
  id: string;
  title: string;
  priority: string;
  sprint?: string;
  assignedDeveloper?: string;
  assignedTester?: string;
  status?: string;
}

interface Bug {
  id: string;
  title: string;
  severity: string;
  status: string;
  assignedTo?: string;
}

interface TestCase {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignedTo?: string;
}

export function BulkOperations() {
  const { modalState, showAlert, showSuccess, showConfirm, closeModal } =
    useModal();
  const [entityType, setEntityType] = useState<EntityType>('stories');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<BulkAction>('assign');
  const [actionValue, setActionValue] = useState('');

  // Use Supabase data hook with fallbacks to guarantee data is never empty
  const { data: stories, setData: setStories } = useSupabaseData<Story[]>(
    'aqms_stories',
    defaultStories
  );
  const { data: bugs, setData: setBugs } = useSupabaseData<Bug[]>(
    'aqms_bugs',
    defaultBugs
  );
  const { data: testCases, setData: setTestCases } = useSupabaseData<TestCase[]>(
    'aqms_test_cases',
    defaultTestCases
  );
  const { data: users } = useSupabaseData<any[]>('aqms_users', []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentItems = getCurrentItems();
    if (selectedItems.size === currentItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(currentItems.map((item) => item.id)));
    }
  };

  const handleToggleItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const getCurrentItems = () => {
    switch (entityType) {
      case 'stories':
        return stories || [];
      case 'bugs':
        return bugs || [];
      case 'testcases':
        return testCases || [];
    }
  };

  const handleApplyBulkAction = () => {
    if (selectedItems.size === 0) {
      showAlert('Please select at least one item');
      return;
    }

    if (!actionValue && bulkAction !== 'delete') {
      showAlert('Please enter a value for the action');
      return;
    }

    showConfirm(
      `Are you sure you want to apply "${bulkAction}" to ${selectedItems.size} item(s)?`,
      () => {
        applyAction();
      },
      'Confirm Bulk Action',
      'Apply',
      'Cancel'
    );
  };

  const applyAction = async () => {
    const selectedIds = Array.from(selectedItems);

    if (entityType === 'stories') {
      if (bulkAction === 'delete') {
        const filtered = stories.filter((s) => !selectedIds.includes(s.id));
        setStories(filtered);
      } else {
        const updated = stories.map((story) => {
          if (!selectedIds.includes(story.id)) return story;
          switch (bulkAction) {
            case 'assign':
              return { ...story, assignedDeveloper: actionValue };
            case 'status':
              return { ...story, status: actionValue };
            case 'priority':
              return { ...story, priority: actionValue };
            case 'sprint':
              return { ...story, sprint: actionValue };
            default:
              return story;
          }
        });
        setStories(updated);
      }
    } else if (entityType === 'bugs') {
      if (bulkAction === 'delete') {
        const filtered = bugs.filter((b) => !selectedIds.includes(b.id));
        setBugs(filtered);
      } else {
        const updated = bugs.map((bug) => {
          if (!selectedIds.includes(bug.id)) return bug;
          switch (bulkAction) {
            case 'assign':
              return { ...bug, assignedTo: actionValue };
            case 'status':
              return { ...bug, status: actionValue };
            case 'priority':
              return { ...bug, severity: actionValue };
            default:
              return bug;
          }
        });
        setBugs(updated);
      }
    } else if (entityType === 'testcases') {
      if (bulkAction === 'delete') {
        const filtered = testCases.filter((tc) => !selectedIds.includes(tc.id));
        setTestCases(filtered);
      } else {
        const updated = testCases.map((tc) => {
          if (!selectedIds.includes(tc.id)) return tc;
          switch (bulkAction) {
            case 'assign':
              return { ...tc, assignedTo: actionValue };
            case 'status':
              return { ...tc, status: actionValue };
            case 'priority':
              return { ...tc, priority: actionValue };
            default:
              return tc;
          }
        });
        setTestCases(updated);
      }
    }

    setSelectedItems(new Set());
    setActionValue('');
    showSuccess(`Bulk action applied to ${selectedIds.length} item(s)`);
  };

  const currentItems = getCurrentItems();
  const allSelected =
    selectedItems.size === currentItems.length && currentItems.length > 0;

  // Derive dynamic user list from aqms_users (or fallback list)
  const assignees =
    users && users.length > 0
      ? users.map((u) => u.name || u.email).filter(Boolean)
      : [
          'Damilola Ogunlade',
          'Sarah Johnson',
          'Mike Williams',
          'James Martinez',
          'Emily Chen',
          'David Kumar',
          'Jessica Williams',
          'Maria Rodriguez',
          'Robert Taylor',
          'Linda Thompson',
          'Michael Brown',
          'Jennifer Lee',
        ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Bulk Operations</h1>
        <p className="text-gray-600">Apply actions to multiple items at once</p>
      </div>

      {/* Entity Type Selector */}
      <div className="mb-6 flex gap-2">
        {(['stories', 'bugs', 'testcases'] as const).map((type) => (
          <button
            key={type}
            onClick={() => {
              setEntityType(type);
              setSelectedItems(new Set());
              setActionValue('');
            }}
            className={`btn ${
              entityType === type ? 'btn-primary' : 'btn-secondary'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Bulk Action Controls */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Bulk Action</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Action</label>
            <select
              value={bulkAction}
              onChange={(e) => {
                setBulkAction(e.target.value as BulkAction);
                setActionValue('');
              }}
              className="input"
            >
              <option value="assign">Assign To</option>
              <option value="status">Change Status</option>
              <option value="priority">Change Priority</option>
              {entityType === 'stories' && (
                <option value="sprint">Assign Sprint</option>
              )}
              <option value="delete">Delete</option>
            </select>
          </div>
          {bulkAction !== 'delete' && (
            <div>
              <label className="block text-sm text-gray-700 mb-2">Value</label>
              {bulkAction === 'assign' && (
                <select
                  value={actionValue}
                  onChange={(e) => setActionValue(e.target.value)}
                  className="input"
                >
                  <option value="">Select Person...</option>
                  {assignees.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              )}
              {bulkAction === 'status' && entityType === 'stories' && (
                <select
                  value={actionValue}
                  onChange={(e) => setActionValue(e.target.value)}
                  className="input"
                >
                  <option value="">Select Status...</option>
                  <option value="Backlog">Backlog</option>
                  <option value="Ready for Dev">Ready for Dev</option>
                  <option value="In Development">In Development</option>
                  <option value="In Testing">In Testing</option>
                  <option value="Bugs Found">Bugs Found</option>
                  <option value="Done">Done</option>
                </select>
              )}
              {bulkAction === 'status' && entityType === 'bugs' && (
                <select
                  value={actionValue}
                  onChange={(e) => setActionValue(e.target.value)}
                  className="input"
                >
                  <option value="">Select Status...</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Fixed">Fixed</option>
                  <option value="Verified">Verified</option>
                  <option value="Closed">Closed</option>
                  <option value="Reopened">Reopened</option>
                </select>
              )}
              {bulkAction === 'status' && entityType === 'testcases' && (
                <select
                  value={actionValue}
                  onChange={(e) => setActionValue(e.target.value)}
                  className="input"
                >
                  <option value="">Select Status...</option>
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Not Run">Not Run</option>
                </select>
              )}
              {bulkAction === 'priority' && (
                <select
                  value={actionValue}
                  onChange={(e) => setActionValue(e.target.value)}
                  className="input"
                >
                  <option value="">Select Priority...</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              )}
              {bulkAction === 'sprint' && (
                <select
                  value={actionValue}
                  onChange={(e) => setActionValue(e.target.value)}
                  className="input"
                >
                  <option value="">Select Sprint...</option>
                  <option value="Sprint 12">Sprint 12</option>
                  <option value="Sprint 13">Sprint 13</option>
                  <option value="Sprint 14">Sprint 14</option>
                </select>
              )}
            </div>
          )}
          <div className="flex items-end">
            <button
              onClick={handleApplyBulkAction}
              disabled={selectedItems.size === 0}
              className="btn btn-primary w-full"
            >
              Apply to {selectedItems.size} Selected
            </button>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
              className="w-4 h-4 text-indigo-500 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">
              Select All ({selectedItems.size} / {currentItems.length})
            </span>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700 w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-indigo-500 border-gray-300 rounded focus:ring-indigo-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-gray-700">ID</th>
                <th className="px-6 py-3 text-left text-gray-700">Title</th>
                {entityType === 'stories' && (
                  <>
                    <th className="px-6 py-3 text-left text-gray-700">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-gray-700">
                      Sprint
                    </th>
                    <th className="px-6 py-3 text-left text-gray-700">
                      Assigned
                    </th>
                  </>
                )}
                {entityType === 'bugs' && (
                  <>
                    <th className="px-6 py-3 text-left text-gray-700">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-gray-700">
                      Assigned
                    </th>
                  </>
                )}
                {entityType === 'testcases' && (
                  <>
                    <th className="px-6 py-3 text-left text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-gray-700">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-gray-700">
                      Assigned
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-50 ${selectedItems.has(item.id) ? 'bg-indigo-50' : ''}`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => handleToggleItem(item.id)}
                      className="w-4 h-4 text-indigo-500 border-gray-300 rounded focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {item.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {item.title}
                  </td>
                  {entityType === 'stories' && (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {(item as Story).priority}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {(item as Story).sprint || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {(item as Story).assignedDeveloper || '-'}
                      </td>
                    </>
                  )}
                  {entityType === 'bugs' && (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {(item as Bug).severity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {(item as Bug).status}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {(item as Bug).assignedTo || '-'}
                      </td>
                    </>
                  )}
                  {entityType === 'testcases' && (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {(item as TestCase).status}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {(item as TestCase).priority}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {(item as TestCase).assignedTo || '-'}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {currentItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">No items found</div>
        )}
      </div>

      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
      />
    </div>
  );
}
