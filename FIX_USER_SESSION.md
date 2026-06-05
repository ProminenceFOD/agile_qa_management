# Quick Fix for User Session Issue

If you're still seeing "QA Engineer" instead of "Administrator", run this in your browser console (F12):

```javascript
// Clear stale session
localStorage.removeItem('aqms_session');

// Fix user data
const users = JSON.parse(localStorage.getItem('aqms_users') || '[]');
const qaUser = users.find(u => u.email === 'qa@aqms.com');
if (qaUser) {
  qaUser.role = 'Administrator';
  qaUser.organizationName = 'AQMS Demo Organization';
  qaUser.title = 'Head of QA / Administrator';
  qaUser.canSignOffQA = true;
  qaUser.canSignOffPM = true;
  localStorage.setItem('aqms_users', JSON.stringify(users));
}

// Reload page
location.reload();
```

This will:
1. Clear your cached session
2. Fix the qa@aqms.com user to be Administrator
3. Add the organization name
4. Reload the page with fresh data
