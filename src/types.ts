import { InjectionKey } from "vue";
import { BlitzWareAuth } from "./BlitzWareAuth";

export interface BlitzWareAuthParams {
  responseType?: "code" | "token";
  clientId: string;
  redirectUri: string;
}

export interface BlitzWareAuthUser {
  id: string;
  username: string;
  email?: string;
  roles?: string[];
}

export const BLITZWARE_TOKEN = "$blitzware";

export const BLITZWARE_INJECTION_KEY: InjectionKey<BlitzWareAuth> =
  Symbol(BLITZWARE_TOKEN);
