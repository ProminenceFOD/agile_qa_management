import { useEffect, useState } from 'react';
import { storage, getStorageItem, setStorageItem } from '../utils/storage';

export function StorageDiagnostics() {
  const [storageKeys, setStorageKeys] = useState<string[]>([]);
  const [aqmsKeys, setAqmsKeys] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<string>('');
  const [indexedDBKeys, setIndexedDBKeys] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    const checkStorage = async () => {
      // Get all localStorage keys
      const allKeys = Object.keys(localStorage);
      setStorageKeys(allKeys);

      // Get all aqms_* keys and their values from localStorage
      const aqms: Record<string, string> = {};
      allKeys.forEach((key) => {
        if (key.includes('aqms_')) {
          const value = localStorage.getItem(key);
          aqms[key] = value ? `${value.substring(0, 100)}...` : 'null';
        }
      });
      setAqmsKeys(aqms);

      // Check IndexedDB
      try {
        const idbData: Record<string, string> = {};
        const testKeys = [
          'aqms_stories',
          'aqms_bugs',
          'aqms_users',
          'aqms_test_cases',
        ];
        for (const key of testKeys) {
          const value = await getStorageItem(key);
          if (value) {
            idbData[key] = `${value.substring(0, 100)}...`;
          }
        }
        setIndexedDBKeys(idbData);
      } catch (e) {
        console.error('[Diagnostics] IndexedDB check failed:', e);
      }
    };

    // Check immediately
    checkStorage();

    // Check every 2 seconds
    const interval = setInterval(checkStorage, 2000);

    return () => clearInterval(interval);
  }, []);

  const runTest = () => {
    // Test 1: Simple set/get
    localStorage.setItem('test_simple', 'hello');
    const simple = localStorage.getItem('test_simple');

    // Test 2: aqms_test set/get
    localStorage.setItem('aqms_test', 'world');
    const aqmsTest = localStorage.getItem('aqms_test');

    // Test 3: Complex object
    const testObj = { id: '1', name: 'Test', data: [1, 2, 3] };
    localStorage.setItem('aqms_test_obj', JSON.stringify(testObj));
    const aqmsObj = localStorage.getItem('aqms_test_obj');

    setTestResult(`
Simple test: ${simple === 'hello' ? '✅ PASS' : '❌ FAIL'}
AQMS test: ${aqmsTest === 'world' ? '✅ PASS' : '❌ FAIL'}
Object test: ${aqmsObj ? '✅ PASS' : '❌ FAIL'}
    `);
  };

  const saveTestData = async () => {
    const testStories = [{ id: 'US-999', title: 'Test Story', status: 'Done' }];

    // Save to new storage system
    await setStorageItem('aqms_stories', JSON.stringify(testStories));
    console.log('[Diagnostics] Saved test stories to IndexedDB');

    // Immediately try to read it back
    const retrieved = await getStorageItem('aqms_stories');
    console.log('[Diagnostics] Retrieved from IndexedDB:', retrieved);
    alert(
      `IndexedDB - Saved and retrieved: ${retrieved ? 'SUCCESS ✅' : 'FAILED ❌'}\n\nNow refresh the page and check if it persists!`
    );
  };

  const clearAqmsData = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.includes('aqms_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('[Diagnostics] Cleared all aqms_* keys');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold mb-6">localStorage Diagnostics</h2>

      <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded">
        <h3 className="font-bold mb-2">Real-time Storage Monitor</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-bold text-gray-700">
              localStorage (non-persistent)
            </p>
            <p className="text-sm text-gray-600">
              Total keys: {storageKeys.length}
            </p>
            <p className="text-sm text-gray-600">
              AQMS keys: {Object.keys(aqmsKeys).length}
            </p>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700">
              IndexedDB (persistent)
            </p>
            <p className="text-sm text-gray-600">
              AQMS keys: {Object.keys(indexedDBKeys).length}
            </p>
            {Object.keys(indexedDBKeys).length > 0 ? (
              <p className="text-sm text-green-600 font-bold">✅ Data found!</p>
            ) : (
              <p className="text-sm text-orange-600">⚠️ No data yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-2">
          localStorage AQMS Keys (cleared on refresh)
        </h3>
        {Object.keys(aqmsKeys).length === 0 ? (
          <p className="text-red-600">⚠️ No AQMS keys found in localStorage</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(aqmsKeys).map(([key, value]) => (
              <div key={key} className="p-2 bg-gray-50 border rounded text-xs">
                <div className="font-bold">{key}</div>
                <div className="text-gray-600 truncate">{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-2">
          IndexedDB AQMS Keys (persistent across refresh)
        </h3>
        {Object.keys(indexedDBKeys).length === 0 ? (
          <p className="text-orange-600">
            ⚠️ No AQMS keys found in IndexedDB - Click "Save Test Story" to
            create some
          </p>
        ) : (
          <div className="space-y-2">
            {Object.entries(indexedDBKeys).map(([key, value]) => (
              <div
                key={key}
                className="p-2 bg-green-50 border border-green-200 rounded text-xs"
              >
                <div className="font-bold text-green-700">{key} ✅</div>
                <div className="text-gray-600 truncate">{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-2">All localStorage Keys</h3>
        <div className="p-3 bg-gray-50 border rounded text-xs max-h-40 overflow-y-auto">
          {storageKeys.length === 0 ? (
            <p>No keys in localStorage</p>
          ) : (
            <ul className="space-y-1">
              {storageKeys.map((key) => (
                <li
                  key={key}
                  className={
                    key.includes('aqms_') ? 'text-indigo-600 font-bold' : ''
                  }
                >
                  {key}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mb-6 space-x-2">
        <button
          onClick={runTest}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
        >
          Run Storage Test
        </button>
        <button
          onClick={saveTestData}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Save Test Story
        </button>
        <button
          onClick={clearAqmsData}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear AQMS Data
        </button>
      </div>

      {testResult && (
        <div className="p-4 bg-gray-50 border rounded">
          <h3 className="font-bold mb-2">Test Results</h3>
          <pre className="text-xs whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-bold mb-2">🔍 Testing IndexedDB Persistence</h3>
        <ol className="text-sm space-y-2 list-decimal list-inside">
          <li className="font-bold text-indigo-700">
            Click "Save Test Story" button above
          </li>
          <li>You should see an alert saying "SUCCESS ✅"</li>
          <li>
            Check that "aqms_stories" appears in the "IndexedDB AQMS Keys"
            section with a green checkmark
          </li>
          <li className="font-bold text-orange-700">
            Refresh the page (F5 or Ctrl+R)
          </li>
          <li>Go back to the "Storage Debug" tab</li>
          <li className="font-bold text-green-700">
            If "aqms_stories" still appears in IndexedDB section → IndexedDB
            works! ✅
          </li>
          <li>
            If it's gone → IndexedDB also doesn't persist in Figma Make
            environment ❌
          </li>
        </ol>
      </div>

      <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded">
        <h3 className="font-bold mb-2">📝 What We're Testing</h3>
        <p className="text-sm text-gray-700 mb-2">
          <strong>Problem:</strong> localStorage doesn't persist in Figma Make's
          iframe environment.
        </p>
        <p className="text-sm text-gray-700">
          <strong>Solution:</strong> We're testing IndexedDB as an alternative.
          IndexedDB is a more robust browser storage API that typically persists
          even in iframe environments.
        </p>
      </div>
    </div>
  );
}
