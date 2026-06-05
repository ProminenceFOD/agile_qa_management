interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
}

export function NotificationModal({ isOpen, onClose, title, message, type = 'info' }: NotificationModalProps) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: '✓',
          iconBg: 'bg-green-500',
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: '✕',
          iconBg: 'bg-red-500',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: '⚠',
          iconBg: 'bg-yellow-500',
        };
      default:
        return {
          bg: 'bg-indigo-50',
          border: 'border-indigo-200',
          text: 'text-indigo-800',
          icon: 'ℹ',
          iconBg: 'bg-indigo-500',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-10 h-10 ${styles.iconBg} rounded-full flex items-center justify-center text-white text-xl`}>
              {styles.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-700">{message}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-lg">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
