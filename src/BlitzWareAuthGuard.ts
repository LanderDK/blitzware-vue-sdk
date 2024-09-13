import { BlitzWareAuth } from "./BlitzWareAuth";
import { BLITZWARE_TOKEN } from "./types";
import { App, unref } from "vue";

export async function createGuardHandler(auth: BlitzWareAuth) {
  const fn = async () => {
    if (unref(auth.isAuthenticated)) {
      return true;
    }
    return false;
  };

  if (!unref(auth.isLoading)) {
    return fn();
  }

  return fn();
}

export function createBlitzWareAuthGuard(app: App): () => Promise<boolean> {
  return async () => {
    const auth = app.config.globalProperties[BLITZWARE_TOKEN] as BlitzWareAuth;
    return createGuardHandler(auth);
  };
}
