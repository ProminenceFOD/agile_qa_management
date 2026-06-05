interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'alert' | 'confirm' | 'success' | 'error';
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  message,
  type = 'alert',
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
}: ModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <div className="text-green-500 text-5xl mb-4">✓</div>;
      case 'error':
        return <div className="text-red-500 text-5xl mb-4">✕</div>;
      case 'confirm':
        return <div className="text-indigo-500 text-5xl mb-4">?</div>;
      default:
        return <div className="text-indigo-500 text-5xl mb-4">ℹ</div>;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 hover:bg-green-600';
      case 'error':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-indigo-500 hover:bg-indigo-600';
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={type === 'confirm' ? undefined : onClose}
      ></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
          <div className="p-6 text-center">
            {getIcon()}
            <h2 className="text-2xl text-gray-900 mb-3">{title}</h2>
            <p className="text-gray-700 mb-6 whitespace-pre-line">{message}</p>

            <div className="flex justify-center gap-3">
              {type === 'confirm' ? (
                <>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={handleConfirm}
                    className={`px-6 py-2 text-white rounded-lg transition-colors ${getButtonColor()}`}
                  >
                    {confirmText}
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  className={`px-6 py-2 text-white rounded-lg transition-colors ${getButtonColor()}`}
                >
                  {confirmText}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
