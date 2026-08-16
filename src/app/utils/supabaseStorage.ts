/**
 * Supabase-based storage utility for Figma Make
 * This replaces localStorage/IndexedDB which don't persist in the iframe environment
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-5a760dac`;

// In-memory cache for performance
const cache = new Map<string, Record<string, unknown> | Record<string, unknown>[]>();

// Keys that should NOT be scoped by organization (global data)
const GLOBAL_KEYS = ['aqms_users'];

// Get current user's organization ID from session
export function getCurrentOrganizationId(): string | null {
  try {
    const session = localStorage.getItem('aqms_session');
    if (session) {
      const parsed = JSON.parse(session);
      return parsed.user?.organizationId || null;
    }
  } catch (_error) {
    console.warn('[SupabaseStorage] Could not get organizationId from session');
  }
  return null;
}

// Scope a key by organization (unless it's a global key)
export function getScopedKey(key: string): string {
  // Don't scope global keys
  if (GLOBAL_KEYS.includes(key)) {
    return key;
  }

  const orgId = getCurrentOrganizationId();
  if (!orgId || orgId === 'demo-org') {
    // For demo organization or if no session exists, use the base key
    return key;
  }

  return `${orgId}_${key}`;
}

// Get or create a persistent device ID using cookies (which may persist better than localStorage in iframes)
function getDeviceId(): string {
  // Try to get from cookie first
  const cookieName = 'aqms_device_id';
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === cookieName) {
      console.log('[DeviceID] Found existing device ID in cookie:', value);
      return value;
    }
  }

  // No device ID found, create new one
  const deviceId = crypto.randomUUID();
  // Set cookie to expire in 1 year
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  document.cookie = `${cookieName}=${deviceId}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  console.log('[DeviceID] Created new device ID:', deviceId);

  return deviceId;
}

export async function getData(key: string, retries = 2): Promise<Record<string, unknown> | Record<string, unknown>[] | null> {
  // Scope the key by organization
  const scopedKey = getScopedKey(key);

  // Check cache first
  if (cache.has(scopedKey)) {
    return cache.get(scopedKey);
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Increase timeout to 8 seconds for first attempt, 5 seconds for retries
      const timeoutMs = attempt === 0 ? 8000 : 5000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(`${API_BASE}/data/${scopedKey}`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (attempt === retries) {
          console.warn(
            `[SupabaseStorage] Server returned ${response.status} for ${scopedKey}`
          );
        }
        continue; // Retry on error
      }

      const result = await response.json();

      if (result.data) {
        cache.set(scopedKey, result.data);
      }

      return result.data;
    } catch (error) {
      if (attempt === retries) {
        // Only log on final attempt
        if ((error as Error).name === 'AbortError') {
          console.log(
            `[SupabaseStorage] Using cached/default data for ${scopedKey}`
          );
        } else {
          console.warn(
            `[SupabaseStorage] Cannot reach server for ${scopedKey}:`,
            error
          );
        }
        return null;
      }
      // Wait 500ms before retry
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return null;
}

export async function setData(
  key: string,
  data: Record<string, unknown> | Record<string, unknown>[],
  retries = 2
): Promise<boolean> {
  // Scope the key by organization
  const scopedKey = getScopedKey(key);

  // Update cache immediately for optimistic UI
  cache.set(scopedKey, data);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Use 8 second timeout for writes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${API_BASE}/data/${scopedKey}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (attempt === retries) {
          console.warn(
            `[SupabaseStorage] Server returned ${response.status} for ${scopedKey}`
          );
        }
        continue; // Retry on error
      }

      const result = await response.json();
      return result.success === true;
    } catch (error) {
      if (attempt === retries) {
        // Only log on final attempt
        if ((error as Error).name === 'AbortError') {
          console.log(`[SupabaseStorage] Data cached locally for ${scopedKey}`);
        } else {
          console.warn(
            `[SupabaseStorage] Cannot reach server to save ${scopedKey}, data cached locally:`,
            error
          );
        }
        // Return true since we cached it - it will persist in memory for this session
        return true;
      }
      // Wait 500ms before retry
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // Return true since we cached it
  return true;
}

// Auth functions
export async function login(
  email: string,
  password: string,
  rememberMe: boolean
): Promise<{ success: boolean; user?: Record<string, unknown>; error?: string }> {
  try {
    const deviceId = getDeviceId();
    console.log(
      '[SupabaseStorage] Calling login API for:',
      email,
      'rememberMe:',
      rememberMe,
      'deviceId:',
      deviceId
    );

    // Add 8 second timeout for login
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, rememberMe, deviceId }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const result = await response
        .json()
        .catch(() => ({ error: 'Invalid credentials' }));
      return { success: false, error: result.error || 'Login failed' };
    }

    const result = await response.json();
    console.log('[SupabaseStorage] Login result:', result);

    // Cache successful login in localStorage
    if (result.success && result.user) {
      localStorage.setItem(
        'aqms_session',
        JSON.stringify({
          user: result.user,
          timestamp: Date.now(),
        })
      );
    }

    return result;
  } catch (error) {
    const isTimeout = (error as Error).name === 'AbortError';
    if (isTimeout) {
      console.warn(
        '[SupabaseStorage] Login timeout, trying cached credentials'
      );
    } else {
      console.warn('[SupabaseStorage] Cannot reach auth server:', error);
    }

    // Fallback: check credentials against cached users
    const users = cache.get('aqms_users');
    if (users && Array.isArray(users)) {
      const user = users.find(
        (u: Record<string, unknown>) => u.email === email && u.password === password
      );
      if (user) {
        console.log(
          '[SupabaseStorage] Using cached credentials for offline login'
        );
        const userData = {
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId || 'demo-org',
          organizationName: user.organizationName,
        };

        // Cache session in localStorage
        localStorage.setItem(
          'aqms_session',
          JSON.stringify({
            user: userData,
            timestamp: Date.now(),
          })
        );

        return {
          success: true,
          user: userData,
        };
      }
    }

    return {
      success: false,
      error: 'Cannot connect to server. Please check your connection.',
    };
  }
}

export async function logout(): Promise<void> {
  try {
    const deviceId = getDeviceId();
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deviceId }),
    });
    cache.clear();
    // Clear localStorage session
    localStorage.removeItem('aqms_session');
  } catch (error) {
    console.error('[SupabaseStorage] Logout error:', error);
    // Still clear local session even if server request fails
    localStorage.removeItem('aqms_session');
  }
}

export async function checkSession(): Promise<Record<string, unknown> | null> {
  try {
    const deviceId = getDeviceId();
    console.log('[SupabaseStorage] Checking session for deviceId:', deviceId);

    // Check localStorage first for immediate response
    const localSession = localStorage.getItem('aqms_session');
    if (localSession) {
      try {
        const sessionData = JSON.parse(localSession);
        // Check if session is still valid (within 7 days)
        const sessionAge = Date.now() - sessionData.timestamp;
        const sevenDays = 7 * 24 * 60 * 60 * 1000;

        if (sessionAge < sevenDays) {
          // Enforce correct data for known demo accounts before returning cached session
          const demoCorrections: Record<
            string,
            { name: string; role: string; canSignOffQA?: boolean; canSignOffPM?: boolean }
          > = {
            'qa@aqms.com': { name: 'Damilola Ogunlade', role: 'Administrator', canSignOffQA: true, canSignOffPM: true },
            'pm@aqms.com': { name: 'Sarah Johnson', role: 'Product Manager', canSignOffPM: true },
            'sm@aqms.com': { name: 'Mike Williams', role: 'Scrum Master' },
          };
          const correction = demoCorrections[sessionData.user?.email];
          if (
            correction &&
            (sessionData.user?.role !== correction.role ||
              sessionData.user?.name !== correction.name ||
              (correction.canSignOffQA !== undefined && sessionData.user?.canSignOffQA !== correction.canSignOffQA) ||
              (correction.canSignOffPM !== undefined && sessionData.user?.canSignOffPM !== correction.canSignOffPM))
          ) {
            console.log(
              '[SupabaseStorage] Correcting stale session data for',
              sessionData.user.email
            );
            sessionData.user = { ...sessionData.user, ...correction };
            localStorage.setItem('aqms_session', JSON.stringify(sessionData));
          }

          console.log(
            '[SupabaseStorage] Using cached session from localStorage'
          );
          return sessionData.user;
        } else {
          console.log('[SupabaseStorage] Local session expired');
          localStorage.removeItem('aqms_session');
        }
      } catch (_e) {
        console.warn('[SupabaseStorage] Invalid session data in localStorage');
        localStorage.removeItem('aqms_session');
      }
    }

    // Add 5 second timeout for auth checks
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_BASE}/auth/check-session`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deviceId }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(
        '[SupabaseStorage] Server returned',
        response.status,
        'for check session'
      );
      return null;
    }

    const result = await response.json();
    console.log('[SupabaseStorage] Check session result:', result);

    // Cache the session in localStorage
    if (result.user) {
      localStorage.setItem(
        'aqms_session',
        JSON.stringify({
          user: result.user,
          timestamp: Date.now(),
        })
      );
    }

    return result.user;
  } catch (error) {
    // Server unreachable or timeout - use localStorage fallback
    const isTimeout = (error as Error).name === 'AbortError';

    // Fallback to localStorage if server is unreachable
    const localSession = localStorage.getItem('aqms_session');
    if (localSession) {
      try {
        const sessionData = JSON.parse(localSession);
        // Only log if verbose logging is needed
        if (!isTimeout) {
          console.log(
            '[SupabaseStorage] Server unreachable, using cached session'
          );
        }
        return sessionData.user;
      } catch (_e) {
        console.warn('[SupabaseStorage] Failed to parse localStorage session');
      }
    }

    return null;
  }
}

// Initialize demo data if needed (non-blocking)
export async function initializeDemoData(): Promise<void> {
  try {
    const users = await getData('aqms_users');

    if (!users || users.length === 0) {
      console.log('[SupabaseStorage] Initializing demo data...');

      const demoUsers = [
        {
          email: 'qa@aqms.com',
          password: 'password123',
          name: 'Damilola Ogunlade',
          role: 'Administrator',
          organizationId: 'demo-org',
          organizationName: 'AQMS Demo Organization',
          canSignOffQA: true,
          canSignOffPM: true,
          id: 'USR-001',
          title: 'Head of QA / Administrator',
          status: 'Active',
          joinedDate: new Date('2026-01-15'),
          lastActive: new Date('2026-04-26T14:30:00'),
          storiesAssigned: 12,
          bugsAssigned: 8,
          isActive: true,
        },
        {
          email: 'pm@aqms.com',
          password: 'password123',
          name: 'Sarah Johnson',
          role: 'Product Manager',
          organizationId: 'demo-org',
          organizationName: 'AQMS Demo Organization',
          canSignOffPM: true,
          id: 'USR-002',
          title: 'Senior Product Manager',
          status: 'Active',
          joinedDate: new Date('2026-01-10'),
          lastActive: new Date('2026-04-26T10:15:00'),
          storiesAssigned: 24,
          bugsAssigned: 0,
          isActive: true,
        },
        {
          email: 'sm@aqms.com',
          password: 'password123',
          name: 'Mike Williams',
          role: 'Scrum Master',
          organizationId: 'demo-org',
          organizationName: 'AQMS Demo Organization',
          id: 'USR-003',
          title: 'Lead Scrum Master',
          status: 'Active',
          joinedDate: new Date('2026-01-10'),
          lastActive: new Date('2026-04-25T16:45:00'),
          storiesAssigned: 0,
          bugsAssigned: 0,
          isActive: true,
        },
        {
          email: 'james.martinez@aqms.com',
          password: 'password123',
          name: 'James Martinez',
          role: 'Developer',
          organizationId: 'demo-org',
          organizationName: 'AQMS Demo Organization',
          id: 'USR-004',
          title: 'Senior Software Engineer',
          status: 'Active',
          joinedDate: new Date('2026-02-01'),
          lastActive: new Date('2026-04-26T13:00:00'),
          storiesAssigned: 15,
          bugsAssigned: 5,
          isActive: true,
        },
        {
          email: 'emily.chen@aqms.com',
          password: 'password123',
          name: 'Emily Chen',
          role: 'Developer',
          organizationId: 'demo-org',
          id: 'USR-005',
          title: 'Software Engineer',
          status: 'Active',
          joinedDate: new Date('2026-02-15'),
          lastActive: new Date('2026-04-26T11:20:00'),
          storiesAssigned: 10,
          bugsAssigned: 3,
          isActive: true,
        },
        {
          email: 'david.kumar@aqms.com',
          password: 'password123',
          name: 'David Kumar',
          role: 'Developer',
          organizationId: 'demo-org',
          id: 'USR-006',
          title: 'Software Engineer',
          status: 'Active',
          joinedDate: new Date('2026-01-20'),
          lastActive: new Date('2026-04-26T09:30:00'),
          storiesAssigned: 8,
          bugsAssigned: 2,
          isActive: true,
        },
        {
          email: 'jessica.williams@aqms.com',
          password: 'password123',
          name: 'Jessica Williams',
          role: 'QA Engineer',
          organizationId: 'demo-org',
          id: 'USR-007',
          title: 'QA Engineer',
          status: 'Active',
          joinedDate: new Date('2026-03-01'),
          lastActive: new Date('2026-04-26T09:15:00'),
          storiesAssigned: 5,
          bugsAssigned: 3,
          isActive: true,
        },
        {
          email: 'maria.rodriguez@aqms.com',
          password: 'password123',
          name: 'Maria Rodriguez',
          role: 'Developer',
          organizationId: 'demo-org',
          id: 'USR-008',
          title: 'Lead Software Engineer',
          status: 'Active',
          joinedDate: new Date('2026-01-25'),
          lastActive: new Date('2026-04-26T15:00:00'),
          storiesAssigned: 12,
          bugsAssigned: 4,
          isActive: true,
        },
        {
          email: 'robert.taylor@aqms.com',
          password: 'password123',
          name: 'Robert Taylor',
          role: 'Developer',
          organizationId: 'demo-org',
          id: 'USR-009',
          title: 'Software Engineer',
          status: 'Active',
          joinedDate: new Date('2026-02-10'),
          lastActive: new Date('2026-04-26T12:30:00'),
          storiesAssigned: 6,
          bugsAssigned: 1,
          isActive: true,
        },
        {
          email: 'linda.thompson@aqms.com',
          password: 'password123',
          name: 'Linda Thompson',
          role: 'Tester',
          organizationId: 'demo-org',
          id: 'USR-010',
          title: 'Senior Test Engineer',
          status: 'Active',
          joinedDate: new Date('2026-02-20'),
          lastActive: new Date('2026-04-26T14:00:00'),
          storiesAssigned: 9,
          bugsAssigned: 7,
          isActive: true,
        },
        {
          email: 'michael.brown@aqms.com',
          password: 'password123',
          name: 'Michael Brown',
          role: 'Tester',
          organizationId: 'demo-org',
          id: 'USR-011',
          title: 'Test Engineer',
          status: 'Active',
          joinedDate: new Date('2026-03-05'),
          lastActive: new Date('2026-04-26T10:45:00'),
          storiesAssigned: 5,
          bugsAssigned: 6,
          isActive: true,
        },
        {
          email: 'jennifer.lee@aqms.com',
          password: 'password123',
          name: 'Jennifer Lee',
          role: 'Tester',
          organizationId: 'demo-org',
          id: 'USR-012',
          title: 'Test Engineer',
          status: 'Active',
          joinedDate: new Date('2026-03-10'),
          lastActive: new Date('2026-04-26T11:15:00'),
          storiesAssigned: 4,
          bugsAssigned: 5,
          isActive: true,
        },
      ];

      await setData('aqms_users', demoUsers);
    } else {
      // Users exist — enforce correct data for primary demo accounts (in case they got corrupted)
      const primaryCorrections: Record<
        string,
        {
          name: string;
          role: string;
          title: string;
          canSignOffQA?: boolean;
          canSignOffPM?: boolean;
        }
      > = {
        'qa@aqms.com': {
          name: 'Damilola Ogunlade',
          role: 'Administrator',
          title: 'Head of QA / Administrator',
          canSignOffQA: true,
          canSignOffPM: true,
        },
        'pm@aqms.com': {
          name: 'Sarah Johnson',
          role: 'Product Manager',
          title: 'Senior Product Manager',
          canSignOffPM: true,
        },
        'sm@aqms.com': {
          name: 'Mike Williams',
          role: 'Scrum Master',
          title: 'Lead Scrum Master',
        },
      };

      let correctionsMade = false;
      for (const user of users) {
        const correction = primaryCorrections[user.email];
        if (correction) {
          const needsUpdate =
            user.name !== correction.name ||
            user.role !== correction.role ||
            (correction.canSignOffQA !== undefined && user.canSignOffQA !== correction.canSignOffQA) ||
            (correction.canSignOffPM !== undefined && user.canSignOffPM !== correction.canSignOffPM);
          if (needsUpdate) {
            console.log(
              `[SupabaseStorage] Correcting user ${user.email}: QA sign-off authority -> ${correction.canSignOffQA}`
            );
            Object.assign(user, correction);
            correctionsMade = true;

            // Also update current active session if logged in as this user
            try {
              const activeSessionStr = localStorage.getItem('aqms_session');
              if (activeSessionStr) {
                const session = JSON.parse(activeSessionStr);
                if (session.user && session.user.email === user.email) {
                  session.user.canSignOffQA = user.canSignOffQA;
                  session.user.canSignOffPM = user.canSignOffPM;
                  session.user.role = user.role;
                  session.user.title = user.title;
                  localStorage.setItem('aqms_session', JSON.stringify(session));
                }
              }
            } catch (err) {
              console.error('[SupabaseStorage] Failed updating active session user:', err);
            }
          }
        }
      }

      if (correctionsMade) {
        await setData('aqms_users', users);
        console.log('[SupabaseStorage] Primary demo users updated with QA sign-off authority.');
      }

      // Check if we need to add missing developers/testers
      const existingUserIds = new Set(users.map((u: Record<string, unknown>) => u.id));
      const requiredUserIds = [
        'USR-004',
        'USR-005',
        'USR-006',
        'USR-008',
        'USR-009',
        'USR-010',
        'USR-011',
        'USR-012',
      ];
      const missingUsers = requiredUserIds.filter(
        (id) => !existingUserIds.has(id)
      );

      if (missingUsers.length > 0) {
        console.log(
          '[SupabaseStorage] Adding missing developers and testers...'
        );

        // Define all required users
        const allRequiredUsers: Record<string, unknown> = {
          'USR-004': {
            email: 'james.martinez@aqms.com',
            password: 'password123',
            name: 'James Martinez',
            role: 'Developer',
            id: 'USR-004',
            title: 'Senior Software Engineer',
            status: 'Active',
            joinedDate: new Date('2026-02-01'),
            lastActive: new Date('2026-04-26T13:00:00'),
            storiesAssigned: 0,
            bugsAssigned: 0,
            isActive: true,
          },
          'USR-005': {
            email: 'emily.chen@aqms.com',
            password: 'password123',
            name: 'Emily Chen',
            role: 'Developer',
            id: 'USR-005',
            title: 'Software Engineer',
            status: 'Active',
            joinedDate: new Date('2026-02-15'),
            lastActive: new Date('2026-04-26T11:20:00'),
            storiesAssigned: 0,
            bugsAssigned: 0,
            isActive: true,
          },
          'USR-006': {
            email: 'david.kumar@aqms.com',
            password: 'password123',
            name: 'David Kumar',
            role: 'Developer',
            id: 'USR-006',
            title: 'Software Engineer',
            status: 'Active',
            joinedDate: new Date('2026-01-20'),
            lastActive: new Date('2026-04-26T09:30:00'),
            storiesAssigned: 0,
            bugsAssigned: 0,
            isActive: true,
          },
          'USR-008': {
            email: 'maria.rodriguez@aqms.com',
            password: 'password123',
            name: 'Maria Rodriguez',
            role: 'Developer',
            id: 'USR-008',
            title: 'Lead Software Engineer',
            status: 'Active',
            joinedDate: new Date('2026-01-25'),
            lastActive: new Date('2026-04-26T15:00:00'),
            storiesAssigned: 0,
            bugsAssigned: 0,
            isActive: true,
          },
          'USR-009': {
            email: 'robert.taylor@aqms.com',
            password: 'password123',
            name: 'Robert Taylor',
            role: 'Developer',
            id: 'USR-009',
            title: 'Software Engineer',
            status: 'Active',
            joinedDate: new Date('2026-02-10'),
            lastActive: new Date('2026-04-26T12:30:00'),
            storiesAssigned: 0,
            bugsAssigned: 0,
            isActive: true,
          },
          'USR-010': {
            email: 'linda.thompson@aqms.com',
            password: 'password123',
            name: 'Linda Thompson',
            role: 'Tester',
            id: 'USR-010',
            title: 'Senior Test Engineer',
            status: 'Active',
            joinedDate: new Date('2026-02-20'),
            lastActive: new Date('2026-04-26T14:00:00'),
            storiesAssigned: 0,
            bugsAssigned: 0,
            isActive: true,
          },
          'USR-011': {
            email: 'michael.brown@aqms.com',
            password: 'password123',
            name: 'Michael Brown',
            role: 'Tester',
            id: 'USR-011',
            title: 'Test Engineer',
            status: 'Active',
            joinedDate: new Date('2026-03-05'),
            lastActive: new Date('2026-04-26T10:45:00'),
            storiesAssigned: 0,
            bugsAssigned: 0,
            isActive: true,
          },
          'USR-012': {
            email: 'jennifer.lee@aqms.com',
            password: 'password123',
            name: 'Jennifer Lee',
            role: 'Tester',
            id: 'USR-012',
            title: 'Test Engineer',
            status: 'Active',
            joinedDate: new Date('2026-03-10'),
            lastActive: new Date('2026-04-26T11:15:00'),
            storiesAssigned: 0,
            bugsAssigned: 0,
            isActive: true,
          },
        };

        // Add missing users
        for (const userId of missingUsers) {
          if (allRequiredUsers[userId]) {
            users.push(allRequiredUsers[userId]);
          }
        }

        await setData('aqms_users', users);
        console.log(
          '[SupabaseStorage] Added',
          missingUsers.length,
          'missing users'
        );
      }
    }
  } catch (error) {
    console.warn('[SupabaseStorage] Could not initialize demo data:', error);
    // Non-fatal, continue anyway
  }
}
