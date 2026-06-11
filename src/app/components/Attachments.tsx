import { useState } from 'react';
import { NotificationModal } from './NotificationModal';
import { Modal } from './Modal';

interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedAt: Date;
  linkedTo: {
    type: 'story' | 'bug' | 'sprint';
    id: string;
    title: string;
  };
  url: string;
  thumbnail?: string;
}

export function Attachments() {
  const [attachments, setAttachments] = useState<Attachment[]>([
    {
      id: 'ATT-001',
      fileName: 'wireframe-payment-flow.png',
      fileSize: 2456789,
      fileType: 'image/png',
      uploadedBy: 'Damilola Ogunlade',
      uploadedAt: new Date('2026-04-20T10:30:00'),
      linkedTo: {
        type: 'story',
        id: 'US-101',
        title: 'Payment Gateway Integration',
      },
      url: '#',
      thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23e5e7eb" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-family="sans-serif" font-size="14"%3EPNG%3C/text%3E%3C/svg%3E',
    },
    {
      id: 'ATT-002',
      fileName: 'test-results.pdf',
      fileSize: 1234567,
      fileType: 'application/pdf',
      uploadedBy: 'Sarah Johnson',
      uploadedAt: new Date('2026-04-22T14:15:00'),
      linkedTo: {
        type: 'bug',
        id: 'BUG-001',
        title: 'Login page rendering issue',
      },
      url: '#',
    },
    {
      id: 'ATT-003',
      fileName: 'api-documentation.pdf',
      fileSize: 987654,
      fileType: 'application/pdf',
      uploadedBy: 'Mike Williams',
      uploadedAt: new Date('2026-04-18T09:00:00'),
      linkedTo: {
        type: 'story',
        id: 'US-102',
        title: 'User Authentication',
      },
      url: '#',
    },
    {
      id: 'ATT-004',
      fileName: 'screenshot-error.jpg',
      fileSize: 567890,
      fileType: 'image/jpeg',
      uploadedBy: 'Damilola Ogunlade',
      uploadedAt: new Date('2026-04-25T16:45:00'),
      linkedTo: {
        type: 'bug',
        id: 'BUG-002',
        title: 'Dashboard chart not loading',
      },
      url: '#',
      thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23e5e7eb" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-family="sans-serif" font-size="14"%3EJPG%3C/text%3E%3C/svg%3E',
    },
  ]);

  const [filterType, setFilterType] = useState<'all' | 'story' | 'bug' | 'sprint'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [linkType, setLinkType] = useState<'story' | 'bug' | 'sprint'>('story');
  const [linkId, setLinkId] = useState('');
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'warning' as const });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<string | null>(null);

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
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📽️';
    return '📎';
  };

  const getTypeColor = (type: 'story' | 'bug' | 'sprint') => {
    switch (type) {
      case 'story':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'bug':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'sprint':
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  const filteredAttachments = attachments.filter(att => {
    const matchesType = filterType === 'all' || att.linkedTo.type === filterType;
    const matchesSearch = att.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         att.linkedTo.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !linkId) {
      setNotification({
        isOpen: true,
        title: 'Required Fields',
        message: 'Please select a file and provide a link ID',
        type: 'warning',
      });
      return;
    }

    const newAttachment: Attachment = {
      id: `ATT-${String(attachments.length + 1).padStart(3, '0')}`,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type,
      uploadedBy: 'Damilola Ogunlade',
      uploadedAt: new Date(),
      linkedTo: {
        type: linkType,
        id: linkId,
        title: `${linkType === 'story' ? 'Story' : linkType === 'bug' ? 'Bug' : 'Sprint'} ${linkId}`,
      },
      url: URL.createObjectURL(selectedFile),
      thumbnail: selectedFile.type.startsWith('image/') ? URL.createObjectURL(selectedFile) : undefined,
    };

    setAttachments([newAttachment, ...attachments]);
    setUploadModalOpen(false);
    setSelectedFile(null);
    setLinkId('');
  };

  const handleDelete = (id: string) => {
    setDeletingAttachmentId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deletingAttachmentId) {
      setAttachments(attachments.filter(att => att.id !== deletingAttachmentId));
    }
    setShowDeleteConfirm(false);
    setDeletingAttachmentId(null);
  };

  const totalSize = attachments.reduce((sum, att) => sum + att.fileSize, 0);

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Attachments & Files</h1>
          <p className="text-gray-600">Manage files linked to stories, bugs, and sprints</p>
        </div>
        <button
          onClick={() => setUploadModalOpen(true)}
          className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          📎 Upload File
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Files</div>
          <div className="text-2xl font-bold text-gray-900">{attachments.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Size</div>
          <div className="text-2xl font-bold text-gray-900">{formatFileSize(totalSize)}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Images</div>
          <div className="text-2xl font-bold text-indigo-600">
            {attachments.filter(a => a.fileType.startsWith('image/')).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Documents</div>
          <div className="text-2xl font-bold text-purple-600">
            {attachments.filter(a => !a.fileType.startsWith('image/')).length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex gap-2">
          {['all', 'story', 'bug', 'sprint'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type as typeof filterType)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                filterType === type
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Attachments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAttachments.map(attachment => (
          <div key={attachment.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Thumbnail or Icon */}
            <div className="h-40 bg-gray-100 flex items-center justify-center">
              {attachment.thumbnail ? (
                <img src={attachment.thumbnail} alt={attachment.fileName} className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="text-6xl">{getFileIcon(attachment.fileType)}</div>
              )}
            </div>

            {/* File Info */}
            <div className="p-4">
              <div className="mb-2">
                <div className="font-medium text-gray-900 truncate" title={attachment.fileName}>
                  {attachment.fileName}
                </div>
                <div className="text-xs text-gray-500">{formatFileSize(attachment.fileSize)}</div>
              </div>

              <div className="mb-3">
                <span className={`inline-flex items-center px-2 py-1 rounded border text-xs ${getTypeColor(attachment.linkedTo.type)}`}>
                  {attachment.linkedTo.type}: {attachment.linkedTo.id}
                </span>
              </div>

              <div className="text-xs text-gray-600 mb-3">
                <div>Uploaded by {attachment.uploadedBy}</div>
                <div>{new Date(attachment.uploadedAt).toLocaleString()}</div>
              </div>

              <div className="flex gap-2">
                <a
                  href={attachment.url}
                  download={attachment.fileName}
                  className="flex-1 px-3 py-2 bg-indigo-500 text-white rounded text-sm text-center hover:bg-indigo-600 transition-colors"
                >
                  Download
                </a>
                <button
                  onClick={() => handleDelete(attachment.id)}
                  className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAttachments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No attachments found
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setUploadModalOpen(false)}></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 rounded-t-lg flex-shrink-0">
                <h2 className="text-2xl text-gray-900 dark:text-white font-semibold">Upload File</h2>
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-4 flex-grow overflow-y-auto custom-scrollbar">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select File
                  </label>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  />
                  {selectedFile && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Link To
                  </label>
                  <select
                    value={linkType}
                    onChange={(e) => setLinkType(e.target.value as typeof linkType)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="story">User Story</option>
                    <option value="bug">Bug</option>
                    <option value="sprint">Sprint</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {linkType === 'story' ? 'Story ID' : linkType === 'bug' ? 'Bug ID' : 'Sprint ID'}
                  </label>
                  <input
                    type="text"
                    value={linkId}
                    onChange={(e) => setLinkId(e.target.value)}
                    placeholder={linkType === 'story' ? 'US-XXX' : linkType === 'bug' ? 'BUG-XXX' : 'SPR-XXX'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg flex-shrink-0">
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || !linkId}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      {/* Delete Attachment Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingAttachmentId(null);
        }}
        title="Delete Attachment"
        message="Are you sure you want to delete this attachment? This action cannot be undone."
        type="danger"
        onConfirm={confirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
