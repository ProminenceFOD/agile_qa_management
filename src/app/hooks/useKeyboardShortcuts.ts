import { useEffect } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: Shortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const keyMatches = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl
          ? e.ctrlKey || e.metaKey
          : !e.ctrlKey && !e.metaKey;
        const shiftMatches = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatches = shortcut.alt ? e.altKey : !e.altKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          e.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

export const GLOBAL_SHORTCUTS: Shortcut[] = [
  {
    key: 'k',
    ctrl: true,
    description: 'Open search',
    action: () => {}, // Will be overridden
  },
  {
    key: 'n',
    ctrl: true,
    description: 'Create new story',
    action: () => {},
  },
  {
    key: 'd',
    ctrl: true,
    description: 'Toggle dark mode',
    action: () => {},
  },
  {
    key: '?',
    shift: true,
    description: 'Show keyboard shortcuts',
    action: () => {},
  },
  {
    key: '1',
    ctrl: true,
    description: 'Go to Dashboard',
    action: () => {},
  },
  {
    key: '2',
    ctrl: true,
    description: 'Go to Criteria Validator',
    action: () => {},
  },
  {
    key: '3',
    ctrl: true,
    description: 'Go to Risk Matrix',
    action: () => {},
  },
  {
    key: '4',
    ctrl: true,
    description: 'Go to Burn-Down',
    action: () => {},
  },
];
