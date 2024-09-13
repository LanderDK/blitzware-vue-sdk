import { createRouter as createVueRouter, createWebHashHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import { createBlitzWareAuthGuard } from 'blitzware-vue-sdk'

export function createRouter(app) {
  return createVueRouter({
    routes: [
      {
        path: '/login',
        name: 'login',
        component: LoginView
      },
      {
        path: '/dashboard',
        name: 'dashboard',
        component: DashboardView,
        beforeEnter: createBlitzWareAuthGuard(app)
      },
      {
        path: '/',
        redirect: '/login'
      }
    ],
    history: createWebHashHistory()
  })
}
