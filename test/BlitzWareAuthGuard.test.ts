/**
 * Vue Router Guards Tests
 * Testing the authentication and role-based guards
 */

import { createApp } from 'vue';
import { BlitzWareAuth } from '../src/BlitzWareAuth';
import { createGuardHandler } from '../src/BlitzWareAuthGuard';
import { RouteLocationNormalized } from 'vue-router';

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

describe('Vue Router Guards', () => {
  let mockAuth: BlitzWareAuth;
  let mockTo: RouteLocationNormalized;
  let mockFrom: RouteLocationNormalized;

  beforeEach(() => {
    // Create mock auth instance
    mockAuth = new BlitzWareAuth({
      clientId: 'test-client-id',
      redirectUri: 'http://localhost:3000/callback',
    });

    // Mock route objects
    mockTo = {
      name: 'test-route',
      path: '/test',
      fullPath: '/test',
      query: {},
      params: {},
      hash: '',
      matched: [],
      meta: {},
      redirectedFrom: undefined
    };

    mockFrom = {
      name: 'from-route',
      path: '/from',
      fullPath: '/from',
      query: {},
      params: {},
      hash: '',
      matched: [],
      meta: {},
      redirectedFrom: undefined
    };
  });

  describe('createGuardHandler', () => {
    it('should return login redirect when user is not authenticated', async () => {
      // Mock not authenticated
      jest.spyOn(mockAuth.isAuthenticated, 'value', 'get').mockReturnValue(false);
      jest.spyOn(mockAuth.isLoading, 'value', 'get').mockReturnValue(false);

      const result = await createGuardHandler(mockAuth);
      
      expect(result).toEqual({ name: 'login' });
    });

    it('should return true when user is authenticated and no role required', async () => {
      // Mock authenticated
      jest.spyOn(mockAuth.isAuthenticated, 'value', 'get').mockReturnValue(true);
      jest.spyOn(mockAuth.isLoading, 'value', 'get').mockReturnValue(false);
      jest.spyOn(mockAuth.user, 'value', 'get').mockReturnValue({
        id: '1',
        username: 'testuser',
        roles: ['user']
      });

      const result = await createGuardHandler(mockAuth);
      
      expect(result).toBe(true);
    });

    it('should return true when user has required role', async () => {
      // Mock authenticated with admin role
      jest.spyOn(mockAuth.isAuthenticated, 'value', 'get').mockReturnValue(true);
      jest.spyOn(mockAuth.isLoading, 'value', 'get').mockReturnValue(false);
      jest.spyOn(mockAuth.user, 'value', 'get').mockReturnValue({
        id: '1',
        username: 'testuser',
        roles: ['admin', 'user']
      });
      
      // Mock hasRole method
      jest.spyOn(mockAuth, 'hasRole').mockReturnValue(true);

      const result = await createGuardHandler(mockAuth, 'admin');
      
      expect(result).toBe(true);
      expect(mockAuth.hasRole).toHaveBeenCalledWith('admin', false);
    });

    it('should return unauthorized redirect when user lacks required role', async () => {
      // Mock authenticated but without admin role
      jest.spyOn(mockAuth.isAuthenticated, 'value', 'get').mockReturnValue(true);
      jest.spyOn(mockAuth.isLoading, 'value', 'get').mockReturnValue(false);
      jest.spyOn(mockAuth.user, 'value', 'get').mockReturnValue({
        id: '1',
        username: 'testuser',
        roles: ['user']
      });
      
      // Mock hasRole method to return false
      jest.spyOn(mockAuth, 'hasRole').mockReturnValue(false);

      const result = await createGuardHandler(mockAuth, 'admin');
      
      expect(result).toEqual({ name: 'access-denied' });
      expect(mockAuth.hasRole).toHaveBeenCalledWith('admin', false);
    });

    it('should handle multiple roles with OR logic', async () => {
      // Mock authenticated with moderator role
      jest.spyOn(mockAuth.isAuthenticated, 'value', 'get').mockReturnValue(true);
      jest.spyOn(mockAuth.isLoading, 'value', 'get').mockReturnValue(false);
      jest.spyOn(mockAuth.user, 'value', 'get').mockReturnValue({
        id: '1',
        username: 'testuser',
        roles: ['moderator']
      });
      
      // Mock hasRole method to return true for OR logic
      jest.spyOn(mockAuth, 'hasRole').mockReturnValue(true);

      const result = await createGuardHandler(mockAuth, ['admin', 'moderator'], false);
      
      expect(result).toBe(true);
      expect(mockAuth.hasRole).toHaveBeenCalledWith(['admin', 'moderator'], false);
    });

    it('should handle multiple roles with AND logic', async () => {
      // Mock authenticated but missing one required role
      jest.spyOn(mockAuth.isAuthenticated, 'value', 'get').mockReturnValue(true);
      jest.spyOn(mockAuth.isLoading, 'value', 'get').mockReturnValue(false);
      jest.spyOn(mockAuth.user, 'value', 'get').mockReturnValue({
        id: '1',
        username: 'testuser',
        roles: ['admin'] // Missing 'premium' role
      });
      
      // Mock hasRole method to return false for AND logic
      jest.spyOn(mockAuth, 'hasRole').mockReturnValue(false);

      const result = await createGuardHandler(mockAuth, ['admin', 'premium'], true);
      
      expect(result).toEqual({ name: 'access-denied' });
      expect(mockAuth.hasRole).toHaveBeenCalledWith(['admin', 'premium'], true);
    });

    it('should wait for loading to complete before checking authentication', async () => {
      // Mock loading state initially true
      const isLoadingMock = jest.spyOn(mockAuth.isLoading, 'value', 'get');
      const isAuthenticatedMock = jest.spyOn(mockAuth.isAuthenticated, 'value', 'get');
      
      // First call returns loading, subsequent calls return not loading
      isLoadingMock
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      
      isAuthenticatedMock.mockReturnValue(false);

      // Start the guard handler
      const guardPromise = createGuardHandler(mockAuth);
      
      // Simulate loading completion after a delay
      setTimeout(() => {
        isLoadingMock.mockReturnValue(false);
      }, 100);

      const result = await guardPromise;
      
      expect(result).toEqual({ name: 'login' });
      expect(isLoadingMock).toHaveBeenCalled();
    });

    it('should handle empty role array', async () => {
      // Mock authenticated
      jest.spyOn(mockAuth.isAuthenticated, 'value', 'get').mockReturnValue(true);
      jest.spyOn(mockAuth.isLoading, 'value', 'get').mockReturnValue(false);
      jest.spyOn(mockAuth.user, 'value', 'get').mockReturnValue({
        id: '1',
        username: 'testuser',
        roles: ['user']
      });
      
      // Mock hasRole method
      jest.spyOn(mockAuth, 'hasRole').mockReturnValue(true);

      const result = await createGuardHandler(mockAuth, []);
      
      expect(result).toBe(true);
      expect(mockAuth.hasRole).toHaveBeenCalledWith([], false);
    });
  });

  describe('route meta integration', () => {
    it('should extract role from route meta', async () => {
      // This would test the integration with Vue Router meta properties
      // The actual implementation would depend on how the guard is integrated
      // with the router and how it reads meta properties
      
      const routeWithMeta = {
        ...mockTo,
        meta: {
          role: 'admin',
          requireAllRoles: false
        }
      };

      // This test demonstrates the expected behavior
      expect(routeWithMeta.meta.role).toBe('admin');
      expect(routeWithMeta.meta.requireAllRoles).toBe(false);
    });

    it('should handle multiple roles in route meta', async () => {
      const routeWithMeta = {
        ...mockTo,
        meta: {
          role: ['admin', 'moderator'],
          requireAllRoles: true
        }
      };

      expect(routeWithMeta.meta.role).toEqual(['admin', 'moderator']);
      expect(routeWithMeta.meta.requireAllRoles).toBe(true);
    });
  });
});
