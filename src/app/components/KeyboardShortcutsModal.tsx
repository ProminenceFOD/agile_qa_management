interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { category: 'Navigation', items: [
      { keys: ['Ctrl', '1'], description: 'Go to Dashboard' },
      { keys: ['Ctrl', '2'], description: 'Go to Kanban Board' },
      { keys: ['Ctrl', '3'], description: 'Go to Stories (Criteria Validator)' },
      { keys: ['Ctrl', '4'], description: 'Go to Risk Matrix' },
      { keys: ['Ctrl', '5'], description: 'Go to Burn-Down Tracker' },
      { keys: ['Ctrl', '6'], description: 'Go to Test Cases' },
      { keys: ['Ctrl', '7'], description: 'Go to Bug Tracker' },
      { keys: ['Ctrl', '8'], description: 'Go to Analytics' },
      { keys: ['Ctrl', '9'], description: 'Go to Sprints' },
      { keys: ['Ctrl', '0'], description: 'Go to User Management' },
    ]},
    { category: 'Actions', items: [
      { keys: ['Ctrl', 'K'], description: 'Open search' },
      { keys: ['Ctrl', 'N'], description: 'Create new story' },
      { keys: ['Ctrl', 'D'], description: 'Toggle dark mode' },
      { keys: ['Ctrl', 'E'], description: 'Export data' },
      { keys: ['Esc'], description: 'Close modal / Cancel' },
    ]},
    { category: 'Help', items: [
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['Ctrl', '/'], description: 'Toggle command palette' },
    ]},
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-2xl text-gray-900">Keyboard Shortcuts</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="p-6 space-y-6">
            {shortcuts.map((section, index) => (
              <div key={index}>
                <h3 className="text-lg font-medium text-gray-800 mb-3">{section.category}</h3>
                <div className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between py-2">
                      <span className="text-gray-700">{item.description}</span>
                      <div className="flex gap-1">
                        {item.keys.map((key, keyIndex) => (
                          <kbd
                            key={keyIndex}
                            className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              💡 Tip: Press <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">?</kbd> anytime to show this help
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
