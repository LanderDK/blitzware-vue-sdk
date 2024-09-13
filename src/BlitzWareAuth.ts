import { App, ref, Ref } from "vue";
import {
  BlitzWareAuthParams,
  BlitzWareAuthUser,
  BLITZWARE_INJECTION_KEY,
  BLITZWARE_TOKEN,
} from "./types";
import {
  generateAuthUrl,
  isTokenValid,
  fetchUserInfo,
  setToken,
  getToken,
  removeToken,
  getState,
  setState,
  removeState,
  hasAuthParams,
} from "./utils";
import { nanoid } from "nanoid";

export class BlitzWareAuth {
  private authParams: Ref<BlitzWareAuthParams> = ref({} as BlitzWareAuthParams);
  private state: Ref<string> = ref("");
  public user: Ref<BlitzWareAuthUser | null> = ref(null);
  public isAuthenticated: Ref<boolean> = ref(isTokenValid());
  public isLoading: Ref<boolean> = ref(true);

  constructor(authParams: BlitzWareAuthParams) {
    this.authParams.value = authParams;
    this.state.value = getState() || nanoid();
  }

  install(app: App): void {
    this.checkAuthState();
    app.config.globalProperties[BLITZWARE_TOKEN] = this;
    app.provide(BLITZWARE_INJECTION_KEY, this as BlitzWareAuth);
  }

  private async checkAuthState(): Promise<void> {
    if (hasAuthParams()) {
      const urlParams = new URLSearchParams(window.location.search);

      const state = urlParams.get("state");
      if (state !== this.state.value) {
        this.isAuthenticated.value = false;
        this.isLoading.value = false;
        return;
      }

      const access_token = urlParams.get("access_token");
      if (access_token) {
        setToken("access_token", access_token);
        this.isAuthenticated.value = true;
        const data = await fetchUserInfo(access_token);
        this.user.value = data;
        this.isLoading.value = false;
      } else {
        this.isAuthenticated.value = false;
        this.isLoading.value = false;
      }

      const refresh_token = urlParams.get("refresh_token");
      if (refresh_token) setToken("refresh_token", refresh_token);
    } else {
      if (isTokenValid()) {
        const data = await fetchUserInfo(getToken("access_token") as string);
        this.user.value = data;
        this.isAuthenticated.value = true;
      }
      this.isLoading.value = false;
    }
  }

  login(): void {
    const newState = nanoid();
    setState(newState);
    const authUrl = generateAuthUrl(this.authParams.value, newState);
    window.location.href = authUrl;
  }

  logout(): void {
    removeToken("access_token");
    removeToken("refresh_token");
    removeState();
    this.isAuthenticated.value = false;
    this.user.value = null;
    window.location.reload();
  }
}
