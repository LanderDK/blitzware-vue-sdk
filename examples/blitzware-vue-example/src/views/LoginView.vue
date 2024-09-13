<template>
  <div class="login">
    <h1>Login Page</h1>
    <button @click="login">Login</button>
  </div>
</template>

<script>
import { useBlitzWareAuth } from 'blitzware-vue-sdk'
export default {
  name: 'LoginView',
  setup() {
    const BlitzWareAuth = useBlitzWareAuth()

    return {
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
