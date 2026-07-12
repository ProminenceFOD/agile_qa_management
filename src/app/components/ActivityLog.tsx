import {
  Plus,
  Edit3,
  Trash2,
  UserPlus,
  Check,
  MessageCircle,
  Paperclip,
  FileText,
} from 'lucide-react';

interface ActivityLog {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  details?: string;
}

interface ActivityLogProps {
  activities: ActivityLog[];
}

export function ActivityLog({ activities }: ActivityLogProps) {
  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionIcon = (action: string) => {
    const iconClass = 'w-4 h-4';
    if (action.includes('created')) return <Plus className={iconClass} />;
    if (action.includes('updated') || action.includes('edited'))
      return <Edit3 className={iconClass} />;
    if (action.includes('deleted')) return <Trash2 className={iconClass} />;
    if (action.includes('assigned')) return <UserPlus className={iconClass} />;
    if (action.includes('approved') || action.includes('signed'))
      return <Check className={iconClass} />;
    if (action.includes('comment'))
      return <MessageCircle className={iconClass} />;
    if (action.includes('attached')) return <Paperclip className={iconClass} />;
    return <FileText className={iconClass} />;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg text-gray-800">Activity Log</h3>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No activity yet</div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3 text-sm">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                {getActionIcon(activity.action)}
              </div>
              <div className="flex-1">
                <div className="text-gray-900">
                  <span className="font-medium">{activity.user}</span>{' '}
                  {activity.action}
                </div>
                {activity.details && (
                  <div className="text-gray-600 text-xs mt-1">
                    {activity.details}
                  </div>
                )}
                <div className="text-gray-500 text-xs mt-1">
                  {formatTimestamp(activity.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
