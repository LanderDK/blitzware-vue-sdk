import { inject } from "vue";
import { BlitzWareAuth } from "./BlitzWareAuth";
import {
  BLITZWARE_INJECTION_KEY,
  BLITZWARE_TOKEN,
  BlitzWareAuthParams,
} from "./types";
import { createBlitzWareAuthGuard } from "./BlitzWareAuthGuard";

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

export { createBlitzWareAuthGuard };
