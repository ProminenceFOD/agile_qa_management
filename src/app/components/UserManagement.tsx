import { useState, useEffect } from 'react';
import {
  Edit3,
  AlertTriangle,
  Check,
  X,
  Shield,
  Clock,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { Modal } from './Modal';
import { useModal } from '../hooks/useModal';
import {
  hasPermission,
  isAdmin,
  getPermissionsForRole,
  canAccessTab,
  DEFAULT_ROLE_PERMISSIONS,
  getCurrentRolePermissions,
  overrideRolePermissions,
  TAB_PERMISSION_MAP,
  PERMISSION_TEMPLATES,
  ALL_PERMISSIONS,
  type Permission,
  type AnyRole,
  type AuditLogEntry,
  type UserPermissionOverride,
  getUserOverride,
  grantUserPermission,
  revokeUserPermission,
  clearUserOverrides,
  loadUserOverrides,
  saveUserOverrides,
  getAuditLogs,
  logAuditEntry,
  applyTemplateToRole,
  applyTemplateToUser,
} from '../utils/permissions';
import {
  getData as getStorageData,
  setData as setStorageData,
} from '../utils/supabaseStorage';
import type { UserRole } from '../contexts/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  role:
    | 'Administrator'
    | 'QA Engineer'
    | 'Product Manager'
    | 'Scrum Master'
    | 'Developer'
    | 'Tester';
  title?: string;
  status: 'Active' | 'Invited' | 'Inactive';
  joinedDate: Date;
  lastActive?: Date;
  storiesAssigned?: number;
  bugsAssigned?: number;
  canSignOffQA?: boolean;
  canSignOffPM?: boolean;
}

interface Invitation {
  id: string;
  email: string;
  role:
    | 'Administrator'
    | 'QA Engineer'
    | 'Product Manager'
    | 'Scrum Master'
    | 'Developer'
    | 'Tester';
  sentBy: string;
  sentAt: Date;
  status: 'Pending' | 'Accepted' | 'Expired';
  expiresAt: Date;
}

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const currentOrgId = currentUser?.organizationId || 'demo-org';
  const [activeTab, setActiveTab] = useState<
    'users' | 'invitations' | 'permissions' | 'userperms' | 'audit'
  >('users');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<User['role']>('Developer');

  // Add user directly state
  const [addUserName, setAddUserName] = useState('');
  const [addUserEmail, setAddUserEmail] = useState('');
  const [addUserRole, setAddUserRole] = useState<User['role']>('Developer');
  const [addUserTitle, setAddUserTitle] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | User['role']>('all');
  const [showEditTitleModal, setShowEditTitleModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');

  // User permissions state
  const [selectedUserForPerms, setSelectedUserForPerms] = useState<
    string | null
  >(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateTarget, setTemplateTarget] = useState<{
    type: 'role' | 'user';
    id: string;
    name: string;
  } | null>(null);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Initialize users from localStorage or use defaults
  const getInitialUsers = (): User[] => {
    const storedUsers = localStorage.getItem('aqms_users');
    if (storedUsers) {
      try {
        const parsed = JSON.parse(storedUsers);
        return parsed.map((u: any) => ({
          ...u,
          joinedDate: u.joinedDate ? new Date(u.joinedDate) : new Date(),
          lastActive: u.lastActive ? new Date(u.lastActive) : undefined,
        }));
      } catch (e) {
        console.error('Failed to load users from localStorage:', e);
      }
    }

    // Return default users only if localStorage is empty
    return [
      {
        id: 'USR-001',
        name: 'Damilola Ogunlade',
        email: 'qa@aqms.com',
        role: 'Administrator',
        title: 'Head of QA / Administrator',
        status: 'Active',
        joinedDate: new Date('2026-01-15'),
        lastActive: new Date('2026-04-26T14:30:00'),
        storiesAssigned: 12,
        bugsAssigned: 8,
        canSignOffQA: true,
        canSignOffPM: false,
      },
      {
        id: 'USR-002',
        name: 'Sarah Johnson',
        email: 'pm@aqms.com',
        role: 'Product Manager',
        title: 'Senior Product Manager',
        status: 'Active',
        joinedDate: new Date('2026-01-10'),
        lastActive: new Date('2026-04-26T10:15:00'),
        storiesAssigned: 24,
        bugsAssigned: 0,
        canSignOffPM: true,
      },
      {
        id: 'USR-003',
        name: 'Mike Williams',
        email: 'sm@aqms.com',
        role: 'Scrum Master',
        title: 'Lead Scrum Master',
        status: 'Active',
        joinedDate: new Date('2026-01-10'),
        lastActive: new Date('2026-04-25T16:45:00'),
        storiesAssigned: 0,
        bugsAssigned: 0,
      },
      {
        id: 'USR-004',
        name: 'James Martinez',
        email: 'james.martinez@aqms.com',
        role: 'Developer',
        title: 'Senior Software Engineer',
        status: 'Active',
        joinedDate: new Date('2026-02-01'),
        lastActive: new Date('2026-04-26T13:00:00'),
        storiesAssigned: 15,
        bugsAssigned: 5,
      },
      {
        id: 'USR-005',
        name: 'Emily Chen',
        email: 'emily.chen@aqms.com',
        role: 'Developer',
        title: 'Software Engineer',
        status: 'Active',
        joinedDate: new Date('2026-02-15'),
        lastActive: new Date('2026-04-26T11:20:00'),
        storiesAssigned: 10,
        bugsAssigned: 3,
        canSignOffQA: false,
      },
      {
        id: 'USR-006',
        name: 'David Kumar',
        email: 'david.kumar@aqms.com',
        role: 'Developer',
        title: 'Software Engineer',
        status: 'Active',
        joinedDate: new Date('2026-01-20'),
        lastActive: new Date('2026-04-26T09:30:00'),
        storiesAssigned: 8,
        bugsAssigned: 2,
        canSignOffQA: false,
      },
      {
        id: 'USR-008',
        name: 'Maria Rodriguez',
        email: 'maria.rodriguez@aqms.com',
        role: 'Developer',
        title: 'Lead Software Engineer',
        status: 'Active',
        joinedDate: new Date('2026-01-25'),
        lastActive: new Date('2026-04-26T15:00:00'),
        storiesAssigned: 12,
        bugsAssigned: 4,
        canSignOffQA: false,
      },
      {
        id: 'USR-009',
        name: 'Robert Taylor',
        email: 'robert.taylor@aqms.com',
        role: 'Developer',
        title: 'Software Engineer',
        status: 'Active',
        joinedDate: new Date('2026-02-10'),
        lastActive: new Date('2026-04-26T12:30:00'),
        storiesAssigned: 6,
        bugsAssigned: 1,
        canSignOffQA: false,
      },
      {
        id: 'USR-010',
        name: 'Linda Thompson',
        email: 'linda.thompson@aqms.com',
        role: 'Tester',
        title: 'Senior Test Engineer',
        status: 'Active',
        joinedDate: new Date('2026-02-20'),
        lastActive: new Date('2026-04-26T14:00:00'),
        storiesAssigned: 9,
        bugsAssigned: 7,
        canSignOffQA: false,
      },
      {
        id: 'USR-011',
        name: 'Michael Brown',
        email: 'michael.brown@aqms.com',
        role: 'Tester',
        title: 'Test Engineer',
        status: 'Active',
        joinedDate: new Date('2026-03-05'),
        lastActive: new Date('2026-04-26T10:45:00'),
        storiesAssigned: 5,
        bugsAssigned: 6,
        canSignOffQA: false,
      },
      {
        id: 'USR-012',
        name: 'Jennifer Lee',
        email: 'jennifer.lee@aqms.com',
        role: 'Tester',
        title: 'Test Engineer',
        status: 'Active',
        joinedDate: new Date('2026-03-10'),
        lastActive: new Date('2026-04-26T11:15:00'),
        storiesAssigned: 4,
        bugsAssigned: 5,
        canSignOffQA: false,
      },
      {
        id: 'USR-007',
        name: 'Jessica Williams',
        email: 'jessica.williams@aqms.com',
        role: 'QA Engineer',
        title: 'QA Engineer',
        status: 'Active',
        joinedDate: new Date('2026-03-01'),
        lastActive: new Date('2026-04-26T09:15:00'),
        storiesAssigned: 5,
        bugsAssigned: 3,
        canSignOffQA: false,
      },
    ];
  };

  // Use Supabase for persistent storage (shares data with AuthContext and other components)
  const {
    data: users,
    setData: setUsers,
    loading: usersLoading,
  } = useSupabaseData<User[]>('aqms_users', getInitialUsers());

  const [invitations, setInvitations] = useState<Invitation[]>([
    {
      id: 'INV-001',
      email: 'john.doe@example.com',
      role: 'Developer',
      sentBy: 'Sarah Johnson',
      sentAt: new Date('2026-04-20'),
      status: 'Pending',
      expiresAt: new Date('2026-04-27'),
    },
    {
      id: 'INV-002',
      email: 'jane.smith@example.com',
      role: 'Tester',
      sentBy: 'Damilola Ogunlade',
      sentAt: new Date('2026-04-22'),
      status: 'Pending',
      expiresAt: new Date('2026-04-29'),
    },
    {
      id: 'INV-003',
      email: 'robert.brown@example.com',
      role: 'Developer',
      sentBy: 'Mike Williams',
      sentAt: new Date('2026-04-10'),
      status: 'Expired',
      expiresAt: new Date('2026-04-17'),
    },
  ]);

  // All hooks must be called before any early returns
  const { modalState, showAlert, showSuccess, showConfirm, closeModal } =
    useModal();

  // Load user permission overrides and audit logs on mount
  useEffect(() => {
    const loadData = async () => {
      await loadUserOverrides();
      if (activeTab === 'audit') {
        setLoadingAudit(true);
        const logs = await getAuditLogs(100); // Load last 100 entries
        setAuditLogs(logs);
        setLoadingAudit(false);
      }
    };
    loadData();
  }, [activeTab]);

  // Check if current user has permission to manage users
  const canManageUsers = hasPermission(currentUser?.role, 'users:view');
  const canEditUsers = hasPermission(currentUser?.role, 'users:edit');
  const canChangeRoles = hasPermission(currentUser?.role, 'users:change_role');
  const canDeactivateUsers = hasPermission(
    currentUser?.role,
    'users:deactivate'
  );
  const userIsAdmin = isAdmin(currentUser?.role);

  // Show access denied if user doesn't have permission
  if (!canManageUsers) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access User Management.
          </p>
          <p className="text-sm text-gray-500">
            Only Administrators can view and manage users.
          </p>
        </div>
      </div>
    );
  }

  // Show loading state immediately if data isn't ready
  if (usersLoading || !users) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-500 mb-4"></div>
          <p className="text-gray-600">Loading users from database...</p>
        </div>
      </div>
    );
  }

  // Save users to localStorage whenever they change (skip initial mount)
  // No longer needed - useSupabaseData handles automatic saving

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'Administrator':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'QA Engineer':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Product Manager':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Scrum Master':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Developer':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Tester':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Invited':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getInvitationStatusColor = (status: Invitation['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Accepted':
        return 'bg-green-100 text-green-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
    }
  };

  const handleAddUserDirectly = () => {
    if (!addUserName.trim()) {
      showAlert('Please enter a name');
      return;
    }

    if (!addUserEmail.trim()) {
      showAlert('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addUserEmail)) {
      showAlert('Please enter a valid email address');
      return;
    }

    const existingUser = users.find(
      (u) => u.email.toLowerCase() === addUserEmail.toLowerCase()
    );
    if (existingUser) {
      showAlert('A user with this email already exists');
      return;
    }

    // Generate new user ID
    const existingIds = users.map((u) => {
      const match = u.id.match(/^USR-(\d+)$/);
      return match ? parseInt(match[1]) : 0;
    });
    const nextId = Math.max(...existingIds, 0) + 1;
    const userId = `USR-${String(nextId).padStart(3, '0')}`;

    const newUser: User = {
      id: userId,
      name: addUserName.trim(),
      email: addUserEmail.trim().toLowerCase(),
      role: addUserRole,
      title: addUserTitle.trim() || undefined,
      status: 'Active',
      joinedDate: new Date(),
      lastActive: new Date(),
      storiesAssigned: 0,
      bugsAssigned: 0,
      organizationId: currentOrgId,
      organizationName: currentUser?.organizationName,
    };

    setUsers([...users, newUser]);
    setShowAddUserModal(false);
    setAddUserName('');
    setAddUserEmail('');
    setAddUserRole('Developer');
    setAddUserTitle('');
    showSuccess(`User ${newUser.name} has been added successfully!`);
  };

  const handleSendInvite = () => {
    if (!inviteEmail) {
      showAlert('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      showAlert('Please enter a valid email address');
      return;
    }

    const existingUser = users.find(
      (u) => u.email.toLowerCase() === inviteEmail.toLowerCase()
    );
    if (existingUser) {
      showAlert('A user with this email already exists');
      return;
    }

    const existingInvite = invitations.find(
      (i) =>
        i.email.toLowerCase() === inviteEmail.toLowerCase() &&
        i.status === 'Pending'
    );
    if (existingInvite) {
      showAlert('An invitation has already been sent to this email');
      return;
    }

    const newInvitation: Invitation = {
      id: `INV-${String(invitations.length + 1).padStart(3, '0')}`,
      email: inviteEmail,
      role: inviteRole,
      sentBy: currentUser?.name || 'Unknown',
      sentAt: new Date(),
      status: 'Pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    setInvitations([newInvitation, ...invitations]);
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteRole('Developer');
    showSuccess(
      `Invitation sent to ${inviteEmail}! (Note: Email service not configured in prototype)`
    );
  };

  const handleResendInvite = (invitationId: string) => {
    setInvitations(
      invitations.map((inv) =>
        inv.id === invitationId
          ? {
              ...inv,
              sentAt: new Date(),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              status: 'Pending' as const,
            }
          : inv
      )
    );
    showSuccess('Invitation resent!');
  };

  const handleRevokeInvite = (invitationId: string) => {
    showConfirm(
      'Are you sure you want to revoke this invitation?',
      () => {
        setInvitations(invitations.filter((inv) => inv.id !== invitationId));
      },
      'Revoke Invitation',
      'Revoke',
      'Cancel'
    );
  };

  const handleDeactivateUser = (userId: string) => {
    showConfirm(
      'Are you sure you want to deactivate this user?',
      () => {
        setUsers(
          users.map((u) =>
            u.id === userId ? { ...u, status: 'Inactive' as const } : u
          )
        );
      },
      'Deactivate User',
      'Deactivate',
      'Cancel'
    );
  };

  const handleActivateUser = (userId: string) => {
    setUsers(
      users.map((u) =>
        u.id === userId ? { ...u, status: 'Active' as const } : u
      )
    );
  };

  const handleChangeRole = async (userId: string, newRole: User['role']) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser || !currentUser) return;

    const oldRole = targetUser.role;
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));

    // Log the role change
    await logAuditEntry({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'role_change',
      targetUserId: userId,
      targetUserName: targetUser.name,
      details: `Changed role from ${oldRole} to ${newRole}`,
      oldValue: oldRole,
      newValue: newRole,
    });
  };

  const handleToggleQASignOff = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (user.role !== 'QA Engineer') {
      showAlert('Only QA Engineers can have QA sign-off authority');
      return;
    }

    const currentValue = user.canSignOffQA || false;
    const newValue = !currentValue;

    if (newValue && !user.title) {
      showAlert(
        'Please set a title for this user first (e.g., "Head of QA", "Senior QA Lead")'
      );
      return;
    }

    setUsers(
      users.map((u) => (u.id === userId ? { ...u, canSignOffQA: newValue } : u))
    );
    // useSupabaseData handles saving automatically
  };

  const handleTogglePMSignOff = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (user.role !== 'Product Manager') {
      showAlert('Only Product Managers can have PM approval authority');
      return;
    }

    const currentValue = user.canSignOffPM || false;
    const newValue = !currentValue;

    if (newValue && !user.title) {
      showAlert(
        'Please set a title for this user first (e.g., "Senior Product Manager", "Product Lead")'
      );
      return;
    }

    setUsers(
      users.map((u) => (u.id === userId ? { ...u, canSignOffPM: newValue } : u))
    );
    // useSupabaseData handles saving automatically
  };

  const handleEditTitle = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    setEditingUserId(userId);
    setEditTitleValue(user.title || '');
    setShowEditTitleModal(true);
  };

  const handleSaveTitle = () => {
    if (!editingUserId) return;

    setUsers(
      users.map((u) =>
        u.id === editingUserId
          ? { ...u, title: editTitleValue.trim() || undefined }
          : u
      )
    );
    setShowEditTitleModal(false);
    setEditingUserId(null);
    setEditTitleValue('');
  };

  const orgUsers = (users || []).filter(
    (u) => (u.organizationId || 'demo-org') === currentOrgId
  );

  const filteredUsers = orgUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const activeUsers = orgUsers.filter((u) => u.status === 'Active').length;
  const pendingInvites = invitations.filter(
    (i) => i.status === 'Pending'
  ).length;

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">User Management</h1>
          <p className="text-gray-600">Manage team members and invitations</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Add User
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            ✉️ Invite User
          </button>
        </div>
      </div>

      {/* Sign-Off Authority Info */}
      <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-purple-900 mb-2">
          🔐 Sign-Off Authority
        </h3>
        <p className="text-sm text-purple-800 mb-3">
          QA Engineers and Product Managers with sign-off authority can approve
          stories. Click authority buttons to grant/revoke permissions. Only
          designated reviewers can provide approvals.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="text-xs text-purple-700">
            <strong>QA Reviewers:</strong>{' '}
            {orgUsers
              .filter((u) => u.canSignOffQA)
              .map((u) => `${u.name} (${u.title || 'No title'})`)
              .join(', ') || 'None'}
          </div>
          <div className="text-xs text-purple-700">
            <strong>PM Approvers:</strong>{' '}
            {orgUsers
              .filter((u) => u.canSignOffPM)
              .map((u) => `${u.name} (${u.title || 'No title'})`)
              .join(', ') || 'None'}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Users</div>
          <div className="text-2xl font-bold text-gray-900">
            {orgUsers.length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Active Users</div>
          <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Authorized</div>
          <div className="text-2xl font-bold text-purple-600">
            {orgUsers.filter((u) => u.canSignOffQA || u.canSignOffPM).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Pending Invites</div>
          <div className="text-2xl font-bold text-yellow-600">
            {pendingInvites}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Developers</div>
          <div className="text-2xl font-bold text-indigo-600">
            {orgUsers.filter((u) => u.role === 'Developer').length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'users'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Team Members ({orgUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('invitations')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'invitations'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Invitations ({invitations.length})
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'permissions'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Roles &amp; Permissions
        </button>
        <button
          onClick={() => setActiveTab('userperms')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'userperms'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          User Permissions
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Audit Trail
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <>
          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={filterRole}
              onChange={(e) =>
                setFilterRole(e.target.value as typeof filterRole)
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Roles</option>
              <option value="QA Engineer">QA Engineer</option>
              <option value="Product Manager">Product Manager</option>
              <option value="Scrum Master">Scrum Master</option>
              <option value="Developer">Developer</option>
              <option value="Tester">Tester</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">
                    Title
                  </th>
                  <th className="px-6 py-4 text-center text-sm text-gray-700">
                    Authority
                  </th>
                  <th className="px-6 py-4 text-center text-sm text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm text-gray-700">
                    Stories
                  </th>
                  <th className="px-6 py-4 text-center text-sm text-gray-700">
                    Bugs
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">
                    Last Active
                  </th>
                  <th className="px-6 py-4 text-center text-sm text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">
                        Joined {new Date(user.joinedDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleChangeRole(
                            user.id,
                            e.target.value as User['role']
                          )
                        }
                        className={`px-3 py-1 rounded border text-sm ${getRoleColor(user.role)}`}
                        disabled={user.id === 'USR-001'}
                      >
                        <option value="Administrator">Administrator</option>
                        <option value="QA Engineer">QA Engineer</option>
                        <option value="Product Manager">Product Manager</option>
                        <option value="Scrum Master">Scrum Master</option>
                        <option value="Developer">Developer</option>
                        <option value="Tester">Tester</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">
                          {user.title || (
                            <span className="text-gray-400 italic">
                              No title
                            </span>
                          )}
                        </span>
                        <button
                          onClick={() => handleEditTitle(user.id)}
                          className="text-indigo-600 hover:text-indigo-700"
                          title="Edit title"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {(user.role === 'Administrator' || user.role === 'QA Engineer' || user.canSignOffQA) && (
                          <button
                            onClick={() => handleToggleQASignOff(user.id)}
                            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                              user.canSignOffQA !== false
                                ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                            }`}
                            title="Toggle QA Sign-Off Authority"
                          >
                            {user.canSignOffQA !== false ? '✓ QA Sign-Off' : 'No QA Authority'}
                          </button>
                        )}
                        {(user.role === 'Administrator' || user.role === 'Product Manager' || user.canSignOffPM) && (
                          <button
                            onClick={() => handleTogglePMSignOff(user.id)}
                            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                              user.canSignOffPM !== false
                                ? 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200'
                                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                            }`}
                            title="Toggle PM Approval Authority"
                          >
                            {user.canSignOffPM !== false ? '✓ PM Approval' : 'No PM Authority'}
                          </button>
                        )}
                        {user.role !== 'Administrator' &&
                          user.role !== 'QA Engineer' &&
                          user.role !== 'Product Manager' &&
                          !user.canSignOffQA &&
                          !user.canSignOffPM && (
                            <span className="text-xs text-gray-400">Standard Access</span>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${getStatusColor(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      {user.storiesAssigned || 0}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      {user.bugsAssigned || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.lastActive
                        ? new Date(user.lastActive).toLocaleString()
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {user.status === 'Active' ? (
                        <button
                          onClick={() => handleDeactivateUser(user.id)}
                          disabled={user.id === 'USR-001'}
                          className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateUser(user.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Invitations Tab */}
      {activeTab === 'invitations' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm text-gray-700">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm text-gray-700">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-sm text-gray-700">
                  Sent By
                </th>
                <th className="px-6 py-4 text-center text-sm text-gray-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm text-gray-700">
                  Sent Date
                </th>
                <th className="px-6 py-4 text-left text-sm text-gray-700">
                  Expires
                </th>
                <th className="px-6 py-4 text-center text-sm text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invitations.map((invitation) => (
                <tr key={invitation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {invitation.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded border text-xs ${getRoleColor(
                        invitation.role
                      )}`}
                    >
                      {invitation.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {invitation.sentBy}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${getInvitationStatusColor(
                        invitation.status
                      )}`}
                    >
                      {invitation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(invitation.sentAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(invitation.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      {invitation.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleResendInvite(invitation.id)}
                            className="px-3 py-1 bg-indigo-500 text-white rounded text-xs hover:bg-indigo-600"
                          >
                            Resend
                          </button>
                          <button
                            onClick={() => handleRevokeInvite(invitation.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                          >
                            Revoke
                          </button>
                        </>
                      )}
                      {invitation.status === 'Expired' && (
                        <button
                          onClick={() => handleResendInvite(invitation.id)}
                          className="px-3 py-1 bg-indigo-500 text-white rounded text-xs hover:bg-indigo-600"
                        >
                          Resend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {invitations.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No invitations sent yet
            </div>
          )}
        </div>
      )}

      {/* Roles & Permissions Tab */}
      {activeTab === 'permissions' && (
        <PermissionsMatrix currentUser={currentUser} />
      )}

      {/* User Permissions Tab */}
      {activeTab === 'userperms' && (
        <UserPermissionsOverrides users={orgUsers} currentUser={currentUser} />
      )}

      {/* Audit Trail Tab */}
      {activeTab === 'audit' && (
        <AuditTrailViewer auditLogs={auditLogs} loading={loadingAudit} />
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowInviteModal(false)}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 rounded-t-lg flex-shrink-0">
                <h2 className="text-2xl text-gray-900 dark:text-white font-semibold">
                  Invite Team Member
                </h2>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-4 flex-grow overflow-y-auto custom-scrollbar">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) =>
                      setInviteRole(e.target.value as User['role'])
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Developer">Developer</option>
                    <option value="Tester">Tester</option>
                    <option value="QA Engineer">QA Engineer</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Scrum Master">Scrum Master</option>
                    <option value="Administrator">
                      ⚠️ Administrator (Full Access)
                    </option>
                  </select>
                </div>

                {inviteRole === 'Administrator' && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-450 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-1">
                          ⚠️ Administrator Role - Full System Access
                        </h4>
                        <p className="text-sm text-red-800 dark:text-red-300 mb-2">
                          This person will have unrestricted access to:
                        </p>
                        <ul className="text-sm text-red-850 dark:text-red-350 space-y-1 ml-4 list-disc">
                          <li>Manage all users and change roles</li>
                          <li>View audit trails and system logs</li>
                          <li>Import/export and delete all data</li>
                          <li>Execute bulk operations</li>
                          <li>Both QA and PM sign-offs</li>
                        </ul>
                        <p className="text-sm text-red-900 dark:text-red-200 font-medium mt-2">
                          Only invite trusted team members as Administrator.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-3 text-sm text-yellow-800 dark:text-yellow-350">
                  <strong>⚠️ Prototype Mode:</strong> Email service is not
                  configured. The invitation will be recorded in the system but
                  no actual email will be sent. For immediate user access, use{' '}
                  <strong>"Add User"</strong> instead.
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg flex-shrink-0">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvite}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Send Invitation
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowAddUserModal(false)}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 rounded-t-lg flex-shrink-0">
                <h2 className="text-2xl text-gray-900 dark:text-white font-semibold">
                  Add User Directly
                </h2>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-4 flex-grow overflow-y-auto custom-scrollbar">
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-3 text-sm text-green-800 dark:text-green-300">
                  <strong>✓ Direct Add:</strong> User will be created
                  immediately with Active status. They can log in straight away
                  using their email and the default password:{' '}
                  <strong>password123</strong>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={addUserName}
                    onChange={(e) => setAddUserName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={addUserEmail}
                    onChange={(e) => setAddUserEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role *
                  </label>
                  <select
                    value={addUserRole}
                    onChange={(e) =>
                      setAddUserRole(e.target.value as User['role'])
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Developer">Developer</option>
                    <option value="Tester">Tester</option>
                    <option value="QA Engineer">QA Engineer</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Scrum Master">Scrum Master</option>
                    <option value="Administrator">
                      ⚠️ Administrator (Full Access)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={addUserTitle}
                    onChange={(e) => setAddUserTitle(e.target.value)}
                    placeholder="e.g., Senior QA Engineer"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {addUserRole === 'Administrator' && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-450 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-1">
                          ⚠️ Administrator Role - Full System Access
                        </h4>
                        <p className="text-sm text-red-800 dark:text-red-300 mb-2">
                          This person will have unrestricted access to:
                        </p>
                        <ul className="text-sm text-red-850 dark:text-red-350 space-y-1 ml-4 list-disc">
                          <li>Manage all users and change roles</li>
                          <li>View audit trails and system logs</li>
                          <li>Import/export and delete all data</li>
                          <li>Execute bulk operations</li>
                          <li>Both QA and PM sign-offs</li>
                        </ul>
                        <p className="text-sm text-red-900 dark:text-red-200 font-medium mt-2">
                          Only add trusted team members as Administrator.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg flex-shrink-0">
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUserDirectly}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        </>
      )}

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

      {/* Edit Title Modal */}
      {showEditTitleModal && (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Edit Job Title
              </h3>

              <div className="mb-6">
                <label
                  htmlFor="editTitle"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Job Title
                </label>
                <input
                  id="editTitle"
                  type="text"
                  value={editTitleValue}
                  onChange={(e) => setEditTitleValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveTitle();
                    } else if (e.key === 'Escape') {
                      setShowEditTitleModal(false);
                      setEditingUserId(null);
                      setEditTitleValue('');
                    }
                  }}
                  placeholder="e.g., Senior QA Engineer"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  autoFocus
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Press Enter to save, Esc to cancel
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowEditTitleModal(false);
                    setEditingUserId(null);
                    setEditTitleValue('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTitle}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Permissions Matrix ───────────────────────────────────────────────────────

const MATRIX_ROLES: AnyRole[] = [
  'Administrator',
  'QA Engineer',
  'Product Manager',
  'Scrum Master',
  'Developer',
  'Tester',
];

const ROLE_COLORS: Record<AnyRole, string> = {
  Administrator: 'bg-red-100 text-red-800',
  'QA Engineer': 'bg-green-100 text-green-800',
  'Product Manager': 'bg-purple-100 text-purple-800',
  'Scrum Master': 'bg-orange-100 text-orange-800',
  Developer: 'bg-indigo-100 text-indigo-800',
  Tester: 'bg-cyan-100 text-cyan-800',
};

const PAGE_VIEWS: {
  label: string;
  tab: string;
  requiredPermission: Permission;
}[] = Object.entries(TAB_PERMISSION_MAP).map(([tab, perm]) => ({
  tab,
  label:
    {
      dashboard: 'Dashboard',
      kanban: 'Kanban Board',
      validator: 'Stories / Validator',
      risk: 'Risk Matrix',
      burndown: 'Quality Burn-Down',
      tests: 'Test Cases',
      bugs: 'Bug Tracker',
      charts: 'Analytics',
      sprints: 'Sprint Management',
      reports: 'Reports',
      testhistory: 'Test Execution History',
      traceability: 'Traceability Matrix',
      release: 'Release Readiness',
      team: 'Team Performance',
      recommendations: 'AI Recommendations',
      users: 'User Management',
      data: 'Data Management',
      audit: 'Audit Trail',
      bulk: 'Bulk Operations',
    }[tab] ?? tab,
  requiredPermission: perm as Permission,
}));

const ACTION_GROUPS: {
  group: string;
  items: { label: string; permission: Permission }[];
}[] = [
  {
    group: 'Stories',
    items: [
      { label: 'View Stories', permission: 'stories:view' },
      { label: 'Create Story', permission: 'stories:create' },
      { label: 'Edit Own Stories', permission: 'stories:edit_own' },
      { label: 'Edit All Stories', permission: 'stories:edit_all' },
      { label: 'Delete Stories', permission: 'stories:delete' },
      { label: 'QA Sign-Off', permission: 'stories:sign_off_qa' },
      { label: 'PM Approval', permission: 'stories:sign_off_pm' },
    ],
  },
  {
    group: 'Bugs',
    items: [
      { label: 'View Bugs', permission: 'bugs:view' },
      { label: 'Create Bug', permission: 'bugs:create' },
      { label: 'Edit Own Bugs', permission: 'bugs:edit_own' },
      { label: 'Edit All Bugs', permission: 'bugs:edit_all' },
      { label: 'Delete Bugs', permission: 'bugs:delete' },
      { label: 'Close Bug', permission: 'bugs:close' },
    ],
  },
  {
    group: 'Test Cases',
    items: [
      { label: 'View Tests', permission: 'tests:view' },
      { label: 'Create Test', permission: 'tests:create' },
      { label: 'Edit Own Tests', permission: 'tests:edit_own' },
      { label: 'Edit All Tests', permission: 'tests:edit_all' },
      { label: 'Execute Tests', permission: 'tests:execute' },
      { label: 'Delete Tests', permission: 'tests:delete' },
    ],
  },
  {
    group: 'Sprints',
    items: [
      { label: 'View Sprints', permission: 'sprints:view' },
      { label: 'Create Sprint', permission: 'sprints:create' },
      { label: 'Edit Sprint', permission: 'sprints:edit' },
      { label: 'Delete Sprint', permission: 'sprints:delete' },
    ],
  },
  {
    group: 'Reports',
    items: [
      { label: 'View Reports', permission: 'reports:view' },
      { label: 'Export Reports', permission: 'reports:export' },
    ],
  },
  {
    group: 'Administration',
    items: [
      { label: 'View Users', permission: 'users:view' },
      { label: 'Invite Users', permission: 'users:invite' },
      { label: 'Edit Users', permission: 'users:edit' },
      { label: 'Change Roles', permission: 'users:change_role' },
      { label: 'Deactivate Users', permission: 'users:deactivate' },
      { label: 'Delete Users', permission: 'users:delete' },
      { label: 'View Data', permission: 'data:view' },
      { label: 'Import Data', permission: 'data:import' },
      { label: 'Export Data', permission: 'data:export' },
      { label: 'Bulk Delete Data', permission: 'data:bulk_delete' },
      { label: 'View Audit Trail', permission: 'audit:view' },
      { label: 'Export Audit Trail', permission: 'audit:export' },
      { label: 'View Bulk Ops', permission: 'bulk:view' },
      { label: 'Execute Bulk Ops', permission: 'bulk:execute' },
      { label: 'View Org Settings', permission: 'org:view' },
      { label: 'Edit Org Settings', permission: 'org:edit' },
    ],
  },
];

// Build a set from a permission array for fast lookup
function toSet(perms: Permission[]): Set<Permission> {
  return new Set(perms);
}

// Convert the Record<string, Permission[]> into a Record<AnyRole, Set<Permission>>
function buildSets(
  map: Record<string, Permission[]>
): Record<string, Set<Permission>> {
  const out: Record<string, Set<Permission>> = {};
  for (const role of MATRIX_ROLES) {
    out[role] = toSet(map[role] ?? []);
  }
  return out;
}

interface PermissionsMatrixProps {
  currentUser: any;
}

function PermissionsMatrix({ currentUser }: PermissionsMatrixProps) {
  const [section, setSection] = useState<'pages' | 'actions'>('pages');
  // local editable state: role -> Set<Permission>
  const [permSets, setPermSets] = useState<Record<string, Set<Permission>>>(
    () => buildSets(getCurrentRolePermissions())
  );
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load saved overrides from storage on mount
  useEffect(() => {
    getStorageData('aqms_role_permissions').then((saved) => {
      if (saved) {
        overrideRolePermissions(saved);
        setPermSets(buildSets(saved));
      }
    });
  }, []);

  const toggle = (role: AnyRole, permission: Permission) => {
    if (role === 'Administrator') return; // admins always have all permissions
    setPermSets((prev) => {
      const next = { ...prev };
      const set = new Set(prev[role]);
      if (set.has(permission)) set.delete(permission);
      else set.add(permission);
      next[role] = set;
      return next;
    });
    setDirty(true);
  };

  const hasPerm = (role: AnyRole, permission: Permission): boolean =>
    permSets[role]?.has(permission) ?? false;

  const pageAccessible = (
    role: AnyRole,
    requiredPermission: Permission
  ): boolean =>
    role === 'Administrator' ||
    (permSets[role]?.has(requiredPermission) ?? false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const toSave: Record<string, Permission[]> = {};
      for (const role of MATRIX_ROLES) {
        toSave[role] = Array.from(permSets[role] ?? []);
      }
      await setStorageData('aqms_role_permissions', toSave);
      overrideRolePermissions(toSave);
      setDirty(false);
      toast.success('Permissions saved and applied');

      // Log audit entry
      if (currentUser) {
        await logAuditEntry({
          userId: currentUser.id,
          userName: currentUser.name,
          action: 'matrix_update',
          details: 'Updated role permissions matrix',
        });
      }
    } catch {
      toast.error('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPermSets(
      buildSets(DEFAULT_ROLE_PERMISSIONS as Record<string, Permission[]>)
    );
    setDirty(true);
  };

  const handleSelectAllForRole = (role: AnyRole) => {
    if (role === 'Administrator') return; // admins always have all
    setPermSets((prev) => {
      const next = { ...prev };
      next[role] = new Set(ALL_PERMISSIONS);
      return next;
    });
    setDirty(true);
  };

  const handleDeselectAllForRole = (role: AnyRole) => {
    if (role === 'Administrator') return; // admins always have all
    setPermSets((prev) => {
      const next = { ...prev };
      next[role] = new Set();
      return next;
    });
    setDirty(true);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setSection('pages')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${section === 'pages' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Page Views
          </button>
          <button
            onClick={() => setSection('actions')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${section === 'actions' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Actions
          </button>
        </div>
        <div className="flex items-center gap-3">
          {dirty && (
            <span className="text-xs text-amber-600 font-medium">
              Unsaved changes
            </span>
          )}
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className="px-4 py-2 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
        Toggle checkboxes to grant or revoke permissions per role.{' '}
        <strong>Administrator</strong> always retains full access. Use the{' '}
        <strong>Select All / Deselect All</strong> buttons in column headers for
        bulk operations. Click <strong>Save Changes</strong> to apply
        immediately.
      </div>

      {/* Page Views — now editable */}
      {section === 'pages' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[200px]">
                  Page
                </th>
                <th className="px-3 py-2 text-xs text-gray-500 font-normal border-l border-gray-100">
                  Required permission
                </th>
                {MATRIX_ROLES.map((role) => (
                  <th
                    key={role}
                    className="px-3 py-3 text-center border-l border-gray-100 min-w-[110px]"
                  >
                    <div className="space-y-1">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${ROLE_COLORS[role]}`}
                      >
                        {role}
                      </span>
                      {role !== 'Administrator' && (
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => handleSelectAllForRole(role)}
                            className="px-1.5 py-0.5 bg-green-500 text-white rounded text-[10px] hover:bg-green-600 transition-colors"
                            title={`Grant all permissions to ${role}`}
                          >
                            All
                          </button>
                          <button
                            onClick={() => handleDeselectAllForRole(role)}
                            className="px-1.5 py-0.5 bg-red-500 text-white rounded text-[10px] hover:bg-red-600 transition-colors"
                            title={`Revoke all permissions from ${role}`}
                          >
                            None
                          </button>
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {PAGE_VIEWS.map(({ label, tab, requiredPermission }) => (
                <tr key={tab} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-800 font-medium">
                    {label}
                  </td>
                  <td className="px-3 py-2 border-l border-gray-100">
                    <span className="text-xs font-mono text-gray-400">
                      {requiredPermission}
                    </span>
                  </td>
                  {MATRIX_ROLES.map((role) => {
                    const isAdmin = role === 'Administrator';
                    const checked =
                      isAdmin || hasPerm(role, requiredPermission);
                    return (
                      <td
                        key={role}
                        className="px-3 py-2 text-center border-l border-gray-100"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={isAdmin}
                          onChange={() => toggle(role, requiredPermission)}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-default disabled:opacity-60"
                          title={
                            isAdmin
                              ? 'Administrator always has full access'
                              : `${checked ? 'Revoke' : 'Grant'} access to ${label} for ${role}`
                          }
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Actions — fully editable */}
      {section === 'actions' && (
        <div className="space-y-4">
          {ACTION_GROUPS.map(({ group, items }) => (
            <div
              key={group}
              className="bg-white rounded-lg border border-gray-200 overflow-x-auto"
            >
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {group}
                </span>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 min-w-[200px]">
                      Action
                    </th>
                    {MATRIX_ROLES.map((role) => (
                      <th
                        key={role}
                        className="px-3 py-2 text-center border-l border-gray-100 min-w-[110px]"
                      >
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${ROLE_COLORS[role]}`}
                          >
                            {role}
                          </span>
                          {role !== 'Administrator' && (
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={() => handleSelectAllForRole(role)}
                                className="px-1.5 py-0.5 bg-green-500 text-white rounded text-[10px] hover:bg-green-600 transition-colors"
                                title={`Grant all permissions to ${role}`}
                              >
                                All
                              </button>
                              <button
                                onClick={() => handleDeselectAllForRole(role)}
                                className="px-1.5 py-0.5 bg-red-500 text-white rounded text-[10px] hover:bg-red-600 transition-colors"
                                title={`Revoke all permissions from ${role}`}
                              >
                                None
                              </button>
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map(({ label, permission }) => (
                    <tr key={permission} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-800">{label}</td>
                      {MATRIX_ROLES.map((role) => {
                        const isAdmin = role === 'Administrator';
                        const checked = isAdmin || hasPerm(role, permission);
                        return (
                          <td
                            key={role}
                            className="px-3 py-2 text-center border-l border-gray-100"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={isAdmin}
                              onChange={() => toggle(role, permission)}
                              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-default disabled:opacity-60"
                              title={
                                isAdmin
                                  ? 'Administrator always has full access'
                                  : `${checked ? 'Revoke' : 'Grant'} "${label}" for ${role}`
                              }
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── User Permissions Overrides Component ────────────────────────────────────

interface UserPermissionsOverridesProps {
  users: User[];
  currentUser: any;
}

function UserPermissionsOverrides({
  users,
  currentUser,
}: UserPermissionsOverridesProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userOverrides, setUserOverrides] = useState<
    Record<string, UserPermissionOverride>
  >({});
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Load all user overrides on mount
  useEffect(() => {
    const loadOverrides = async () => {
      await loadUserOverrides();
      const overrides: Record<string, UserPermissionOverride> = {};
      for (const user of users) {
        const override = getUserOverride(user.id);
        if (override) {
          overrides[user.id] = override;
        }
      }
      setUserOverrides(overrides);
    };
    loadOverrides();
  }, [users]);

  const selectedUser = users.find((u) => u.id === selectedUserId);
  const selectedOverride = selectedUserId
    ? userOverrides[selectedUserId]
    : null;

  const handleTogglePermission = async (permission: Permission) => {
    if (!selectedUserId || !currentUser) return;

    const override = userOverrides[selectedUserId];
    const currentlyGranted = override?.grantedPermissions.includes(permission);
    const currentlyRevoked = override?.revokedPermissions.includes(permission);

    if (currentlyGranted) {
      // Remove grant
      await revokeUserPermission(selectedUserId, permission);
      await logAuditEntry({
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'permission_revoke',
        targetUserId: selectedUserId,
        targetUserName: selectedUser?.name || 'Unknown',
        details: `Revoked permission: ${permission}`,
      });
    } else if (currentlyRevoked) {
      // Remove revoke (restore to role default)
      const updated = { ...override };
      updated.revokedPermissions = updated.revokedPermissions.filter(
        (p) => p !== permission
      );
      setUserOverrides({ ...userOverrides, [selectedUserId]: updated });
      await saveUserOverrides();
    } else {
      // Grant permission
      await grantUserPermission(selectedUserId, permission);
      await logAuditEntry({
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'permission_grant',
        targetUserId: selectedUserId,
        targetUserName: selectedUser?.name || 'Unknown',
        details: `Granted permission: ${permission}`,
      });
    }

    // Reload overrides
    const newOverride = getUserOverride(selectedUserId);
    if (newOverride) {
      setUserOverrides({ ...userOverrides, [selectedUserId]: newOverride });
    }
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate || !selectedUserId || !selectedUser || !currentUser)
      return;

    await applyTemplateToUser(
      selectedTemplate,
      selectedUserId,
      selectedUser.name,
      {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
      }
    );

    // Reload overrides
    const newOverride = getUserOverride(selectedUserId);
    if (newOverride) {
      setUserOverrides({ ...userOverrides, [selectedUserId]: newOverride });
    }

    setShowTemplateModal(false);
    setSelectedTemplate('');
    toast.success(`Template applied to ${selectedUser.name}`);
  };

  const handleClearOverrides = async () => {
    if (!selectedUserId || !selectedUser || !currentUser) return;

    await clearUserOverrides(selectedUserId);
    await logAuditEntry({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'permission_revoke',
      targetUserId: selectedUserId,
      targetUserName: selectedUser.name,
      details: 'Cleared all user-level permission overrides',
    });

    const newOverrides = { ...userOverrides };
    delete newOverrides[selectedUserId];
    setUserOverrides(newOverrides);
    toast.success('Permission overrides cleared');
  };

  const getPermissionStatus = (
    permission: Permission
  ): 'granted' | 'revoked' | 'default' => {
    if (!selectedOverride) return 'default';
    if (selectedOverride.grantedPermissions.includes(permission))
      return 'granted';
    if (selectedOverride.revokedPermissions.includes(permission))
      return 'revoked';
    return 'default';
  };

  const handleGrantAll = async () => {
    if (!selectedUserId || !selectedUser || !currentUser) return;

    // Clear existing overrides first
    await clearUserOverrides(selectedUserId);

    // Grant all permissions
    for (const permission of ALL_PERMISSIONS) {
      await grantUserPermission(selectedUserId, permission);
    }

    await logAuditEntry({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'permission_grant',
      targetUserId: selectedUserId,
      targetUserName: selectedUser.name,
      details: `Granted all permissions (${ALL_PERMISSIONS.length} total)`,
    });

    // Reload overrides
    const newOverride = getUserOverride(selectedUserId);
    if (newOverride) {
      setUserOverrides({ ...userOverrides, [selectedUserId]: newOverride });
    }

    toast.success(
      `Granted all ${ALL_PERMISSIONS.length} permissions to ${selectedUser.name}`
    );
  };

  const handleRevokeAll = async () => {
    if (!selectedUserId || !selectedUser || !currentUser) return;

    // Clear existing overrides first
    await clearUserOverrides(selectedUserId);

    // Revoke all permissions
    for (const permission of ALL_PERMISSIONS) {
      await revokeUserPermission(selectedUserId, permission);
    }

    await logAuditEntry({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'permission_revoke',
      targetUserId: selectedUserId,
      targetUserName: selectedUser.name,
      details: `Revoked all permissions (${ALL_PERMISSIONS.length} total)`,
    });

    // Reload overrides
    const newOverride = getUserOverride(selectedUserId);
    if (newOverride) {
      setUserOverrides({ ...userOverrides, [selectedUserId]: newOverride });
    }

    toast.success(
      `Revoked all ${ALL_PERMISSIONS.length} permissions from ${selectedUser.name}`
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          💡 User-Level Permission Overrides
        </h3>
        <p className="text-sm text-blue-800">
          Grant or revoke specific permissions for individual users beyond their
          role permissions. Granted permissions are shown in{' '}
          <span className="text-green-700 font-semibold">green</span>, revoked
          permissions in <span className="text-red-700 font-semibold">red</span>
          , and default (from role) in{' '}
          <span className="text-gray-700 font-semibold">gray</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User List */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Select User
          </h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {users.map((user) => {
              const override = userOverrides[user.id];
              const hasOverrides =
                override &&
                (override.grantedPermissions.length > 0 ||
                  override.revokedPermissions.length > 0);

              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedUserId === user.id
                      ? 'bg-indigo-100 border-2 border-indigo-500'
                      : hasOverrides
                        ? 'bg-purple-50 border border-purple-200 hover:bg-purple-100'
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium text-gray-900 text-sm">
                    {user.name}
                  </div>
                  <div className="text-xs text-gray-600">{user.role}</div>
                  {hasOverrides && (
                    <div className="text-xs text-purple-700 mt-1">
                      <Shield className="w-3 h-3 inline mr-1" />
                      Has overrides
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Permissions List */}
        <div className="md:col-span-2">
          {selectedUser ? (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedUser.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Base Role: {selectedUser.role}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setShowTemplateModal(true)}
                      className="px-3 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors"
                    >
                      <FileText className="w-4 h-4 inline mr-1" />
                      Apply Template
                    </button>
                    {selectedOverride && (
                      <button
                        onClick={handleClearOverrides}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                      >
                        Clear Overrides
                      </button>
                    )}
                  </div>
                </div>

                {/* Bulk Actions */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-600 font-medium">
                    Bulk Actions:
                  </span>
                  <button
                    onClick={handleGrantAll}
                    className="px-3 py-1.5 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                  >
                    ✓ Grant All Permissions
                  </button>
                  <button
                    onClick={handleRevokeAll}
                    className="px-3 py-1.5 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 transition-colors"
                  >
                    ✗ Revoke All Permissions
                  </button>
                  <span className="text-xs text-gray-500 ml-auto">
                    {ALL_PERMISSIONS.length} total permissions
                  </span>
                </div>
              </div>

              <div className="max-h-[600px] overflow-y-auto space-y-2">
                {ALL_PERMISSIONS.map((permission) => {
                  const status = getPermissionStatus(permission);
                  const hasFromRole = hasPermission(
                    selectedUser.role,
                    permission
                  );

                  return (
                    <div
                      key={permission}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                        status === 'granted'
                          ? 'bg-green-50 border-green-200'
                          : status === 'revoked'
                            ? 'bg-red-50 border-red-200'
                            : hasFromRole
                              ? 'bg-gray-50 border-gray-200'
                              : 'bg-white border-gray-200'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {permission}
                        </div>
                        <div className="text-xs text-gray-500">
                          {status === 'granted' && '✓ Granted (Override)'}
                          {status === 'revoked' && '✗ Revoked (Override)'}
                          {status === 'default' && hasFromRole && '✓ From Role'}
                          {status === 'default' &&
                            !hasFromRole &&
                            '○ Not Granted'}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={
                          status === 'granted' ||
                          (status === 'default' && hasFromRole)
                        }
                        onChange={() => handleTogglePermission(permission)}
                        className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No User Selected
              </h3>
              <p className="text-sm text-gray-500">
                Select a user from the list to manage their permissions
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => {
              setShowTemplateModal(false);
              setSelectedTemplate('');
            }}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 rounded-t-lg flex-shrink-0">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Apply Permission Template
                </h3>
                <button
                  onClick={() => {
                    setShowTemplateModal(false);
                    setSelectedTemplate('');
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl flex-shrink-0"
                >
                  ×
                </button>
              </div>

              <div className="p-6 flex-grow overflow-y-auto custom-scrollbar">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Select a template to apply to {selectedUser?.name}. This will
                  clear existing overrides and apply the template permissions.
                </p>

                <div className="space-y-3">
                  {PERMISSION_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedTemplate === template.id
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-800 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {template.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {template.description}
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {template.permissions.length} permissions
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg flex-shrink-0">
                <button
                  onClick={() => {
                    setShowTemplateModal(false);
                    setSelectedTemplate('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyTemplate}
                  disabled={!selectedTemplate}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Apply Template
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Audit Trail Viewer Component ─────────────────────────────────────────────

interface AuditTrailViewerProps {
  auditLogs: AuditLogEntry[];
  loading: boolean;
}

function AuditTrailViewer({ auditLogs, loading }: AuditTrailViewerProps) {
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesUser = filterUser === 'all' || log.userName === filterUser;
    return matchesAction && matchesUser;
  });

  const uniqueUsers = Array.from(new Set(auditLogs.map((log) => log.userName)));

  const getActionColor = (action: string) => {
    switch (action) {
      case 'role_change':
        return 'bg-blue-100 text-blue-800';
      case 'permission_grant':
        return 'bg-green-100 text-green-800';
      case 'permission_revoke':
        return 'bg-red-100 text-red-800';
      case 'matrix_update':
        return 'bg-purple-100 text-purple-800';
      case 'template_apply':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'role_change':
        return 'Role Change';
      case 'permission_grant':
        return 'Permission Granted';
      case 'permission_revoke':
        return 'Permission Revoked';
      case 'matrix_update':
        return 'Matrix Updated';
      case 'template_apply':
        return 'Template Applied';
      default:
        return action;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-500 mb-4"></div>
        <p className="text-gray-600">Loading audit logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-900 mb-2">
          🔍 Audit Trail
        </h3>
        <p className="text-sm text-yellow-800">
          Complete history of permission changes, role assignments, and
          security-related actions. Last 100 entries are shown.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Actions</option>
          <option value="role_change">Role Changes</option>
          <option value="permission_grant">Permission Grants</option>
          <option value="permission_revoke">Permission Revokes</option>
          <option value="matrix_update">Matrix Updates</option>
          <option value="template_apply">Template Applications</option>
        </select>
        <select
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Users</option>
          {uniqueUsers.map((userName) => (
            <option key={userName} value={userName}>
              {userName}
            </option>
          ))}
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No Audit Logs
            </h3>
            <p className="text-sm text-gray-500">
              No permission changes have been logged yet
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Performed By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}
                      >
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.userName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {log.targetUserName || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-md">
                      <div>{log.details}</div>
                      {log.oldValue && log.newValue && (
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="text-red-600">{log.oldValue}</span>
                          {' → '}
                          <span className="text-green-600">{log.newValue}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
