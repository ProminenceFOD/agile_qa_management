import { useState } from 'react';
import { Plus, Edit3, Trash2, UserPlus, CheckCircle, Check, Play } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';

type ActionType = 'create' | 'update' | 'delete' | 'assign' | 'signoff' | 'approve' | 'execute';
type EntityType = 'story' | 'bug' | 'testcase' | 'user';

interface AuditEntry {
  id: string;
  timestamp: Date;
  user: string;
  action: ActionType;
  entityType: EntityType;
  entityId: string;
  entityTitle?: string;
  changes?: Record<string, { old: any; new: any }>;
  details?: string;
}

export function AuditTrail() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<'all' | ActionType>('all');
  const [filterEntity, setFilterEntity] = useState<'all' | EntityType>('all');
  const [filterUser, setFilterUser] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const defaultEntries: AuditEntry[] = [
    {
      id: 'AUDIT-001',
      timestamp: new Date('2026-04-26T10:30:00'),
      user: 'Damilola Ogunlade',
      action: 'signoff',
      entityType: 'story',
      entityId: 'US-101',
      entityTitle: 'User Authentication - Login Flow',
      details: 'QA sign-off approved',
    },
    {
      id: 'AUDIT-002',
      timestamp: new Date('2026-04-26T09:15:00'),
      user: 'Sarah Johnson',
      action: 'approve',
      entityType: 'story',
      entityId: 'US-101',
      entityTitle: 'User Authentication - Login Flow',
      details: 'PM approval granted',
    },
    {
      id: 'AUDIT-003',
      timestamp: new Date('2026-04-26T08:45:00'),
      user: 'Mike Williams',
      action: 'assign',
      entityType: 'story',
      entityId: 'US-102',
      entityTitle: 'Payment Gateway Integration',
      changes: {
        assignedDeveloper: { old: '', new: 'James Martinez' },
      },
    },
    {
      id: 'AUDIT-004',
      timestamp: new Date('2026-04-25T16:20:00'),
      user: 'Emily Chen',
      action: 'create',
      entityType: 'bug',
      entityId: 'BUG-015',
      entityTitle: 'Cart total calculation incorrect',
      details: 'Critical bug reported',
    },
    {
      id: 'AUDIT-005',
      timestamp: new Date('2026-04-25T14:00:00'),
      user: 'Damilola Ogunlade',
      action: 'execute',
      entityType: 'testcase',
      entityId: 'TC-001',
      entityTitle: 'Login with valid credentials',
      changes: {
        status: { old: 'Not Run', new: 'Pass' },
      },
    },
    {
      id: 'AUDIT-006',
      timestamp: new Date('2026-04-25T11:30:00'),
      user: 'Sarah Johnson',
      action: 'update',
      entityType: 'story',
      entityId: 'US-103',
      entityTitle: 'Dashboard Analytics Widget',
      changes: {
        priority: { old: 'Medium', new: 'High' },
        storyPoints: { old: 3, new: 5 },
      },
    },
    {
      id: 'AUDIT-007',
      timestamp: new Date('2026-04-24T13:15:00'),
      user: 'Mike Williams',
      action: 'create',
      entityType: 'user',
      entityId: 'USR-008',
      entityTitle: 'John Doe',
      details: 'New developer added to team',
    },
  ];

  // Use Supabase for persistent storage
  const { data: entries, setData: setEntries, loading: entriesLoading } = useSupabaseData<AuditEntry[]>('aqms_audit_trail', defaultEntries);

  // Show loading state if data isn't ready
  if (entriesLoading || !entries) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-gray-500 mb-4"></div>
          <p className="text-gray-600">Loading audit trail from database...</p>
        </div>
      </div>
    );
  }

  const uniqueUsers = Array.from(new Set(entries.map(e => e.user)));

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = searchQuery === '' ||
      entry.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.entityTitle?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      entry.user.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = filterAction === 'all' || entry.action === filterAction;
    const matchesEntity = filterEntity === 'all' || entry.entityType === filterEntity;
    const matchesUser = filterUser === 'all' || entry.user === filterUser;

    const matchesDateFrom = !dateFrom || entry.timestamp >= new Date(dateFrom);
    const matchesDateTo = !dateTo || entry.timestamp <= new Date(dateTo + 'T23:59:59');

    return matchesSearch && matchesAction && matchesEntity && matchesUser && matchesDateFrom && matchesDateTo;
  });

  const getActionIcon = (action: ActionType) => {
    const iconClass = "w-4 h-4";
    switch (action) {
      case 'create': return <Plus className={iconClass} />;
      case 'update': return <Edit3 className={iconClass} />;
      case 'delete': return <Trash2 className={iconClass} />;
      case 'assign': return <UserPlus className={iconClass} />;
      case 'signoff': return <CheckCircle className={iconClass} />;
      case 'approve': return <Check className={iconClass} />;
      case 'execute': return <Play className={iconClass} />;
    }
  };

  const getActionColor = (action: ActionType) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800 border-green-200';
      case 'update': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delete': return 'bg-red-100 text-red-800 border-red-200';
      case 'assign': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'signoff': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'approve': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'execute': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    }
  };

  const getEntityColor = (entityType: EntityType) => {
    switch (entityType) {
      case 'story': return 'bg-indigo-100 text-indigo-800';
      case 'bug': return 'bg-red-100 text-red-800';
      case 'testcase': return 'bg-green-100 text-green-800';
      case 'user': return 'bg-purple-100 text-purple-800';
    }
  };

  const handleExportAudit = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      dateRange: { from: dateFrom || 'all', to: dateTo || 'all' },
      entries: filteredEntries,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-trail-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Audit Trail</h1>
          <p className="text-gray-600">Complete history of all system changes</p>
        </div>
        <button
          onClick={handleExportAudit}
          className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          📊 Export Audit Log
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Events</div>
          <div className="text-2xl">{entries.length}</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Creates</div>
          <div className="text-2xl text-green-600">{entries.filter(e => e.action === 'create').length}</div>
        </div>
        <div className="bg-indigo-50 rounded-lg shadow-sm border border-indigo-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Updates</div>
          <div className="text-2xl text-indigo-600">{entries.filter(e => e.action === 'update').length}</div>
        </div>
        <div className="bg-purple-50 rounded-lg shadow-sm border border-purple-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Active Users</div>
          <div className="text-2xl text-purple-600">{uniqueUsers.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Action</label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value as typeof filterAction)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="assign">Assign</option>
              <option value="signoff">Sign-off</option>
              <option value="approve">Approve</option>
              <option value="execute">Execute</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Entity</label>
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value as typeof filterEntity)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">All Types</option>
              <option value="story">Stories</option>
              <option value="bug">Bugs</option>
              <option value="testcase">Test Cases</option>
              <option value="user">Users</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">User</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">All Users</option>
              {uniqueUsers.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Timestamp</th>
                <th className="px-6 py-3 text-left text-gray-700">User</th>
                <th className="px-6 py-3 text-center text-gray-700">Action</th>
                <th className="px-6 py-3 text-left text-gray-700">Entity</th>
                <th className="px-6 py-3 text-left text-gray-700">Changes</th>
                <th className="px-6 py-3 text-left text-gray-700">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEntries.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(entry.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{entry.user}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs ${getActionColor(entry.action)}`}>
                      {getActionIcon(entry.action)} {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs w-fit ${getEntityColor(entry.entityType)}`}>
                        {entry.entityType}
                      </span>
                      <div className="font-medium text-gray-900">{entry.entityId}</div>
                      {entry.entityTitle && (
                        <div className="text-sm text-gray-500">{entry.entityTitle}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {entry.changes && Object.keys(entry.changes).length > 0 ? (
                      <div className="space-y-1">
                        {Object.entries(entry.changes).map(([field, change]) => (
                          <div key={field} className="text-xs">
                            <span className="font-medium text-gray-700">{field}:</span>
                            <span className="text-red-600 line-through ml-1">{JSON.stringify(change.old)}</span>
                            <span className="mx-1">→</span>
                            <span className="text-green-600">{JSON.stringify(change.new)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                    {entry.details || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No audit entries found matching your search criteria
          </div>
        )}
      </div>
    </div>
  );
}
