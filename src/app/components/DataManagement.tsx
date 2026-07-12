import { useState, useEffect } from 'react';
import { Trash2, Download, FileText } from 'lucide-react';
import { Modal } from './Modal';
import { useModal } from '../hooks/useModal';
import { getData, setData } from '../utils/supabaseStorage';
import { toast } from 'sonner';

export function DataManagement() {
  const { modalState, showAlert, showSuccess, showConfirm, closeModal } =
    useModal();
  const [importing, setImporting] = useState(false);
  const [importingCSV, setImportingCSV] = useState(false);
  const [dataCounts, setDataCounts] = useState({
    stories: 0,
    bugs: 0,
    testCases: 0,
    users: 0,
    executionHistory: 0,
    totalSize: '0.00',
  });

  useEffect(() => {
    const loadDataCounts = async () => {
      const stories = (await getData('aqms_stories')) || [];
      const bugs = (await getData('aqms_bugs')) || [];
      const testCases = (await getData('aqms_test_cases')) || [];
      const users = (await getData('aqms_users')) || [];
      const executionHistory =
        (await getData('aqms_test_execution_history')) || [];

      const totalSize =
        (JSON.stringify(stories).length +
          JSON.stringify(bugs).length +
          JSON.stringify(testCases).length +
          JSON.stringify(users).length +
          JSON.stringify(executionHistory).length) /
        1024; // Convert to KB

      setDataCounts({
        stories: stories.length,
        bugs: bugs.length,
        testCases: testCases.length,
        users: users.length,
        executionHistory: executionHistory.length,
        totalSize: totalSize.toFixed(2),
      });
    };

    loadDataCounts();
  }, []);

  const handleExportData = async () => {
    const data = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      stories: JSON.stringify(await getData('aqms_stories')),
      bugs: JSON.stringify(await getData('aqms_bugs')),
      testCases: JSON.stringify(await getData('aqms_test_cases')),
      users: JSON.stringify(await getData('aqms_users')),
      executionHistory: JSON.stringify(
        await getData('aqms_test_execution_history')
      ),
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aqms-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    showSuccess('Data exported successfully!');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    showConfirm(
      'Are you sure you want to import data? This will overwrite all existing data.',
      () => {
        setImporting(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
          try {
            const content = e.target?.result as string;
            const data = JSON.parse(content);

            // Validate data structure
            if (!data.version || !data.exportedAt) {
              showAlert('Invalid backup file format');
              setImporting(false);
              return;
            }

            // Import data to Supabase
            if (data.stories)
              await setData('aqms_stories', JSON.parse(data.stories));
            if (data.bugs) await setData('aqms_bugs', JSON.parse(data.bugs));
            if (data.testCases)
              await setData('aqms_test_cases', JSON.parse(data.testCases));
            if (data.users) await setData('aqms_users', JSON.parse(data.users));
            if (data.executionHistory)
              await setData(
                'aqms_test_execution_history',
                JSON.parse(data.executionHistory)
              );

            showSuccess('Data imported successfully! Please refresh the page.');
            setImporting(false);
          } catch (error) {
            showAlert('Error importing data. Please check the file format.');
            setImporting(false);
          }
        };

        reader.onerror = () => {
          showAlert('Error reading file');
          setImporting(false);
        };

        reader.readAsText(file);
      },
      'Import Data',
      'Import',
      'Cancel'
    );

    // Reset file input
    event.target.value = '';
  };

  const handleClearAllData = () => {
    showConfirm(
      'Are you sure you want to clear ALL data? This action cannot be undone and will remove all stories, bugs, test cases, and execution history.',
      async () => {
        await setData('aqms_stories', []);
        await setData('aqms_bugs', []);
        await setData('aqms_test_cases', []);
        await setData('aqms_test_execution_history', []);

        showSuccess('All data cleared successfully! Please refresh the page.');
      },
      'Clear All Data',
      'Clear All',
      'Cancel'
    );
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter((line) => line.trim());
    return lines.map((line) => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });
  };

  const handleImportDefectCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportingCSV(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCSV(text);
        if (rows.length < 2) {
          toast.error('CSV must have header and at least one data row');
          setImportingCSV(false);
          return;
        }

        const headers = rows[0].map((h) => h.toLowerCase());
        const data = rows.slice(1);
        const existingBugs = (await getData('aqms_bugs')) || [];
        const activeModules = (await getData('aqms_modules')) || [];
        const newBugs: any[] = [];

        data.forEach((row, i) => {
          const title = row[headers.indexOf('title')];
          const severity = row[headers.indexOf('severity')] || 'Medium';
          if (!title) return;

          const moduleIdx = headers.indexOf('module');
          const moduleVal =
            moduleIdx !== -1 && row[moduleIdx] ? row[moduleIdx].trim() : '';

          let matchedModule = activeModules.find(
            (m: any) =>
              m.id.toLowerCase() === moduleVal.toLowerCase() ||
              m.name.toLowerCase() === moduleVal.toLowerCase()
          );

          // Substring / fuzzy match fallback
          if (!matchedModule && moduleVal) {
            matchedModule = activeModules.find(
              (m: any) =>
                m.name.toLowerCase().includes(moduleVal.toLowerCase()) ||
                moduleVal.toLowerCase().includes(m.name.toLowerCase())
            );
          }

          newBugs.push({
            id: row[headers.indexOf('bug_id')] || `BUG-${Date.now()}-${i}`,
            title,
            description: 'Imported from CSV',
            severity: ['Critical', 'High', 'Medium', 'Low'].includes(severity)
              ? severity
              : 'Medium',
            status: row[headers.indexOf('status')] || 'Open',
            linkedStory: row[headers.indexOf('linked_story')],
            foundBy: 'CSV Import',
            createdAt: new Date(
              row[headers.indexOf('created_date')] || Date.now()
            ),
            steps: ['Imported from historical data'],
            expectedBehavior: 'See historical records',
            actualBehavior: 'See historical records',
            environment: moduleVal || 'Unknown',
            moduleId: matchedModule ? matchedModule.id : undefined,
          });
        });

        await setData('aqms_bugs', [...existingBugs, ...newBugs]);
        toast.success(`Imported ${newBugs.length} defect records`);
        setImportingCSV(false);
        e.target.value = '';
      } catch (err) {
        toast.error('Error importing CSV');
        setImportingCSV(false);
      }
    };
    reader.readAsText(file);
  };

  const downloadDefectTemplate = () => {
    const csv = `bug_id,title,severity,status,created_date,resolved_date,linked_story,module
BUG-001,Login page not responsive,High,Fixed,2026-01-15,2026-01-20,US-101,Authentication
BUG-002,Payment gateway timeout,Critical,Open,2026-02-01,,US-102,Payment`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'defect_template.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  const downloadSprintTemplate = () => {
    const csv = `sprint_name,start_date,end_date,planned_points,completed_points,velocity,bugs_found
Sprint 10,2026-01-01,2026-01-14,50,45,45,3
Sprint 11,2026-01-15,2026-01-28,55,50,50,2`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sprint_template.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Data Management</h1>
        <p className="text-gray-600">
          Export, import, and manage your AQMS data
        </p>
      </div>

      {/* Data Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Total Data Size</div>
          <div className="text-3xl mb-1">{dataCounts.totalSize} KB</div>
        </div>
        <div className="bg-indigo-50 rounded-lg shadow-sm border border-indigo-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Stories</div>
          <div className="text-3xl text-indigo-600 mb-1">
            {dataCounts.stories}
          </div>
        </div>
        <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Bugs</div>
          <div className="text-3xl text-red-600 mb-1">{dataCounts.bugs}</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Test Cases</div>
          <div className="text-3xl text-green-600 mb-1">
            {dataCounts.testCases}
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg shadow-sm border border-purple-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Users</div>
          <div className="text-3xl text-purple-600 mb-1">
            {dataCounts.users}
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg shadow-sm border border-orange-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Test Executions</div>
          <div className="text-3xl text-orange-600 mb-1">
            {dataCounts.executionHistory}
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl mb-4">Export Data</h2>
        <p className="text-gray-600 mb-4">
          Download a complete backup of all your AQMS data including stories,
          bugs, test cases, users, and execution history.
        </p>
        <button
          onClick={handleExportData}
          className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          📥 Export All Data
        </button>
      </div>

      {/* Import Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl mb-4">Import Data</h2>
        <p className="text-gray-600 mb-4">
          Restore data from a previous export. This will overwrite all existing
          data.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600 text-xl">⚠️</span>
            <div>
              <h3 className="text-sm font-medium text-yellow-900 mb-1">
                Warning
              </h3>
              <p className="text-sm text-yellow-800">
                Importing data will replace all current data. Make sure to
                export your current data first if you want to keep it.
              </p>
            </div>
          </div>
        </div>
        <label className="inline-block px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer">
          <input
            type="file"
            accept=".json"
            onChange={handleImportData}
            className="hidden"
            disabled={importing}
          />
          {importing ? '⏳ Importing...' : '📤 Import Data'}
        </label>
      </div>

      {/* CSV Import Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl mb-4">Import Historical Data (CSV)</h2>
        <p className="text-gray-600 mb-4">
          Import historical defect records from CSV for risk analysis and trend
          identification.
        </p>

        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-600" />
            Defect Records
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Import historical bug data with severity, status, and module
            information.
          </p>
          <div className="space-y-2">
            <button
              onClick={downloadDefectTemplate}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download CSV Template
            </button>
            <label className="w-full block">
              <input
                type="file"
                accept=".csv"
                onChange={handleImportDefectCSV}
                className="hidden"
                disabled={importingCSV}
              />
              <div className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm cursor-pointer text-center">
                {importingCSV ? '⏳ Importing...' : '🐛 Import Defect CSV'}
              </div>
            </label>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            <strong>Required:</strong> title, severity
            <br />
            <strong>Optional:</strong> bug_id, status, created_date,
            resolved_date, linked_story, module
          </div>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <strong>💡 Tip:</strong> Download template first to see correct
          format. Imported data merges with existing records.
        </div>
      </div>

      {/* Clear Data Section */}
      <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-6">
        <h2 className="text-xl mb-4 text-red-900">Danger Zone</h2>
        <p className="text-gray-700 mb-4">
          Clear all AQMS data from local storage. This action cannot be undone.
        </p>
        <button onClick={handleClearAllData} className="btn btn-danger btn-lg">
          <Trash2 className="w-4 h-4" />
          Clear All Data
        </button>
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
