import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Modal } from './Modal';

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
  edited?: boolean;
}

interface CommentsSectionProps {
  comments: Comment[];
  onAddComment: (text: string) => void;
  onEditComment: (id: string, text: string) => void;
  onDeleteComment: (id: string) => void;
}

const TEAM_MEMBERS = [
  'Damilola Ogunlade',
  'Sarah Johnson',
  'Mike Williams',
  'James Martinez',
  'Emily Chen',
  'David Kumar',
  'Maria Rodriguez',
  'Linda Thompson',
  'Michael Brown',
  'Robert Taylor',
];

export function CommentsSection({
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
}: CommentsSectionProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentionPosition, setMentionPosition] = useState(0);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionDropdownRef = useRef<HTMLDivElement>(null);

  // Close mention dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showMentions &&
        mentionDropdownRef.current &&
        !mentionDropdownRef.current.contains(event.target as Node) &&
        !textareaRef.current?.contains(event.target as Node)
      ) {
        setShowMentions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMentions]);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const cursorPos = e.target.selectionStart;
    setNewComment(text);

    // Check for @ mention
    const textBeforeCursor = text.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Only show mentions if @ is the start or preceded by space, and no space after @
      const charBeforeAt =
        lastAtIndex === 0 ? ' ' : textBeforeCursor[lastAtIndex - 1];
      if (
        (charBeforeAt === ' ' || charBeforeAt === '\n') &&
        !textAfterAt.includes(' ')
      ) {
        setMentionFilter(textAfterAt.toLowerCase());
        setMentionPosition(lastAtIndex);
        setShowMentions(true);
        setSelectedMentionIndex(0);
        return;
      }
    }

    setShowMentions(false);
  };

  const handleMentionSelect = useCallback((name: string) => {
    const beforeMention = newComment.slice(0, mentionPosition);
    const afterMention = newComment.slice(mentionPosition + mentionFilter.length + 1);
    const newText = beforeMention + '@' + name + ' ' + afterMention;
    setNewComment(newText);
    setShowMentions(false);

    // Focus back on textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = (beforeMention + '@' + name + ' ').length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [newComment, mentionPosition, mentionFilter]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions) {
      const filteredMembers = TEAM_MEMBERS.filter((name) =>
        name.toLowerCase().includes(mentionFilter)
      );

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev < filteredMembers.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && filteredMembers.length > 0) {
        e.preventDefault();
        handleMentionSelect(filteredMembers[selectedMentionIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentions(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
      setShowMentions(false);
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const handleSaveEdit = (id: string) => {
    if (editText.trim()) {
      onEditComment(id, editText);
      setEditingId(null);
      setEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const renderCommentText = (text: string) => {
    // Simple @mention highlighting
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-indigo-600 font-medium">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg text-gray-800">Discussion ({comments.length})</h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={newComment}
            onChange={handleCommentChange}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment... Type @ to mention team members"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Mention Dropdown */}
          {showMentions &&
            (() => {
              const filteredMembers = TEAM_MEMBERS.filter((name) =>
                name.toLowerCase().includes(mentionFilter)
              );

              if (filteredMembers.length === 0) return null;

              return (
                <div
                  ref={mentionDropdownRef}
                  className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto w-64"
                >
                  {filteredMembers.map((name, index) => (
                    <div
                      key={name}
                      // eslint-disable-next-line react-hooks/refs
                      onClick={() => handleMentionSelect(name)}
                      className={`px-4 py-2 cursor-pointer hover:bg-indigo-50 ${
                        index === selectedMentionIndex ? 'bg-indigo-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm">
                          {name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div className="font-medium text-gray-900">{name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            💡 Type{' '}
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">
              @
            </kbd>{' '}
            to mention someone
          </span>
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Comment
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm">
                    {comment.author
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {comment.author}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimestamp(comment.timestamp)}
                      {comment.edited && ' (edited)'}
                    </div>
                  </div>
                </div>

                {user?.name === comment.author && (
                  <div className="flex gap-2">
                    {editingId !== comment.id && (
                      <>
                        <button
                          onClick={() => handleEdit(comment)}
                          className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDeletingCommentId(comment.id);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {editingId === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(comment.id)}
                      className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-700 whitespace-pre-wrap">
                  {renderCommentText(comment.text)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Delete Comment Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingCommentId(null);
        }}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        type="danger"
        onConfirm={() => {
          if (deletingCommentId) {
            onDeleteComment(deletingCommentId);
          }
          setShowDeleteConfirm(false);
          setDeletingCommentId(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
