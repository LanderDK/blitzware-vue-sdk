<template>
  <div class="dasboard">
    <h1>Dashboard</h1>
    <p>Welcome to the protected dashboard, {{ user?.username }}!</p>
    <button @click="logout">logout</button>
  </div>
</template>

<script>
import { useBlitzWareAuth } from 'blitzware-vue-sdk'
import { useRouter } from 'vue-router'

export default {
  name: 'DashboardView',
  setup() {
    const BlitzWareAuth = useBlitzWareAuth()
    const router = useRouter()

    return {
      user: BlitzWareAuth.user,
      async logout() {
        try {
          await BlitzWareAuth.logout()
          // Redirect to login after logout
          router.push('/login')
        } catch (error) {
          console.error('Logout failed:', error)
          // Even if logout fails, redirect to login
          router.push('/login')
        }
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
