import './assets/main.css'

import { createApp } from 'vue'

import App from './App.vue'
import { createRouter } from './router'

import { createBlitzWareAuth } from 'blitzware-vue-sdk'

const app = createApp(App)

app
  .use(createRouter(app))
  .use(
    createBlitzWareAuth({
      clientId: 'your-client-id',
      redirectUri: 'your-redirect-uri',
      responseType: 'code', // or "token" for implicit flow
    })
  )
  .mount('#app')
