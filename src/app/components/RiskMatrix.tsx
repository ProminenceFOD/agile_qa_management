import { useState } from 'react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { ModuleForm } from './ModuleForm';
import { ModuleView } from './ModuleView';
import {
  Plus,
  Eye,
  Edit3,
  AlertTriangle,
  TrendingUp,
  Shield,
  Package,
  Grid,
  List,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

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

type ViewMode = 'list' | 'view' | 'create' | 'edit';
type MatrixDisplayMode = 'scatter' | 'heatmap' | 'table';

interface RiskMatrixProps {
  highlightedItemId?: string | null;
}

export const defaultModules: Module[] = [
  {
    id: 'MOD-001',
    name: 'Payment Gateway',
    defectFrequency: 8,
    businessImpact: 10,
    riskLevel: 'High',
    testingProtocol: 'Full Regression',
    description: 'Stripe integration for checkout process',
  },
  {
    id: 'MOD-002',
    name: 'Authentication System',
    defectFrequency: 7,
    businessImpact: 9,
    riskLevel: 'High',
    testingProtocol: 'Full Regression',
    description: 'OAuth2 login and session management',
  },
  {
    id: 'MOD-003',
    name: 'User Dashboard',
    defectFrequency: 5,
    businessImpact: 6,
    riskLevel: 'Medium',
    testingProtocol: 'Focused Functional',
    description: 'Analytics and reporting interface',
  },
  {
    id: 'MOD-004',
    name: 'Email Notification Engine',
    defectFrequency: 6,
    businessImpact: 5,
    riskLevel: 'Medium',
    testingProtocol: 'Focused Functional',
    description: 'Transactional email delivery system',
  },
  {
    id: 'MOD-005',
    name: 'Search Indexing',
    defectFrequency: 4,
    businessImpact: 7,
    riskLevel: 'Medium',
    testingProtocol: 'Focused Functional',
    description: 'ElasticSearch integration for product search',
  },
  {
    id: 'MOD-006',
    name: 'Profile Settings UI',
    defectFrequency: 2,
    businessImpact: 3,
    riskLevel: 'Low',
    testingProtocol: 'Visual/Smoke Check',
    description: 'User profile customization interface',
  },
  {
    id: 'MOD-007',
    name: 'Typography Updates',
    defectFrequency: 1,
    businessImpact: 2,
    riskLevel: 'Low',
    testingProtocol: 'Visual/Smoke Check',
    description: 'Font family and styling changes',
  },
  {
    id: 'MOD-008',
    name: 'Data Export Feature',
    defectFrequency: 3,
    businessImpact: 8,
    riskLevel: 'Medium',
    testingProtocol: 'Focused Functional',
    description: 'CSV/Excel export functionality',
  },
];

export function RiskMatrix({ highlightedItemId }: RiskMatrixProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [sortBy, setSortBy] = useState<'risk' | 'defect' | 'impact'>('risk');
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'All'>('All');
  const [displayMode, setDisplayMode] = useState<MatrixDisplayMode>('scatter');

  const { data: modules, setData: setModules } = useSupabaseData<Module[]>(
    'aqms_modules',
    defaultModules
  );
  const { data: bugs } = useSupabaseData<any[]>('aqms_bugs', []);
  const { data: stories } = useSupabaseData<any[]>('aqms_stories', []);

  const handleSyncDefectFrequencies = () => {
    if (modules.length === 0) {
      toast.error('No modules defined to sync frequencies for.');
      return;
    }

    const bugCounts = modules.map((m) => {
      const moduleStoryIds = new Set(
        stories.filter((s: any) => s.moduleId === m.id).map((s: any) => s.id)
      );
      const count = bugs.filter(
        (b: any) =>
          b.moduleId === m.id ||
          b.environment?.toLowerCase() === m.name?.toLowerCase() ||
          (b.linkedStory && moduleStoryIds.has(b.linkedStory))
      ).length;
      return { id: m.id, count };
    });

    const maxCount = Math.max(...bugCounts.map((b) => b.count));

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

    const updatedModules = modules.map((m) => {
      const countInfo = bugCounts.find((bc) => bc.id === m.id);
      const bugCount = countInfo ? countInfo.count : 0;

      // Calculate normalized score (1-10). If maxCount is 0, score is 1.
      const defectFrequency =
        maxCount > 0 ? Math.max(1, Math.round((bugCount / maxCount) * 10)) : 1;

      const riskLevel = calculateRiskLevel(defectFrequency, m.businessImpact);
      const testingProtocol = getTestingProtocol(riskLevel);

      return {
        ...m,
        defectFrequency,
        riskLevel,
        testingProtocol,
      };
    });

    setModules(updatedModules);
    toast.success(
      'Defect frequencies synced successfully based on active bug records!'
    );
  };

  const handleViewModule = (module: Module) => {
    setSelectedModule(module);
    setViewMode('view');
  };

  const handleCreateModule = () => {
    setSelectedModule(null);
    setViewMode('create');
  };

  const handleEditModule = (module?: Module) => {
    if (module) {
      setSelectedModule(module);
    }
    setViewMode('edit');
  };

  const handleSaveModule = (module: Module) => {
    if (viewMode === 'create') {
      setModules([...modules, module]);
    } else if (viewMode === 'edit') {
      setModules(modules.map((m) => (m.id === module.id ? module : m)));
    }
    setViewMode('list');
    setSelectedModule(null);
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedModule(null);
  };

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

  const sortedModules = [...modules].sort((a, b) => {
    if (sortBy === 'risk') {
      const riskOrder = { High: 3, Medium: 2, Low: 1 };
      return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
    } else if (sortBy === 'defect') {
      return b.defectFrequency - a.defectFrequency;
    } else {
      return b.businessImpact - a.businessImpact;
    }
  });

  const filteredModules =
    filterRisk === 'All'
      ? sortedModules
      : sortedModules.filter((m) => m.riskLevel === filterRisk);

  const riskCounts = {
    High: modules.filter((m) => m.riskLevel === 'High').length,
    Medium: modules.filter((m) => m.riskLevel === 'Medium').length,
    Low: modules.filter((m) => m.riskLevel === 'Low').length,
  };

  if (viewMode === 'view' && selectedModule) {
    return (
      <ModuleView
        module={selectedModule}
        onEdit={() => handleEditModule()}
        onBack={handleCancel}
      />
    );
  }

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <ModuleForm
        module={selectedModule || undefined}
        onSave={handleSaveModule}
        onCancel={handleCancel}
        mode={viewMode}
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Risk-Prioritisation Matrix</h1>
          <p className="text-gray-600">
            Automated risk scoring and test action pre-assignment
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSyncDefectFrequencies}
            className="btn btn-secondary btn-lg flex items-center gap-2 hover:scale-105 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Sync Defect Frequencies
          </button>
          <button
            onClick={handleCreateModule}
            className="btn btn-primary btn-lg bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Module
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card fade-in p-4 bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-3xl font-bold text-red-700 mb-1">
                {riskCounts.High}
              </div>
              <div className="text-sm text-red-600 font-medium">High Risk</div>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
        </div>
        <div className="card fade-in p-4 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-3xl font-bold text-yellow-700 mb-1">
                {riskCounts.Medium}
              </div>
              <div className="text-sm text-yellow-600 font-medium">
                Medium Risk
              </div>
            </div>
            <TrendingUp className="w-10 h-10 text-yellow-600" />
          </div>
        </div>
        <div className="card fade-in p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-3xl font-bold text-green-700 mb-1">
                {riskCounts.Low}
              </div>
              <div className="text-sm text-green-600 font-medium">Low Risk</div>
            </div>
            <Shield className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="card fade-in p-4 bg-gradient-to-br from-indigo-50 to-indigo-50 border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-3xl font-bold text-indigo-700 mb-1">
                {modules.length}
              </div>
              <div className="text-sm text-indigo-600 font-medium">
                Total Modules
              </div>
            </div>
            <Package className="w-10 h-10 text-indigo-600" />
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setDisplayMode('scatter')}
              className={`btn ${displayMode === 'scatter' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Grid className="w-4 h-4" />
              Scatter Plot
            </button>
            <button
              onClick={() => setDisplayMode('heatmap')}
              className={`btn ${displayMode === 'heatmap' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Package className="w-4 h-4" />
              Heat Map
            </button>
            <button
              onClick={() => setDisplayMode('table')}
              className={`btn ${displayMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <List className="w-4 h-4" />
              Table View
            </button>
          </div>

          {displayMode === 'table' && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
                >
                  <option value="risk">Risk Level</option>
                  <option value="defect">Defect Frequency</option>
                  <option value="impact">Business Impact</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-gray-700">Filter:</label>
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
                >
                  <option value="All">All Risks</option>
                  <option value="High">High Risk Only</option>
                  <option value="Medium">Medium Risk Only</option>
                  <option value="Low">Low Risk Only</option>
                </select>
              </div>
            </>
          )}
        </div>

        {displayMode === 'table' && (
          <div className="text-sm text-gray-600">
            Showing {filteredModules.length} of {modules.length} modules
          </div>
        )}
      </div>

      {displayMode === 'scatter' && (
        <div className="mb-6">
          {/* How to Read the Matrix - Clear Info Banner */}
          <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl">
                💡
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  How to Read This Matrix
                </h3>
                <div className="space-y-2 text-sm text-gray-700 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold mt-0.5">•</span>
                    <span>
                      Each <strong>colored dot</strong> represents one module in
                      your system
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold mt-0.5">•</span>
                    <span>
                      <strong>Horizontal position (→)</strong> shows how often
                      bugs occur (Defect Frequency)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold mt-0.5">•</span>
                    <span>
                      <strong>Vertical position (↑)</strong> shows how critical
                      the module is (Business Impact)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold mt-0.5">•</span>
                    <span>
                      <strong>Dot color</strong> indicates risk level:
                      <span className="inline-flex items-center gap-1.5 ml-2">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span>
                          <span className="font-medium">Low</span>
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
                          <span className="font-medium">Medium</span>
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                          <span className="font-medium">High</span>
                        </span>
                      </span>
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold mt-0.5">•</span>
                    <span>
                      <strong>Hover over a dot</strong> to see details |{' '}
                      <strong>Click a dot</strong> to view full module
                      information
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-8 shadow-lg">
            <div className="relative" style={{ height: '550px' }}>
              {/* Y-axis label */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90">
                <div className="text-xs font-semibold text-gray-700 whitespace-nowrap tracking-wide uppercase">
                  Business Impact →
                </div>
              </div>

              {/* Grid container */}
              <div className="h-full w-full border-l-2 border-b-2 border-gray-400 relative rounded-br-lg">
                {/* Risk zones backgrounds - matching formula: High (Defect≥7 OR Impact≥9), Medium (Defect 4-6 OR Impact 5-8), Low (Defect≤3 AND Impact≤4) */}
                <div className="absolute inset-0">
                  {/* Low Risk Zone: Defect ≤3 AND Impact ≤4 (bottom-left corner, 30% x 40%) */}
                  <div
                    className="absolute bottom-0 left-0 bg-green-50 border-2 border-green-300"
                    style={{ width: '30%', height: '40%' }}
                  ></div>

                  {/* High Risk Zone - Top strip for Impact ≥9 (top 10%) */}
                  <div
                    className="absolute top-0 left-0 right-0 bg-red-50 border-2 border-red-300"
                    style={{ height: '10%' }}
                  ></div>

                  {/* High Risk Zone - Right strip for Defect ≥7 (right 30%) */}
                  <div
                    className="absolute top-0 right-0 bottom-0 bg-red-50 border-2 border-red-300"
                    style={{ width: '30%' }}
                  ></div>

                  {/* Medium Risk Zone - fills the rest (Impact 5-8 and Defect 0-6.9, OR Impact 0-8.9 and Defect 4-6.9) */}
                  <div
                    className="absolute left-0 bg-yellow-50 border-2 border-yellow-300"
                    style={{ top: '10%', width: '70%', height: '40%' }}
                  ></div>
                  <div
                    className="absolute left-0 bottom-0 bg-yellow-50 border-2 border-yellow-300"
                    style={{ left: '30%', width: '40%', height: '40%' }}
                  ></div>
                  <div
                    className="absolute bg-yellow-50 border-2 border-yellow-300"
                    style={{
                      top: '50%',
                      left: '0',
                      width: '70%',
                      bottom: '40%',
                    }}
                  ></div>
                </div>

                {/* Subtle grid lines */}
                <div className="absolute inset-0 pointer-events-none opacity-40">
                  <div className="absolute left-1/3 top-0 bottom-0 border-l border-gray-300"></div>
                  <div className="absolute left-2/3 top-0 bottom-0 border-l border-gray-300"></div>
                  <div className="absolute top-1/3 left-0 right-0 border-t border-gray-300"></div>
                  <div className="absolute top-2/3 left-0 right-0 border-t border-gray-300"></div>
                </div>

                {/* Zone labels - minimalist */}
                <div className="absolute top-3 right-3 text-[11px] font-semibold text-red-600 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm z-10 border border-red-200">
                  HIGH RISK
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] font-semibold text-orange-600 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm z-10 border border-orange-200">
                  MEDIUM
                </div>
                <div className="absolute bottom-3 left-3 text-[11px] font-semibold text-green-600 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm z-10 border border-green-200">
                  LOW RISK
                </div>

                {/* Plot modules */}
                {modules.map((module) => {
                  const x = (module.defectFrequency / 10) * 100;
                  const y = 100 - (module.businessImpact / 10) * 100;
                  const isHighlighted = highlightedItemId === module.id;

                  const dotColor = isHighlighted
                    ? 'bg-indigo-600 ring-4 ring-indigo-300 animate-pulse shadow-xl'
                    : module.riskLevel === 'High'
                      ? 'bg-red-500 hover:bg-red-600'
                      : module.riskLevel === 'Medium'
                        ? 'bg-orange-500 hover:bg-orange-600'
                        : 'bg-green-500 hover:bg-green-600';

                  return (
                    <div
                      key={module.id}
                      className="absolute group cursor-pointer transition-transform hover:scale-110 z-20 w-3.5 h-3.5"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      onClick={() => handleViewModule(module)}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full ${dotColor} border-2 border-white shadow-lg transition-all`}
                      ></div>

                      {/* Modern tooltip */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-30">
                        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-2xl min-w-[200px]">
                          <div className="font-semibold mb-1">
                            {module.name}
                          </div>
                          <div className="text-gray-300 text-[11px] space-y-0.5">
                            <div>Defects: {module.defectFrequency}/10</div>
                            <div>Impact: {module.businessImpact}/10</div>
                          </div>
                          <div
                            className={`mt-1.5 pt-1.5 border-t border-gray-700 text-[11px] font-medium ${
                              module.riskLevel === 'High'
                                ? 'text-red-400'
                                : module.riskLevel === 'Medium'
                                  ? 'text-orange-400'
                                  : 'text-green-400'
                            }`}
                          >
                            {module.riskLevel} Risk • {module.testingProtocol}
                          </div>
                        </div>
                        {/* Tooltip arrow */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Axis scales - clean and minimal */}
              <div className="absolute -left-10 top-0 h-full flex flex-col justify-between text-[11px] font-medium text-gray-600 py-1">
                <span>10</span>
                <span className="opacity-50">5</span>
                <span>0</span>
              </div>
              <div className="absolute -bottom-6 left-0 w-full flex justify-between text-[11px] font-medium text-gray-600">
                <span>0</span>
                <span className="opacity-50">5</span>
                <span>10</span>
              </div>
            </div>

            {/* X-axis label */}
            <div className="text-center mt-6">
              <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Defect Frequency →
              </div>
            </div>

            {/* Legend - clean and minimal */}
            <div className="mt-8 flex items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">
                  Low Risk
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">
                  Medium Risk
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">
                  High Risk
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {displayMode === 'heatmap' && (
        <div className="mb-6">
          {/* Heat Map Info Banner */}
          <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl">
                🔥
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Heat Map View
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  This grid shows all modules organized by their defect
                  frequency (columns) and business impact (rows). Each cell
                  contains modules that fall within that range. Darker colors
                  indicate higher risk zones.
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6 shadow-lg">
            {/* Heat Map Grid - 3x3 */}
            <div className="grid grid-cols-4 gap-0 border-2 border-gray-300 rounded-lg overflow-hidden">
              {/* Header Row */}
              <div className="bg-gray-100 p-3 border-b border-r border-gray-300 text-center font-semibold text-sm text-gray-700">
                Impact \ Defect
              </div>
              <div className="bg-gray-100 p-3 border-b border-r border-gray-300 text-center text-xs font-semibold text-gray-700">
                Low (0-3)
              </div>
              <div className="bg-gray-100 p-3 border-b border-r border-gray-300 text-center text-xs font-semibold text-gray-700">
                Medium (4-6)
              </div>
              <div className="bg-gray-100 p-3 border-b border-gray-300 text-center text-xs font-semibold text-gray-700">
                High (7-10)
              </div>

              {/* High Impact Row (9-10) */}
              <div className="bg-gray-100 p-3 border-b border-r border-gray-300 font-semibold text-xs text-gray-700">
                High (9-10)
              </div>
              <div className="bg-orange-50 border-b border-r border-gray-300 p-3 min-h-[120px]">
                <div className="text-[10px] font-semibold text-orange-800 mb-2">
                  MEDIUM RISK
                </div>
                <div className="space-y-1">
                  {modules
                    .filter(
                      (m) => m.businessImpact >= 9 && m.defectFrequency <= 3
                    )
                    .map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleViewModule(m)}
                        className="text-xs bg-white border border-orange-200 rounded px-2 py-1 cursor-pointer hover:bg-orange-100 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{m.id}</div>
                        <div className="text-gray-600 truncate">{m.name}</div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="bg-red-50 border-b border-r border-gray-300 p-3 min-h-[120px]">
                <div className="text-[10px] font-semibold text-red-800 mb-2">
                  HIGH RISK
                </div>
                <div className="space-y-1">
                  {modules
                    .filter(
                      (m) =>
                        m.businessImpact >= 9 &&
                        m.defectFrequency >= 4 &&
                        m.defectFrequency <= 6
                    )
                    .map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleViewModule(m)}
                        className="text-xs bg-white border border-red-200 rounded px-2 py-1 cursor-pointer hover:bg-red-100 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{m.id}</div>
                        <div className="text-gray-600 truncate">{m.name}</div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="bg-red-100 border-b border-gray-300 p-3 min-h-[120px]">
                <div className="text-[10px] font-semibold text-red-900 mb-2">
                  HIGH RISK
                </div>
                <div className="space-y-1">
                  {modules
                    .filter(
                      (m) => m.businessImpact >= 9 && m.defectFrequency >= 7
                    )
                    .map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleViewModule(m)}
                        className="text-xs bg-white border border-red-300 rounded px-2 py-1 cursor-pointer hover:bg-red-200 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{m.id}</div>
                        <div className="text-gray-600 truncate">{m.name}</div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Medium Impact Row (5-8) */}
              <div className="bg-gray-100 p-3 border-b border-r border-gray-300 font-semibold text-xs text-gray-700">
                Medium (5-8)
              </div>
              <div className="bg-green-50 border-b border-r border-gray-300 p-3 min-h-[120px]">
                <div className="text-[10px] font-semibold text-green-800 mb-2">
                  LOW RISK
                </div>
                <div className="space-y-1">
                  {modules
                    .filter(
                      (m) =>
                        m.businessImpact >= 5 &&
                        m.businessImpact <= 8 &&
                        m.defectFrequency <= 3
                    )
                    .map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleViewModule(m)}
                        className="text-xs bg-white border border-green-200 rounded px-2 py-1 cursor-pointer hover:bg-green-100 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{m.id}</div>
                        <div className="text-gray-600 truncate">{m.name}</div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="bg-yellow-50 border-b border-r border-gray-300 p-3 min-h-[120px]">
                <div className="text-[10px] font-semibold text-yellow-800 mb-2">
                  MEDIUM RISK
                </div>
                <div className="space-y-1">
                  {modules
                    .filter(
                      (m) =>
                        m.businessImpact >= 5 &&
                        m.businessImpact <= 8 &&
                        m.defectFrequency >= 4 &&
                        m.defectFrequency <= 6
                    )
                    .map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleViewModule(m)}
                        className="text-xs bg-white border border-yellow-200 rounded px-2 py-1 cursor-pointer hover:bg-yellow-100 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{m.id}</div>
                        <div className="text-gray-600 truncate">{m.name}</div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="bg-orange-50 border-b border-gray-300 p-3 min-h-[120px]">
                <div className="text-[10px] font-semibold text-orange-800 mb-2">
                  MEDIUM RISK
                </div>
                <div className="space-y-1">
                  {modules
                    .filter(
                      (m) =>
                        m.businessImpact >= 5 &&
                        m.businessImpact <= 8 &&
                        m.defectFrequency >= 7
                    )
                    .map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleViewModule(m)}
                        className="text-xs bg-white border border-orange-200 rounded px-2 py-1 cursor-pointer hover:bg-orange-100 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{m.id}</div>
                        <div className="text-gray-600 truncate">{m.name}</div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Low Impact Row (0-4) */}
              <div className="bg-gray-100 p-3 border-r border-gray-300 font-semibold text-xs text-gray-700">
                Low (0-4)
              </div>
              <div className="bg-green-100 border-r border-gray-300 p-3 min-h-[120px]">
                <div className="text-[10px] font-semibold text-green-900 mb-2">
                  LOW RISK
                </div>
                <div className="space-y-1">
                  {modules
                    .filter(
                      (m) => m.businessImpact <= 4 && m.defectFrequency <= 3
                    )
                    .map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleViewModule(m)}
                        className="text-xs bg-white border border-green-300 rounded px-2 py-1 cursor-pointer hover:bg-green-200 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{m.id}</div>
                        <div className="text-gray-600 truncate">{m.name}</div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="bg-green-50 border-r border-gray-300 p-3 min-h-[120px]">
                <div className="text-[10px] font-semibold text-green-800 mb-2">
                  LOW RISK
                </div>
                <div className="space-y-1">
                  {modules
                    .filter(
                      (m) =>
                        m.businessImpact <= 4 &&
                        m.defectFrequency >= 4 &&
                        m.defectFrequency <= 6
                    )
                    .map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleViewModule(m)}
                        className="text-xs bg-white border border-green-200 rounded px-2 py-1 cursor-pointer hover:bg-green-100 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{m.id}</div>
                        <div className="text-gray-600 truncate">{m.name}</div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="bg-yellow-50 p-3 min-h-[120px]">
                <div className="text-[10px] font-semibold text-yellow-800 mb-2">
                  MEDIUM RISK
                </div>
                <div className="space-y-1">
                  {modules
                    .filter(
                      (m) => m.businessImpact <= 4 && m.defectFrequency >= 7
                    )
                    .map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleViewModule(m)}
                        className="text-xs bg-white border border-yellow-200 rounded px-2 py-1 cursor-pointer hover:bg-yellow-100 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{m.id}</div>
                        <div className="text-gray-600 truncate">{m.name}</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
                <span className="text-sm font-medium text-gray-700">
                  Low Risk
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-50 border border-yellow-200"></div>
                <span className="text-sm font-medium text-gray-700">
                  Medium Risk
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
                <span className="text-sm font-medium text-gray-700">
                  High Risk
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {displayMode === 'table' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto mb-6">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-gray-700">Module ID</th>
                <th className="px-6 py-4 text-left text-gray-700">
                  Module Name
                </th>
                <th className="px-6 py-4 text-left text-gray-700">
                  Description
                </th>
                <th className="px-6 py-4 text-center text-gray-700">
                  Defect Freq.
                </th>
                <th className="px-6 py-4 text-center text-gray-700">Impact</th>
                <th className="px-6 py-4 text-center text-gray-700">
                  Risk Level
                </th>
                <th className="px-6 py-4 text-left text-gray-700">
                  Testing Protocol
                </th>
                <th className="px-6 py-4 text-center text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredModules.map((module) => {
                const isHighlighted = highlightedItemId === module.id;
                return (
                  <tr
                    key={module.id}
                    className={`
                  ${isHighlighted ? 'bg-indigo-100 dark:bg-indigo-900 ring-2 ring-indigo-500 animate-pulse' : 'hover:bg-gray-50'}
                `}
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        {module.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{module.name}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {module.description}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-12 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-500 h-2 rounded-full"
                            style={{
                              width: `${(module.defectFrequency / 10) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {module.defectFrequency}/10
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-12 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{
                              width: `${(module.businessImpact / 10) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {module.businessImpact}/10
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full border ${getRiskColor(module.riskLevel)}`}
                      >
                        {module.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full ${getProtocolColor(module.testingProtocol)}`}
                      >
                        {module.testingProtocol}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewModule(module)}
                          className="btn btn-primary btn-sm"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        <button
                          onClick={() => handleEditModule(module)}
                          className="btn btn-secondary btn-sm"
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-sm font-bold">
            ƒ
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Risk Scoring Formula
            </h3>
            <p className="text-xs text-gray-500">
              f(Defect Frequency, Business Impact)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-red-200 rounded-lg p-4 bg-red-50/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <span className="text-sm font-semibold text-red-900">
                High Risk
              </span>
            </div>
            <p className="text-xs text-gray-700 mb-2">Defect ≥7 OR Impact ≥9</p>
            <div className="text-xs text-red-700 font-medium">
              → Full Regression Testing
            </div>
          </div>

          <div className="border border-orange-200 rounded-lg p-4 bg-orange-50/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
              <span className="text-sm font-semibold text-orange-900">
                Medium Risk
              </span>
            </div>
            <p className="text-xs text-gray-700 mb-2">
              Defect 4-6 OR Impact 5-8
            </p>
            <div className="text-xs text-orange-700 font-medium">
              → Focused Functional Testing
            </div>
          </div>

          <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <span className="text-sm font-semibold text-green-900">
                Low Risk
              </span>
            </div>
            <p className="text-xs text-gray-700 mb-2">
              Defect ≤3 AND Impact ≤4
            </p>
            <div className="text-xs text-green-700 font-medium">
              → Visual/Smoke Check
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
