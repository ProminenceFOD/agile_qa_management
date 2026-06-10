import { useState } from 'react';
import { toast } from 'sonner';

interface Sprint {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  goal: string;
  capacity: number;
  committed: number;
  completed: number;
  status: 'Planning' | 'Active' | 'Completed';
  release?: string;
  stories: string[];
}

interface SprintFormProps {
  onClose: () => void;
  onSubmit: (sprint: Omit<Sprint, 'id' | 'committed' | 'completed' | 'stories'>) => void;
  sprint?: Sprint;
  releases: { id: string; name: string }[];
}

export function SprintForm({ onClose, onSubmit, sprint, releases }: SprintFormProps) {
  const [formData, setFormData] = useState({
    name: sprint?.name || '',
    startDate: sprint?.startDate ? new Date(sprint.startDate).toISOString().split('T')[0] : '',
    endDate: sprint?.endDate ? new Date(sprint.endDate).toISOString().split('T')[0] : '',
    goal: sprint?.goal || '',
    capacity: sprint?.capacity || 30,
    status: sprint?.status || 'Planning' as 'Planning' | 'Active' | 'Completed',
    release: sprint?.release || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter a sprint name');
      return;
    }

    if (!formData.startDate) {
      toast.error('Please select a start date');
      return;
    }

    if (!formData.endDate) {
      toast.error('Please select an end date');
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    if (!formData.goal.trim()) {
      toast.error('Please enter a sprint goal');
      return;
    }

    if (formData.capacity <= 0) {
      toast.error('Capacity must be greater than 0');
      return;
    }

    const newSprint: Omit<Sprint, 'id' | 'committed' | 'completed' | 'stories'> = {
      name: formData.name,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      goal: formData.goal,
      capacity: formData.capacity,
      status: formData.status,
      release: formData.release || undefined,
    };

    onSubmit(newSprint);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 rounded-t-lg flex-shrink-0">
            <h2 className="text-2xl text-gray-900 dark:text-white font-semibold">
              {sprint ? 'Edit Sprint' : 'Create Sprint'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
              {/* Sprint Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sprint Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Sprint 14"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Sprint Goal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sprint Goal <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  placeholder="What will the team accomplish in this sprint?"
                  rows={3}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Capacity and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Capacity (Story Points) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    min="1"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Planning' | 'Active' | 'Completed' })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Release */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Link to Release (Optional)
                </label>
                <select
                  value={formData.release}
                  onChange={(e) => setFormData({ ...formData, release: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">No Release</option>
                  {releases.map((release) => (
                    <option key={release.id} value={release.id}>
                      {release.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info Banner */}
              <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 rounded-lg p-3 text-sm text-indigo-800 dark:text-indigo-200">
                <strong>Note:</strong> Stories can be added to the sprint after creation. Committed and completed points will be tracked as stories are added and updated.
              </div>
            </div>

            {/* Form Actions */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-white dark:bg-gray-800 rounded-b-lg flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium"
              >
                {sprint ? 'Update Sprint' : 'Create Sprint'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
