import { useState } from 'react';
import { toast } from 'sonner';

interface Release {
  id: string;
  name: string;
  version: string;
  targetDate: Date;
  status: 'Planning' | 'In Progress' | 'Released';
  sprints: string[];
  features: string[];
}

interface ReleaseFormProps {
  onClose: () => void;
  onSubmit: (release: Omit<Release, 'id' | 'sprints'>) => void;
  release?: Release;
}

export function ReleaseForm({ onClose, onSubmit, release }: ReleaseFormProps) {
  const [formData, setFormData] = useState({
    name: release?.name || '',
    version: release?.version || '',
    targetDate: release?.targetDate ? new Date(release.targetDate).toISOString().split('T')[0] : '',
    status: release?.status || 'Planning' as 'Planning' | 'In Progress' | 'Released',
  });

  const [features, setFeatures] = useState<string[]>(release?.features || ['']);

  const handleAddFeature = () => {
    setFeatures([...features, '']);
  };

  const handleRemoveFeature = (index: number) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter a release name');
      return;
    }

    if (!formData.version.trim()) {
      toast.error('Please enter a version number');
      return;
    }

    if (!formData.targetDate) {
      toast.error('Please select a target date');
      return;
    }

    const filteredFeatures = features.filter(f => f.trim() !== '');
    if (filteredFeatures.length === 0) {
      toast.error('Please add at least one feature');
      return;
    }

    const newRelease: Omit<Release, 'id' | 'sprints'> = {
      name: formData.name,
      version: formData.version,
      targetDate: new Date(formData.targetDate),
      status: formData.status,
      features: filteredFeatures,
    };

    onSubmit(newRelease);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full my-8">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-lg">
            <h2 className="text-2xl text-gray-900">
              {release ? 'Edit Release' : 'Create Release'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Release Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Release Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Version 2.2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Version and Target Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Version Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="e.g., v2.2.0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Planning' | 'In Progress' | 'Released' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Released">Released</option>
              </select>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      placeholder={`Feature ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
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
                onClick={handleAddFeature}
                className="mt-2 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700"
              >
                + Add Feature
              </button>
            </div>

            {/* Info Banner */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-800">
              <strong>Note:</strong> Sprints can be linked to this release after creation. Features listed here will help track the scope of the release.
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
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                {release ? 'Update Release' : 'Create Release'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
