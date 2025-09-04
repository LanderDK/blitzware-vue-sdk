<template>
  <div class="dashboard">
    <h1>Role Check Dashboard</h1>
    <p>Welcome to the role-protected dashboard, {{ user?.username }}!</p>
    
    <div class="role-checks">
      <h3>Role Checks:</h3>
      <p>
        <strong>Admin Role:</strong>
        <span :style="{ color: hasAdminRole ? 'green' : 'red' }">
          {{ hasAdminRole ? '✓ You have admin access' : '✗ Admin access denied' }}
        </span>
      </p>
      <p>
        <strong>Premium Role:</strong>
        <span :style="{ color: hasPremiumRole ? 'green' : 'red' }">
          {{ hasPremiumRole ? '✓ You have premium access' : '✗ Premium access denied' }}
        </span>
      </p>
    </div>

    <div v-if="hasAdminRole" class="admin-section">
      <h3>🔒 Admin Only Section</h3>
      <p>This content is only visible to users with the admin role.</p>
    </div>

    <div v-if="hasPremiumRole" class="premium-section">
      <h3>⭐ Premium Only Section</h3>
      <p>This content is only visible to users with the premium role.</p>
    </div>

    <div class="user-info">
      <h3>User Information:</h3>
      <pre>{{ JSON.stringify(user, null, 2) }}</pre>
    </div>
    
    <button @click="logout">logout</button>
  </div>
</template>

<script>
import { useBlitzWareAuth } from 'blitzware-vue-sdk'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

export default {
  name: 'DashboardView',
  setup() {
    const BlitzWareAuth = useBlitzWareAuth()
    const router = useRouter()

    const hasAdminRole = computed(() => {
      return BlitzWareAuth.user.value?.roles?.includes('admin') || false
    })

    const hasPremiumRole = computed(() => {
      return BlitzWareAuth.user.value?.roles?.includes('premium') || false
    })

    return {
      user: BlitzWareAuth.user,
      hasAdminRole,
      hasPremiumRole,
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

<style scoped>
.dashboard {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.role-checks {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.admin-section {
  margin: 20px 0;
  padding: 20px;
  background-color: #e8f5e8;
  border-radius: 5px;
}

.premium-section {
  margin: 20px 0;
  padding: 20px;
  background-color: #fff3cd;
  border-radius: 5px;
}

.user-info {
  margin: 20px 0;
}

pre {
  text-align: left;
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
}
</style>
