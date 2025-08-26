import { inject, computed } from "vue";
import { BlitzWareAuth } from "./BlitzWareAuth";
import {
  BLITZWARE_INJECTION_KEY,
  BLITZWARE_TOKEN,
  BlitzWareAuthParams,
  BlitzWareAuthUser,
  BlitzWareAuthError,
  TokenIntrospectionResponse,
} from "./types";
import { 
  createBlitzWareAuthGuard, 
  createBlitzWareLoginGuard 
} from "./BlitzWareAuthGuard";

declare module "@vue/runtime-core" {
  export interface ComponentCustomProperties {
    [BLITZWARE_TOKEN]: BlitzWareAuth;
  }
}

export function createBlitzWareAuth(authParams: BlitzWareAuthParams) {
  return new BlitzWareAuth(authParams);
}

export function useBlitzWareAuth(): BlitzWareAuth {
  return inject(BLITZWARE_INJECTION_KEY) as BlitzWareAuth;
}

/**
 * Composable to get the authenticated user
 */
export function useAuthUser() {
  const auth = useBlitzWareAuth();
  return computed(() => auth.user.value);
}

/**
 * Composable to check if the user is authenticated
 */
export function useIsAuthenticated() {
  const auth = useBlitzWareAuth();
  return computed(() => auth.isAuthenticated.value);
}

/**
 * Composable to check if authentication is loading
 */
export function useAuthLoading() {
  const auth = useBlitzWareAuth();
  return computed(() => auth.isLoading.value);
}

/**
 * Composable to get the login function
 */
export function useLogin() {
  const auth = useBlitzWareAuth();
  return () => auth.login();
}

/**
 * Composable to get the logout function
 */
export function useLogout() {
  const auth = useBlitzWareAuth();
  return () => auth.logout();
}

export { 
  createBlitzWareAuthGuard, 
  createBlitzWareLoginGuard,
  BlitzWareAuthError,
};

export type { 
  BlitzWareAuthParams,
  BlitzWareAuthUser,
  TokenIntrospectionResponse,
};
