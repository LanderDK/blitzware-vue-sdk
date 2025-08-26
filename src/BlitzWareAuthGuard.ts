import { BlitzWareAuth } from "./BlitzWareAuth";
import { BLITZWARE_TOKEN } from "./types";
import { App, unref } from "vue";
import { NavigationGuardNext, RouteLocationNormalized } from "vue-router";

export async function createGuardHandler(auth: BlitzWareAuth) {
  const fn = async () => {
    // Wait for loading to complete
    while (unref(auth.isLoading)) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    if (unref(auth.isAuthenticated)) {
      return true;
    }
    return { name: 'login' }; // Redirect to login route
  };

  return fn();
}

export function createBlitzWareAuthGuard(app: App) {
  return async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const auth = app.config.globalProperties[BLITZWARE_TOKEN] as BlitzWareAuth;
    
    try {
      const result = await createGuardHandler(auth);
      
      if (result === true) {
        next();
      } else {
        next(result);
      }
    } catch (error) {
      console.error('Auth guard error:', error);
      next({ name: 'login' });
    }
  };
}

/**
 * Creates a login guard that prevents authenticated users from accessing login pages
 */
export function createBlitzWareLoginGuard(app: App) {
  return async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const auth = app.config.globalProperties[BLITZWARE_TOKEN] as BlitzWareAuth;
    
    try {
      // Wait for loading to complete
      while (unref(auth.isLoading)) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      if (!unref(auth.isAuthenticated)) {
        // User is not authenticated, allow access to login page
        next();
      } else {
        // User is already authenticated, redirect to dashboard or return URL
        const returnUrl = to.query.returnUrl as string || '/dashboard';
        next(returnUrl);
      }
    } catch (error) {
      console.error('Login guard error:', error);
      // On error, allow access to login page
      next();
    }
  };
}
