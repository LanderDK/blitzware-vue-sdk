import { createRouter as createVueRouter, createWebHashHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import { createBlitzWareAuthGuard, createBlitzWareLoginGuard } from 'blitzware-vue-sdk'

export function createRouter(app) {
  return createVueRouter({
    routes: [
      {
        path: '/login',
        name: 'login',
        component: LoginView,
        beforeEnter: createBlitzWareLoginGuard(app) // Prevent authenticated users from seeing login
      },
      {
        path: '/dashboard',
        name: 'dashboard',
        component: DashboardView,
        beforeEnter: createBlitzWareAuthGuard(app) // Protect dashboard
      },
      {
        path: '/',
        redirect: '/dashboard' // Redirect to dashboard by default
      }
    ],
    history: createWebHashHistory()
  })
}
