import { App, ref, Ref } from "vue";
import {
  BlitzWareAuthParams,
  BlitzWareAuthUser,
  BLITZWARE_INJECTION_KEY,
  BLITZWARE_TOKEN,
} from "./types";
import {
  generateAuthUrl,
  hasAuthParams,
  isTokenValid,
  setToken,
  setState,
  getState,
  fetchUserInfo,
  exchangeCodeForToken,
  tryRefreshToken,
  generateSecureState,
  logoutFromService,
  clearSession,
} from "./utils";

export class BlitzWareAuth {
  private authParams: Ref<BlitzWareAuthParams> = ref({} as BlitzWareAuthParams);
  private state: Ref<string> = ref("");
  public user: Ref<BlitzWareAuthUser | null> = ref(null);
  public isAuthenticated: Ref<boolean> = ref(isTokenValid());
  public isLoading: Ref<boolean> = ref(true);

  constructor(authParams: BlitzWareAuthParams) {
    this.authParams.value = authParams;
    this.state.value = getState() || generateSecureState();
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

      // Handle Authorization Code flow
      const code = urlParams.get("code");
      if (code) {
        try {
          const tokenResponse = await exchangeCodeForToken(
            code,
            this.authParams.value.clientId,
            this.authParams.value.redirectUri
          );

          setToken("access_token", tokenResponse.access_token);
          if (tokenResponse.refresh_token) {
            setToken("refresh_token", tokenResponse.refresh_token);
          }

          const userData = await fetchUserInfo(this.authParams.value.clientId);
          this.user.value = userData;
          this.isAuthenticated.value = true;

          // Clean up URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } catch (error) {
          console.error("Failed to handle authorization code:", error);
          clearSession();
          this.isAuthenticated.value = false;
          this.user.value = null;
        }
        this.isLoading.value = false;
        return;
      }

      // Handle Implicit flow
      const access_token = urlParams.get("access_token");
      if (access_token) {
        setToken("access_token", access_token);
        this.isAuthenticated.value = true;
        fetchUserInfo(this.authParams.value.clientId)
          .then((data) => {
            this.user.value = data;
          })
          .catch((error) => {
            console.error("Failed to fetch user info:", error);
            clearSession();
            this.isAuthenticated.value = false;
            this.user.value = null;
          })
          .finally(() => {
            this.isLoading.value = false;
          });
      } else {
        this.isAuthenticated.value = false;
        this.isLoading.value = false;
      }

      const refresh_token = urlParams.get("refresh_token");
      if (refresh_token) setToken("refresh_token", refresh_token);
    } else {
      if (isTokenValid()) {
        fetchUserInfo(this.authParams.value.clientId)
          .then((data) => {
            this.user.value = data;
            this.isAuthenticated.value = true;
          })
          .catch((error) => {
            console.error("Failed to fetch user info:", error);
            clearSession();
            this.isAuthenticated.value = false;
            this.user.value = null;
          })
          .finally(() => {
            this.isLoading.value = false;
          });
      } else {
        tryRefreshToken(this.authParams.value.clientId)
          .then((tokenResponse) => {
            setToken("access_token", tokenResponse.access_token);
            if (tokenResponse.refresh_token) {
              setToken("refresh_token", tokenResponse.refresh_token);
            }

            return fetchUserInfo(this.authParams.value.clientId);
          })
          .then((data) => {
            this.user.value = data;
            this.isAuthenticated.value = true;
          })
          .catch((error) => {
            console.error("Failed to refresh token or fetch user info:", error);
            clearSession();
            this.isAuthenticated.value = false;
            this.user.value = null;
          })
          .finally(() => {
            this.isLoading.value = false;
          });
      }
    }
  }

  async login(): Promise<void> {
    const newState = generateSecureState();
    setState(newState);
    const authUrl = await generateAuthUrl(this.authParams.value, newState);
    window.location.href = authUrl;
  }

  async logout(): Promise<void> {
    this.isLoading.value = true;

    try {
      await logoutFromService(this.authParams.value.clientId);
    } catch (error) {
      // Log the error but continue with local cleanup
      console.error("Failed to logout from service:", error);
    }

    // Always clear local state regardless of service call result
    clearSession();
    this.isAuthenticated.value = false;
    this.user.value = null;
    this.isLoading.value = false;
  }

  /**
   * Check if the current user has the required role(s).
   * @param role - Single role or array of roles to check
   * @param requireAllRoles - If true, user must have ALL roles (AND logic), if false, user needs ANY role (OR logic)
   * @returns True if user has the required role(s), false otherwise.
   */
  hasRole(role?: string | string[], requireAllRoles: boolean = false): boolean {
    const user = this.user.value;
    
    if (!user || !user.roles || !role) {
      return false;
    }

    const userRoles = user.roles;
    const requiredRoles = Array.isArray(role) ? role : [role];

    if (requireAllRoles) {
      // User must have ALL required roles (AND logic)
      return requiredRoles.every(requiredRole => userRoles.includes(requiredRole));
    } else {
      // User must have at least ONE required role (OR logic)
      return requiredRoles.some(requiredRole => userRoles.includes(requiredRole));
    }
  }
}
