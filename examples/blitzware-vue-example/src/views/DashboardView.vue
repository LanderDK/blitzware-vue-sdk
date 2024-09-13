<template>
  <div class="dasboard">
    <h1>Dashboard</h1>
    <p>Welcome to the protected dashboard, {{ user?.username }}!</p>
    <button @click="logout">logout</button>
  </div>
</template>

<script>
import { useBlitzWareAuth } from 'blitzware-vue-sdk'
export default {
  name: 'LoginView',
  setup() {
    const BlitzWareAuth = useBlitzWareAuth()

    return {
      user: BlitzWareAuth.user,
      logout() {
        BlitzWareAuth.logout()
      }
    }
  }
}
</script>

<style>
@media (min-width: 1024px) {
  .dasboard {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
}
</style>
