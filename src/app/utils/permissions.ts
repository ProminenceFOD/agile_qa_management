import { UserRole } from '../contexts/AuthContext';
import { getData, setData } from './supabaseStorage';

export type Permission =
  | 'users:view' | 'users:invite' | 'users:edit' | 'users:deactivate' | 'users:change_role' | 'users:delete'
  | 'data:view' | 'data:import' | 'data:export' | 'data:bulk_delete'
  | 'audit:view' | 'audit:export'
  | 'bulk:view' | 'bulk:execute'
  | 'org:view' | 'org:edit'
  | 'stories:view' | 'stories:create' | 'stories:edit_own' | 'stories:edit_all' | 'stories:delete' | 'stories:sign_off_qa' | 'stories:sign_off_pm'
  | 'bugs:view' | 'bugs:create' | 'bugs:edit_own' | 'bugs:edit_all' | 'bugs:delete' | 'bugs:close'
  | 'tests:view' | 'tests:create' | 'tests:edit_own' | 'tests:edit_all' | 'tests:execute' | 'tests:delete'
  | 'sprints:view' | 'sprints:create' | 'sprints:edit' | 'sprints:delete'
  | 'reports:view' | 'reports:export'
  | 'dashboard:view';

// All 6 roles used in the system (UserRole covers the 4 that can log in)
export type AnyRole = UserRole | 'Developer' | 'Tester';

// User-level permission overrides
export interface UserPermissionOverride {
  userId: string;
  grantedPermissions: Permission[]; // Extra permissions granted to this user
  revokedPermissions: Permission[]; // Permissions revoked from this user
}

// Audit log entry
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: 'role_change' | 'permission_grant' | 'permission_revoke' | 'matrix_update' | 'template_apply';
  targetUserId?: string;
  targetUserName?: string;
  details: string;
  oldValue?: string;
  newValue?: string;
}

export const ALL_PERMISSIONS: Permission[] = [
  'users:view','users:invite','users:edit','users:deactivate','users:change_role','users:delete',
  'data:view','data:import','data:export','data:bulk_delete',
  'audit:view','audit:export',
  'bulk:view','bulk:execute',
  'org:view','org:edit',
  'stories:view','stories:create','stories:edit_own','stories:edit_all','stories:delete','stories:sign_off_qa','stories:sign_off_pm',
  'bugs:view','bugs:create','bugs:edit_own','bugs:edit_all','bugs:delete','bugs:close',
  'tests:view','tests:create','tests:edit_own','tests:edit_all','tests:execute','tests:delete',
  'sprints:view','sprints:create','sprints:edit','sprints:delete',
  'reports:view','reports:export',
  'dashboard:view',
];

/** Default (built-in) permissions per role — never mutated */
export const DEFAULT_ROLE_PERMISSIONS: Record<AnyRole, Permission[]> = {
  'Administrator': ALL_PERMISSIONS.slice(), // all

  'QA Engineer': [
    'stories:view','stories:create','stories:edit_own','stories:sign_off_qa',
    'bugs:view','bugs:create','bugs:edit_own','bugs:edit_all','bugs:close',
    'tests:view','tests:create','tests:edit_own','tests:edit_all','tests:execute','tests:delete',
    'sprints:view',
    'reports:view','reports:export',
    'dashboard:view',
  ],

  'Product Manager': [
    'stories:view','stories:create','stories:edit_own','stories:edit_all','stories:sign_off_pm',
    'bugs:view','bugs:create','bugs:edit_own',
    'tests:view',
    'sprints:view','sprints:create','sprints:edit',
    'reports:view','reports:export',
    'dashboard:view',
  ],

  'Scrum Master': [
    'stories:view','stories:create','stories:edit_own',
    'bugs:view','bugs:create','bugs:edit_own',
    'tests:view',
    'sprints:view','sprints:create','sprints:edit','sprints:delete',
    'reports:view','reports:export',
    'dashboard:view',
  ],

  'Developer': [
    'stories:view',
    'bugs:view','bugs:create','bugs:edit_own',
    'tests:view','tests:execute',
    'sprints:view',
    'reports:view',
    'dashboard:view',
  ],

  'Tester': [
    'stories:view',
    'bugs:view','bugs:create','bugs:edit_own','bugs:close',
    'tests:view','tests:create','tests:edit_own','tests:execute',
    'sprints:view',
    'reports:view',
    'dashboard:view',
  ],
};

// ── Permission Templates ──────────────────────────────────────────────────────

export interface PermissionTemplate {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export const PERMISSION_TEMPLATES: PermissionTemplate[] = [
  {
    id: 'read-only',
    name: 'Read-Only',
    description: 'View access to all content without edit or delete permissions',
    permissions: [
      'stories:view', 'bugs:view', 'tests:view', 'sprints:view',
      'reports:view', 'dashboard:view'
    ]
  },
  {
    id: 'contributor',
    name: 'Contributor',
    description: 'Create and edit own content across stories, bugs, and tests',
    permissions: [
      'stories:view', 'stories:create', 'stories:edit_own',
      'bugs:view', 'bugs:create', 'bugs:edit_own',
      'tests:view', 'tests:create', 'tests:edit_own', 'tests:execute',
      'sprints:view', 'reports:view', 'dashboard:view'
    ]
  },
  {
    id: 'qa-reviewer',
    name: 'QA Reviewer',
    description: 'Full QA permissions including sign-off authority',
    permissions: [
      'stories:view', 'stories:create', 'stories:edit_own', 'stories:sign_off_qa',
      'bugs:view', 'bugs:create', 'bugs:edit_own', 'bugs:edit_all', 'bugs:close',
      'tests:view', 'tests:create', 'tests:edit_own', 'tests:edit_all', 'tests:execute', 'tests:delete',
      'sprints:view', 'reports:view', 'reports:export', 'dashboard:view'
    ]
  },
  {
    id: 'pm-approver',
    name: 'PM Approver',
    description: 'Product management with approval authority',
    permissions: [
      'stories:view', 'stories:create', 'stories:edit_own', 'stories:edit_all', 'stories:sign_off_pm',
      'bugs:view', 'bugs:create', 'bugs:edit_own',
      'tests:view', 'sprints:view', 'sprints:create', 'sprints:edit',
      'reports:view', 'reports:export', 'dashboard:view'
    ]
  },
  {
    id: 'team-lead',
    name: 'Team Lead',
    description: 'Extended permissions for team management',
    permissions: [
      'stories:view', 'stories:create', 'stories:edit_own', 'stories:edit_all',
      'bugs:view', 'bugs:create', 'bugs:edit_own', 'bugs:edit_all', 'bugs:close',
      'tests:view', 'tests:create', 'tests:edit_own', 'tests:edit_all', 'tests:execute',
      'sprints:view', 'sprints:create', 'sprints:edit',
      'reports:view', 'reports:export', 'users:view', 'dashboard:view'
    ]
  }
];

/** Live permission map — updated at runtime by overrideRolePermissions() */
let ROLE_PERMISSIONS: Record<string, Permission[]> = deepClone(DEFAULT_ROLE_PERMISSIONS);

/** User-level permission overrides — loaded from storage */
let USER_PERMISSION_OVERRIDES: Record<string, UserPermissionOverride> = {};

function deepClone(src: Record<string, Permission[]>): Record<string, Permission[]> {
  const out: Record<string, Permission[]> = {};
  for (const k of Object.keys(src)) out[k] = src[k].slice();
  return out;
}

/** Replace the live permission map (call this after loading saved config) */
export function overrideRolePermissions(overrides: Record<string, Permission[]>): void {
  ROLE_PERMISSIONS = deepClone(overrides);
}

/** Get a snapshot of the current live permission map */
export function getCurrentRolePermissions(): Record<string, Permission[]> {
  return deepClone(ROLE_PERMISSIONS);
}

// ── User Override Management ──────────────────────────────────────────────────

export async function loadUserOverrides(): Promise<void> {
  try {
    const overrides = await getData('aqms_user_permission_overrides');
    if (overrides && typeof overrides === 'object') {
      USER_PERMISSION_OVERRIDES = overrides;
    }
  } catch (e) {
    console.error('Failed to load user permission overrides:', e);
  }
}

export async function saveUserOverrides(): Promise<void> {
  try {
    await setData('aqms_user_permission_overrides', USER_PERMISSION_OVERRIDES);
  } catch (e) {
    console.error('Failed to save user permission overrides:', e);
  }
}

export function getUserOverride(userId: string): UserPermissionOverride | undefined {
  return USER_PERMISSION_OVERRIDES[userId];
}

export async function grantUserPermission(userId: string, permission: Permission): Promise<void> {
  if (!USER_PERMISSION_OVERRIDES[userId]) {
    USER_PERMISSION_OVERRIDES[userId] = {
      userId,
      grantedPermissions: [],
      revokedPermissions: []
    };
  }
  const override = USER_PERMISSION_OVERRIDES[userId];
  if (!override.grantedPermissions.includes(permission)) {
    override.grantedPermissions.push(permission);
  }
  // Remove from revoked if present
  override.revokedPermissions = override.revokedPermissions.filter(p => p !== permission);
  await saveUserOverrides();
}

export async function revokeUserPermission(userId: string, permission: Permission): Promise<void> {
  if (!USER_PERMISSION_OVERRIDES[userId]) {
    USER_PERMISSION_OVERRIDES[userId] = {
      userId,
      grantedPermissions: [],
      revokedPermissions: []
    };
  }
  const override = USER_PERMISSION_OVERRIDES[userId];
  if (!override.revokedPermissions.includes(permission)) {
    override.revokedPermissions.push(permission);
  }
  // Remove from granted if present
  override.grantedPermissions = override.grantedPermissions.filter(p => p !== permission);
  await saveUserOverrides();
}

export async function clearUserOverrides(userId: string): Promise<void> {
  delete USER_PERMISSION_OVERRIDES[userId];
  await saveUserOverrides();
}

// ── Core permission helpers ───────────────────────────────────────────────────

export function hasPermission(role: string | undefined, permission: Permission, userId?: string): boolean {
  if (!role) return false;

  // Check user-level overrides first
  if (userId) {
    const override = USER_PERMISSION_OVERRIDES[userId];
    if (override) {
      // If explicitly revoked, deny
      if (override.revokedPermissions.includes(permission)) {
        return false;
      }
      // If explicitly granted, allow
      if (override.grantedPermissions.includes(permission)) {
        return true;
      }
    }
  }

  // Fall back to role-based permissions
  return (ROLE_PERMISSIONS[role] ?? []).includes(permission);
}

export function hasAnyPermission(role: string | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.some(p => hasPermission(role, p));
}

export function hasAllPermissions(role: string | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.every(p => hasPermission(role, p));
}

export function isAdmin(role: string | undefined): boolean {
  return role === 'Administrator';
}

export function canSignOffQA(role: string | undefined): boolean {
  return hasPermission(role, 'stories:sign_off_qa');
}

export function canSignOffPM(role: string | undefined): boolean {
  return hasPermission(role, 'stories:sign_off_pm');
}

export function getPermissionsForRole(role: string): Permission[] {
  return (ROLE_PERMISSIONS[role] ?? []).slice();
}

/** Map tab names to the permission that gates them */
const TAB_PERMISSION_MAP: Record<string, Permission> = {
  users: 'users:view',
  data: 'data:view',
  audit: 'audit:view',
  bulk: 'bulk:view',
  dashboard: 'dashboard:view',
  kanban: 'stories:view',
  validator: 'stories:view',
  tests: 'tests:view',
  bugs: 'bugs:view',
  risk: 'stories:view',
  burndown: 'stories:view',
  charts: 'reports:view',
  reports: 'reports:view',
  testhistory: 'tests:view',
  sprints: 'sprints:view',
  traceability: 'stories:view',
  release: 'sprints:view',
  team: 'reports:view',
  recommendations: 'stories:view',
};

export function canAccessTab(role: string | undefined, tab: string, userId?: string): boolean {
  if (!role) return false;
  const required = TAB_PERMISSION_MAP[tab];
  if (!required) return true;
  return hasPermission(role, required, userId);
}

// ── Centralized Ownership Validation Helpers ──────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Story {
  id: string;
  assignedDeveloper?: string;
  assignedTester?: string;
  assignedQAReviewer?: string;
}

export interface Bug {
  id: string;
  foundBy?: string;
  assignedTo?: string;
  assignedDeveloper?: string;
  assignedTester?: string;
}

export interface TestCase {
  id: string;
  createdBy?: string;
  assignedTo?: string;
}

export function canEditStory(user: User | null, story: Story): boolean {
  if (!user) return false;

  // Admins can edit all
  if (isAdmin(user.role)) return true;

  // Check if user has edit_all permission
  if (hasPermission(user.role, 'stories:edit_all', user.id)) return true;

  // Check if user has edit_own permission and is assigned
  if (hasPermission(user.role, 'stories:edit_own', user.id)) {
    const isOwner = story.assignedDeveloper === user.name ||
                    story.assignedTester === user.name ||
                    story.assignedQAReviewer === user.name;
    return isOwner;
  }

  return false;
}

export function canDeleteStory(user: User | null, story: Story): boolean {
  if (!user) return false;
  return hasPermission(user.role, 'stories:delete', user.id);
}

export function canEditBug(user: User | null, bug: Bug): boolean {
  if (!user) return false;

  // Admins can edit all
  if (isAdmin(user.role)) return true;

  // Check if user has edit_all permission
  if (hasPermission(user.role, 'bugs:edit_all', user.id)) return true;

  // Check if user has edit_own permission and is assigned or creator
  if (hasPermission(user.role, 'bugs:edit_own', user.id)) {
    const isOwner = bug.foundBy === user.name ||
                    bug.assignedTo === user.name ||
                    bug.assignedDeveloper === user.name ||
                    bug.assignedTester === user.name;
    return isOwner;
  }

  return false;
}

export function canDeleteBug(user: User | null, bug: Bug): boolean {
  if (!user) return false;
  return hasPermission(user.role, 'bugs:delete', user.id);
}

export function canCloseBug(user: User | null, bug: Bug): boolean {
  if (!user) return false;
  return hasPermission(user.role, 'bugs:close', user.id);
}

export function canEditTestCase(user: User | null, testCase: TestCase): boolean {
  if (!user) return false;

  // Admins can edit all
  if (isAdmin(user.role)) return true;

  // Check if user has edit_all permission
  if (hasPermission(user.role, 'tests:edit_all', user.id)) return true;

  // Check if user has edit_own permission and is creator or assigned
  if (hasPermission(user.role, 'tests:edit_own', user.id)) {
    const isOwner = testCase.createdBy === user.name ||
                    testCase.assignedTo === user.name;
    return isOwner;
  }

  return false;
}

export function canDeleteTestCase(user: User | null, testCase: TestCase): boolean {
  if (!user) return false;
  return hasPermission(user.role, 'tests:delete', user.id);
}

export function canExecuteTestCase(user: User | null, testCase: TestCase): boolean {
  if (!user) return false;
  return hasPermission(user.role, 'tests:execute', user.id);
}

// ── Audit Logging ─────────────────────────────────────────────────────────────

export async function logAuditEntry(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
  try {
    const logs = (await getData('aqms_audit_logs')) || [];
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    logs.unshift(newEntry); // Add to beginning for most recent first

    // Keep only last 1000 entries to prevent storage overflow
    const trimmedLogs = logs.slice(0, 1000);
    await setData('aqms_audit_logs', trimmedLogs);
  } catch (e) {
    console.error('Failed to log audit entry:', e);
  }
}

export async function getAuditLogs(limit?: number): Promise<AuditLogEntry[]> {
  try {
    const logs = (await getData('aqms_audit_logs')) || [];
    return limit ? logs.slice(0, limit) : logs;
  } catch (e) {
    console.error('Failed to get audit logs:', e);
    return [];
  }
}

export async function exportAuditLogs(): Promise<string> {
  try {
    const logs = await getAuditLogs();
    return JSON.stringify(logs, null, 2);
  } catch (e) {
    console.error('Failed to export audit logs:', e);
    return '[]';
  }
}

// ── Permission Templates ──────────────────────────────────────────────────────

export async function applyTemplateToRole(templateId: string, role: AnyRole, currentUser: User): Promise<void> {
  const template = PERMISSION_TEMPLATES.find(t => t.id === templateId);
  if (!template) throw new Error('Template not found');

  const currentPerms = ROLE_PERMISSIONS[role] || [];
  ROLE_PERMISSIONS[role] = [...template.permissions];

  await setData('aqms_role_permissions', getCurrentRolePermissions());

  await logAuditEntry({
    userId: currentUser.id,
    userName: currentUser.name,
    action: 'template_apply',
    details: `Applied template "${template.name}" to role ${role}`,
    oldValue: currentPerms.join(', '),
    newValue: template.permissions.join(', ')
  });
}

export async function applyTemplateToUser(templateId: string, userId: string, userName: string, currentUser: User): Promise<void> {
  const template = PERMISSION_TEMPLATES.find(t => t.id === templateId);
  if (!template) throw new Error('Template not found');

  // Clear existing overrides
  await clearUserOverrides(userId);

  // Grant all template permissions
  for (const permission of template.permissions) {
    await grantUserPermission(userId, permission);
  }

  await logAuditEntry({
    userId: currentUser.id,
    userName: currentUser.name,
    action: 'template_apply',
    targetUserId: userId,
    targetUserName: userName,
    details: `Applied template "${template.name}" to user ${userName}`,
    newValue: template.permissions.join(', ')
  });
}

export { TAB_PERMISSION_MAP };
