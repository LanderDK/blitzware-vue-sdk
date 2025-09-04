<template>
  <div class="login">
    <h1>Login Page</h1>
    <div v-if="isLoading">
      <p>Loading...</p>
    </div>
    <div v-else-if="!isAuthenticated">
      <button @click="login">Login</button>
    </div>
    <div v-else>
      <p>Already authenticated, redirecting...</p>
    </div>
  </div>
</template>

<script>
import { useBlitzWareAuth } from 'blitzware-vue-sdk'

export default {
  name: 'LoginView',
  setup() {
    const BlitzWareAuth = useBlitzWareAuth()

    return {
      isLoading: BlitzWareAuth.isLoading,
      isAuthenticated: BlitzWareAuth.isAuthenticated,
      login() {
        BlitzWareAuth.login()
      }
    }
  }
}
</script>

<style>
@media (min-width: 1024px) {
  .login {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
}
</style>
