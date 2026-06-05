import { Download, FileText, Book, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

export function HelpDocumentation() {
  const downloadMarkdown = () => {
    fetch('/AQMS_Documentation.md')
      .then(response => response.text())
      .then(content => {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'AQMS_Documentation.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Documentation downloaded successfully!');
      })
      .catch(error => {
        console.error('Download error:', error);
        toast.error('Failed to download documentation');
      });
  };

  const downloadPDF = () => {
    toast.info('PDF export coming soon! Use the Markdown file for now.');
  };

  const viewOnline = () => {
    window.open('/AQMS_Documentation.md', '_blank');
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Help & Documentation
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive guide to all AQMS features and functionalities
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <Download className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Download Docs
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Download the complete documentation as a Markdown file for offline access
          </p>
          <button
            onClick={downloadMarkdown}
            className="btn btn-primary w-full"
          >
            <Download className="w-4 h-4" />
            Download Markdown
          </button>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              View Online
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Open the documentation in a new tab to read it online
          </p>
          <button
            onClick={viewOnline}
            className="btn btn-secondary w-full"
          >
            <Book className="w-4 h-4" />
            View Online
          </button>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow opacity-60">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Export as PDF
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Download a PDF version for printing or sharing
          </p>
          <button
            onClick={downloadPDF}
            className="btn btn-secondary w-full"
            disabled
          >
            <Download className="w-4 h-4" />
            Coming Soon
          </button>
        </div>
      </div>

      {/* Documentation Sections */}
      <div className="card p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          What's Covered
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-500" />
              Getting Started
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Login and authentication</li>
              <li>• User roles and permissions</li>
              <li>• Navigation and interface overview</li>
              <li>• First-time setup guide</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-green-500" />
              Core Features
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Dashboard and overview</li>
              <li>• Kanban board workflow</li>
              <li>• Story management</li>
              <li>• Test case creation and execution</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-500" />
              Quality Management
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Bug tracking and resolution</li>
              <li>• Risk matrix and assessment</li>
              <li>• Burn-down charts</li>
              <li>• Test execution history</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-orange-500" />
              Analytics & AI
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Analytics dashboards</li>
              <li>• AI test recommendations</li>
              <li>• Team performance tracking</li>
              <li>• Custom reports generation</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-red-500" />
              Planning & Workflow
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Sprint management</li>
              <li>• Traceability matrix</li>
              <li>• Release readiness</li>
              <li>• Workflow best practices</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-yellow-500" />
              Administration
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• User management</li>
              <li>• Audit trail</li>
              <li>• Bulk operations</li>
              <li>• Data import/export</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Keyboard Shortcuts
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Dashboard</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+1</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Stories</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+3</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Test Cases</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+6</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Bugs</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+7</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Toggle Theme</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+Shift+D</kbd>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
            Press <kbd className="px-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+/</kbd> to see all shortcuts
          </p>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Common Workflows
          </h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <div className="font-medium text-gray-900 dark:text-white mb-1">Create a Story</div>
              <div className="text-xs">Stories → Create Story → Fill details → Save</div>
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white mb-1">Execute a Test</div>
              <div className="text-xs">Test Cases → Run → Follow steps → Mark Pass/Fail</div>
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white mb-1">Report a Bug</div>
              <div className="text-xs">Bugs → Report Bug → Describe issue → Submit</div>
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white mb-1">Link Test to Story</div>
              <div className="text-xs">View Story → Linked Items → + Link Test</div>
            </div>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="card p-6 mt-6 bg-indigo-50 dark:bg-indigo-900 border-indigo-200 dark:border-indigo-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Need Help?
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          The comprehensive documentation contains detailed explanations of every feature,
          button, workflow, and functionality in AQMS. Download it for a complete reference guide.
        </p>
        <div className="flex gap-3">
          <button onClick={downloadMarkdown} className="btn btn-primary">
            <Download className="w-4 h-4" />
            Download Full Documentation
          </button>
          <button onClick={viewOnline} className="btn btn-secondary">
            <Book className="w-4 h-4" />
            Read Online
          </button>
        </div>
      </div>
    </div>
  );
}
