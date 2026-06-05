import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Modal } from './Modal';

type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

interface BulkActionsProps {
  selectedIds: string[];
  onAssignDeveloper: (developer: string) => void;
  onAssignTester: (tester: string) => void;
  onSetPriority: (priority: Priority) => void;
  onSetSprint: (sprint: string) => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

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

export function BulkActions({
  selectedIds,
  onAssignDeveloper,
  onAssignTester,
  onSetPriority,
  onSetSprint,
  onDelete,
  onClearSelection,
}: BulkActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
      <div className="bg-indigo-600 text-white rounded-lg shadow-2xl p-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">{selectedIds.length} selected</span>
          <button
            onClick={onClearSelection}
            className="text-white hover:text-indigo-200"
            title="Clear selection"
          >
            ✕
          </button>
        </div>

        <div className="h-6 w-px bg-indigo-400"></div>

        <div className="flex gap-2">
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 rounded-lg text-sm"
            >
              Bulk Actions ▼
            </button>

            {isOpen && (
              <>
                <div className="fixed inset-0" onClick={() => setIsOpen(false)}></div>
                <div className="absolute bottom-full mb-2 left-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                  {/* Assign Developer */}
                  <div className="px-4 py-2">
                    <label className="block text-xs text-gray-600 mb-1">Assign Developer</label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          onAssignDeveloper(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 bg-white"
                    >
                      <option value="">Choose...</option>
                      {DEVELOPERS.map(dev => (
                        <option key={dev} value={dev}>{dev}</option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-gray-200 my-2"></div>

                  {/* Assign Tester */}
                  <div className="px-4 py-2">
                    <label className="block text-xs text-gray-600 mb-1">Assign Tester</label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          onAssignTester(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 bg-white"
                    >
                      <option value="">Choose...</option>
                      {TESTERS.map(tester => (
                        <option key={tester} value={tester}>{tester}</option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-gray-200 my-2"></div>

                  {/* Set Priority */}
                  <div className="px-4 py-2">
                    <label className="block text-xs text-gray-600 mb-1">Set Priority</label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          onSetPriority(e.target.value as Priority);
                          e.target.value = '';
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 bg-white"
                    >
                      <option value="">Choose...</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div className="border-t border-gray-200 my-2"></div>

                  {/* Set Sprint */}
                  <div className="px-4 py-2">
                    <label className="block text-xs text-gray-600 mb-1">Move to Sprint</label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          onSetSprint(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 bg-white"
                    >
                      <option value="">Choose...</option>
                      {SPRINTS.map(sprint => (
                        <option key={sprint} value={sprint}>{sprint}</option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-gray-200 my-2"></div>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 text-sm flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Selected
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Selected Stories"
        message={`Are you sure you want to delete ${selectedIds.length} selected ${selectedIds.length === 1 ? 'story' : 'stories'}? This action cannot be undone.`}
        type="danger"
        onConfirm={() => {
          onDelete();
          setShowDeleteConfirm(false);
        }}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
