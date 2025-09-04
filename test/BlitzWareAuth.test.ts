/**
 * BlitzWareAuth Class Tests
 * Testing the core authentication class and hasRole functionality
 */

import { ref } from 'vue';
import { BlitzWareAuth } from '../src/BlitzWareAuth';
import { BlitzWareAuthUser } from '../src/types';

// Mock axios
jest.mock('axios');

// Mock the utils functions
jest.mock('../src/utils', () => ({
  generateAuthUrl: jest.fn(),
  hasAuthParams: jest.fn().mockReturnValue(false),
  isTokenValid: jest.fn().mockReturnValue(false),
  setToken: jest.fn(),
  setState: jest.fn(),
  getState: jest.fn(),
  fetchUserInfo: jest.fn(),
  exchangeCodeForToken: jest.fn(),
  tryRefreshToken: jest.fn(),
  generateSecureState: jest.fn().mockReturnValue('test-state'),
  logoutFromService: jest.fn(),
  clearSession: jest.fn(),
}));

describe('BlitzWareAuth', () => {
  let auth: BlitzWareAuth;

  beforeEach(() => {
    auth = new BlitzWareAuth({
      clientId: 'test-client-id',
      redirectUri: 'http://localhost:3000/callback',
    });
  });

  describe('hasRole method', () => {
    beforeEach(() => {
      // Reset user state
      auth['user'] = ref(null);
      auth['isAuthenticated'] = ref(false);
    });

    it('should return false when user is not authenticated', () => {
      const result = auth.hasRole('admin');
      expect(result).toBe(false);
    });

    it('should return false when user is null', () => {
      auth['isAuthenticated'] = ref(true);
      auth['user'] = ref(null);

      const result = auth.hasRole('admin');
      expect(result).toBe(false);
    });

    it('should return false when no role is specified', () => {
      const mockUser: BlitzWareAuthUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['admin'],
      };

      auth['isAuthenticated'] = ref(true);
      auth['user'] = ref(mockUser);

      const result = auth.hasRole();
      expect(result).toBe(false);
    });

    it('should return false when empty role array is provided', () => {
      const mockUser: BlitzWareAuthUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['admin'],
      };

      auth['isAuthenticated'] = ref(true);
      auth['user'] = ref(mockUser);

      const result = auth.hasRole([]);
      expect(result).toBe(false);
    });

    it('should return true when user has the required role', () => {
      const mockUser: BlitzWareAuthUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['admin', 'user'],
      };

      auth['isAuthenticated'] = ref(true);
      auth['user'] = ref(mockUser);

      const result = auth.hasRole('admin');
      expect(result).toBe(true);
    });

    it('should return false when user does not have the required role', () => {
      const mockUser: BlitzWareAuthUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user'],
      };

      auth['isAuthenticated'] = ref(true);
      auth['user'] = ref(mockUser);

      const result = auth.hasRole('admin');
      expect(result).toBe(false);
    });

    describe('multiple roles with OR logic (default)', () => {
      it('should return true when user has any of the required roles', () => {
        const mockUser: BlitzWareAuthUser = {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          roles: ['moderator', 'user'],
        };

        auth['isAuthenticated'] = ref(true);
        auth['user'] = ref(mockUser);

        const result = auth.hasRole(['admin', 'moderator']);
        expect(result).toBe(true);
      });

      it('should return false when user has none of the required roles', () => {
        const mockUser: BlitzWareAuthUser = {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          roles: ['user'],
        };

        auth['isAuthenticated'] = ref(true);
        auth['user'] = ref(mockUser);

        const result = auth.hasRole(['admin', 'moderator']);
        expect(result).toBe(false);
      });
    });

    describe('multiple roles with AND logic', () => {
      it('should return true when user has all required roles', () => {
        const mockUser: BlitzWareAuthUser = {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          roles: ['admin', 'moderator', 'user'],
        };

        auth['isAuthenticated'] = ref(true);
        auth['user'] = ref(mockUser);

        const result = auth.hasRole(['admin', 'moderator'], true);
        expect(result).toBe(true);
      });

      it('should return false when user does not have all required roles', () => {
        const mockUser: BlitzWareAuthUser = {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          roles: ['admin', 'user'],
        };

        auth['isAuthenticated'] = ref(true);
        auth['user'] = ref(mockUser);

        const result = auth.hasRole(['admin', 'moderator'], true);
        expect(result).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should handle user with no roles property', () => {
        const mockUser: BlitzWareAuthUser = {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          // roles property is undefined
        };

        auth['isAuthenticated'] = ref(true);
        auth['user'] = ref(mockUser);

        const result = auth.hasRole('admin');
        expect(result).toBe(false);
      });

      it('should handle user with empty roles array', () => {
        const mockUser: BlitzWareAuthUser = {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          roles: [],
        };

        auth['isAuthenticated'] = ref(true);
        auth['user'] = ref(mockUser);

        const result = auth.hasRole('admin');
        expect(result).toBe(false);
      });

      it('should be case sensitive', () => {
        const mockUser: BlitzWareAuthUser = {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          roles: ['admin'],
        };

        auth['isAuthenticated'] = ref(true);
        auth['user'] = ref(mockUser);

        const result = auth.hasRole('Admin');
        expect(result).toBe(false);
      });
    });
  });

  describe('reactive properties', () => {
    it('should have reactive isAuthenticated property', () => {
      expect(auth.isAuthenticated).toBeDefined();
      expect(typeof auth.isAuthenticated.value).toBe('boolean');
    });

    it('should have reactive isLoading property', () => {
      expect(auth.isLoading).toBeDefined();
      expect(typeof auth.isLoading.value).toBe('boolean');
    });

    it('should have reactive user property', () => {
      expect(auth.user).toBeDefined();
      expect(auth.user.value === null || typeof auth.user.value === 'object').toBe(true);
    });
  });
});
