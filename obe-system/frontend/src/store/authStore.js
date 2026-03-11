import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Authentication Store using Zustand
 * 
 * Manages user authentication state with persistence
 * Stores user data, JWT token, and authentication status
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,

      /**
       * Set hydration status
       * Internal method called after store rehydrates from localStorage
       */
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      /**
       * Set user data and token after successful login
       * @param {Object} userData - User object from backend
       * @param {string} authToken - JWT token
       */
      login: (userData, authToken) => {
        set({
          user: userData,
          token: authToken,
          isAuthenticated: true,
        });
      },

      /**
       * Clear user data and token on logout
       */
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      /**
       * Update user data without changing token
       * Useful for profile updates
       * @param {Object} userData - Updated user object
       */
      setUser: (userData) => {
        set({
          user: userData,
        });
      },

      /**
       * Update specific user fields
       * @param {Object} updates - Partial user object with fields to update
       */
      updateUser: (updates) => {
        const currentUser = get().user;
        set({
          user: currentUser ? { ...currentUser, ...updates } : null,
        });
      },

      /**
       * Set token only (for token refresh scenarios)
       * @param {string} authToken - New JWT token
       */
      setToken: (authToken) => {
        set({
          token: authToken,
          isAuthenticated: !!authToken,
        });
      },

      /**
       * Check if user has a specific role
       * @param {string|string[]} roles - Role or array of roles to check
       * @returns {boolean} - True if user has at least one of the specified roles
       */
      hasRole: (roles) => {
        const user = get().user;
        if (!user || !user.role) return false;
        
        if (Array.isArray(roles)) {
          return roles.includes(user.role);
        }
        return user.role === roles;
      },

      /**
       * Check if user is admin
       * @returns {boolean}
       */
      isAdmin: () => {
        const user = get().user;
        return user?.role === 'admin';
      },

      /**
       * Check if user is HOD
       * @returns {boolean}
       */
      isHOD: () => {
        const user = get().user;
        return user?.role === 'hod';
      },

      /**
       * Check if user is teacher
       * @returns {boolean}
       */
      isTeacher: () => {
        const user = get().user;
        return user?.role === 'teacher';
      },

      /**
       * Check if user is student
       * @returns {boolean}
       */
      isStudent: () => {
        const user = get().user;
        return user?.role === 'student';
      },
    }),
    {
      name: 'obe-auth-storage', // LocalStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }), // Only persist these fields
      onRehydrateStorage: () => (state) => {
        // Called after state is rehydrated from localStorage
        // Always set hydration to true, even if no data was in localStorage
        if (state) {
          state.setHasHydrated(true);
        } else {
          // Edge case: if state is null, manually trigger hydration
          // This ensures the app doesn't get stuck on loading screen
          setTimeout(() => {
            useAuthStore.getState().setHasHydrated(true);
          }, 0);
        }
      },
    }
  )
);

// Separate hook to access hydration state
export const useHasHydrated = () => useAuthStore((state) => state._hasHydrated);

export default useAuthStore;
