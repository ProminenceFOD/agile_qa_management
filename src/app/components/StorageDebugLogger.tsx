import { useEffect } from 'react';

/**
 * Component that logs storage changes to help debug when data is being cleared.
 * Add this to App.tsx to track storage lifecycle.
 */
export function StorageDebugLogger() {
  useEffect(() => {
    console.log('=== STORAGE DEBUG LOGGER MOUNTED ===');

    // Log current state
    const logCurrentState = (event: string) => {
      const stories = localStorage.getItem('aqms_stories');
      const bugs = localStorage.getItem('aqms_bugs');
      const users = localStorage.getItem('aqms_users');

      console.log(`[${event}] Storage State:`, {
        stories: stories ? `${stories.length} chars` : 'NULL',
        bugs: bugs ? `${bugs.length} chars` : 'NULL',
        users: users ? `${users.length} chars` : 'NULL',
      });
    };

    logCurrentState('MOUNT');

    // Monitor storage events
    const handleStorage = (e: StorageEvent) => {
      console.log('[STORAGE EVENT]', {
        key: e.key,
        oldValue: e.oldValue ? `${e.oldValue.substring(0, 50)}...` : 'null',
        newValue: e.newValue ? `${e.newValue.substring(0, 50)}...` : 'null',
      });
    };

    window.addEventListener('storage', handleStorage);

    // Log before unload
    const handleBeforeUnload = () => {
      logCurrentState('BEFORE_UNLOAD');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Periodic check
    const interval = setInterval(() => {
      logCurrentState('PERIODIC_CHECK');
    }, 5000);

    return () => {
      logCurrentState('UNMOUNT');
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(interval);
    };
  }, []);

  return null; // This component doesn't render anything
}
