import { Edit3, ArrowLeft } from 'lucide-react';

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

interface ModuleViewProps {
  module: Module;
  onEdit: () => void;
  onBack: () => void;
}

export function ModuleView({ module, onEdit, onBack }: ModuleViewProps) {
  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getProtocolColor = (protocol: TestingProtocol) => {
    switch (protocol) {
      case 'Full Regression':
        return 'bg-purple-100 text-purple-800';
      case 'Focused Functional':
        return 'bg-indigo-100 text-indigo-800';
      case 'Visual/Smoke Check':
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-indigo-500 hover:text-indigo-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </button>
        <button onClick={onEdit} className="btn btn-primary">
          <Edit3 className="w-4 h-4" />
          Edit Module
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-sm text-gray-500">{module.id}</span>
              <h1 className="text-3xl text-gray-900 mt-1">{module.name}</h1>
            </div>
            <div>
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full border ${getRiskColor(
                  module.riskLevel
                )}`}
              >
                {module.riskLevel} Risk
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg text-gray-800 mb-2">Description</h3>
            <p className="text-gray-700">{module.description}</p>
          </div>

          <div>
            <h3 className="text-lg text-gray-800 mb-4">
              Risk Assessment Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-2">
                  Defect Frequency
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-indigo-500 h-3 rounded-full"
                      style={{
                        width: `${(module.defectFrequency / 10) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-lg text-gray-900">
                    {module.defectFrequency}/10
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Historical defect rate for this module
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-2">
                  Business Impact
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-purple-500 h-3 rounded-full"
                      style={{
                        width: `${(module.businessImpact / 10) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-lg text-gray-900">
                    {module.businessImpact}/10
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Business criticality of this module
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg text-gray-800 mb-4">
              Assigned Testing Protocol
            </h3>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full ${getProtocolColor(
                    module.testingProtocol
                  )}`}
                >
                  {module.testingProtocol}
                </span>
                <span className="text-sm text-gray-600">
                  Auto-assigned based on risk level
                </span>
              </div>
              <div className="text-sm text-gray-700">
                {module.testingProtocol === 'Full Regression' && (
                  <p>
                    Comprehensive testing required including all regression
                    suites, integration tests, and end-to-end scenarios.
                  </p>
                )}
                {module.testingProtocol === 'Focused Functional' && (
                  <p>
                    Targeted testing of core functionality with emphasis on
                    critical user flows and integration points.
                  </p>
                )}
                {module.testingProtocol === 'Visual/Smoke Check' && (
                  <p>
                    Basic visual verification and smoke testing to ensure no
                    obvious regressions or UI issues.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm text-gray-700 mb-2">
              Risk Calculation Formula
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• High Risk: Defect ≥7 OR Impact ≥9</li>
              <li>• Medium Risk: Defect 4-6 OR Impact 5-8</li>
              <li>• Low Risk: Defect ≤3 AND Impact ≤4</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
