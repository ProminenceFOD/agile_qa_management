/**
 * Utility to fix server-side user data
 * Run this by calling fixServerUsers() from the browser console
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-5a760dac`;

export async function fixServerUsers() {
  console.log('🔧 Fixing server user data...');

  // Correct demo users with Administrator role
  const correctUsers = [
    {
      email: 'qa@aqms.com',
      password: 'password123',
      name: 'Damilola Ogunlade',
      role: 'Administrator',
      organizationId: 'demo-org',
      organizationName: 'AQMS Demo Organization',
      canSignOffQA: true,
      canSignOffPM: false,
      id: 'USR-001',
      title: 'Head of QA / Administrator',
      status: 'Active',
      joinedDate: new Date('2026-01-15'),
      lastActive: new Date(),
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
      isActive: true,
    },
  ];

  try {
    // Update server KV store
    const response = await fetch(`${API_BASE}/data/aqms_users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: correctUsers }),
    });

    if (response.ok) {
      console.log('✅ Server users updated successfully!');
      console.log('📋 Updated users:');
      correctUsers.forEach((u) => {
        console.log(`  - ${u.email}: ${u.role} (${u.organizationName})`);
      });

      // Update local storage too
      localStorage.setItem('aqms_users', JSON.stringify(correctUsers));

      // Clear any cached sessions
      localStorage.removeItem('aqms_session');

      console.log('✅ Local storage updated');
      console.log('🔄 Please refresh the page and log in again');

      return true;
    } else {
      const text = await response.text();
      console.error('❌ Failed to update server:', response.status, text);
      return false;
    }
  } catch (error) {
    console.error('❌ Error updating server:', error);
    return false;
  }
}

// Make it available globally for console access
if (typeof window !== 'undefined') {
  (window as any).fixServerUsers = fixServerUsers;
}
