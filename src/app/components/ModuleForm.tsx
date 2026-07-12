import { useState } from 'react';

type RiskLevel = 'High' | 'Medium' | 'Low';
type TestingProtocol =
  'Full Regression' | 'Focused Functional' | 'Visual/Smoke Check';

interface Module {
  id: string;
  name: string;
  defectFrequency: number;
  businessImpact: number;
  riskLevel: RiskLevel;
  testingProtocol: TestingProtocol;
  description: string;
}

interface ModuleFormProps {
  module?: Module;
  onSave: (module: Module) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

export function ModuleForm({
  module,
  onSave,
  onCancel,
  mode,
}: ModuleFormProps) {
  const calculateRiskLevel = (defect: number, impact: number): RiskLevel => {
    if (defect >= 7 || impact >= 9) return 'High';
    if (defect >= 4 || impact >= 5) return 'Medium';
    return 'Low';
  };

  const getTestingProtocol = (risk: RiskLevel): TestingProtocol => {
    if (risk === 'High') return 'Full Regression';
    if (risk === 'Medium') return 'Focused Functional';
    return 'Visual/Smoke Check';
  };

  const [formData, setFormData] = useState<Module>(
    module || {
      id: '',
      name: '',
      defectFrequency: 5,
      businessImpact: 5,
      riskLevel: 'Medium',
      testingProtocol: 'Focused Functional',
      description: '',
    }
  );

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleDefectChange = (value: number) => {
    const risk = calculateRiskLevel(value, formData.businessImpact);
    const protocol = getTestingProtocol(risk);
    setFormData({
      ...formData,
      defectFrequency: value,
      riskLevel: risk,
      testingProtocol: protocol,
    });
  };

  const handleImpactChange = (value: number) => {
    const risk = calculateRiskLevel(formData.defectFrequency, value);
    const protocol = getTestingProtocol(risk);
    setFormData({
      ...formData,
      businessImpact: value,
      riskLevel: risk,
      testingProtocol: protocol,
    });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Module name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (mode === 'create' && !formData.id.trim()) {
      newErrors.id = 'Module ID is required';
    }

    if (formData.id && !/^MOD-\d+$/.test(formData.id)) {
      newErrors.id = 'Module ID must follow format: MOD-XXX (e.g., MOD-001)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-6">
          <h1 className="text-3xl mb-2">
            {mode === 'create' ? 'Create New Module' : 'Edit Module'}
          </h1>
          <p className="text-gray-600">
            {mode === 'create'
              ? 'Add a new module to the risk assessment matrix'
              : 'Update module details and risk parameters'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="id" className="block text-gray-700 mb-2">
              Module ID *
            </label>
            <input
              id="id"
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              disabled={mode === 'edit'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
              placeholder="MOD-001"
            />
            {errors.id && (
              <p className="text-red-600 text-sm mt-1">{errors.id}</p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-gray-700 mb-2">
              Module Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Payment Gateway"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Describe the module and its functionality..."
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="defectFrequency"
                className="block text-gray-700 mb-2"
              >
                Defect Frequency: {formData.defectFrequency}/10
              </label>
              <input
                id="defectFrequency"
                type="range"
                min="1"
                max="10"
                value={formData.defectFrequency}
                onChange={(e) => handleDefectChange(parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-sm text-gray-600 mt-1">
                Historical defect rate for this module
              </p>
            </div>

            <div>
              <label
                htmlFor="businessImpact"
                className="block text-gray-700 mb-2"
              >
                Business Impact: {formData.businessImpact}/10
              </label>
              <input
                id="businessImpact"
                type="range"
                min="1"
                max="10"
                value={formData.businessImpact}
                onChange={(e) => handleImpactChange(parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-sm text-gray-600 mt-1">
                Business criticality of this module
              </p>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h3 className="text-gray-800 mb-3">Calculated Risk Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Risk Level</div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full border ${
                    formData.riskLevel === 'High'
                      ? 'bg-red-100 text-red-800 border-red-200'
                      : formData.riskLevel === 'Medium'
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        : 'bg-green-100 text-green-800 border-green-200'
                  }`}
                >
                  {formData.riskLevel}
                </span>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">
                  Testing Protocol
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                  {formData.testingProtocol}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              {mode === 'create' ? 'Create Module' : 'Save Changes'}
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
