interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedAt: Date;
  url: string;
}

interface AttachmentsListProps {
  attachments: Attachment[];
  onDelete?: (id: string) => void;
}

export function AttachmentsList({
  attachments,
  onDelete,
}: AttachmentsListProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
    if (fileType.includes('presentation') || fileType.includes('powerpoint'))
      return '📽️';
    return '📎';
  };

  if (attachments.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-4">
        No attachments
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          <div className="text-2xl">{getFileIcon(attachment.fileType)}</div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {attachment.fileName}
            </div>
            <div className="text-xs text-gray-500">
              {formatFileSize(attachment.fileSize)} • {attachment.uploadedBy} •{' '}
              {new Date(attachment.uploadedAt).toLocaleDateString()}
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={attachment.url}
              download={attachment.fileName}
              className="px-3 py-1 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600 transition-colors"
            >
              Download
            </a>
            {onDelete && (
              <button
                onClick={() => onDelete(attachment.id)}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
