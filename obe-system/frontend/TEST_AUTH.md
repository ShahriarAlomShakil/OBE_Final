# Authentication Test Instructions

## To access the Courses page, you need to:

### Option 1: Login with Demo Credentials
1. Go to http://localhost:5174/login
2. Use these demo credentials:
   - **Admin:** admin@university.edu / admin123
   - **Teacher:** teacher@university.edu / teacher123
   - **Student:** student@university.edu / student123
3. After login, navigate to http://localhost:5174/courses

### Option 2: Check if you're already logged in
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Check LocalStorage for `obe-auth-storage`
4. If it exists and has a token, you're logged in
5. If not, use Option 1

### If still redirecting after login:
1. Clear browser localStorage:
   ```javascript
   localStorage.clear()
   ```
2. Refresh the page
3. Login again

### Current Status:
- Development server: http://localhost:5174/
- You need to login first before accessing protected routes like /courses
- The redirect to /login is expected behavior when not authenticated
