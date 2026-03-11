/**
 * Mock Authentication for Development
 * 
 * This provides a way to test the frontend without a backend API
 * Remove this file when integrating with real backend
 */

export const mockUsers = {
  'admin@university.edu': {
    id: 1,
    name: 'Admin User',
    email: 'admin@university.edu',
    username: 'admin',
    role: 'admin',
    password: 'admin123',
  },
  'hod@university.edu': {
    id: 2,
    name: 'John Smith',
    email: 'hod@university.edu',
    username: 'hodsmith',
    role: 'hod',
    password: 'hod123',
  },
  'teacher@university.edu': {
    id: 3,
    name: 'Jane Doe',
    email: 'teacher@university.edu',
    username: 'teacherjane',
    role: 'teacher',
    password: 'teacher123',
  },
  'student@university.edu': {
    id: 4,
    name: 'Bob Wilson',
    email: 'student@university.edu',
    username: 'studentbob',
    role: 'student',
    password: 'student123',
  },
};

/**
 * Mock login function
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{user, tokens}>}
 */
export const mockLogin = async (email, password) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const user = mockUsers[email];

  if (!user || user.password !== password) {
    throw new Error('Invalid email or password');
  }

  // Return user without password and mock token
  const { password: _, ...userWithoutPassword } = user;
  
  return {
    user: userWithoutPassword,
    tokens: {
      accessToken: `mock-token-${user.id}-${Date.now()}`,
      refreshToken: `mock-refresh-${user.id}-${Date.now()}`,
    },
  };
};

/**
 * Mock register function
 * @param {Object} userData 
 * @returns {Promise<{user, token}>}
 */
export const mockRegister = async (userData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Check if email already exists
  if (mockUsers[userData.email]) {
    throw new Error('Email already exists');
  }

  const newUser = {
    id: Object.keys(mockUsers).length + 1,
    name: userData.fullName || userData.name,
    email: userData.email,
    username: userData.username,
    role: userData.role || 'student',
  };

  return {
    user: newUser,
    token: `mock-token-${newUser.id}-${Date.now()}`,
  };
};

/**
 * Check if we should use mock auth (development mode)
 */
export const useMockAuth = () => {
  return import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_AUTH === 'true';
};
